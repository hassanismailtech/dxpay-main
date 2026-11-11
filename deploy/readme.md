# Production deployment manifests for the Access Bank Youth Forge Hackathon

These manifests deploy the DxPay frontend and API as two containers from the
same image in the `team12` Kubernetes namespace. The frontend starts the
standalone Next.js server on port 3000 and the API starts Express on port 5000.
They are preparation-only: image digests must be
resolved to verified immutable digests by the build job before `kubectl apply`,
and secrets must be created outside version control before the first apply.

## Prerequisites

- A Kubernetes cluster with namespace `team12`.
- A private API key for the Forge sandbox, supplied as a Kubernetes secret named
  `dxpay-runtime` (keys `PGUSER`, `PGPASSWORD`, `FORGE_MERCHANT_ID`, `GATEWAY_KEY`).
- A build job that pushes images to the team registry and records their digests.

## Applied order

1. `readiness.yaml` — database service and startup probes.
2. `app.yaml` — frontend and API deployments, service, and config.
3. `registry.yaml` — image manifest references (resolved before apply).

## Verification

```bash
kubectl --kubeconfig <path> -n team12 create secret generic dxpay-runtime \
  --from-literal=PGUSER=<db-user> \
  --from-literal=PGPASSWORD=<db-password> \
  --from-literal=FORGE_MERCHANT_ID=<merchant-id> \
  --from-literal=GATEWAY_KEY=<sandbox-key>

kubectl --kubeconfig <path> -n team12 apply -f deploy/readiness.yaml
kubectl --kubeconfig <path> -n team12 apply -f deploy/app.yaml
```

## Health and readiness

- Frontend: `GET /` returns `200`.
- API: `GET /healthz` (process) and `GET /readyz` (database) return `200`; `503`
  is returned when the database is unavailable.

## Notes

- The database PVC is provisioned out of band; the manifests do not create it.
- Bank connectivity is cluster-internal: the API calls `http://bank-api.ingress-apisix.svc.cluster.local/v1` and must be deployed inside the permitted Forge environment.
