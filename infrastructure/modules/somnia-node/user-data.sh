#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install monitoring tools
apt-get install -y htop iotop nethogs

# Create directories
mkdir -p /opt/somnia/{data,config,logs}
mkdir -p /opt/monitoring

# Mount additional EBS volume
mkfs.ext4 /dev/xvdf
mount /dev/xvdf /opt/somnia/data
echo '/dev/xvdf /opt/somnia/data ext4 defaults,nofail 0 2' >> /etc/fstab

# Create Somnia node configuration
cat > /opt/somnia/config/somnia.toml << EOF
[network]
name = "somnia-${environment}"
chain_id = 50312

[rpc]
http_port = ${rpc_port}
ws_port = ${ws_port}
cors_allowed_origins = ["*"]

[metrics]
port = ${metrics_port}
path = "/metrics"

[storage]
data_dir = "/opt/somnia/data"
cache_size = "2GB"

[consensus]
algorithm = "tendermint"
timeout_commit = "1s"
timeout_propose = "3s"

[logging]
level = "info"
format = "json"
output = "/opt/somnia/logs/somnia.log"
EOF

# Create Docker Compose file
cat > /opt/somnia/docker-compose.yml << EOF
version: '3.8'

services:
  somnia-node:
    image: somnia/somnia-node:latest
    container_name: somnia-node
    restart: unless-stopped
    ports:
      - "${rpc_port}:${rpc_port}"
      - "${ws_port}:${ws_port}"
      - "${metrics_port}:${metrics_port}"
    volumes:
      - /opt/somnia/data:/data
      - /opt/somnia/config:/config
      - /opt/somnia/logs:/logs
    environment:
      - SOMNIA_NETWORK=${environment}
      - SOMNIA_REGION=${region}
    command: ["--config", "/config/somnia.toml"]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:${rpc_port}/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - /opt/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - /opt/monitoring/data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - /opt/monitoring/grafana:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
EOF

# Create Prometheus configuration
cat > /opt/monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'somnia-node'
    static_configs:
      - targets: ['somnia-node:${metrics_port}']
    scrape_interval: 5s
    metrics_path: /metrics

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

# Create systemd service for Docker Compose
cat > /etc/systemd/system/somnia.service << EOF
[Unit]
Description=Somnia Node Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/somnia
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start services
systemctl enable somnia.service
systemctl start somnia.service

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i amazon-cloudwatch-agent.deb

# Configure CloudWatch agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
  "metrics": {
    "namespace": "NFTFlow/Somnia",
    "metrics_collected": {
      "cpu": {
        "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": ["used_percent"],
        "metrics_collection_interval": 60,
        "resources": ["*"]
      },
      "diskio": {
        "measurement": ["io_time"],
        "metrics_collection_interval": 60,
        "resources": ["*"]
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      },
      "netstat": {
        "measurement": ["tcp_established", "tcp_time_wait"],
        "metrics_collection_interval": 60
      },
      "swap": {
        "measurement": ["swap_used_percent"],
        "metrics_collection_interval": 60
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/opt/somnia/logs/somnia.log",
            "log_group_name": "/aws/ec2/somnia-node",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s

# Create health check endpoint
cat > /opt/somnia/health-check.sh << 'EOF'
#!/bin/bash
# Health check script for load balancer

# Check if Somnia node is responding
if curl -f -s http://localhost:8545/health > /dev/null; then
    echo "HTTP/1.1 200 OK"
    echo "Content-Type: application/json"
    echo ""
    echo '{"status": "healthy", "timestamp": "'$(date -Iseconds)'"}'
else
    echo "HTTP/1.1 503 Service Unavailable"
    echo "Content-Type: application/json"
    echo ""
    echo '{"status": "unhealthy", "timestamp": "'$(date -Iseconds)'"}'
    exit 1
fi
EOF

chmod +x /opt/somnia/health-check.sh

# Create simple HTTP server for health checks
cat > /etc/systemd/system/somnia-health.service << EOF
[Unit]
Description=Somnia Health Check Service
After=network.target

[Service]
Type=simple
ExecStart=/bin/bash -c 'while true; do /opt/somnia/health-check.sh | nc -l -p 8080; done'
Restart=always
User=ubuntu

[Install]
WantedBy=multi-user.target
EOF

systemctl enable somnia-health.service
systemctl start somnia-health.service

# Set proper permissions
chown -R ubuntu:ubuntu /opt/somnia
chown -R ubuntu:ubuntu /opt/monitoring

echo "Somnia node setup completed successfully!"
