# DeployGuard — Production-Style Kubernetes

These manifests deploy the existing DeployGuard React + Spring Boot + PostgreSQL application.

## Architecture

Internet
→ NGINX Ingress + TLS
→ React frontend (2+ replicas)
→ Spring Boot backend (2–6 replicas)
→ PostgreSQL StatefulSet + persistent volume

Included:

- Namespace + Pod Security Admission labels
- ConfigMap and externalized DB password
- PostgreSQL StatefulSet + PVC
- Spring Boot Deployment with rolling updates
- React/Nginx Deployment with rolling updates
- ClusterIP services
- Ingress with TLS
- HPA for frontend/backend
- PodDisruptionBudgets
- Resource requests/limits
- Startup/readiness/liveness probes
- Pod anti-affinity
- Basic NetworkPolicies
- Kustomize entry point

## 1. Build and push images

Replace `YOUR_GITHUB_USERNAME` in the manifests with your registry path.

Backend:
```bash
docker build -f docker/backend.Dockerfile -t ghcr.io/YOUR_GITHUB_USERNAME/deployguard-backend:1.0.0 ./backend
docker push ghcr.io/YOUR_GITHUB_USERNAME/deployguard-backend:1.0.0
```

Frontend:
```bash
docker build   -f docker/frontend.Dockerfile   --build-arg VITE_API_URL=https://api.deployguard.example.com   -t ghcr.io/YOUR_GITHUB_USERNAME/deployguard-frontend:1.0.0 ./frontend
docker push ghcr.io/YOUR_GITHUB_USERNAME/deployguard-frontend:1.0.0
```

The frontend API URL is baked into the Vite bundle at image-build time.

## 2. Create the database secret

Do not commit a real password.

```bash
kubectl create namespace deployguard
kubectl -n deployguard create secret generic deployguard-db   --from-literal=DB_PASSWORD='USE-A-LONG-RANDOM-PASSWORD'
```

If using Kustomize, remove `02-secret.example.yaml` from the apply set; it is intentionally not referenced by `09-kustomization.yaml`.

## 3. Install cluster prerequisites

You need:

- Kubernetes 1.28+
- NGINX Ingress Controller
- metrics-server for HPA
- a StorageClass named `standard`, or change `storageClassName`
- a DNS record for both application hosts
- TLS certificate/secret named `deployguard-tls`

For a real production cluster, prefer cert-manager for automated TLS and a managed PostgreSQL service instead of running PostgreSQL in the application cluster.

## 4. Change domain

Edit `06-ingress.yaml`:

- `deployguard.example.com`
- `api.deployguard.example.com`

Then point DNS A/AAAA records to the ingress controller's external address.

## 5. Apply

```bash
kubectl apply -k k8s/
kubectl -n deployguard get pods
kubectl -n deployguard get svc
kubectl -n deployguard get ingress
kubectl -n deployguard get hpa
```

Watch rollout:

```bash
kubectl -n deployguard rollout status statefulset/deployguard-postgres
kubectl -n deployguard rollout status deployment/deployguard-backend
kubectl -n deployguard rollout status deployment/deployguard-frontend
```

## 6. TLS

For a manually created TLS secret:

```bash
kubectl -n deployguard create secret tls deployguard-tls   --cert=fullchain.pem   --key=privkey.pem
```

For production, use cert-manager and replace the manual secret workflow with an Issuer/ClusterIssuer + Certificate.

## Important production notes

1. PostgreSQL in this repository is suitable for a Kubernetes portfolio/demo environment, not HA production database operations. Use managed PostgreSQL for real production.
2. Backups, restore testing, database replication, WAL archiving, and disaster recovery are outside these manifests.
3. The application currently has no Spring Boot Actuator health endpoints, so the backend probes use TCP checks. Adding Actuator would allow `/actuator/health/liveness` and `/actuator/health/readiness` probes.
4. The frontend and backend use separate hosts so the existing Vite `VITE_API_URL` design works without changing the application code.
5. The network policies assume the frontend pod directly talks to the backend. If your ingress/controller architecture needs different pod-to-pod access, adjust the policies.
