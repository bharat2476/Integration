variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod."
  }
}

variable "aws_region" {
  description = "Primary AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Resource naming prefix"
  type        = string
  default     = "omniroute"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.20.0.0/16"
}

variable "availability_zones" {
  description = "Multi-AZ list for HA subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "eks_cluster_version" {
  type    = string
  default = "1.29"
}

variable "eks_managed_node_instance_types" {
  type    = list(string)
  default = ["m6i.large", "m6i.xlarge"]
}

variable "eks_managed_node_desired_size" {
  type    = number
  default = 3
}

variable "rds_instance_class" {
  type    = string
  default = "db.r6g.large"
}

variable "rds_allocated_storage_gb" {
  type    = number
  default = 200
}

variable "enable_karpenter" {
  type    = bool
  default = true
}

variable "tenant_schema_count" {
  description = "Number of dedicated PostgreSQL schemas for large tenants (RLS for shared schema)"
  type        = number
  default     = 8
}
