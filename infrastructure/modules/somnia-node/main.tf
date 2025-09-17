# Somnia Node Module
resource "aws_instance" "somnia_node" {
  count         = var.node_count
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = aws_key_pair.somnia.key_name

  vpc_security_group_ids = var.security_groups
  subnet_id              = var.subnet_ids[count.index % length(var.subnet_ids)]

  root_block_device {
    volume_type = "gp3"
    volume_size = 50
    encrypted   = true
  }

  # Additional EBS volume for blockchain data
  ebs_block_device {
    device_name = "/dev/sdf"
    volume_type = var.ebs_volume_type
    volume_size = var.ebs_volume_size
    encrypted   = true
  }

  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    rpc_port     = var.rpc_port
    ws_port      = var.ws_port
    metrics_port = var.metrics_port
    environment  = var.environment
    region       = var.region
  }))

  tags = {
    Name        = "nftflow-somnia-node-${var.environment}-${count.index + 1}"
    Environment = var.environment
    Role        = "somnia-node"
  }
}

# Auto Scaling Group for high availability
resource "aws_launch_template" "somnia_node" {
  name_prefix   = "nftflow-somnia-${var.environment}-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = aws_key_pair.somnia.key_name

  vpc_security_group_ids = var.security_groups

  block_device_mappings {
    device_name = "/dev/sda1"
    ebs {
      volume_type = "gp3"
      volume_size = 50
      encrypted   = true
    }
  }

  block_device_mappings {
    device_name = "/dev/sdf"
    ebs {
      volume_type = var.ebs_volume_type
      volume_size = var.ebs_volume_size
      encrypted   = true
    }
  }

  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    rpc_port     = var.rpc_port
    ws_port      = var.ws_port
    metrics_port = var.metrics_port
    environment  = var.environment
    region       = var.region
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "nftflow-somnia-node-${var.environment}"
      Environment = var.environment
      Role        = "somnia-node"
    }
  }
}

resource "aws_autoscaling_group" "somnia_node" {
  name                = "nftflow-somnia-${var.environment}"
  vpc_zone_identifier = var.subnet_ids
  target_group_arns   = [aws_lb_target_group.somnia.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300

  min_size         = var.min_nodes
  max_size         = var.max_nodes
  desired_capacity = var.desired_nodes

  launch_template {
    id      = aws_launch_template.somnia_node.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "nftflow-somnia-asg-${var.environment}"
    propagate_at_launch = false
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }
}

# Target Group for Load Balancer
resource "aws_lb_target_group" "somnia" {
  name     = "nftflow-somnia-${var.environment}"
  port     = var.rpc_port
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = {
    Name = "nftflow-somnia-tg-${var.environment}"
  }
}

# Key Pair for SSH access
resource "aws_key_pair" "somnia" {
  key_name   = "nftflow-somnia-${var.environment}"
  public_key = file("${path.module}/../../keys/somnia.pub")
}

# Data sources
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-22.04-lts-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Variables
variable "environment" {
  description = "Environment name"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "r5.2xlarge"
}

variable "node_count" {
  description = "Number of nodes to deploy"
  type        = number
  default     = 3
}

variable "min_nodes" {
  description = "Minimum number of nodes in ASG"
  type        = number
  default     = 2
}

variable "max_nodes" {
  description = "Maximum number of nodes in ASG"
  type        = number
  default     = 10
}

variable "desired_nodes" {
  description = "Desired number of nodes in ASG"
  type        = number
  default     = 3
}

variable "rpc_port" {
  description = "RPC port"
  type        = number
  default     = 8545
}

variable "ws_port" {
  description = "WebSocket port"
  type        = number
  default     = 8546
}

variable "metrics_port" {
  description = "Metrics port"
  type        = number
  default     = 6060
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs"
  type        = list(string)
}

variable "security_groups" {
  description = "Security group IDs"
  type        = list(string)
}

variable "ebs_volume_size" {
  description = "EBS volume size for blockchain data"
  type        = number
  default     = 1000
}

variable "ebs_volume_type" {
  description = "EBS volume type"
  type        = string
  default     = "gp3"
}

# Outputs
output "instance_ids" {
  value = aws_instance.somnia_node[*].id
}

output "private_ips" {
  value = aws_instance.somnia_node[*].private_ip
}

output "target_group_arn" {
  value = aws_lb_target_group.somnia.arn
}
