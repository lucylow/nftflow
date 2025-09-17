# NFTFlow Infrastructure Variables

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  default     = "development"
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "nftflow"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "admin_cidr" {
  description = "CIDR block for admin access"
  type        = string
  default     = "0.0.0.0/0"
}

# Database Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "RDS maximum allocated storage in GB"
  type        = number
  default     = 100
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Redis Configuration
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

# ECS Configuration
variable "api_cpu" {
  description = "CPU units for API container"
  type        = number
  default     = 256
}

variable "api_memory" {
  description = "Memory for API container"
  type        = number
  default     = 512
}

variable "api_desired_count" {
  description = "Desired number of API containers"
  type        = number
  default     = 2
}

# Blockchain Configuration
variable "somnia_http_rpc" {
  description = "Somnia HTTP RPC URL"
  type        = string
  default     = "https://dream-rpc.somnia.network/"
}

variable "somnia_ws_rpc" {
  description = "Somnia WebSocket RPC URL"
  type        = string
  default     = "wss://dream-rpc.somnia.network/ws"
}

variable "nftflow_core_address" {
  description = "NFTFlow Core contract address"
  type        = string
}

variable "payment_stream_factory_address" {
  description = "Payment Stream Factory contract address"
  type        = string
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

# Monitoring Configuration
variable "enable_monitoring" {
  description = "Enable CloudWatch monitoring"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

# Scaling Configuration
variable "min_capacity" {
  description = "Minimum number of containers"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of containers"
  type        = number
  default     = 10
}

variable "target_cpu_utilization" {
  description = "Target CPU utilization for auto scaling"
  type        = number
  default     = 70
}

variable "target_memory_utilization" {
  description = "Target memory utilization for auto scaling"
  type        = number
  default     = 80
}

# Security Configuration
variable "enable_waf" {
  description = "Enable AWS WAF"
  type        = bool
  default     = false
}

variable "enable_shield" {
  description = "Enable AWS Shield"
  type        = bool
  default     = false
}

# Backup Configuration
variable "backup_retention_days" {
  description = "Database backup retention in days"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Database backup window"
  type        = string
  default     = "03:00-06:00"
}

variable "maintenance_window" {
  description = "Database maintenance window"
  type        = string
  default     = "Mon:00:00-Mon:03:00"
}

# Cost Optimization
variable "enable_spot_instances" {
  description = "Enable spot instances for cost optimization"
  type        = bool
  default     = false
}

variable "enable_scheduled_scaling" {
  description = "Enable scheduled scaling"
  type        = bool
  default     = false
}

# Environment-specific overrides
variable "environment_config" {
  description = "Environment-specific configuration"
  type        = map(any)
  default     = {
    development = {
      db_instance_class    = "db.t3.micro"
      redis_node_type      = "cache.t3.micro"
      api_cpu              = 256
      api_memory           = 512
      api_desired_count    = 1
      enable_monitoring    = false
      log_retention_days   = 3
    }
    staging = {
      db_instance_class    = "db.t3.small"
      redis_node_type      = "cache.t3.small"
      api_cpu              = 512
      api_memory           = 1024
      api_desired_count    = 2
      enable_monitoring    = true
      log_retention_days   = 7
    }
    production = {
      db_instance_class    = "db.r5.large"
      redis_node_type      = "cache.r5.large"
      api_cpu              = 1024
      api_memory           = 2048
      api_desired_count    = 3
      enable_monitoring    = true
      log_retention_days   = 30
      enable_waf           = true
      enable_shield        = true
    }
  }
}

# Tags
variable "additional_tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}

# Feature Flags
variable "enable_event_ingest" {
  description = "Enable event ingestion service"
  type        = bool
  default     = true
}

variable "enable_worker" {
  description = "Enable background worker service"
  type        = bool
  default     = true
}

variable "enable_metrics" {
  description = "Enable metrics collection"
  type        = bool
  default     = true
}

# Network Configuration
variable "enable_nat_gateway" {
  description = "Enable NAT Gateway"
  type        = bool
  default     = true
}

variable "enable_vpc_endpoints" {
  description = "Enable VPC endpoints for AWS services"
  type        = bool
  default     = false
}

# Storage Configuration
variable "enable_efs" {
  description = "Enable EFS for shared storage"
  type        = bool
  default     = false
}

variable "efs_throughput_mode" {
  description = "EFS throughput mode"
  type        = string
  default     = "provisioned"
  
  validation {
    condition     = contains(["provisioned", "bursting"], var.efs_throughput_mode)
    error_message = "EFS throughput mode must be either 'provisioned' or 'bursting'."
  }
}

# Disaster Recovery
variable "enable_cross_region_backup" {
  description = "Enable cross-region backup"
  type        = bool
  default     = false
}

variable "backup_region" {
  description = "Region for cross-region backup"
  type        = string
  default     = "us-west-2"
}

# Compliance
variable "enable_encryption" {
  description = "Enable encryption at rest"
  type        = bool
  default     = true
}

variable "enable_audit_logging" {
  description = "Enable audit logging"
  type        = bool
  default     = false
}

# Performance
variable "enable_performance_insights" {
  description = "Enable RDS Performance Insights"
  type        = bool
  default     = true
}

variable "enable_enhanced_monitoring" {
  description = "Enable RDS Enhanced Monitoring"
  type        = bool
  default     = true
}
