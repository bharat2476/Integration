# 1-iaas-infra — OmniRoute-Core

Dry, modular Terraform for AWS EKS and multi-AZ isolated VPC.

## Production vs this folder

| Production integration | This repo folder |
|------------------------|------------------|
| **SQL DB** for structured data | Not defined here — enterprise SQL tier |
| **MongoDB** for JSON / non-structured data | Not defined here — enterprise MongoDB tier |
| **GCP** for Nike in-house protocol translation | GCP configs live outside this AWS Terraform |
| **PostgreSQL** | **Not used** for the live integration |

`terraform/rds.tf` and `sql/tenant_rls_bootstrap.sql` are **optional reference samples** (AWS RDS PostgreSQL + RLS pattern). Do not treat them as the production datastore for OmniRoute / Nike integrations.

## Apply (AWS runtime only)

```bash
cd terraform
terraform init
terraform plan -var="environment=dev"
terraform apply -var="environment=dev"
```

## Layout

| Path | Purpose |
|------|---------|
| `terraform/vpc.tf` | Multi-AZ public/private/database tiers, NACL isolation |
| `terraform/eks.tf` | Private EKS API, managed system node group |
| `terraform/karpenter.tf` | Karpenter controller IRSA |
| `terraform/rds.tf` | *(Optional sample only)* PostgreSQL 16 — not production |
| `terraform/sql/tenant_rls_bootstrap.sql` | *(Optional sample only)* RLS bootstrap |
