import { renderShell, renderGuideShell } from "./shared.js";
import { GUIDE_EXTRA_STYLES, productGuideBody } from "./product-guide.js";

const PAGES: Record<string, () => string> = {
  guide: () =>
    renderGuideShell(
      "guide",
      "Product Guide",
      "Interview walkthrough — integration across OMS, ERP, WMS, WES, WCS, TMS.",
      productGuideBody(),
      GUIDE_EXTRA_STYLES,
    ),

  home: () =>
    renderShell(
      "home",
      "API console",
      "Engineering playground. Start with the Product Guide for the product story.",
      `
    <section>
      <a class="ui-card" href="/ui/guide"><strong>→ Product Guide</strong><p>Recommended for interviews and stakeholders.</p></a>
    </section>
    <section>
      <h2>Sample order</h2>
      <button type="button" data-post="/api/v1/execution/orders" data-body='{"omsOrderRef":"OMS-10042","shipUrgency":"rush","wesVendor":"Locus"}'>POST order (rush)</button>
      <button type="button" class="secondary" data-get="/api/v1/pubsub/metrics/backlog">Pub/Sub backlog</button>
    </section>
    `,
    ),

  orders: () =>
    renderShell(
      "orders",
      "Order execution",
      "ERP → TMS loadId → WMS wave → WES → TMS rate → ERP close. Compare rush vs standard.",
      `
    <section>
      <h2>Start pipeline</h2>
      <div class="grid2">
        <label>OMS ref <input id="omsRef" value="OMS-10042" /></label>
        <label>Urgency <select id="shipUrgency">
          <option value="rush">Rush (~24h)</option>
          <option value="standard" selected>Standard (~5d)</option>
        </select></label>
        <label>WES <select id="wesVendor">
          <option value="Locus">Locus</option>
          <option value="Rapyuta">Rapyuta</option>
          <option value="AutoStore">AutoStore</option>
        </select></label>
      </div>
      <button type="button" id="btnStartOrder">POST /api/v1/execution/orders</button>
      <p class="sub">Response includes <code>tmsLoadId</code>, <code>stagingLane</code>, <code>trailerId</code> before WMS wave.</p>
    </section>
    <script>
      document.getElementById("btnStartOrder").onclick = () => runApi("POST", "/api/v1/execution/orders",
        JSON.stringify({
          omsOrderRef: document.getElementById("omsRef").value,
          shipUrgency: document.getElementById("shipUrgency").value,
          wesVendor: document.getElementById("wesVendor").value
        }));
    </script>
    `,
    ),

  catalog: () =>
    renderShell(
      "catalog",
      "PIM catalog",
      "Async catalog delta — does not block order pipeline.",
      `
    <section>
      <label>Payload <textarea id="catalogBody">{"pimBatchId":"PIM-BATCH-001","operation":"UPSERT","items":[{"sku":"SKU-HYDRO-001","attributes":{"name":"Hydro Vest"}}]}</textarea></label>
      <button data-post="/api/v1/catalog/delta" data-body-from="catalogBody">POST /api/v1/catalog/delta</button>
    </section>
    `,
    ),

  warehouse: () =>
    renderShell(
      "warehouse",
      "Warehouse",
      "WMS · WES · WCS — use TMS load fields from order response on stage/load.",
      `
    <section>
      <button data-post="/api/v1/warehouse-tasks/wave/release" data-body='{"waveId":"WAVE-DEMO"}'>Release wave</button>
      <button data-post="/api/v1/warehouse-tasks/auto-pick" data-body='{"vendor":"Locus","missionId":"M-1"}'>Auto-pick</button>
      <button data-post="/api/v1/warehouse-tasks/stage" data-body='{"orderId":"ORD-DEMO","stagingLane":"LANE-RUSH-1"}'>Stage (WCS)</button>
      <button data-post="/api/v1/warehouse-tasks/labels/print" data-body='{"orderId":"ORD-DEMO","format":"ZPL"}'>Print label</button>
      <button data-post="/api/v1/warehouse-tasks/ship" data-body='{"orderId":"ORD-DEMO"}'>Ship</button>
    </section>
    `,
    ),

  inventory: () =>
    renderShell(
      "inventory",
      "Inventory & OS&D",
      "WMS vs ERP reconciliation and audited adjustments.",
      `
    <section>
      <button data-post="/api/v1/inventory/cycle-count" data-body='{"sku":"SKU-HYDRO-001","locationId":"LOC-A1","countedQuantity":118}'>Cycle count</button>
      <button data-post="/api/v1/inventory/reconciliation/daily">Daily reconciliation</button>
      <button class="secondary" data-get="/api/v1/inventory/audit-ledger">Audit ledger</button>
    </section>
    `,
    ),

  platform: () =>
    renderShell(
      "platform",
      "Platform",
      "Shared IaaS + SaaS · Jenkins · Docker · Terraform peak · many warehouses.",
      `
    <section>
      <h2>Platform (product view)</h2>
      <ul class="plain">
        <li><strong>SaaS</strong> — one API + Docker image for every DC</li>
        <li><strong>PaaS</strong> — Helm, gateway, Splunk</li>
        <li><strong>IaaS</strong> — Terraform VMs; Karpenter burst on peak</li>
        <li><strong>CI/CD</strong> — Jenkins + GitHub Actions → same image everywhere</li>
      </ul>
      <p class="sub"><a href="https://github.com/bharat2476/Integration/blob/main/PRODUCT_BRIEF.md" target="_blank" rel="noopener">PRODUCT_BRIEF.md</a> · <a href="https://github.com/bharat2476/Integration/blob/main/docs/TECH.md" target="_blank" rel="noopener">docs/TECH.md</a></p>
    </section>
    <section>
      <h2>Order sequence</h2>
      <pre class="flow">ERP pledge → TMS loadId → WMS wave → WES → WCS → TMS rate → ship → ERP close</pre>
    </section>
    `,
    ),

  health: () =>
    renderShell(
      "health",
      "Health",
      "Liveness and queue depth.",
      `
    <section>
      <button data-get="/health/live">GET /health/live</button>
      <button data-get="/health/ready">GET /health/ready</button>
      <button data-get="/api/v1/pubsub/metrics/backlog">Pub/Sub backlog</button>
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
