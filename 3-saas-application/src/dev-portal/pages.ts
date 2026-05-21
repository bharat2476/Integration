import { renderShell, renderGuideShell } from "./shared.js";
import { GUIDE_EXTRA_STYLES, productGuideBody } from "./product-guide.js";

const PAGES: Record<string, () => string> = {
  guide: () =>
    renderGuideShell(
      "guide",
      "Product Guide",
      "Integration across OMS, ERP, WMS, WES, WCS, and TMS — many APIs, one orchestrated flow.",
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
      "OMS → ERP → WMS → WES → TMS via orchestrated APIs. Rush vs standard changes wave tier and freight.",
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
      "WMS, WES, and WCS APIs — waves, picks, robotics, staging, labels, ship confirm.",
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
      "Tech persona — systems & APIs",
      "OMS · ERP · WMS · WES · WCS · TMS — multiple partner APIs orchestrated through OmniRoute-Core.",
      `
    <section>
      <h2>System landscape</h2>
      <table class="timeline" style="width:100%;border-collapse:collapse;font-size:0.82rem">
        <thead><tr><th style="border:1px solid #2a3a52;padding:0.4rem">Layer</th><th style="border:1px solid #2a3a52;padding:0.4rem">System</th><th style="border:1px solid #2a3a52;padding:0.4rem">Demo integration surface</th></tr></thead>
        <tbody>
          <tr><td style="border:1px solid #2a3a52;padding:0.4rem">Sell</td><td>OMS + PIM</td><td style="border:1px solid #2a3a52;padding:0.4rem"><code>POST /api/v1/execution/orders</code> · <code>POST /api/v1/catalog/delta</code></td></tr>
          <tr><td style="border:1px solid #2a3a52;padding:0.4rem">Finance</td><td>ERP (SAP)</td><td style="border:1px solid #2a3a52;padding:0.4rem">Pledge + close inside <code>execution/order-pipeline.ts</code></td></tr>
          <tr><td style="border:1px solid #2a3a52;padding:0.4rem">Plan</td><td>WMS (Manhattan)</td><td style="border:1px solid #2a3a52;padding:0.4rem"><code>/api/v1/warehouse-tasks/wave/release</code> · <code>/pick</code> · <code>/ship</code></td></tr>
          <tr><td style="border:1px solid #2a3a52;padding:0.4rem">Automate</td><td>WES</td><td style="border:1px solid #2a3a52;padding:0.4rem"><code>/auto-pick</code> · <code>/auto-pack</code> (Locus, Rapyuta, AutoStore…)</td></tr>
          <tr><td style="border:1px solid #2a3a52;padding:0.4rem">Move</td><td>WCS</td><td style="border:1px solid #2a3a52;padding:0.4rem"><code>/stage</code> · <code>/load/trailer</code> (conveyors / dock)</td></tr>
          <tr><td style="border:1px solid #2a3a52;padding:0.4rem">Ship</td><td>TMS (Blue Yonder)</td><td style="border:1px solid #2a3a52;padding:0.4rem">Freight rate in order pipeline · <code>TMS_RATED</code></td></tr>
          <tr><td style="border:1px solid #2a3a52;padding:0.4rem">Reconcile</td><td>ERP + WMS</td><td style="border:1px solid #2a3a52;padding:0.4rem"><code>/api/v1/inventory/reconciliation/daily</code> · OS&amp;D adjustments</td></tr>
        </tbody>
      </table>
      <p class="sub">All routes require <code>x-tenant-id</code> and <code>x-correlation-id</code> (multi-tenant smoke tests enforce this in CI).</p>
    </section>
    <section>
      <h2>Global vs Edge</h2>
      <p><strong>Global (cloud):</strong> OMS, PIM, ERP, WMS host, TMS — shared across tenants on one Manhattan estate.</p>
      <p><strong>Edge (on-prem):</strong> WES + WCS + scanners — sub-second handshakes; site-specific vendor APIs.</p>
    </section>
    <section>
      <h2>Data stores</h2>
      <p><span class="tag">MongoDB</span> JSON, events, raw partner payloads, audit documents</p>
      <p><span class="tag">SQL</span> Orders, inventory ledger, reconciliation (not PostgreSQL)</p>
      <p><span class="tag">GCP</span> Transform to / from Nike in-house service protocols</p>
    </section>
    <section>
      <h2>Pub/Sub (async integration)</h2>
      <p><span class="tag">pim.catalog.delta</span> PIM → warehouses without blocking order APIs</p>
      <p><span class="tag">order.execution.stage</span> ERP / WMS / TMS stage events for observability</p>
      <p><span class="tag">inventory.adjustment.posted</span> OS&amp;D → finance audit trail</p>
    </section>
    <section>
      <h2>Order flow (reference)</h2>
      <pre class="flow">OMS → GCP → POST /execution/orders → ERP pledge
  → WMS wave → WES allocate → WCS stage/load → TMS rate → WMS ship → ERP close
PIM → POST /catalog/delta → pub/sub → warehouse SKU cache</pre>
      <p class="sub"><a href="/ui/guide">Non Tech Product Guide</a> · <a href="https://github.com/bharat2476/Integration/blob/main/README.md#tech-persona" target="_blank" rel="noopener">README Tech Persona</a></p>
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
