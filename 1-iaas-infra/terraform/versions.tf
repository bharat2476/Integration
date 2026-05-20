terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }

  backend "s3" {
    # Configure per environment: bucket, key, dynamodb_table, region
    # bucket         = "omniroute-terraform-state"
    # key            = "omniroute-core/${var.environment}/terraform.tfstate"
    # dynamodb_table = "omniroute-terraform-locks"
    # encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "OmniRoute-Core"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
