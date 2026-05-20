# AGENTS.md — OmniRoute-Core

## Overview

Multi-pillar supply chain integration blueprint (IaaS Terraform, PaaS Helm/Istio/OTel, SaaS Express API).

## Run SaaS API

```bash
cd 3-saas-application && npm install && npm run dev
```

Port **8080**. Required header: `x-tenant-id`.

## Validate

```bash
cd 3-saas-application && npm run build
cd 1-iaas-infra/terraform && terraform init -backend=false && terraform validate
helm lint 2-paas-platform/helm/omniroute-api
```

## Known blueprint notes

- **Production data:** MongoDB (JSON / unstructured), SQL DB (structured) — **not PostgreSQL**.
- **GCP** translates messages to/from Nike in-house service protocols.
- In-process Pub/Sub — replace with Kafka/GCP Pub/Sub for production.
- Integration clients (SAP, Manhattan, etc.) are mock stubs with structured logging.
- `terraform/rds.tf` is an optional AWS Postgres reference sample only.
- Terraform `backend "s3"` block requires environment-specific configuration before apply.
