# 1-iaas-infra — OmniRoute-Core

Dry, modular Terraform for AWS EKS, multi-AZ isolated VPC, and PostgreSQL multi-tenancy (schemas + RLS).

## Apply

```bash
cd terraform
terraform init
terraform plan -var="environment=dev"
terraform apply -var="environment=dev"
```

After RDS is available, run `sql/tenant_rls_bootstrap.sql` via your migration pipeline.

## Layout

| Path | Purpose |
|------|---------|
| `terraform/vpc.tf` | Multi-AZ public/private/database tiers, NACL isolation |
| `terraform/eks.tf` | Private EKS API, managed system node group |
| `terraform/karpenter.tf` | Karpenter controller IRSA |
| `terraform/rds.tf` | Encrypted PostgreSQL 16, Secrets Manager |
| `terraform/sql/tenant_rls_bootstrap.sql` | RLS policies and tenant schemas |
