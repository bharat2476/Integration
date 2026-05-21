# Technical appendix — OmniRoute-Core

Concise engineering reference. Product narrative: [README.md](../README.md).

## Repo layout

| Pillar | Path | Contents |
|--------|------|----------|
| IaaS | `1-iaas-infra/terraform/` | VPC, EKS, Karpenter (`eks.tf`, `variables.tf`) |
| PaaS | `2-paas-platform/` | Helm `omniroute-api`, Istio rate limits, OTel, Splunk |
| SaaS | `3-saas-application/` | Express API, `Dockerfile`, `dev-portal/` |
| CI/CD | `Jenkinsfile`, `.github/workflows/deploy.yml` | Docker build, Terraform, Helm, Trivy, tenant smoke |

## Data

- **MongoDB** — JSON, events, audits  
- **SQL** — orders, inventory (not PostgreSQL in production design)  
- **GCP** — Nike in-house protocol translation  

## Order pipeline states

```
RECEIVED_OMS → ERP_PLEDGED → TMS_LOAD_ASSIGNED → WMS_WAVE_RELEASED
  → WES_ALLOCATED → TMS_RATED → ERP_CLOSED
```

`POST /api/v1/execution/orders` — body: `omsOrderRef`, `shipUrgency` (`rush`|`standard`), optional `wesVendor`.  
Response includes: `tmsLoadId`, `stagingLane`, `trailerId`, `doorId`, `priorityScore`, `promisedShipBy`, `waveTier`.

## Key APIs

| Area | Endpoints |
|------|-----------|
| Execution | `POST/GET /api/v1/execution/orders` |
| Catalog | `POST /api/v1/catalog/delta` |
| Warehouse | `POST /api/v1/warehouse-tasks/{wave,pick,stage,auto-pick,labels/print,ship,...}` |
| Inventory | cycle-count, reconciliation, adjustments, audit-ledger |

Headers: `x-tenant-id`, `x-correlation-id`.

## Peak scaling

- Terraform: `eks_managed_node_desired_size`  
- Karpenter: `2-paas-platform/karpenter/nodepool-workloads.yaml`  
- HPA: `omniroute_pubsub_backlog_depth` in Helm values  

## CI/CD

Jenkins + GitHub Actions: lint, `terraform validate`, Helm lint, Docker build, Trivy, `npm run test:tenant`.  
Image push and canary deploy on `main` only.

## Run locally

```powershell
cd 3-saas-application
npm install
npm run dev
```

Open [http://localhost:8080/ui/guide](http://localhost:8080/ui/guide).

```bash
curl -X POST http://localhost:8080/api/v1/execution/orders \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant-acme" \
  -H "x-correlation-id: $(uuidgen)" \
  -d '{"omsOrderRef":"OMS-10042","shipUrgency":"rush","wesVendor":"Locus"}'
```

## Pub/Sub topics

| Topic | Purpose |
|-------|---------|
| `pim.catalog.delta` | Async catalog fan-out |
| `order.execution.stage` | Stage observability |
| `inventory.adjustment.posted` | OS&D / finance |
