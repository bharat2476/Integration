/** Product Guide — interview / stakeholder walkthrough (/ui/guide). */

export const GUIDE_EXTRA_STYLES = `
  .callout { background: #1e3a5f; border: 1px solid #2563eb; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
  .ui-card { display: block; background: #253045; border: 1px solid #3d5270; border-radius: 8px; padding: 0.85rem 1rem; margin-bottom: 0.5rem; text-decoration: none; color: #e7ecf3; }
  .ui-card:hover { border-color: #7eb8ff; }
  .ui-card strong { color: #7eb8ff; }
  .ui-card p { margin: 0.35rem 0 0; font-size: 0.82rem; color: #8b9cb3; }
  .timeline { width: 100%; border-collapse: collapse; font-size: 0.82rem; margin-top: 0.5rem; }
  .timeline th, .timeline td { border: 1px solid #2a3a52; padding: 0.45rem 0.6rem; text-align: left; vertical-align: top; }
  .timeline th { background: #0a0e14; color: #7eb8ff; }
  .rush { color: #fbbf24; font-weight: 600; }
  ul.plain { margin: 0.5rem 0 0 1.1rem; padding: 0; }
`;

export function productGuideBody(): string {
  return `
    <div class="callout">
      <strong>Omni-Channel Integration — product story</strong>
      <p style="margin:0.5rem 0 0;color:#b8c5d9;font-size:0.9rem">
        Six enterprise systems (OMS, ERP, WMS, WES, WCS, TMS), <strong>many APIs</strong>, one orchestrated flow.
        Built as a <strong>shared platform</strong> for all warehouses — Docker + Jenkins delivery, Terraform for peak VMs.
      </p>
    </div>

    <section>
      <h2>7-minute interview demo</h2>
      <ol class="plain">
        <li><strong>This page</strong> — problem &amp; flow</li>
        <li><a href="/ui/orders">Orders</a> — run <span class="rush">rush</span> then standard; show <code>tmsLoadId</code> before WMS</li>
        <li><a href="/ui/warehouse">Warehouse</a> — WMS / WES / WCS APIs</li>
        <li><a href="/ui/inventory">Inventory</a> — ERP alignment</li>
        <li><a href="/ui/platform">Platform</a> — multi-DC, Jenkins, Terraform peak</li>
      </ol>
      <p class="sub">Full story: <a href="https://github.com/bharat2476/Integration/blob/main/README.md" target="_blank" rel="noopener">README.md</a></p>
    </section>

    <section>
      <h2>Systems we integrate</h2>
      <table class="timeline">
        <thead><tr><th>System</th><th>Role</th></tr></thead>
        <tbody>
          <tr><td><strong>OMS</strong></td><td>Orders, rush vs standard promise</td></tr>
          <tr><td><strong>ERP</strong></td><td>Financial pledge &amp; close</td></tr>
          <tr><td><strong>TMS</strong></td><td><strong>Load ID before pick</strong> — staging lane + trailer; freight at ship</td></tr>
          <tr><td><strong>WMS</strong></td><td>Waves, picks, ship confirm</td></tr>
          <tr><td><strong>WES</strong></td><td>Robotics (Locus, AutoStore, …)</td></tr>
          <tr><td><strong>WCS</strong></td><td>Conveyors, staging, trailer load</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>Product rules that matter</h2>
      <ul class="plain">
        <li><strong>TMS load before WMS wave</strong> — every order gets <code>tmsLoadId</code>, <code>stagingLane</code>, <code>trailerId</code></li>
        <li><strong>Rush ≠ standard</strong> — SLA, RUSH wave, expedited carrier</li>
        <li><strong>One platform, many DCs</strong> — same Docker image; Edge only for floor latency</li>
        <li><strong>Peak</strong> — Terraform + burst nodes, not a new stack per warehouse</li>
      </ul>
    </section>

    <section>
      <h2>Business outcomes</h2>
      <table class="timeline">
        <thead><tr><th>Outcome</th><th>How</th></tr></thead>
        <tbody>
          <tr><td>On-time delivery</td><td>SLA + priority on every order</td></tr>
          <tr><td>Dock accuracy</td><td>TMS load → WCS stage → correct trailer</td></tr>
          <tr><td>Peak readiness</td><td>Shared APIs + autoscaled infra</td></tr>
          <tr><td>Audit trust</td><td>OS&amp;D codes; WMS vs ERP reconciliation</td></tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>Explore the demo</h2>
      <a class="ui-card" href="/ui/orders"><strong>Order execution</strong><p>OMS → ERP → TMS load → WMS → TMS rate → ERP</p></a>
      <a class="ui-card" href="/ui/warehouse"><strong>Warehouse</strong><p>WMS · WES · WCS floor APIs</p></a>
      <a class="ui-card" href="/ui/catalog"><strong>PIM catalog</strong><p>Async updates — never block orders</p></a>
      <a class="ui-card" href="/ui/inventory"><strong>Inventory &amp; OS&amp;D</strong><p>Finance / legal audit trail</p></a>
      <a class="ui-card" href="/ui/platform"><strong>Platform</strong><p>Jenkins · Docker · Terraform · multi-warehouse</p></a>
    </section>
  `;
}
