# AGENTS.md

**Product / interview:** [README.md](README.md)  
**Engineering:** [docs/TECH.md](docs/TECH.md)

## Run

```bash
cd 3-saas-application && npm install && npm run dev
```

Port **8080** · UI [http://localhost:8080/ui/guide](http://localhost:8080/ui/guide) · Header `x-tenant-id` required.

## Validate

```bash
cd 3-saas-application && npm run build && npm run test:tenant
```

## Notes

- Shared **platform** for many warehouses; Docker via Jenkins/GHA; Terraform/Karpenter for peak VMs.
- Order pipeline: ERP → **TMS load** → WMS wave → WES → TMS rate → ERP close.
- Production data design: MongoDB + SQL + GCP (not PostgreSQL); mocks for partner APIs in demo.
