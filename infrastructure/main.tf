provider "aws" {
  region = var.region
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "nftflow-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "nftflow-${var.environment}-igw"
  }
}

# Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "nftflow-${var.environment}-public-${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "nftflow-${var.environment}-private-${count.index + 1}"
  }
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "nftflow-${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security Groups
resource "aws_security_group" "somnia_node" {
  name_prefix = "nftflow-somnia-node-${var.environment}"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 8545
    to_port     = 8545
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  ingress {
    from_port   = 8546
    to_port     = 8546
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  ingress {
    from_port   = 6060
    to_port     = 6060
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "nftflow-somnia-node-${var.environment}"
  }
}

resource "aws_security_group" "load_balancer" {
  name_prefix = "nftflow-lb-${var.environment}"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "nftflow-lb-${var.environment}"
  }
}

# Somnia Node Module
module "somnia_node" {
  source = "./modules/somnia-node"
  
  environment = var.environment
  region      = var.region
  instance_type = "r5.2xlarge"
  
  # RPC configuration
  rpc_port    = 8545
  ws_port     = 8546
  metrics_port = 6060
  
  # Security
  vpc_id          = aws_vpc.main.id
  subnet_ids      = aws_subnet.private[*].id
  security_groups = [aws_security_group.somnia_node.id]
  
  # Storage
  ebs_volume_size = 1000
  ebs_volume_type = "gp3"
}

# Load Balancer Module
module "load_balancer" {
  source = "./modules/load-balancer"
  
  name               = "nftflow-${var.environment}"
  vpc_id             = aws_vpc.main.id
  subnet_ids         = aws_subnet.public[*].id
  certificate_arn    = aws_acm_certificate.nftflow.arn
  security_group_id  = aws_security_group.load_balancer.id
  
  # Health check for Somnia nodes
  health_check = {
    path                = "/health"
    port                = 8545
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 10
  }
}

# Monitoring Module
module "monitoring" {
  source = "./modules/monitoring"
  
  environment = var.environment
  somnia_nodes = module.somnia_node.instance_ids
  
  alerts = {
    high_cpu_usage = {
      threshold = 80
      period    = 300
    }
    high_memory_usage = {
      threshold = 85  
      period    = 300
    }
    high_rpc_latency = {
      threshold = 1000 # ms
      period    = 300
    }
  }
}

# SSL Certificate
resource "aws_acm_certificate" "nftflow" {
  domain_name       = "api.nftflow.${var.environment}.somnia.network"
  validation_method = "DNS"

  subject_alternative_names = [
    "*.nftflow.${var.environment}.somnia.network"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "nftflow-${var.environment}-cert"
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# Variables
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

# Outputs
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "load_balancer_dns" {
  value = module.load_balancer.dns_name
}

output "somnia_node_ips" {
  value = module.somnia_node.private_ips
}
