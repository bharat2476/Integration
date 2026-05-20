locals {
  name_prefix = "${var.project_name}-${var.environment}"

  private_subnet_cidrs = [
    for i, az in var.availability_zones : cidrsubnet(var.vpc_cidr, 4, i)
  ]

  public_subnet_cidrs = [
    for i, az in var.availability_zones : cidrsubnet(var.vpc_cidr, 4, i + length(var.availability_zones))
  ]

  database_subnet_cidrs = [
    for i, az in var.availability_zones : cidrsubnet(var.vpc_cidr, 4, i + (2 * length(var.availability_zones)))
  ]

  common_tags = {
    Project     = "OmniRoute-Core"
    Environment = var.environment
    Layer       = "iaas"
  }
}
