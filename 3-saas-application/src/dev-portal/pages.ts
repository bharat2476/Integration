import { renderShell, renderGuideShell } from "./shared.js";
import { GUIDE_EXTRA_STYLES, productGuideBody } from "./product-guide.js";

const PAGES: Record<string, () => string> = {
  guide: () =>
    renderGuideShell(
      "guide",
      "Product Guide",
      "What OmniRoute-Core does — for business, operations, and finance stakeholders. No technical background required.",
      productGuideBody(),
      GUIDE_EXTRA_STYLES,
    ),

  home: () =>
    renderShell(
      "home",
      "Overview",
      "Technical API console for engineers. New to the product? Start with the Product Guide.",
      `
    <section>
      <h2>Non-technical?</h2>
      <a class="ui-card" href="/ui/guide">
        <strong>→ Open Product Guide</strong>
        <p>Full walkthrough and links to every UI screen.</p>
      </a>
    </section>
    <section>
      <h2>Quick start</h2>
      <p class="flow">OMS → GCP (Nike protocols) → API → SQL + MongoDB · Edge warehouse tasks on-prem</p>
      <button type="button" data-post="/api/v1/execution/orders" data-body='{"omsOrderRef":"OMS-10042","wesVendor":"Locus"}'>Run sample order pipeline</button>
      <button type="button" class="secondary" data-get="/api/v1/pubsub/metrics/backlog">Pub/Sub backlog</button>
    </section>
    <section>
      <h2>All UI pages</h2>
      <p><span class="tag">/ui/guide</span> Product Guide (start here for demos)</p>
      <p><span class="tag">/ui/orders</span> SAP → Manhattan → WES → TMS loop</p>
      <p><span class="tag">/ui/catalog</span> PIM async catalog delta</p>
      <p><span class="tag">/ui/warehouse</span> Floor + robotics tasks</p>
      <p><span class="tag">/ui/inventory</span> Cycle count, reconciliation, OS&D</p>
      <p><span class="tag">/ui/platform</span> Global vs Edge, MongoDB, SQL, GCP</p>
      <p><span class="tag">/ui/health</span> Liveness and readiness</p>
    </section>
    `,
    ),

  orders: () =>
    renderShell(
      "orders",
      "Order execution",
      "End-to-end customer order flow with rush vs standard priority. Each stage logs correlation ID, SLA, and wave tier.",
      `
    <section>
      <h2>Start pipeline</h2>
      <p class="sub" style="margin-top:0">Rush orders get higher priority score, RUSH WMS wave, and expedited freight.</p>
      <div class="grid2">
        <label>OMS order ref <input id="omsRef" value="OMS-10042" /></label>
        <label>Ship urgency
          <select id="shipUrgency">
            <option value="rush">Rush / urgent (~24h SLA)</option>
            <option value="standard" selected>Standard / non-rush (~5 day SLA)</option>
          </select>
        </label>
        <label>WES vendor
          <select id="wesVendor">
            <option value="Locus">Locus</option>
            <option value="Rapyuta">Rapyuta</option>
            <option value="AutoStore">AutoStore</option>
            <option value="Vanderlande">Vanderlande</option>
            <option value="Schaefer">Schaefer</option>
          </select>
        </label>
      </div>
      <button type="button" id="btnStartOrder">POST /api/v1/execution/orders</button>
    </section>
    <section>
      <h2>Lookup order state</h2>
      <label>Order ID (from start response) <input id="orderId" placeholder="uuid" /></label>
      <button type="button" id="btnGetOrder">GET /api/v1/execution/orders/:orderId</button>
    </section>
    <script>
      document.getElementById("btnStartOrder").onclick = () => {
        const body = JSON.stringify({
          omsOrderRef: document.getElementById("omsRef").value,
          shipUrgency: document.getElementById("shipUrgency").value,
          wesVendor: document.getElementById("wesVendor").value
        });
        runApi("POST", "/api/v1/execution/orders", body);
      };
      document.getElementById("btnGetOrder").onclick = () => {
        const id = document.getElementById("orderId").value.trim();
        if (!id) { document.getElementById("out").textContent = "Enter an order ID"; return; }
        runApi("GET", "/api/v1/execution/orders/" + id);
      };
    </script>
    `,
    ),

  catalog: () =>
    renderShell(
      "catalog",
      "PIM catalog",
      "Publish catalog deltas asynchronously — topic pim.catalog.delta fans out to warehouse nodes.",
      `
    <section>
      <h2>Catalog delta</h2>
      <label>PIM batch ID <input id="pimBatch" value="PIM-BATCH-001" /></label>
      <label>Items JSON
        <textarea id="catalogBody">{"pimBatchId":"PIM-BATCH-001","operation":"UPSERT","items":[{"sku":"SKU-HYDRO-001","attributes":{"name":"Hydro Vest","category":"hydration"}}]}</textarea>
      </label>
      <button type="button" data-post="/api/v1/catalog/delta" data-body-from="catalogBody">POST /api/v1/catalog/delta</button>
    </section>
    `,
    ),

  warehouse: () =>
    renderShell(
      "warehouse",
      "Warehouse tasks",
      "Edge on-prem style endpoints — manual floor work and automation (AMR, auto-pack, labels).",
      `
    <section>
      <h2>Manual WMS</h2>
      <button data-post="/api/v1/warehouse-tasks/wave/release" data-body='{"waveId":"WAVE-100"}'>Release wave</button>
      <button data-post="/api/v1/warehouse-tasks/pick" data-body='{"pickListId":"PICK-42"}'>Pick task</button>
      <button data-post="/api/v1/warehouse-tasks/pack/verify" data-body='{"stationId":"PACK-3","orderId":"ORD-1"}'>Pack verify</button>
      <button data-post="/api/v1/warehouse-tasks/stage" data-body='{"orderId":"ORD-1","stagingLane":"LANE-A"}'>Stage order</button>
      <button data-post="/api/v1/warehouse-tasks/load/trailer" data-body='{"trailerId":"TRL-9","doorId":"DOOR-2"}'>Fluid load trailer</button>
      <button data-post="/api/v1/warehouse-tasks/ship" data-body='{"orderId":"ORD-1"}'>Ship order</button>
    </section>
    <section>
      <h2>Automation & labels</h2>
      <button data-post="/api/v1/warehouse-tasks/auto-pick" data-body='{"vendor":"Locus","missionId":"AMR-771"}'>Auto-pick (Locus)</button>
      <button data-post="/api/v1/warehouse-tasks/auto-pack" data-body='{"scannerId":"SCAN-12","orderId":"ORD-1"}'>Auto-pack</button>
      <button data-post="/api/v1/warehouse-tasks/labels/print" data-body='{"orderId":"ORD-DEMO-1","format":"ZPL"}'>Print label (ZPL)</button>
      <button data-post="/api/v1/warehouse-tasks/labels/print" data-body='{"orderId":"ORD-DEMO-1","format":"PDF"}'>Print label (PDF)</button>
    </section>
    `,
    ),

  inventory: () =>
    renderShell(
      "inventory",
      "Inventory & OS&D",
      "Structured facts → SQL · JSON audits → MongoDB (production). Demo uses in-memory ledger.",
      `
    <section>
      <h2>Cycle count</h2>
      <button data-post="/api/v1/inventory/cycle-count" data-body='{"sku":"SKU-HYDRO-001","locationId":"LOC-A1","countedQty":118}'>Cycle count</button>
    </section>
    <section>
      <h2>Reconciliation</h2>
      <button data-post="/api/v1/inventory/reconciliation/daily" data-body='{"siteId":"SITE-EAST"}'>Daily WMS vs SAP reconciliation</button>
    </section>
    <section>
      <h2>OS&D adjustment</h2>
      <label>Request JSON
        <textarea id="adjBody">{"sku":"SKU-HYDRO-001","locationId":"LOC-A1","reasonCode":"CNT-SHORT","adjustmentType":"shortage","quantityDelta":-2,"notes":"Cycle count variance"}</textarea>
      </label>
      <button data-post="/api/v1/inventory/adjustments" data-body-from="adjBody">POST adjustment</button>
      <button class="secondary" data-get="/api/v1/inventory/audit-ledger">GET audit ledger</button>
    </section>
    `,
    ),

  platform: () =>
    renderShell(
      "platform",
      "Global / Edge / Data platform",
      "How production was integrated — not the optional Terraform PostgreSQL sample.",
      `
    <section>
      <h2>Integration components</h2>
      <p><strong>Global (cloud):</strong> Shared Manhattan WMS estate — OMS, PIM, SAP, TMS orchestration.</p>
      <p><strong>Edge (on-prem):</strong> Per-warehouse WES vendors — low latency robotics and scanners.</p>
    </section>
    <section>
      <h2>Data stores</h2>
      <p><span class="tag">MongoDB</span> JSON, events, raw partner payloads, audit documents</p>
      <p><span class="tag">SQL</span> Orders, inventory ledger, reconciliation (not PostgreSQL)</p>
      <p><span class="tag">GCP</span> Transform to / from Nike in-house service protocols</p>
    </section>
    <section>
      <h2>Order flow (reference)</h2>
      <pre class="flow">PIM → GCP → MongoDB + API → pub/sub → warehouse nodes
OMS → GCP → API → SAP → Manhattan → WES → TMS → SAP
Floor → Edge API → warehouse-tasks → WES / WMS</pre>
      <p class="sub">Full diagrams: <a href="https://github.com/bharat2476/Integration/blob/main/README.md">README.md</a></p>
    </section>
    `,
    ),

  health: () =>
    renderShell(
      "health",
      "Health & metrics",
      "Kubernetes probes and pub/sub backlog depth (HPA signal in production Helm chart).",
      `
    <section>
      <h2>Probes</h2>
      <button data-get="/health/live">GET /health/live</button>
      <button data-get="/health/ready">GET /health/ready</button>
    </section>
    <section>
      <h2>Metrics</h2>
      <button data-get="/api/v1/pubsub/health">GET /api/v1/pubsub/health</button>
      <button data-get="/api/v1/pubsub/metrics/backlog">GET /api/v1/pubsub/metrics/backlog</button>
    </section>
    `,
    ),
};

export function renderPage(pageId: string): string | null {
  const render = PAGES[pageId];
  return render ? render() : null;
}

export function listPageIds(): string[] {
  return Object.keys(PAGES);
}
