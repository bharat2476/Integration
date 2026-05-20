/** Non-technical product guide body HTML (used by /ui/guide). */

export const GUIDE_EXTRA_STYLES = `
  .callout { background: #1e3a5f; border: 1px solid #2563eb; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
  .outcomes { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.6rem; margin: 0.75rem 0; }
  .outcome { background: #0a0e14; border: 1px solid #2a3a52; border-radius: 6px; padding: 0.65rem; }
  .outcome strong { display: block; font-size: 0.85rem; color: #e7ecf3; }
  .outcome span { font-size: 0.75rem; color: #8b9cb3; }
  .ui-card { display: block; background: #253045; border: 1px solid #3d5270; border-radius: 8px; padding: 0.85rem 1rem; margin-bottom: 0.5rem; text-decoration: none; color: #e7ecf3; }
  .ui-card:hover { border-color: #7eb8ff; background: #2a3d58; }
  .ui-card strong { color: #7eb8ff; }
  .ui-card p { margin: 0.35rem 0 0; font-size: 0.82rem; color: #8b9cb3; }
  details { background: #1a2332; border: 1px solid #2a3a52; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 0.5rem; }
  details summary { cursor: pointer; font-weight: 600; color: #e7ecf3; }
  details .inner { margin-top: 0.75rem; font-size: 0.88rem; color: #b8c5d9; }
  details .inner a { color: #7eb8ff; }
  ul.plain { margin: 0.5rem 0 0 1.1rem; padding: 0; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 640px) { .two-col { grid-template-columns: 1fr; } }
`;

export function productGuideBody(): string {
  return `
    <div class="callout">
      <strong>OmniRoute-Core — explained simply</strong>
      <p style="margin:0.5rem 0 0;color:#b8c5d9;font-size:0.9rem">
        Think of this as a <strong>translation and coordination layer</strong> between your selling systems,
        warehouses, finance, and carriers. It is not a replacement for Manhattan, SAP, or your robots —
        it is the <strong>glue</strong> that keeps them speaking the same language without blocking each other during busy seasons.
      </p>
    </div>

    <section>
      <h2>What is the objective?</h2>
      <p><strong>Main goal:</strong> Move orders and product data safely across many systems while keeping costs down, meeting warehouse speed targets, and leaving a clear audit trail for Finance and Legal.</p>
      <p>The platform answers three questions for the business:</p>
      <ol class="plain">
        <li><strong>Is the order financially and operationally ready?</strong> — SAP, WMS, robotics, and shipping aligned.</li>
        <li><strong>Is our product information correct everywhere?</strong> — PIM updates reach every warehouse without halting orders.</li>
        <li><strong>Do our books match the building?</strong> — Inventory counts, shortages, and damage are recorded with proper reason codes.</li>
      </ol>
      <div class="outcomes">
        <div class="outcome"><strong>Faster fulfillment</strong><span>One order path, fewer manual handoffs</span></div>
        <div class="outcome"><strong>Lower infra cost</strong><span>Shared cloud + on-prem Edge only where needed</span></div>
        <div class="outcome"><strong>Resilience</strong><span>Multi-region cloud; floor keeps working if a region blips</span></div>
        <div class="outcome"><strong>Compliance</strong><span>OS&amp;D audits and correlation IDs on every step</span></div>
      </div>
    </section>

    <section>
      <h2>Two parts of the product: Global and Edge</h2>
      <div class="two-col">
        <div>
          <p><span class="tag">Global</span> <strong>Cloud — shared by all brands on one WMS</strong></p>
          <ul class="plain">
            <li>Order orchestration (OMS → SAP → Manhattan → carriers → SAP close)</li>
            <li>PIM catalog updates to all warehouses</li>
            <li>Inventory reconciliation and finance adjustments</li>
            <li>GCP translates messages to <strong>Nike in-house service protocols</strong></li>
          </ul>
        </div>
        <div>
          <p><span class="tag">Edge</span> <strong>On-prem — one warehouse at a time</strong></p>
          <ul class="plain">
            <li>Release waves, pick, pack, stage, ship</li>
            <li>Robotics (Locus, Rapyuta, AutoStore, etc.)</li>
            <li>Shipping labels at the pack station</li>
            <li>Stays local for <strong>low latency</strong> and tight SLOs</li>
          </ul>
        </div>
      </div>
      <p class="sub" style="margin-top:0.75rem">Explore the technical summary on <a href="/ui/platform">Global / Edge / Data</a>.</p>
    </section>

    <section>
      <h2>Where data lives (plain language)</h2>
      <p><span class="tag">SQL database</span> Structured facts — order numbers, quantities, reconciliation results.</p>
      <p><span class="tag">MongoDB</span> Flexible JSON — large catalog payloads, event details, audit documents.</p>
      <p><span class="tag">GCP</span> The <strong>translator</strong> between partner systems and Nike internal services.</p>
      <p style="font-size:0.85rem;color:#8b9cb3">PostgreSQL was not used for this integration.</p>
    </section>

    <section>
      <h2>The big picture</h2>
      <pre class="flow">Customer order (OMS)
    → GCP (Nike protocol translation)
    → Global coordination (SAP · Manhattan · TMS)
    → Edge warehouse (pick · pack · robots · ship)
    → Finance close + inventory audit
    → Splunk dashboards (latency · errors · savings)</pre>
    </section>

    <section>
      <h2>Explore the app — every screen</h2>
      <p class="sub" style="margin-top:0">Use the links below to open each area of the local demo. Start with <strong>Product Guide</strong> (this page), then try one workflow.</p>

      <a class="ui-card" href="/ui/guide"><strong>Product Guide</strong><p>Plain-language overview — you are here.</p></a>
      <a class="ui-card" href="/ui/orders"><strong>Order execution</strong><p>Run a sample order from OMS through SAP, warehouse, robotics, shipping, and financial close.</p></a>
      <a class="ui-card" href="/ui/catalog"><strong>PIM catalog</strong><p>Send a product update that fans out to warehouses without stopping orders.</p></a>
      <a class="ui-card" href="/ui/warehouse"><strong>Warehouse tasks</strong><p>Floor and automation actions: waves, picks, AMRs, labels, ship confirm.</p></a>
      <a class="ui-card" href="/ui/inventory"><strong>Inventory &amp; OS&amp;D</strong><p>Cycle counts, daily reconciliation, overage/shortage/damage with audit trail.</p></a>
      <a class="ui-card" href="/ui/platform"><strong>Global / Edge / Data</strong><p>How cloud, on-prem, SQL, MongoDB, and GCP fit together.</p></a>
      <a class="ui-card" href="/"><strong>Overview (technical console)</strong><p>Quick API buttons for engineers — same tenant header as other pages.</p></a>
      <a class="ui-card" href="/ui/health"><strong>Health &amp; metrics</strong><p>Check that services are up and event queues are healthy.</p></a>
    </section>

    <section>
      <h2>Step-by-step walkthrough (maps to each UI)</h2>

      <details open>
        <summary>Step 1 — Read the Product Guide (this page)</summary>
        <div class="inner">
          <p>Understand Global vs Edge and which systems connect. No login required for local demo.</p>
          <p><a href="/ui/guide">Stay on Product Guide</a></p>
        </div>
      </details>

      <details>
        <summary>Step 2 — Product catalog update (PIM)</summary>
        <div class="inner">
          <p><strong>What you do:</strong> Submit a batch of SKU changes (new items or updates).</p>
          <p><strong>What it represents:</strong> Marketing updated products; every warehouse must see the same item master without overnight batch jobs blocking the morning shift.</p>
          <p><strong>Try it:</strong> <a href="/ui/catalog">Open PIM catalog UI</a> → send catalog delta.</p>
        </div>
      </details>

      <details>
        <summary>Step 3 — Run an order (OMS → finance → warehouse → ship)</summary>
        <div class="inner">
          <p><strong>What you do:</strong> Start an order with an OMS reference and pick a robotics vendor (e.g. Locus).</p>
          <p><strong>What it represents:</strong> A customer order flowing through financial pledge, warehouse wave, robot allocation, freight rating, and SAP close.</p>
          <p><strong>Try it:</strong> <a href="/ui/orders">Open Order execution UI</a> → Start pipeline → copy Order ID → Lookup state.</p>
        </div>
      </details>

      <details>
        <summary>Step 4 — Warehouse floor &amp; robotics (Edge)</summary>
        <div class="inner">
          <p><strong>What you do:</strong> Trigger wave release, pick, pack verify, auto-pick, print label, ship.</p>
          <p><strong>What it represents:</strong> What operators and AMRs do on-site — kept on-prem for speed.</p>
          <p><strong>Try it:</strong> <a href="/ui/warehouse">Open Warehouse tasks UI</a>.</p>
        </div>
      </details>

      <details>
        <summary>Step 5 — Inventory hygiene &amp; OS&amp;D (Finance / Legal)</summary>
        <div class="inner">
          <p><strong>What you do:</strong> Run cycle count, daily reconciliation, post an adjustment with a reason code, view audit ledger.</p>
          <p><strong>What it represents:</strong> Physical counts matching SAP; documenting overage, shortage, or damage for review.</p>
          <p><strong>Try it:</strong> <a href="/ui/inventory">Open Inventory &amp; OS&amp;D UI</a>.</p>
        </div>
      </details>

      <details>
        <summary>Step 6 — Platform &amp; health (optional)</summary>
        <div class="inner">
          <p><a href="/ui/platform">Global / Edge / Data</a> — architecture summary.</p>
          <p><a href="/ui/health">Health &amp; metrics</a> — liveness and queue depth for operations.</p>
        </div>
      </details>
    </section>

    <section>
      <h2>Who benefits?</h2>
      <div class="two-col">
        <div>
          <p><strong>Operations</strong></p>
          <ul class="plain">
            <li>Clear floor endpoints per action</li>
            <li>Robotics vendor choice per building</li>
            <li>Splunk view of errors by WES vendor</li>
          </ul>
        </div>
        <div>
          <p><strong>Finance &amp; Legal</strong></p>
          <ul class="plain">
            <li>OS&amp;D reason codes enforced</li>
            <li>Audit ledger for adjustments</li>
            <li>WMS vs SAP reconciliation report</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2>It is / It is not</h2>
      <div class="two-col">
        <ul class="plain">
          <li><strong>Is</strong> an integration and orchestration platform</li>
          <li><strong>Is</strong> multi-tenant and multi-region in the cloud</li>
          <li><strong>Is</strong> built for peak events (e.g. high-volume selling periods)</li>
        </ul>
        <ul class="plain">
          <li><strong>Is not</strong> a replacement for Manhattan or SAP</li>
          <li><strong>Is not</strong> a single database for everything (uses SQL + MongoDB)</li>
          <li><strong>Is not</strong> only cloud — Edge stays in the warehouse</li>
        </ul>
      </div>
    </section>

    <section>
      <h2>5-minute try path</h2>
      <ol class="plain">
        <li>Read this guide</li>
        <li><a href="/ui/catalog">Catalog</a> — send one product update</li>
        <li><a href="/ui/orders">Orders</a> — run sample pipeline</li>
        <li><a href="/ui/warehouse">Warehouse</a> — print a sample label</li>
        <li><a href="/ui/inventory">Inventory</a> — view audit ledger</li>
      </ol>
      <p class="sub">Technical README and diagrams: <a href="https://github.com/bharat2476/Integration/blob/main/README.md" target="_blank" rel="noopener">GitHub Integration repo</a></p>
    </section>
  `;
}
