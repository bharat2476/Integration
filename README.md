# OmniRoute-Core

**OmniRoute-Core** is a production-ready architectural blueprint for a decoupled, multi-tenant supply chain abstraction layer. It connects **OMS**, **PIM**, **SAP ERP**, **Manhattan WMS**, **WES** (AutoStore, Vanderlande, Locus, Schaefer, Rapyuta), and **Blue Yonder TMS** without tight coupling between domain systems.

Repository: [github.com/bharat2476/Integration](https://github.com/bharat2476/Integration)

## Three-pillar topology

```
                    ┌─────────────────────────────────────────┐
                    │           Corporate / Edge API          │
                    │     (x-tenant-id + x-correlation-id)    │
                    └────────────────────┬────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│ 1-iaas-infra    │           │ 2-paas-platform │           │ 3-saas-app      │
│ VPC · EKS · RDS │           │ Helm · Istio    │           │ Express domains │
│ RLS multi-tenant│           │ OTel · Splunk   │           │ Pub/Sub async   │
└─────────────────┘           └─────────────────┘           └─────────────────┘
```

| Pillar | Path | Responsibility |
|--------|------|----------------|
| **IaaS** | [`1-iaas-infra/`](1-iaas-infra/) | AWS VPC (private isolation), EKS + Karpenter, RDS PostgreSQL with schema/RLS tenancy |
| **PaaS** | [`2-paas-platform/`](2-paas-platform/) | Helm HPA (queue-depth), Istio tenant rate limits, OTel → Splunk dashboards |
| **SaaS** | [`3-saas-application/`](3-saas-application/) | Catalog, order execution, warehouse tasks, inventory OS&D |

## Order execution flow (correlation-traced)

```
OMS ──► SAP (financial pledge) ──► Manhattan (wave) ──► WES (robotics)
  ──► Blue Yonder TMS (freight) ──► Ship ──► SAP (close loop)
```

Every hop logs `tenantId`, `orderId`, and **`correlationId`** for Splunk/Otel traceability.

## Cross-functional collaboration

### Engineering & Platform

- **Pub/Sub decoupling** (`3-saas-application/src/pubsub/`) isolates PIM catalog floods from order pipelines — critical for **Black Friday** spikes when SKU deltas arrive in millions.
- **Karpenter + HPA** scale on CPU *and* `omniroute_pubsub_backlog_depth` (see Helm `values.yaml`).
- **Canary + automated rollback** in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) and [`Jenkinsfile`](Jenkinsfile) when post-deploy P99 latency or error rate breaches SLO.

### Operations

Warehouse endpoints map 1:1 to floor actions:

| Endpoint | Physical / automation action |
|----------|------------------------------|
| `POST /warehouse-tasks/wave/release` | Release WMS wave |
| `POST /warehouse-tasks/pick` | Manual pick task |
| `POST /warehouse-tasks/auto-pick` | Locus / Rapyuta AMR mission |
| `POST /warehouse-tasks/auto-pack` | Inline scanner → pack machine |
| `POST /warehouse-tasks/labels/print` | ZPL/PDF label stream |
| `POST /warehouse-tasks/ship` | Ship confirm |

Splunk panels ([`2-paas-platform/splunk/dashboard-omniroute-operations.json`](2-paas-platform/splunk/dashboard-omniroute-operations.json)) break out **latency per tenant** and **WES vendor error %**.

### Finance & Legal

- **OS&D adjustments** require validated `reasonCode` per variance type (`overage`, `shortage`, `damage`).
- Each adjustment emits an **audit ledger payload** with `financeReviewRequired` and `legalHold` flags for SAP alignment.
- **Daily reconciliation** compares WMS physical counts vs SAP ledger; mismatches surface before period close.
- **Multi-tenant telemetry** tags `tenant.id` in OTel — supporting data governance and noisy-neighbor isolation at the gateway.

## Quick start

```powershell
cd C:\Users\agarw\Integrations\3-saas-application
npm install
npm run dev
```

```bash
curl -X POST http://localhost:8080/api/v1/execution/orders \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant-acme" \
  -H "x-correlation-id: $(uuidgen)" \
  -d '{"omsOrderRef":"OMS-10042","wesVendor":"Locus"}'
```

## CI/CD

| Track | Tooling |
|-------|---------|
| Lint / build | Node 20, Terraform fmt/validate |
| Security | Trivy container scan |
| Deploy | Helm canary 10% → health gate → promote or **rollback** |

## Project layout

```
├── 1-iaas-infra/terraform/     # VPC, EKS, Karpenter IRSA, RDS + RLS SQL
├── 2-paas-platform/            # Helm, Istio, OTel, Splunk
├── 3-saas-application/src/     # Express API domains
├── .github/workflows/deploy.yml
├── Jenkinsfile
└── README.md
```

## License

Apache-2.0 (configure per your enterprise policy).
