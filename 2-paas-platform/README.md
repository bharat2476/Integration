# 2-paas-platform — OmniRoute-Core

Kubernetes Helm chart, Istio/Envoy tenant rate limiting, OpenTelemetry DaemonSet, and Splunk operational dashboards.

| Component | Path |
|-----------|------|
| API Helm + HPA | `helm/omniroute-api/` |
| Tenant gateway | `gateway/istio/envoyfilter-tenant-ratelimit.yaml` |
| OTel collector | `otel/daemonset-collector.yaml` |
| Splunk dashboard | `splunk/dashboard-omniroute-operations.json` |
| Karpenter pools | `karpenter/nodepool-workloads.yaml` |

```bash
helm template omniroute-api ./helm/omniroute-api --debug
kubectl apply -f otel/daemonset-collector.yaml
kubectl apply -f gateway/istio/
```
