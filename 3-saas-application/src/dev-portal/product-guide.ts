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
  .timeline { width: 100%; border-collapse: collapse; font-size: 0.82rem; margin-top: 0.5rem; }
  .timeline th, .timeline td { border: 1px solid #2a3a52; padding: 0.45rem 0.6rem; text-align: left; vertical-align: top; }
  .timeline th { background: #0a0e14; color: #7eb8ff; }
  .rush { color: #fbbf24; font-weight: 600; }
  .persona-pick { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin: 0.75rem 0 1rem; }
  .persona-pick a { display: block; padding: 0.85rem 1rem; border-radius: 8px; text-decoration: none; border: 1px solid #3d5270; background: #253045; color: #e7ecf3; }
  .persona-pick a:hover { border-color: #7eb8ff; }
  .persona-pick a.active { border-color: #2563eb; background: #1e3a5f; }
  .persona-pick strong { color: #7eb8ff; display: block; margin-bottom: 0.25rem; }
  .persona-pick span { font-size: 0.8rem; color: #8b9cb3; }
  @media (max-width: 640px) { .persona-pick { grid-template-columns: 1fr; } }
  .sys-role { font-size: 0.78rem; color: #8b9cb3; display: block; margin-top: 0.2rem; }
  code.api { font-size: 0.75rem; color: #a5d4ff; }
`;

export function productGuideBody(): string {
  return `
    <section>
      <h2>Choose your view</h2>
      <p class="sub" style="margin:0 0 0.5rem">Same product, two guides — pick the one that fits your role.</p>
      <div class="persona-pick">
        <a class="active" href="/ui/guide"><strong>Non Tech</strong><span>Business, ops, finance — you are here</span></a>
        <a href="/ui/platform"><strong>Tech</strong><span>Architecture, APIs, data plane, CI/CD</span></a>
      </div>
      <p class="sub" style="margin:0">Full Tech write-up: <a href="https://github.com/bharat2476/Integration/blob/main/README.md#tech-persona" target="_blank" rel="noopener">README Tech Persona</a></p>
    </section>

    <div class="callout">
      <strong>Omni-Channel End to End Integration — explained simply</strong>
      <p style="margin:0.5rem 0 0;color:#b8c5d9;font-size:0.9rem">
        Fulfillment spans <strong>OMS, ERP, WMS, WES, WCS, and TMS</strong> — each with its own APIs and owners.
        <strong>OmniRoute-Core</strong> orchestrates <strong>many API calls</strong> so they stay in sync: one order,
        one correlation ID, no re-keying between systems (rush ~24h vs standard ~5 days in this demo).
      </p>
    </div>

    <section>
      <h2>Complex systems — why integration is the product</h2>
      <p>
        A single “ship this order” action touches software that was never built as one app.
        Without an integration layer, teams bridge gaps manually. This demo shows how
        <strong>multiple REST APIs</strong> chain together so everything clicks.
      </p>
      <table class="timeline">
        <thead>
          <tr><th>System</th><th>What it owns</th><th>Examples in this demo</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>OMS</strong><br/><span class="sys-role">Order Management System</span></td>
            <td>Customer orders, channels, rush vs standard</td>
            <td><a href="/ui/orders">Order execution</a> → <code class="api">POST /api/v1/execution/orders</code></td>
          </tr>
          <tr>
            <td><strong>ERP</strong><br/><span class="sys-role">Enterprise Resource Planning (SAP)</span></td>
            <td>Financial pledge, inventory ledger, period close</td>
            <td>Stages <code class="api">ERP_PLEDGED</code> → <code class="api">ERP_CLOSED</code> in order pipeline</td>
          </tr>
          <tr>
            <td><strong>WMS</strong><br/><span class="sys-role">Warehouse Management (Manhattan)</span></td>
            <td>Waves, pick lists, locations, ship confirm</td>
            <td><code class="api">…/warehouse-tasks/wave/release</code> · <code class="api">/pick</code> · <code class="api">/ship</code></td>
          </tr>
          <tr>
            <td><strong>WES</strong><br/><span class="sys-role">Warehouse Execution System</span></td>
            <td>Robotics — AMRs, shuttles, goods-to-person</td>
            <td><code class="api">…/auto-pick</code> · <code class="api">/auto-pack</code> (Locus, Rapyuta, AutoStore…)</td>
          </tr>
          <tr>
            <td><strong>WCS</strong><br/><span class="sys-role">Warehouse Control System</span></td>
            <td>Conveyors, sortation, staging, trailer load</td>
            <td><code class="api">…/stage</code> · <code class="api">/load/trailer</code></td>
          </tr>
          <tr>
            <td><strong>TMS</strong><br/><span class="sys-role">Transportation Management (Blue Yonder)</span></td>
            <td>Carrier, service level, freight cost</td>
            <td><code class="api">TMS_RATED</code> in order pipeline</td>
          </tr>
        </tbody>
      </table>
      <p><strong>PIM</strong> (product data): <code class="api">POST /api/v1/catalog/delta</code> on <a href="/ui/catalog">PIM catalog</a> — async, does not block orders.</p>
    </section>

    <section>
      <h2>How the APIs connect (one order)</h2>
      <pre class="flow">OMS  → POST /api/v1/execution/orders
ERP  → pledge + close (inside execution pipeline)
WMS  → wave/release · pick · pack/verify · ship
WES  → auto-pick · auto-pack
WCS  → stage · load/trailer
TMS  → rate freight (rush = expedited)
Inventory → cycle-count · reconciliation · OS&amp;D</pre>
      <p>Walk the chain: <a href="/ui/orders">Orders</a> → <a href="/ui/warehouse">Warehouse</a> → <a href="/ui/inventory">Inventory</a>.</p>
    </section>

    <section>
      <h2>Main objective — from customer order to on-time delivery</h2>
      <p>
        When a <strong>customer places an order</strong>, many systems must work in sequence — often at the same time — without
        anyone re-typing data. OmniRoute-Core’s primary job is that <strong>end-to-end fulfillment journey</strong>:
        confirm the sale, allocate inventory, run the warehouse and robots, book freight, and close finance —
        while hitting the <strong>delivery promise</strong> shown at checkout.
      </p>
      <p><strong>Rush / urgent orders</strong> jump ahead of <strong>standard (non-rush)</strong> orders in the warehouse queue,
        use faster carrier service, and carry a shorter SLA clock. Standard orders still complete reliably; they simply
        yield capacity when rush volume spikes.</p>
      <table class="timeline">
        <thead>
          <tr><th>Priority</th><th>Typical promise (demo)</th><th>Behind the scenes</th></tr>
        </thead>
        <tbody>
          <tr>
            <td class="rush">Rush / urgent</td>
            <td>~24 hour ship target</td>
            <td>Higher priority score · RUSH wave in Manhattan · expedited TMS · robots tasked first at Edge</td>
          </tr>
          <tr>
            <td>Standard / non-rush</td>
            <td>~5 day ship target</td>
            <td>Standard wave tier · ground freight · fills gaps between rush waves</td>
          </tr>
        </tbody>
      </table>
      <p class="sub" style="margin-top:0.75rem">Try both: <a href="/ui/orders">Order execution UI</a> → choose <strong>rush</strong> vs <strong>standard</strong> and compare the response.</p>
    </section>

    <section>
      <h2>End-to-end flow — what happens after the customer checks out</h2>
      <pre class="flow">① OMS — customer order captured (channel + rush/standard)
② GCP — protocol translation + persistence (MongoDB JSON + SQL facts)
③ ERP — financial pledge before pick starts
④ WMS — Manhattan wave (RUSH vs STANDARD queue)
⑤ WES — robotics missions (vendor-specific APIs)
⑥ WCS — staging lanes, sortation, trailer load
⑦ TMS — carrier rate & service level
⑧ WMS/Edge — ship confirm + label (ZPL/PDF)
⑨ ERP — financial close + inventory ledger
⑩ Dashboards — same correlation ID in every system's log</pre>

      <table class="timeline">
        <thead>
          <tr><th>Step</th><th>System</th><th>What the customer experiences</th><th>Complexity handled for you</th></tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>OMS</td><td>Order confirmation email</td><td>Captures rush vs standard shipping choice</td></tr>
          <tr><td>2</td><td>GCP + Nike services</td><td>—</td><td>Protocol translation; no manual re-entry between brands</td></tr>
          <tr><td>3</td><td>ERP (SAP)</td><td>—</td><td>Credit / allocation pledge before pick starts</td></tr>
          <tr><td>4</td><td>WMS</td><td>—</td><td>Priority waves; urgent orders skip ahead of backlog</td></tr>
          <tr><td>5</td><td>WES</td><td>—</td><td>Robot missions — AutoStore, Locus, Rapyuta, etc.</td></tr>
          <tr><td>6</td><td>WCS</td><td>—</td><td>Staging lanes, sortation, trailer load to dock</td></tr>
          <tr><td>7</td><td>TMS</td><td>Tracking number</td><td>Express vs ground tied to urgency</td></tr>
          <tr><td>8</td><td>WMS + Edge</td><td>"Shipped" notification</td><td>Label (ZPL/PDF) + ship confirm</td></tr>
          <tr><td>9</td><td>ERP close</td><td>—</td><td>Financial loop complete; audit trail for Finance</td></tr>
        </tbody>
      </table>
      <p>
        <strong>Why so many systems?</strong> OMS sells, ERP funds, WMS plans work, WES moves robots, WCS moves cartons,
        TMS books trucks — each speaks different APIs. OmniRoute-Core chains those calls so a delay in any layer is visible
        immediately (same <strong>correlation ID</strong>) and rush orders do not wait behind a slow standard wave.
      </p>
    </section>

    <section>
      <h2>How engineers ship safely (CI/CD)</h2>
      <p>
        Many engineers can work at the same time because <strong>every change is checked before it lands on <code>main</code></strong>.
        Bad code is stopped in the pipeline — not in production.
      </p>
      <table class="timeline">
        <thead>
          <tr><th>Check</th><th>Why it matters</th></tr>
        </thead>
        <tbody>
          <tr><td>Docker image build</td><td>Proves the app packages correctly in a container (same as production)</td></tr>
          <tr><td>Security scan (Trivy)</td><td>Blocks critical vulnerabilities in the image</td></tr>
          <tr><td>Multi-tenant tests</td><td>API must reject calls without <code>x-tenant-id</code>; tenants stay isolated</td></tr>
          <tr><td>Lint + Terraform + Helm</td><td>Infrastructure and Kubernetes configs validated before merge</td></tr>
          <tr><td>CI gate job</td><td>All checks must pass — merge to <code>main</code> is blocked if anything fails</td></tr>
        </tbody>
      </table>
      <p>Only after merge to <code>main</code> is the Docker image published and deployed (canary → health check → full rollout or automatic rollback).</p>
      <p class="sub">Details: <a href="https://github.com/bharat2476/Integration/blob/main/README.md#cicd--docker-images-multi-tenant-gates-and-safe-merges-to-main" target="_blank" rel="noopener">README CI/CD section</a></p>
    </section>

    <section>
      <h2>How integrations stay reliable at scale</h2>
      <div class="outcomes">
        <div class="outcome"><strong>On-time delivery</strong><span>SLA clock + priority score per order</span></div>
        <div class="outcome"><strong>Async catalog</strong><span>PIM updates never block picking</span></div>
        <div class="outcome"><strong>Multi-region cloud</strong><span>Global keeps running if one region fails</span></div>
        <div class="outcome"><strong>Edge on-prem</strong><span>Floor speed for robotics SLOs</span></div>
      </div>
      <p>Shared cloud resources (one API, one message bus, pooled databases) keep cost down while
        <strong>per-tenant rate limits</strong> stop one brand’s peak from starving another.</p>
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
            <li>WMS: release waves, pick, pack, ship</li>
            <li>WES: robotics (Locus, Rapyuta, AutoStore, etc.)</li>
            <li>WCS: staging lanes, trailer load, sortation</li>
            <li>Labels at the pack station (ZPL/PDF)</li>
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
      <a class="ui-card" href="/ui/orders"><strong>Order execution</strong><p>OMS + ERP + WMS + WES + TMS APIs in one pipeline — rush vs standard.</p></a>
      <a class="ui-card" href="/ui/catalog"><strong>PIM catalog</strong><p>Send a product update that fans out to warehouses without stopping orders.</p></a>
      <a class="ui-card" href="/ui/warehouse"><strong>Warehouse tasks</strong><p>WMS, WES, and WCS APIs — waves, AMRs, staging, labels, ship.</p></a>
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

      <details open>
        <summary>Step 3 — Run an order (OMS → finance → warehouse → ship)</summary>
        <div class="inner">
          <p><strong>What you do:</strong> Start an order with OMS reference, <strong>rush or standard</strong> urgency, and a robotics vendor (e.g. Locus).</p>
          <p><strong>What it represents:</strong> The full customer journey — pledge, priority wave, robots, freight class, ship, SAP close — with <code>promisedShipBy</code> in the API response.</p>
          <p><strong>Try it:</strong> <a href="/ui/orders">Open Order execution UI</a> → run rush, then standard → compare priority and SLA fields.</p>
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
      <p class="sub">README: <a href="https://github.com/bharat2476/Integration/blob/main/README.md#non-tech-persona" target="_blank" rel="noopener">Non Tech</a> ·
        <a href="https://github.com/bharat2476/Integration/blob/main/README.md#tech-persona" target="_blank" rel="noopener">Tech</a> personas on GitHub</p>
    </section>
  `;
}
