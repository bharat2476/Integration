# Omni-Channel End to End Integration

Multi-warehouse supply chain integration platform (portfolio / Director PM interview).

| | |
|--|--|
| **Repo** | [github.com/bharat2476/Integration](https://github.com/bharat2476/Integration) |
| **Live demo** | [http://localhost:8080/ui/guide](http://localhost:8080/ui/guide) |
| **Engineering** | [docs/TECH.md](docs/TECH.md) |

---

**One orchestration layer, many warehouses.** OMS, ERP, WMS, WES, WCS, and TMS each have their own APIs—we chain them so orders ship on time without manual handoffs. **IaaS + SaaS built once**, delivered with **Docker (Jenkins)**, scaled on peak via **Terraform**—not a custom integration per building.

**Product rules:** (1) **TMS load ID before WMS pick** — staging lane + trailer before pick release. (2) **Rush vs standard** — SLA, wave tier, freight class.

---

## Problem → product answer

| Pain | Answer |
|------|--------|
| Six systems, six API estates | One flow, one `correlationId` |
| Rush orders miss SLA | `priorityScore`, RUSH waves, expedited TMS |
| Wrong dock / trailer | TMS load → WCS stage → correct trailer |
| Peak weeks | Shared platform + Terraform/Karpenter burst |
| New DC = new project | Same APIs; Edge config for local WES/WCS only |

---

## Systems integrated

| System | Role | When |
|--------|------|------|
| **OMS** | Orders, rush vs standard | Ingest |
| **ERP** | Pledge, ledger, close | Start / end |
| **TMS** | **Load ID**, lane, trailer; then freight | **Before WMS**; rate at ship |
| **WMS** | Waves, pick, ship | After load |
| **WES** | Robotics (Locus, AutoStore, …) | Per site |
| **WCS** | Staging, conveyors, trailer load | Uses TMS lane |
| **PIM** | Catalog | Async — never blocks orders |

---

## Data flow diagram

End-to-end movement of **orders**, **catalog**, and **inventory** through the shared platform (Global cloud + Edge warehouses). Every request carries `x-tenant-id` and `x-correlation-id`.

```mermaid
flowchart TB
  subgraph partners [Partner systems]
    OMS[OMS]
    PIM[PIM]
    SAP[ERP / SAP]
    MHT[WMS Manhattan]
    WES_V[WES vendors]
    TMS_B[TMS Blue Yonder]
  end

  subgraph gcp [GCP — protocol translation]
    TR[GCP transforms]
  end

  subgraph global [Global — cloud platform]
    GW[Istio gateway\nx-tenant-id rate limit]
    API[OmniRoute SaaS API\nDocker / K8s]
    PS[(Pub/Sub broker)]
  end

  subgraph data [Persistence]
    SQL[(SQL — orders inventory)]
    MONGO[(MongoDB — JSON events)]
  end

  subgraph edge [Edge — per warehouse on-prem]
    WH_API[warehouse-tasks API]
    WCS_F[WCS conveyors staging]
    WES_F[WES robotics]
  end

  OMS & PIM --> TR
  TR <--> SAP & MHT & TMS_B
  TR --> API
  OMS --> API
  API --> GW
  GW --> API
  API --> PS
  API --> SQL & MONGO

  PIM -.->|POST /catalog/delta| API
  PS -.->|pim.catalog.delta| MHT

  API -->|execution pipeline| SAP & TMS_B & MHT
  API <-->|order stages| PS

  MHT <-->|wave pick ship| WH_API
  WH_API --> WES_F & WCS_F
  WES_V --- WES_F
  TMS_B -.->|loadId lane trailer| WCS_F

  subgraph cicd [Delivery and peak scale]
    JEN[Jenkins / GHA]
    DOC[Docker image]
    TF[Terraform EKS VMs]
    KARP[Karpenter burst]
  end

  JEN --> DOC --> API
  TF --> KARP --> global
```

| Flow | Path | Async? |
|------|------|--------|
| **Order** | OMS → GCP → API → ERP → **TMS load** → WMS → WES → TMS rate → ERP close | Sync pipeline + stage events on pub/sub |
| **Catalog** | PIM → API → `pim.catalog.delta` → warehouse SKU cache | Yes — does not block orders |
| **Floor** | API `warehouse-tasks` → WMS / WES / WCS (uses `tmsLoadId`, `stagingLane`) | Edge, low latency |
| **Inventory** | Cycle count / reconciliation / OS&D → SQL + MongoDB audit | Finance alignment |

---

## Sequence diagram — customer order

**Rule:** TMS assigns **load ID** (staging lane + trailer) **before** WMS releases pick. Rush vs standard changes SLA, wave tier, and freight class.

```mermaid
sequenceDiagram
  autonumber
  actor Customer
  participant OMS as OMS
  participant GCP as GCP
  participant API as OmniRoute API
  participant PS as Pub/Sub
  participant SAP as ERP SAP
  participant TMS as TMS
  participant WMS as WMS
  participant WES as WES
  participant WCS as WCS
  participant SQL as SQL DB
  participant MG as MongoDB

  Customer->>OMS: Place order rush or standard
  OMS->>GCP: Order payload partner protocol
  GCP->>API: POST /api/v1/execution/orders\nx-tenant-id x-correlation-id
  API->>PS: publish RECEIVED_OMS
  API->>SQL: Persist order facts
  API->>MG: Persist event JSON

  API->>SAP: pledgeSapFinancial
  SAP-->>API: ERP_PLEDGED
  API->>PS: publish ERP_PLEDGED

  API->>TMS: reserveTmsLoadForOrder
  Note over TMS,API: loadId stagingLane trailerId doorId
  TMS-->>API: TMS_LOAD_ASSIGNED
  API->>PS: publish TMS_LOAD_ASSIGNED

  API->>WMS: releaseManhattanWave requires tmsLoadId
  WMS-->>API: WMS_WAVE_RELEASED RUSH or STANDARD
  API->>WES: allocateWesRobotics
  WES-->>API: WES_ALLOCATED

  API->>WMS: warehouse-tasks pick pack
  API->>WES: auto-pick auto-pack
  API->>WCS: stage to stagingLane
  API->>WCS: load/trailer trailerId

  API->>TMS: rateBlueYonderFreight
  TMS-->>API: TMS_RATED carrier cost
  API->>PS: publish TMS_RATED

  API->>WMS: ship confirm
  API->>SAP: closeSapOrderLoop
  SAP-->>API: ERP_CLOSED
  API-->>OMS: Shipment complete
  Customer->>Customer: Tracking notification
```

**API response** (`POST /api/v1/execution/orders`): `tmsLoadId`, `stagingLane`, `trailerId`, `doorId`, `priorityScore`, `promisedShipBy`, `waveTier`.

**Rush** ~24h · **Standard** ~5d.

---

## Platform (all warehouses)

```
Many DCs → Shared SaaS API (Docker) ← Jenkins / GitHub Actions
              Global: OMS · ERP · TMS · WMS
              Edge: WES · WCS (on-prem)
              Terraform + Karpenter (peak VMs)
```

| Layer | Shared | Per site |
|-------|--------|----------|
| **SaaS** | Order, catalog, inventory APIs; one Docker image | Edge floor APIs |
| **PaaS** | Helm, gateway, Splunk | Helm values |
| **IaaS** | Terraform, EKS, burst nodes | Region |

---

## Outcomes

| Outcome | Mechanism |
|---------|-----------|
| On-time delivery | SLA + rush priority |
| Dock accuracy | TMS load → WCS |
| Peak readiness | Terraform + Karpenter + HPA |
| Cost | One platform, many DCs |
| Safe releases | Jenkins/GHA + tenant smoke + canary |
| Audit | OS&D codes; WMS vs ERP reconciliation |

**Metrics:** SLA hit rate · failures by stage · time to onboard a DC · cost per million orders · OS&D cycle time.

---

## Demo

| Min | Screen | Say |
|-----|--------|-----|
| 0–1 | [/ui/guide](http://localhost:8080/ui/guide) | Six systems, one flow |
| 1–2 | [/ui/orders](http://localhost:8080/ui/orders) — **rush** | TMS `tmsLoadId` before WMS in JSON |
| 2–3 | Orders — **standard** | Lower priority, STANDARD wave |
| 3–4 | [/ui/warehouse](http://localhost:8080/ui/warehouse) | WMS / WES / WCS |
| 4–5 | [/ui/inventory](http://localhost:8080/ui/inventory) | WMS vs ERP reconciliation |
| 5–6 | [/ui/platform](http://localhost:8080/ui/platform) | Multi-DC platform, Jenkins, Terraform |

---

## Engineers

APIs, pipeline states, CI/CD: **[docs/TECH.md](docs/TECH.md)** · Operator notes: **[AGENTS.md](AGENTS.md)**

---

## License

Apache-2.0 (configure per enterprise policy).
