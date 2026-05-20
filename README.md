# OmniRoute-Core

**OmniRoute-Core** is a production-ready architectural blueprint for a decoupled, multi-tenant supply chain abstraction layer. It connects **OMS**, **PIM**, **SAP ERP**, **Manhattan WMS**, **WES** (AutoStore, Vanderlande, Locus, Schaefer, Rapyuta), and **Blue Yonder TMS** without tight coupling between domain systems.

Repository: [github.com/bharat2476/Integration](https://github.com/bharat2476/Integration)

**Local dev UI:** [http://localhost:8080/](http://localhost:8080/) (after `npm run dev` in `3-saas-application`)

---

## Integration topology: Global vs Edge

OmniRoute-Core ships as **two integration components**. They share contracts (`x-tenant-id`, `x-correlation-id`, pub/sub topics) but differ in **deployment footprint**, **latency targets**, and **automation scope**.

| Component | Deployment | Scope | Primary systems | Repository focus |
|-----------|------------|-------|-----------------|------------------|
| **Global** | Multi-region **cloud** (AWS EKS) | All ecosystems on the **same WMS** (e.g. Manhattan) | OMS, PIM, SAP, Manhattan, Blue Yonder TMS, shared catalog & order orchestration | `1-iaas-infra/`, `2-paas-platform/`, SaaS domains: `catalog/`, `execution/`, `inventory/` |
| **Edge** | **On-prem** per warehouse | One facility; **site-specific WES** (AutoStore, Vanderlande, Locus, Schaefer, Rapyuta) | Floor automation, pick/pack/ship, labels, AMR missions | SaaS domain: `warehouse-tasks/` + local Edge gateway cache |

**Why split Global and Edge?**

- **Global** amortizes integration cost: one PIM broker, one order pipeline, and one SAP close-loop serve every tenant and brand on a shared Manhattan estate.
- **Edge** stays on-prem to meet **tight SLOs** (sub-second robotics handshakes) and avoid cloud round-trips for scanners, AMRs, and pack lines.
- Each warehouse can run a **different automation vendor** without changing Global configs—only Edge Helm values / env profiles change.

```mermaid
flowchart TB
  subgraph regions [Multi-region Global — disruption isolation]
    R1[Region US-East\nEKS + RDS replica]
    R2[Region US-West\nEKS + RDS replica]
    R3[Region EU-Central\nEKS + RDS replica]
  end

  subgraph global [Global integration — cloud shared services]
    GAPI[OmniRoute Global API\nexecution · catalog · inventory]
    GPS[Shared Pub/Sub\npim.catalog.delta · order.execution.stage]
    GRDS[(Shared PostgreSQL\nRLS + tenant schemas)]
    GW_GLOBAL[Istio + tenant rate limit\n2-paas-platform]
  end

  subgraph shared [Shared resources — cost control]
    EKS_SH[Shared EKS cluster per region\nterraform/eks.tf]
    KARP[Karpenter spot + on-demand\nnodepool-workloads.yaml]
    OTEL_SH[Shared OTel DaemonSet\n→ Splunk]
    HELM_SH[One Helm chart — HPA scale-to-zero friendly]
  end

  OMS & PIM & SAP & MHT_CLOUD[Manhattan central] & TMS --> GW_GLOBAL
  GW_GLOBAL --> GAPI
  GAPI --> GPS --> GRDS
  regions --> global
  shared --> global

  subgraph edge_wh1 [Edge — Warehouse A on-prem]
    E1[Edge API / agent\nwarehouse-tasks]
    WES1[Locus AMR]
    E1 --> WES1
  end

  subgraph edge_wh2 [Edge — Warehouse B on-prem]
    E2[Edge API / agent\nwarehouse-tasks]
    WES2[AutoStore shuttle]
    E2 --> WES2
  end

  GAPI <-->|Async catalog + order stages| E1 & E2
  MHT_CLOUD <-->|Waves / inventory| E1 & E2
  E1 & E2 -->|auto-pick · auto-pack · labels| Floor1[Floor systems]
```

---

## Shared resources and cost efficiency

Platform engineering **consolidates infrastructure** so tenants and brands share pools instead of provisioning duplicate clusters per integration.

| Shared resource | How cost stays low | Config artifact |
|-----------------|-------------------|-----------------|
| **EKS cluster** | One regional control plane; many workloads per cluster | `1-iaas-infra/terraform/eks.tf` |
| **Karpenter NodePools** | Mix **spot** + on-demand; scale nodes to zero when queues drain | `2-paas-platform/karpenter/nodepool-workloads.yaml` |
| **Helm release** | Single `omniroute-api` chart for all tenants; reuse image + PDB | `2-paas-platform/helm/omniroute-api/` |
| **PostgreSQL** | One RDS instance; **RLS + schemas** replace per-tenant databases | `terraform/rds.tf`, `sql/tenant_rls_bootstrap.sql` |
| **Observability** | Shared OTel collectors → Splunk (no per-warehouse Splunk index sprawl) | `otel/daemonset-collector.yaml`, `splunk/dashboard-*.json` |
| **CI/CD** | One pipeline validates all pillars before any deploy | `.github/workflows/deploy.yml`, `Jenkinsfile` |
| **Global API** | Catalog and order logic written once; Edge only runs thin floor adapters | `3-saas-application/src/` |

**Noisy-neighbor protection without duplicate hardware:** Istio enforces per-tenant rate limits on the shared gateway (`envoyfilter-tenant-ratelimit.yaml`), so one tenant’s peak does not require a dedicated cluster.

---

## Multi-region placement (avoid disruption)

Infrastructure is **replicated across regions** so an AZ or regional outage does not halt the full supply chain network.

| Principle | Implementation |
|-----------|----------------|
| **Regional isolation** | Separate VPC + EKS + RDS per region (`terraform/vpc.tf`, `variables.tf` `aws_region`) |
| **Multi-AZ inside region** | Private, database, and NAT subnets span 3 AZs (`availability_zones`) |
| **Global traffic** | Corporate OMS/PIM/SAP connect to the **nearest healthy region**; Global API remains active in surviving regions |
| **Edge unaffected by cloud region loss** | On-prem Edge keeps pick/pack/ship running; syncs catalog/order state when Global is reachable |
| **Data** | PostgreSQL with multi-AZ in prod; cross-region read replicas (extend `rds.tf` per DR playbook) |

```mermaid
flowchart LR
  subgraph US_East [us-east-1]
    EKS1[EKS Global]
    RDS1[(RDS primary)]
  end
  subgraph US_West [us-west-2]
    EKS2[EKS Global]
    RDS2[(RDS replica)]
  end
  subgraph EU [eu-central-1]
    EKS3[EKS Global]
    RDS3[(RDS replica)]
  end

  OMS_G[Corporate OMS] -->|route nearest| EKS1 & EKS2 & EKS3
  RDS1 -.->|async replication| RDS2 & RDS3

  WH_EAST[Edge WH East on-prem] --> EKS1
  WH_WEST[Edge WH West on-prem] --> EKS2
```

Engineers parameterize region in Terraform (`var.aws_region`, `var.environment`) and Helm (`values.yaml` per region)—no forked application code.

---

## Engineer-driven scalability (config, not heroics)

Scale and resilience come from **versioned configs** checked into this repo. Operations change limits; they do not hand-edit production servers.

| Knob | What engineers tune | Effect |
|------|---------------------|--------|
| `eks_managed_node_desired_size` | Baseline node count | Steady-state capacity |
| Karpenter `limits.cpu` / `memory` | Burst ceiling | Black Friday / catalog flood headroom |
| Helm `autoscaling.maxReplicas` | API pod ceiling | Order API throughput |
| Helm `queueDepthMetric.targetAverageValue` | HPA on pub/sub backlog | Scale before queue latency grows |
| Istio token bucket | Per-tenant `max_tokens` | Fair sharing on shared gateway |
| `tenant_schema_count` + RLS | DB isolation model | Tenant growth without new RDS |
| Canary `weight` in `deploy.yml` | Release risk | Safe rollout with auto-rollback |

```mermaid
flowchart LR
  ENG[Platform engineer] --> TF[Terraform vars\n1-iaas-infra]
  ENG --> HELM[Helm values\n2-paas-platform]
  ENG --> APP[Env + HPA metrics\n3-saas-application]
  TF --> AWS[AWS EKS / RDS / VPC]
  HELM --> K8S[Kubernetes workloads]
  APP --> K8S
  METRICS[Splunk / OTel SLOs] -->|feedback| ENG
```

Peak example: PIM publishes millions of SKUs → `omniroute_pubsub_backlog_depth` rises → HPA adds API pods → Karpenter adds spot nodes → backlog drains → scale down after `scaleDown.stabilizationWindowSeconds` (see `helm/omniroute-api/values.yaml`).

---

## Architecture diagram (three pillars + artifacts)

End-to-end platform view: corporate traffic enters the **cloud PaaS gateway** (Global), workloads run on multi-region IaaS, business logic lives in SaaS domains. **On-prem Edge** warehouses (not shown below) run `warehouse-tasks/` only—see [Global vs Edge](#integration-topology-global-vs-edge). Every box lists **repository artifacts**.

```mermaid
flowchart TB
  subgraph clients [Enterprise systems]
    OMS[OMS\nOrder Management]
    PIM[PIM\nProduct Information]
    SAP[SAP ERP\nFinancial ledger]
    MHT[Manhattan WMS\nWaves / picks]
    WES[WES vendors\nAutoStore · Vanderlande\nLocus · Schaefer · Rapyuta]
    TMS[Blue Yonder TMS\nFreight / carriers]
  end

  subgraph paas [2-paas-platform — Cloud gateway and runtime]
    GW["Istio / Envoy\nenvoyfilter-tenant-ratelimit.yaml\nx-tenant-id + rate limit"]
    HELM["Helm omniroute-api\nhelm/omniroute-api/*\nHPA + PDB + Deployment"]
    OTEL["OTel DaemonSet\notel/daemonset-collector.yaml"]
    SPL["Splunk dashboard\nsplunk/dashboard-omniroute-operations.json"]
    KARP["Karpenter NodePool\nkarpenter/nodepool-workloads.yaml"]
  end

  subgraph saas [3-saas-application — Domain API]
    API["Express API :8080\nsrc/app.ts · src/index.ts\nDockerfile"]
    PS["Pub/Sub broker\nsrc/pubsub/broker.ts"]
    CAT["Catalog / PIM\nsrc/catalog/*\nPOST /api/v1/catalog/delta"]
    EXE["Execution / orders\nsrc/execution/*\nPOST /api/v1/execution/orders"]
    WH["Warehouse tasks\nsrc/warehouse-tasks/*"]
    INV["Inventory / OS&D\nsrc/inventory/*"]
    PORTAL["Dev portal UI\nsrc/dev-portal.ts\nGET /"]
  end

  subgraph iaas [1-iaas-infra — AWS]
    VPC["VPC multi-AZ\nterraform/vpc.tf"]
    EKS["EKS private API\nterraform/eks.tf"]
    RDS["RDS PostgreSQL 16\nterraform/rds.tf\nsql/tenant_rls_bootstrap.sql"]
  end

  subgraph cicd [CI/CD artifacts]
    GHA[".github/workflows/deploy.yml"]
    JEN["Jenkinsfile"]
  end

  OMS & PIM & SAP & MHT & WES & TMS --> GW
  GW --> HELM --> API
  API --> PS
  API --> CAT & EXE & WH & INV
  API --> PORTAL
  HELM --> KARP
  EKS --> HELM
  VPC --> EKS
  RDS --> API
  API --> OTEL --> SPL
  GHA & JEN --> HELM
  GHA & JEN --> API
```

| Layer | Path | Key artifacts |
|-------|------|----------------|
| **IaaS** | [`1-iaas-infra/`](1-iaas-infra/) | `terraform/vpc.tf`, `eks.tf`, `karpenter.tf`, `rds.tf`, `sql/tenant_rls_bootstrap.sql`, `outputs.tf` |
| **PaaS** | [`2-paas-platform/`](2-paas-platform/) | `helm/omniroute-api/`, `gateway/istio/envoyfilter-tenant-ratelimit.yaml`, `otel/daemonset-collector.yaml`, `splunk/dashboard-omniroute-operations.json`, `karpenter/nodepool-workloads.yaml` |
| **SaaS** | [`3-saas-application/`](3-saas-application/) | `src/pubsub/`, `src/catalog/`, `src/execution/`, `src/warehouse-tasks/`, `src/inventory/`, `src/shared/`, `Dockerfile` |
| **CI/CD** | repo root | [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), [`Jenkinsfile`](Jenkinsfile) |

---

## System workflow — all integrations and artifacts

Master sequence diagram: how an order and catalog change traverse **external systems**, **OmniRoute-Core**, **pub/sub topics**, **persistence**, and **observability artifacts**. `correlationId` is propagated on every hop (`src/shared/correlation.ts`).

```mermaid
sequenceDiagram
  autonumber
  participant OMS as OMS
  participant Edge as Istio Gateway<br/>envoyfilter-tenant-ratelimit.yaml
  participant API as OmniRoute API<br/>3-saas-application
  participant PS as EventBroker<br/>pubsub/broker.ts
  participant SAP as SAP ERP
  participant MHT as Manhattan WMS
  participant WES as WES (Locus/Rapyuta/…)
  participant TMS as Blue Yonder TMS
  participant RDS as PostgreSQL<br/>tenant_rls_bootstrap.sql
  participant OTEL as OTel Collector<br/>daemonset-collector.yaml
  participant SPL as Splunk<br/>dashboard JSON

  Note over PIM,PS: Catalog path (async, non-blocking)
  participant PIM as PIM
  PIM->>API: POST /api/v1/catalog/delta
  API->>PS: publish pim.catalog.delta
  PS-->>API: CatalogWarehouseSubscriber<br/>warehouse-subscriber.ts
  PS->>MHT: Ingest SKU cache (per node)

  Note over OMS,SPL: Order execution path
  OMS->>Edge: Create / update order (x-tenant-id)
  Edge->>API: POST /api/v1/execution/orders
  API->>SAP: pledgeSapFinancial()<br/>integrations.ts
  API->>PS: publish order.execution.stage ERP_PLEDGED
  API->>MHT: releaseManhattanWave()
  API->>WES: allocateWesRobotics()
  API->>TMS: rateBlueYonderFreight()
  API->>PS: publish order.execution.stage TMS_RATED
  API->>SAP: closeSapOrderLoop()
  API->>RDS: Persist order + tenant RLS
  API->>OTEL: Traces / metrics (tenant.id)
  OTEL->>SPL: Latency · WES errors · P99

  Note over API,SPL: Warehouse floor (operator / robotics)
  API->>MHT: POST /warehouse-tasks/*<br/>wave · pick · pack · stage · ship
  API->>WES: POST /warehouse-tasks/auto-pick
  API-->>OMS: Labels ZPL/PDF stream<br/>labels/print
```

---

## Workflow A — PIM catalog (pub/sub)

Massive catalog deltas must not block order pipelines. **Artifact chain:** `pim-broker-client.ts` → topic `pim.catalog.delta` → `warehouse-subscriber.ts`.

```mermaid
flowchart LR
  PIM[PIM system] -->|HTTP POST| R1["/api/v1/catalog/delta\ncatalog/routes.ts"]
  R1 --> C[pim-broker-client.ts]
  C --> T[(Topic: pim.catalog.delta\nbroker.ts)]
  T --> S1[Warehouse node 1\nMHT-EAST / Locus]
  T --> S2[Warehouse node 2\nMHT-WEST / AutoStore]
  S1 & S2 -->|Async ingest| Cache[(Node SKU cache\nnon-blocking)]
  T -.->|HPA signal| M[omniroute_pubsub_backlog_depth\nhelm HPA external metric]
```

| Step | Artifact | Output |
|------|----------|--------|
| Ingest delta | `src/catalog/routes.ts` | `202` + `messageId` |
| Publish | `src/pubsub/broker.ts` | `PubSubMessage` + logs |
| Fan-out | `src/catalog/warehouse-subscriber.ts` | Per-node ingest logs |

---

## Workflow B — Order execution (OMS → ERP → WMS → WES → TMS → ERP)

Synchronous orchestration with async stage events. **Artifact chain:** `execution/routes.ts` → `order-pipeline.ts` → `integrations.ts`.

```mermaid
stateDiagram-v2
  [*] --> RECEIVED_OMS: POST /execution/orders
  RECEIVED_OMS --> ERP_PLEDGED: integrations.ts pledgeSapFinancial
  ERP_PLEDGED --> WMS_WAVE_RELEASED: releaseManhattanWave
  WMS_WAVE_RELEASED --> WES_ALLOCATED: allocateWesRobotics
  WES_ALLOCATED --> TMS_RATED: rateBlueYonderFreight
  TMS_RATED --> SHIPPED: warehouse-tasks/ship
  SHIPPED --> ERP_CLOSED: closeSapOrderLoop
  ERP_CLOSED --> [*]

  note right of ERP_PLEDGED
    Pub/Sub: order.execution.stage
    correlationId in every log
  end note
```

| Lifecycle state | External system | Code artifact |
|-----------------|-----------------|---------------|
| `ERP_PLEDGE_PENDING` / `ERP_PLEDGED` | SAP | `execution/integrations.ts` |
| `WMS_WAVE_RELEASED` | Manhattan | `execution/integrations.ts` |
| `WES_ALLOCATED` | AutoStore, Vanderlande, Locus, Schaefer, Rapyuta | `order-pipeline.ts` (`wesVendor`) |
| `TMS_RATED` | Blue Yonder | `execution/integrations.ts` |
| `ERP_CLOSED` | SAP close loop | `execution/integrations.ts` |
| Persisted | PostgreSQL RLS | `1-iaas-infra/terraform/sql/tenant_rls_bootstrap.sql` |

---

## Workflow C — Warehouse floor (manual + automation)

Maps HTTP endpoints to physical or robotic actions. **Artifact:** `warehouse-tasks/controllers.ts`, `warehouse-tasks/routes.ts`.

```mermaid
flowchart TB
  OP[Operator / WMS UI] --> API[OmniRoute API]
  AMR[Locus / Rapyuta AMR] --> API
  SCAN[Inline scanner] --> API

  API --> W1[POST /wave/release\nManhattan wave]
  API --> W2[POST /pick\nPick task]
  API --> W3[POST /pack/verify\nPack station]
  API --> W4[POST /stage\nStaging lane]
  API --> W5[POST /load/trailer\nFluid load]
  API --> W6[POST /auto-pick\nAMR mission]
  API --> W7[POST /auto-pack\nPack machine]
  API --> W8[POST /labels/print\nZPL or PDF stream]
  API --> W9[POST /ship\nShip confirm]

  W1 & W2 & W3 & W4 & W5 --> MHT[Manhattan WMS]
  W6 --> WES[WES robotics]
  W7 --> AUTO[Automation line]
  W8 --> LBL[Label printer mock]
  W9 --> TMS2[TMS / carrier handoff]
```

---

## Workflow D — Inventory, reconciliation, and OS&D (Finance / Legal)

**Artifacts:** `inventory/services.ts`, `inventory/routes.ts`, topic `inventory.adjustment.posted`, Splunk OS&D panel.

```mermaid
flowchart TB
  WH[Warehouse operator] --> CC[POST /inventory/cycle-count\nPerpetual baseline]
  FIN[Finance scheduler] --> DR[POST /inventory/reconciliation/daily\nWMS vs SAP ledger]
  QA[QA / inventory control] --> ADJ[POST /inventory/adjustments\nreasonCode validated]

  CC --> BASE[(perpetualBaseline map)]
  DR --> CMP{WMS qty = SAP qty?}
  CMP -->|mismatch| REP[Reconciliation report]
  ADJ --> OSD{Type: overage | shortage | damage}
  OSD --> AUD[AuditLedgerPayload\nfinanceReviewRequired · legalHold]
  AUD --> PS[(Topic: inventory.adjustment.posted)]
  AUD --> RDS[(tenant_shared.inventory_ledger\nRLS policy)]
  PS --> SPL[Splunk panel_osd_variance\ndashboard JSON]
```

| Adjustment type | Valid reason codes (sample) | Audit flags |
|-----------------|----------------------------|-------------|
| `overage` | `RCV-OVER`, `CNT-OVER`, `ADJ-OVER` | Finance review if \|Δ\| > 10 |
| `shortage` | `PICK-SHORT`, `CNT-SHORT`, `SHRINK` | Finance review if \|Δ\| > 10 |
| `damage` | `DMG-FREIGHT`, `DMG-HANDLING`, `DMG-QA` | `legalHold` on damage codes |

---

## CI/CD and deployment workflow (artifacts)

```mermaid
flowchart LR
  subgraph parallel [Parallel gates — deploy.yml / Jenkinsfile]
    L[Lint SaaS\nnpm run build]
    TF[Terraform fmt/validate\n1-iaas-infra/terraform]
    H[Helm lint + template\n2-paas-platform/helm]
    TV[Trivy scan\n3-saas-application/Dockerfile]
    MT[Multi-tenant tests]
  end

  parallel --> PUSH[Push image\nghcr.io/omniroute-api]
  PUSH --> CAN[Canary 10%\nHelm upgrade]
  CAN --> HG{Health gate\nP99 · error %}
  HG -->|fail| RB[helm rollback\nautomated]
  HG -->|pass| PR[Promote 100%]
```

| Stage | Artifact | Behavior |
|-------|----------|----------|
| Quality gates | `.github/workflows/deploy.yml`, `Jenkinsfile` | Parallel lint, TF, Helm, Trivy |
| Canary | Helm `omniroute-api` | 10% traffic |
| Rollback | `deploy.yml` `deploy-canary` job | Simulated SLO breach → `helm rollback` |

---

## Pub/Sub topic catalog (SaaS artifacts)

| Topic | Publisher artifact | Subscriber / consumer |
|-------|-------------------|------------------------|
| `pim.catalog.delta` | `catalog/pim-broker-client.ts` | `catalog/warehouse-subscriber.ts` |
| `order.execution.stage` | `execution/order-pipeline.ts` | Observability / downstream analytics |
| `warehouse.task.completed` | *(reserved)* | WMS confirmation workers |
| `inventory.adjustment.posted` | `inventory/services.ts` | Finance audit, Splunk |

---

## Three-pillar topology (summary)

| Pillar | Path | Responsibility |
|--------|------|----------------|
| **IaaS** | [`1-iaas-infra/`](1-iaas-infra/) | AWS VPC (private isolation), EKS + Karpenter, RDS PostgreSQL with schema/RLS tenancy |
| **PaaS** | [`2-paas-platform/`](2-paas-platform/) | Helm HPA (queue-depth), Istio tenant rate limits, OTel → Splunk dashboards |
| **SaaS** | [`3-saas-application/`](3-saas-application/) | Catalog, order execution, warehouse tasks, inventory OS&D |

---

## Cross-functional collaboration

### Engineering & Platform

- **Global vs Edge:** Global cloud handles OMS/PIM/SAP/Manhattan/TMS orchestration for every ecosystem on one WMS; **Edge on-prem** handles site-specific WES vendors with millisecond-scale floor latency (see [Integration topology: Global vs Edge](#integration-topology-global-vs-edge)).
- **Shared resources** (one EKS, one RDS with RLS, shared OTel/Splunk, Karpenter spot pools) keep marginal tenant cost low—see [Shared resources and cost efficiency](#shared-resources-and-cost-efficiency).
- **Multi-region** Terraform/Helm parameters isolate blast radius; surviving regions continue Global processing while Edge warehouses operate autonomously until sync resumes.
- **Pub/Sub decoupling** (`3-saas-application/src/pubsub/`) isolates PIM catalog floods from order pipelines — critical for **Black Friday** spikes when SKU deltas arrive in millions.
- **Karpenter + HPA** scale on CPU *and* `omniroute_pubsub_backlog_depth` (see [`2-paas-platform/helm/omniroute-api/values.yaml`](2-paas-platform/helm/omniroute-api/values.yaml)).
- **Canary + automated rollback** in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) and [`Jenkinsfile`](Jenkinsfile) when post-deploy P99 latency or error rate breaches SLO.

### Operations

- **Global** operators monitor Splunk dashboards for tenant latency and WES error rates across the shared Manhattan estate.
- **Edge** operators interact only with floor endpoints below; robotics traffic never leaves the warehouse LAN.

| Endpoint | Physical / automation action |
|----------|------------------------------|
| `POST /warehouse-tasks/wave/release` | Release WMS wave |
| `POST /warehouse-tasks/pick` | Manual pick task |
| `POST /warehouse-tasks/auto-pick` | Locus / Rapyuta AMR mission |
| `POST /warehouse-tasks/auto-pack` | Inline scanner → pack machine |
| `POST /warehouse-tasks/labels/print` | ZPL/PDF label stream |
| `POST /warehouse-tasks/ship` | Ship confirm |

Splunk panels ([`2-paas-platform/splunk/dashboard-omniroute-operations.json`](2-paas-platform/splunk/dashboard-omniroute-operations.json)): tenant latency, WES vendor error %, P99 throughput, OS&D audit table.

### Finance & Legal

- **OS&D adjustments** require validated `reasonCode` per variance type (`overage`, `shortage`, `damage`).
- Each adjustment emits an **audit ledger payload** with `financeReviewRequired` and `legalHold` flags for SAP alignment.
- **Daily reconciliation** compares WMS physical counts vs SAP ledger; mismatches surface before period close.
- **Multi-tenant telemetry** tags `tenant.id` in OTel — supporting data governance and noisy-neighbor isolation at the gateway.

---

## Quick start

```powershell
cd C:\Users\agarw\Integrations\3-saas-application
npm install
npm run dev
```

Open **http://localhost:8080/** for the dev portal, or:

```bash
curl -X POST http://localhost:8080/api/v1/execution/orders \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant-acme" \
  -H "x-correlation-id: $(uuidgen)" \
  -d '{"omsOrderRef":"OMS-10042","wesVendor":"Locus"}'
```

---

## Project layout

```
├── 1-iaas-infra/terraform/     # VPC, EKS, Karpenter IRSA, RDS + RLS SQL
├── 2-paas-platform/            # Helm, Istio, OTel, Splunk, Karpenter YAML
├── 3-saas-application/src/     # Express API domains + dev portal
├── .github/workflows/deploy.yml
├── Jenkinsfile
├── AGENTS.md
└── README.md                   # This file — architecture + workflow diagrams
```

---

## License

Apache-2.0 (configure per your enterprise policy).
