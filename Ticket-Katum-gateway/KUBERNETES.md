# Kubernetes Deployment Guide - Ticket Katum Microservices

## Overview

Complete guide for deploying Ticket Katum microservices to Kubernetes with production-ready configurations including auto-scaling, health checks, secrets management, and monitoring.

## Prerequisites

### Required Tools

- **kubectl** (v1.28+)
- **Docker** (v24+)
- **Helm** (v3.12+) - optional
- **k9s** (optional, for cluster management)

### Kubernetes Cluster

**Minimum Requirements:**
- 3 worker nodes
- 8 CPU cores per node
- 16GB RAM per node
- 100GB SSD storage per node

**Recommended Cloud Providers:**
- AWS EKS
- Google GKE
- Azure AKS
- DigitalOcean Kubernetes

## Quick Start

### 1. Create Namespace

```bash
kubectl create namespace ticket-katum
kubectl config set-context --current --namespace=ticket-katum
```

### 2. Create Secrets

```bash
# Copy template
cp k8s/secrets.yaml.template k8s/secrets.yaml

# Edit with actual values
nano k8s/secrets.yaml

# Apply secrets
kubectl apply -f k8s/secrets.yaml

# Verify
kubectl get secrets -n ticket-katum
```

### 3. Create ConfigMaps

```bash
kubectl apply -f k8s/configmaps.yaml
kubectl get configmaps -n ticket-katum
```

### 4. Deploy Infrastructure

```bash
# PostgreSQL
kubectl apply -f k8s/postgres-deployment.yaml

# Redis
kubectl apply -f k8s/redis-deployment.yaml

# RabbitMQ
kubectl apply -f k8s/rabbitmq-deployment.yaml

# Kafka
kubectl apply -f k8s/kafka-deployment.yaml

# Eureka Server
kubectl apply -f k8s/eureka-deployment.yaml

# Wait for infrastructure to be ready
kubectl wait --for=condition=ready pod -l tier=infrastructure --timeout=300s
```

### 5. Deploy Microservices

```bash
# Deploy all services
kubectl apply -f k8s/hotel-service-deployment.yaml
kubectl apply -f k8s/booking-service-deployment.yaml
kubectl apply -f k8s/bus-service-deployment.yaml
kubectl apply -f k8s/payment-service-deployment.yaml
kubectl apply -f k8s/auth-service-deployment.yaml
kubectl apply -f k8s/web-bff-deployment.yaml
kubectl apply -f k8s/mobile-bff-deployment.yaml

# Wait for services to be ready
kubectl wait --for=condition=ready pod -l tier=backend --timeout=300s
kubectl wait --for=condition=ready pod -l tier=bff --timeout=300s
```

### 6. Deploy Monitoring

```bash
kubectl apply -f k8s/prometheus-deployment.yaml
kubectl apply -f k8s/grafana-deployment.yaml
kubectl apply -f k8s/jaeger-deployment.yaml
```

### 7. Configure Ingress

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Apply ingress rules
kubectl apply -f k8s/ingress.yaml

# Get external IP
kubectl get ingress -n ticket-katum
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Ingress Controller                        │
│                  (NGINX + SSL/TLS)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼────────┐
│   Web BFF      │      │  Mobile BFF     │
│   (2-5 pods)   │      │  (2-5 pods)     │
└───────┬────────┘      └────────┬────────┘
        │                        │
        └────────────┬───────────┘
                     │
        ┌────────────┴────────────────────────┐
        │                                     │
┌───────▼────────┐  ┌──────────┐  ┌─────────▼────────┐
│ Hotel Service  │  │ Booking  │  │ Payment Service  │
│ (2-10 pods)    │  │ Service  │  │ (2-10 pods)      │
└───────┬────────┘  │(2-10pods)│  └─────────┬────────┘
        │           └────┬─────┘            │
        └────────────────┼──────────────────┘
                         │
        ┌────────────────┴────────────────────┐
        │                                     │
┌───────▼────────┐  ┌──────────┐  ┌─────────▼────────┐
│   PostgreSQL   │  │  Redis   │  │    RabbitMQ      │
│   (StatefulSet)│  │  (3pods) │  │   (StatefulSet)  │
└────────────────┘  └──────────┘  └──────────────────┘
```

## Resource Allocation

### Per Service

| Service | Min CPU | Max CPU | Min RAM | Max RAM | Replicas |
|---------|---------|---------|---------|---------|----------|
| Hotel Service | 250m | 500m | 512Mi | 1Gi | 2-10 |
| Booking Service | 250m | 500m | 512Mi | 1Gi | 2-10 |
| Bus Service | 250m | 500m | 512Mi | 1Gi | 2-10 |
| Payment Service | 250m | 500m | 512Mi | 1Gi | 2-10 |
| Auth Service | 250m | 500m | 512Mi | 1Gi | 2-10 |
| Web BFF | 250m | 500m | 512Mi | 1Gi | 2-5 |
| Mobile BFF | 250m | 500m | 512Mi | 1Gi | 2-5 |

### Infrastructure

| Service | CPU | RAM | Storage |
|---------|-----|-----|---------|
| PostgreSQL | 1000m | 2Gi | 50Gi |
| Redis | 500m | 1Gi | 10Gi |
| RabbitMQ | 500m | 1Gi | 20Gi |
| Kafka | 1000m | 2Gi | 30Gi |
| Prometheus | 500m | 2Gi | 100Gi |
| Grafana | 250m | 512Mi | 10Gi |

## Auto-Scaling

### Horizontal Pod Autoscaler (HPA)

**Configuration:**
```yaml
minReplicas: 2
maxReplicas: 10
metrics:
  - CPU: 70%
  - Memory: 80%
```

**Scaling Behavior:**
- **Scale Up:** Immediate (max 100% or 4 pods per 15s)
- **Scale Down:** Gradual (max 50% per 60s, 5min stabilization)

**Monitor Scaling:**
```bash
kubectl get hpa -n ticket-katum -w
```

## Health Checks

### Liveness Probe

**Purpose:** Restart unhealthy pods

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8087
  initialDelaySeconds: 60
  periodSeconds: 10
  failureThreshold: 3
```

### Readiness Probe

**Purpose:** Remove unhealthy pods from load balancer

```yaml
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8087
  initialDelaySeconds: 30
  periodSeconds: 5
  failureThreshold: 3
```

## Secrets Management

### Using Kubernetes Secrets

```bash
# Create secret from literal
kubectl create secret generic jwt-secret \
  --from-literal=secret='your-secret-key' \
  -n ticket-katum

# Create secret from file
kubectl create secret generic db-credentials \
  --from-file=./credentials.txt \
  -n ticket-katum

# View secrets (base64 encoded)
kubectl get secret jwt-secret -o yaml
```

### Using External Secrets Operator (Recommended)

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: hotel-db-secret
spec:
  secretStoreRef:
    name: aws-secrets-manager
  target:
    name: hotel-db-secret
  data:
  - secretKey: password
    remoteRef:
      key: prod/hotel-db/password
```

## Monitoring

### Prometheus Metrics

```bash
# Port-forward Prometheus
kubectl port-forward svc/prometheus-service 9090:9090 -n ticket-katum

# Access: http://localhost:9090
```

### Grafana Dashboards

```bash
# Port-forward Grafana
kubectl port-forward svc/grafana-service 3000:3000 -n ticket-katum

# Access: http://localhost:3000
# Default: admin/admin
```

### Logs

```bash
# View logs
kubectl logs -f deployment/hotel-service -n ticket-katum

# View logs from all pods
kubectl logs -f -l app=hotel-service -n ticket-katum

# Tail last 100 lines
kubectl logs --tail=100 deployment/hotel-service -n ticket-katum
```

## Networking

### Service Types

**ClusterIP (Internal):**
- All microservices
- Databases
- Message queues

**LoadBalancer (External):**
- Ingress Controller

### Network Policies

**Default Deny:**
```yaml
podSelector: {}
policyTypes:
- Ingress
- Egress
```

**Allow BFF → Services:**
```yaml
from:
- podSelector:
    matchLabels:
      tier: bff
```

## Rolling Updates

### Zero-Downtime Deployment

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

### Update Strategy

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

## Troubleshooting

### Pod Not Starting

```bash
# Describe pod
kubectl describe pod <pod-name> -n ticket-katum

# Check events
kubectl get events -n ticket-katum --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n ticket-katum
```

### Service Not Accessible

```bash
# Check service
kubectl get svc -n ticket-katum

# Check endpoints
kubectl get endpoints hotel-service -n ticket-katum

# Test connectivity
kubectl run test-pod --image=curlimages/curl -it --rm -- \
  curl http://hotel-service:8087/actuator/health
```

### High Resource Usage

```bash
# Check resource usage
kubectl top pods -n ticket-katum
kubectl top nodes

# Check HPA status
kubectl describe hpa hotel-service-hpa -n ticket-katum
```

## Best Practices

### 1. Use Resource Limits

✅ Always set requests and limits  
❌ Don't leave unlimited

### 2. Implement Health Checks

✅ Liveness + Readiness probes  
❌ Don't skip health checks

### 3. Use ConfigMaps/Secrets

✅ Externalize configuration  
❌ Don't hardcode in images

### 4. Enable Auto-Scaling

✅ Configure HPA  
❌ Don't use fixed replicas

### 5. Monitor Everything

✅ Prometheus + Grafana  
❌ Don't deploy blind

## Production Checklist

- [ ] Secrets created and secured
- [ ] Resource limits configured
- [ ] Health checks implemented
- [ ] HPA configured
- [ ] Ingress with SSL/TLS
- [ ] Network policies applied
- [ ] Monitoring deployed
- [ ] Logging configured
- [ ] Backup strategy defined
- [ ] Disaster recovery plan
- [ ] Load testing completed
- [ ] Security scan passed

## Next Steps

1. ✅ Deploy to staging
2. ✅ Run load tests
3. ✅ Security audit
4. ✅ Backup verification
5. ✅ Deploy to production
6. ✅ Monitor for 24 hours
7. ✅ Optimize based on metrics

## Resources

- **Kubernetes Docs:** https://kubernetes.io/docs/
- **kubectl Cheat Sheet:** https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- **Best Practices:** https://kubernetes.io/docs/concepts/configuration/overview/
