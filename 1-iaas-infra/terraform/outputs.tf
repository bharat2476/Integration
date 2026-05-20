output "vpc_id" {
  value       = aws_vpc.core.id
  description = "Core VPC identifier"
}

output "private_subnet_ids" {
  value       = aws_subnet.private[*].id
  description = "Private subnets for EKS workloads"
}

output "eks_cluster_name" {
  value       = aws_eks_cluster.core.name
  description = "EKS cluster name for Helm/kubeconfig"
}

output "eks_cluster_endpoint" {
  value       = aws_eks_cluster.core.endpoint
  description = "EKS API endpoint (private)"
}

output "rds_endpoint" {
  value       = aws_db_instance.core.endpoint
  description = "PostgreSQL endpoint"
  sensitive   = true
}

output "rds_secret_arn" {
  value       = aws_secretsmanager_secret.rds_master.arn
  description = "Secrets Manager ARN for DB credentials"
}

output "karpenter_irsa_role_arn" {
  value       = var.enable_karpenter ? aws_iam_role.karpenter_controller[0].arn : null
  description = "IAM role for Karpenter service account"
}
