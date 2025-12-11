# Kubernetes Deployment - Quick Start Guide

## Prerequisites

### 1. Install Required Tools

**kubectl:**
```bash
# Windows (using Chocolatey)
choco install kubernetes-cli

# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

**Verify Installation:**
```bash
kubectl version --client
```

### 2. Set Up Kubernetes Cluster

**Option A: Local Development (Minikube)**
```bash
# Install Minikube
choco install minikube  # Windows
brew install minikube   # macOS

# Start cluster
minikube start --cpus=4 --memory=8192 --disk-size=50g

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server
```

**Option B: Cloud Provider**

- **AWS EKS:** https://aws.amazon.com/eks/
- **Google GKE:** https://cloud.google.com/kubernetes-engine
- **Azure AKS:** https://azure.microsoft.com/en-us/services/kubernetes-service/
- **DigitalOcean:** https://www.digitalocean.com/products/kubernetes

## Step-by-Step Deployment

### Step 1: Prepare Secrets

```bash
# Navigate to project directory
cd "c:\New folder\Ticket-Katum-gateway"

# Copy secrets template
cp k8s/secrets.yaml.template k8s/secrets.yaml

# Edit secrets with actual values
notepad k8s/secrets.yaml  # Windows
nano k8s/secrets.yaml     # Linux/macOS
```

**Replace all `REPLACE_WITH_ACTUAL_*` values with real credentials.**

### Step 2: Build Docker Images

```bash
# Build all service images
docker build -t ticketkatum/hotel-service:latest ./services/hotel-service
docker build -t ticketkatum/booking-service:latest ./services/booking-service
docker build -t ticketkatum/bus-service:latest ./services/bus-service
docker build -t ticketkatum/payment-service:latest ./services/payment-service
docker build -t ticketkatum/auth-service:latest ./services/auth-service
docker build -t ticketkatum/web-bff:latest ./bff/web-bff
docker build -t ticketkatum/mobile-bff:latest ./bff/mobile-bff
docker build -t ticketkatum/eureka-server:latest ./eureka-server

# Push to registry (if using cloud)
docker push ticketkatum/hotel-service:latest
# ... push all images
```

### Step 3: Run Deployment Script

**Windows (PowerShell):**
```powershell
.\deploy-to-k8s.ps1 -Environment dev
```

**Linux/macOS (Bash):**
```bash
chmod +x deploy-to-k8s.sh
./deploy-to-k8s.sh dev
```

### Step 4: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n ticket-katum

# Expected output: All pods in "Running" state
# NAME                              READY   STATUS    RESTARTS   AGE
# hotel-service-xxx                 1/1     Running   0          2m
# booking-service-xxx               1/1     Running   0          2m
# ...

# Check services
kubectl get svc -n ticket-katum

# Check ingress
kubectl get ingress -n ticket-katum
```

### Step 5: Access Applications

**Get External IP:**
```bash
kubectl get ingress ticket-katum-ingress -n ticket-katum
```

**Access URLs:**
- API: `http://<EXTERNAL-IP>/api/bff`
- Eureka: `http://<EXTERNAL-IP>/eureka`
- Grafana: `http://<EXTERNAL-IP>/grafana`
- Prometheus: `http://<EXTERNAL-IP>/prometheus`

**For local development (Minikube):**
```bash
minikube service list -n ticket-katum
```

## Common Operations

### View Logs

```bash
# View logs for a specific service
kubectl logs -f deployment/hotel-service -n ticket-katum

# View logs from all pods of a service
kubectl logs -f -l app=hotel-service -n ticket-katum

# View last 100 lines
kubectl logs --tail=100 deployment/hotel-service -n ticket-katum
```

### Scale Services

```bash
# Scale hotel service to 5 replicas
kubectl scale deployment hotel-service --replicas=5 -n ticket-katum

# Auto-scaling is already configured via HPA
kubectl get hpa -n ticket-katum
```

### Update Services

```bash
# Update image
kubectl set image deployment/hotel-service \
  hotel-service=ticketkatum/hotel-service:v2.0.0 \
  -n ticket-katum

# Monitor rollout
kubectl rollout status deployment/hotel-service -n ticket-katum

# Rollback if needed
kubectl rollout undo deployment/hotel-service -n ticket-katum
```

### Port Forwarding (for local access)

```bash
# Forward Grafana
kubectl port-forward svc/grafana-service 3000:3000 -n ticket-katum

# Forward Prometheus
kubectl port-forward svc/prometheus-service 9090:9090 -n ticket-katum

# Forward specific service
kubectl port-forward svc/hotel-service 8087:8087 -n ticket-katum
```

### Execute Commands in Pods

```bash
# Get shell access
kubectl exec -it deployment/hotel-service -n ticket-katum -- /bin/bash

# Run single command
kubectl exec deployment/hotel-service -n ticket-katum -- env
```

## Troubleshooting

### Pods Not Starting

```bash
# Describe pod to see events
kubectl describe pod <pod-name> -n ticket-katum

# Common issues:
# 1. Image pull errors - check image name and registry access
# 2. Secret not found - verify secrets are created
# 3. Resource limits - check node capacity
```

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints hotel-service -n ticket-katum

# Test connectivity from another pod
kubectl run test-pod --image=curlimages/curl -it --rm -n ticket-katum -- \
  curl http://hotel-service:8087/actuator/health
```

### Database Connection Issues

```bash
# Check PostgreSQL pod
kubectl logs deployment/postgres -n ticket-katum

# Verify secrets
kubectl get secret hotel-db-secret -o yaml -n ticket-katum

# Test database connection
kubectl run psql-test --image=postgres:15 -it --rm -n ticket-katum -- \
  psql -h postgres-service -U postgres -d hotel_db
```

### High Resource Usage

```bash
# Check resource usage
kubectl top pods -n ticket-katum
kubectl top nodes

# Check HPA status
kubectl describe hpa hotel-service-hpa -n ticket-katum
```

## Monitoring

### View Metrics

```bash
# Prometheus
kubectl port-forward svc/prometheus-service 9090:9090 -n ticket-katum
# Open: http://localhost:9090

# Grafana
kubectl port-forward svc/grafana-service 3000:3000 -n ticket-katum
# Open: http://localhost:3000 (admin/admin)
```

### Check Health

```bash
# Check all pod health
kubectl get pods -n ticket-katum -o wide

# Check specific service health
curl http://<EXTERNAL-IP>/api/bff/actuator/health
```

## Cleanup

### Delete Everything

```bash
# Delete all resources in namespace
kubectl delete namespace ticket-katum

# Or delete specific resources
kubectl delete -f k8s/ -n ticket-katum
```

### Delete Specific Service

```bash
kubectl delete deployment hotel-service -n ticket-katum
kubectl delete svc hotel-service -n ticket-katum
kubectl delete hpa hotel-service-hpa -n ticket-katum
```

## Production Checklist

Before deploying to production:

- [ ] All secrets configured with strong passwords
- [ ] SSL/TLS certificates configured
- [ ] Resource limits tested under load
- [ ] HPA thresholds validated
- [ ] Backup strategy implemented
- [ ] Monitoring alerts configured
- [ ] Log aggregation set up
- [ ] Disaster recovery plan tested
- [ ] Security scan completed
- [ ] Load testing passed

## Next Steps

1. **Configure SSL/TLS:**
   - Install cert-manager
   - Configure Let's Encrypt
   - Update ingress with TLS

2. **Set Up CI/CD:**
   - GitHub Actions / GitLab CI
   - Automated deployments
   - Rollback procedures

3. **Implement Backup:**
   - Database backups
   - Volume snapshots
   - Disaster recovery

4. **Security Hardening:**
   - Network policies
   - Pod security policies
   - RBAC configuration

## Support

For issues or questions:
- Check logs: `kubectl logs -f deployment/<service> -n ticket-katum`
- Check events: `kubectl get events -n ticket-katum --sort-by='.lastTimestamp'`
- Describe resources: `kubectl describe <resource> <name> -n ticket-katum`

**Your microservices are now running on Kubernetes!** 🚀
