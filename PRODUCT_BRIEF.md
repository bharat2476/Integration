# Product brief — Director of Product Management interview

**Candidate artifact:** Omni-Channel End to End Integration (OmniRoute-Core)  
**Repo:** [github.com/bharat2476/Integration](https://github.com/bharat2476/Integration)  
**Live demo:** [http://localhost:8080/ui/guide](http://localhost:8080/ui/guide) (`npm run dev` in `3-saas-application`)

---

## 30-second pitch

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

## 7-minute demo script (use in interview)

| Min | Do | Say |
|-----|-----|-----|
| 0–1 | Open `/ui/guide` | “Six systems, one flow—integration is the product.” |
| 1–2 | `/ui/orders` — **rush** order | “ERP pledge, then TMS load ID, then WMS wave—note `tmsLoadId` in JSON.” |
| 2–3 | Same — **standard** order | “Lower priority score, STANDARD wave, ground freight.” |
| 3–4 | `/ui/warehouse` — stage + label | “WCS uses TMS lane; WMS/WES floor APIs.” |
| 4–5 | `/ui/inventory` — reconciliation | “Finance alignment—WMS vs ERP.” |
| 5–6 | `/ui/platform` | “Platform for all DCs—Terraform peak, Jenkins Docker.” |
| 6–7 | README or this brief | “Outcomes, roadmap, how I’d measure success.” |

---

## STAR stories (prepare these)

**Situation — Peak volume**  
Black Friday–class catalog + order spikes threatened to block picking.

**Task**  
Keep integrations reliable without per-warehouse infra projects.

**Action**  
Platform approach: shared SaaS, async PIM pub/sub, Terraform/Karpenter burst, per-tenant rate limits, rush priority in the order API.

**Result**  
One codebase serves all DCs; engineers tune variables instead of provisioning ad-hoc servers; demo shows backlog-driven scale story.

---

**Situation — Wrong trailer / staging chaos**  
Orders reached pick before transportation planned the load.

**Task**  
Guarantee dock correctness under rush and standard mix.

**Action**  
Product rule: **TMS load assignment is a gate before WMS wave**; API returns `stagingLane`, `trailerId`; WCS endpoints consume them.

**Result**  
Traceable correlation ID across TMS → WMS → WCS; fewer mis-staged cartons (narrative for interview—tie to your real metrics if you have them).

---

## How I’d measure success as Director

| Metric | Why |
|--------|-----|
| Order-to-ship SLA hit rate (rush vs standard) | Customer promise |
| Integration failure rate by stage (OMS…ERP) | Where to invest |
| Mean time to onboard a new DC | Platform leverage |
| Cost per million orders (shared infra) | Business case |
| % changes via CI without Sev-1 | Delivery discipline |
| OS&D audit cycle time | Finance trust |

---

## Roadmap I’d pitch next (shows strategic thinking)

1. Replace in-process pub/sub with managed bus (Kafka / GCP Pub/Sub).  
2. Self-service tenant onboarding + API portal for partners.  
3. Real-time SLA dashboard per DC and vendor (WES error rate).  
4. Load-building optimization in TMS (multi-order trailers).  
5. Chaos testing for regional failover while Edge runs autonomously.

---

## Tech depth

Engineers: [docs/TECH.md](docs/TECH.md) · In-app [Platform UI](http://localhost:8080/ui/platform)

---

## Questions to ask the hiring manager

- How is integration funding prioritized vs net-new channel features?  
- What is the current SLA baseline for rush D2C?  
- How many DCs share one WMS estate vs isolated?  
- Where do product and platform engineering boundaries sit today?
