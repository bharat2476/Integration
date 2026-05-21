

##

I led the product vision for a **multi-warehouse integration platform** that connects OMS, ERP, WMS, WES, WCS, and TMS through orchestrated APIs—so customer orders ship on time without manual handoffs. We built **IaaS + SaaS once**, deployed with **Docker via Jenkins**, and scale VMs on **peak demand via Terraform**—not a custom integration per building.

---

## Problem

| Pain | Cost |
|------|------|
| Six+ domain systems, each with its own API and owner | Re-keying orders, delayed waves, wrong trailer |
| Peak weeks (e.g. high-volume selling) | Backlogs, SLA misses, emergency infra heroics |
| New warehouse or robotics vendor | Months of point-to-point projects |
| Finance vs floor mismatch | OS&D surprises, audit risk |

---

## Product thesis

**One orchestration layer, many warehouses.**  
Global cloud coordinates OMS → ERP → TMS (load) → WMS → TMS (rate) → ERP close. Edge on-prem handles WES/WCS latency. Same Docker image and APIs everywhere; site differences are config, not a fork.

**TMS load before WMS pick** — non-negotiable sequencing: every order gets a **load ID**, staging lane, and trailer *before* Manhattan releases pick—so WCS stages to the right dock.

**Rush vs standard** — productized priority (SLA, wave tier, freight class), not “first come, first served.”

---

## What we shipped (outcomes)

| Outcome | Mechanism |
|---------|-----------|
| On-time delivery | SLA + `priorityScore`; RUSH waves |
| Dock accuracy | TMS `tmsLoadId` → WCS stage/load |
| Peak readiness | Terraform baseline + Karpenter burst + HPA |
| Cost | Shared platform across DCs; Edge only where latency requires |
| Safe velocity | Jenkins/GHA: Docker + Terraform + tenant smoke before `main` |
| Audit | OS&D reason codes; WMS vs SAP reconciliation |

---

## System landscape (one table)

| System | Job | Integration moment |
|--------|-----|-------------------|
| **OMS** | Sell & promise dates | Order ingest |
| **ERP** | Money & ledger | Pledge → close |
| **TMS** | Load + carrier | **Load ID before WMS**; rate at ship |
| **WMS** | Plan & confirm pick/ship | Wave after load |
| **WES** | Robots | Vendor APIs per site |
| **WCS** | Conveyors / staging / trailer | Lane from TMS load |
| **PIM** | Catalog | Async—never blocks orders |

---

## Architecture (product view)

```
Many warehouses ──► Shared SaaS API (Docker) ◄── Jenkins / GHA
                           │
                    Global: OMS·ERP·TMS·WMS
                           │
                    Edge: WES·WCS (on-prem)
                           │
              Terraform + Karpenter (peak VMs)
```

---

## Demo

|-----|-----|-----|
| 0–1 | Open `/ui/guide` | “Six systems, one flow—integration is the product.” |
| 1–2 | `/ui/orders` — **rush** order | “ERP pledge, then TMS load ID, then WMS wave—note `tmsLoadId` in JSON.” |
| 2–3 | Same — **standard** order | “Lower priority score, STANDARD wave, ground freight.” |
| 3–4 | `/ui/warehouse` — stage + label | “WCS uses TMS lane; WMS/WES floor APIs.” |
| 4–5 | `/ui/inventory` — reconciliation | “Finance alignment—WMS vs ERP.” |
| 5–6 | `/ui/platform` | “Platform for all DCs—Terraform peak, Jenkins Docker.” |
| 6–7 | README or this brief | “Outcomes, roadmap, how I’d measure success.” |

---

## How I’d measured success

| Metric | Why |
|--------|-----|
| Order-to-ship SLA hit rate (rush vs standard) | Customer promise |
| Integration failure rate by stage (OMS…ERP) | Where to invest |
| Mean time to onboard a new DC | Platform leverage |
| Cost per million orders (shared infra) | Business case |
| % changes via CI without Sev-1 | Delivery discipline |
| OS&D audit cycle time | Finance trust |

---

## Tech depth

Engineers: [docs/TECH.md](docs/TECH.md) · In-app [Platform UI](http://localhost:8080/ui/platform)

---

## Questions to ask the hiring manager

- How is integration funding prioritized vs net-new channel features?  
- What is the current SLA baseline for rush D2C?  
- How many DCs share one WMS estate vs isolated?  
- Where do product and platform engineering boundaries sit today?
