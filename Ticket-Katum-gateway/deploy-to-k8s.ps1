# ============================================================
# Ticket Katum - Kubernetes Deployment (PowerShell)
# ============================================================
# This script deploys all microservices to Kubernetes
# Usage: .\deploy-to-k8s.ps1 [-Environment dev|staging|prod]
# ============================================================

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment = 'dev'
)

$ErrorActionPreference = "Stop"

# Configuration
$Namespace = "ticket-katum"
$K8sDir = "k8s-deploy"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Ticket Katum - Kubernetes Deployment" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# ============================================================
# Step 1: Prerequisites Check
# ============================================================
Write-Host "`n[1/10] Checking prerequisites..." -ForegroundColor Yellow

# Check kubectl
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "Error: kubectl not found. Please install kubectl." -ForegroundColor Red
    exit 1
}
Write-Host "✓ kubectl found" -ForegroundColor Green

# Check cluster connection
try {
    kubectl cluster-info | Out-Null
    Write-Host "✓ Connected to Kubernetes cluster" -ForegroundColor Green
}
catch {
    Write-Host "Error: Cannot connect to Kubernetes cluster." -ForegroundColor Red
    exit 1
}

# ============================================================
# Step 2: Create Namespace
# ============================================================
Write-Host "`n[2/10] Creating namespace..." -ForegroundColor Yellow

$namespaceExists = kubectl get namespace $Namespace 2>$null
if ($namespaceExists) {
    Write-Host "✓ Namespace $Namespace already exists" -ForegroundColor Green
}
else {
    kubectl create namespace $Namespace
    Write-Host "✓ Namespace $Namespace created" -ForegroundColor Green
}

# Set context to namespace
kubectl config set-context --current --namespace=$Namespace

# ============================================================
# Step 3: Create Secrets
# ============================================================
Write-Host "`n[3/10] Creating secrets..." -ForegroundColor Yellow

if (!(Test-Path "$K8sDir\secrets.yaml")) {
    Write-Host "Error: secrets.yaml not found!" -ForegroundColor Red
    Write-Host "Please copy secrets.yaml.template to secrets.yaml and fill in actual values." -ForegroundColor Yellow
    exit 1
}

kubectl apply -f "$K8sDir\secrets.yaml"
Write-Host "✓ Secrets created" -ForegroundColor Green

# ============================================================
# Step 4: Create ConfigMaps
# ============================================================
Write-Host "`n[4/10] Creating ConfigMaps..." -ForegroundColor Yellow

kubectl apply -f "$K8sDir\services\configmaps.yaml"
Write-Host "✓ ConfigMaps created" -ForegroundColor Green

# ============================================================
# Step 5: Create Persistent Volumes
# ============================================================
Write-Host "`n[5/10] Creating Persistent Volumes..." -ForegroundColor Yellow

kubectl apply -f "$K8sDir\services\persistent-volumes.yaml"
Write-Host "✓ Persistent Volumes created" -ForegroundColor Green

Write-Host "Waiting for PVCs to be bound..." -ForegroundColor Yellow
kubectl wait --for=condition=Bound pvc --all --timeout=120s
Write-Host "✓ All PVCs bound" -ForegroundColor Green

# ============================================================
# Step 6: Deploy Infrastructure Services
# ============================================================
Write-Host "`n[6/10] Deploying infrastructure services..." -ForegroundColor Yellow

$infraServices = @('postgres', 'redis', 'rabbitmq', 'kafka', 'eureka')
foreach ($service in $infraServices) {
    $deploymentFile = "$K8sDir\services\$service-deployment.yaml"
    if (Test-Path $deploymentFile) {
        kubectl apply -f $deploymentFile
        Write-Host "✓ $service deployed" -ForegroundColor Green
    }
}

Write-Host "Waiting for infrastructure services to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l tier=infrastructure --timeout=300s 2>$null
Write-Host "✓ Infrastructure services ready" -ForegroundColor Green

# ============================================================
# Step 7: Deploy Microservices
# ============================================================
Write-Host "`n[7/10] Deploying microservices..." -ForegroundColor Yellow

$microservices = @('hotel-service', 'booking-service', 'bus-service', 'payment-service', 'auth-service', 'market-service')
foreach ($service in $microservices) {
    $deploymentFile = "$K8sDir\services\$service-deployment.yaml"
    if (Test-Path $deploymentFile) {
        kubectl apply -f $deploymentFile
        Write-Host "✓ $service deployed" -ForegroundColor Green
    }
}

Write-Host "Waiting for backend services to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l tier=backend --timeout=300s 2>$null
Write-Host "✓ Backend services ready" -ForegroundColor Green

# ============================================================
# Step 8: Deploy BFF Services
# ============================================================
Write-Host "`n[8/10] Deploying BFF services..." -ForegroundColor Yellow

$bffServices = @('web-bff', 'mobile-bff')
foreach ($bff in $bffServices) {
    $deploymentFile = "$K8sDir\services\$bff-deployment.yaml"
    if (Test-Path $deploymentFile) {
        kubectl apply -f $deploymentFile
        Write-Host "✓ $bff deployed" -ForegroundColor Green
    }
}

Write-Host "Waiting for BFF services to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l tier=bff --timeout=300s 2>$null
Write-Host "✓ BFF services ready" -ForegroundColor Green

# ============================================================
# Step 9: Deploy Monitoring Stack
# ============================================================
Write-Host "`n[9/10] Deploying monitoring stack..." -ForegroundColor Yellow

$monitoringServices = @('prometheus', 'grafana', 'jaeger')
foreach ($monitor in $monitoringServices) {
    $deploymentFile = "$K8sDir\services\$monitor-deployment.yaml"
    if (Test-Path $deploymentFile) {
        kubectl apply -f $deploymentFile
        Write-Host "✓ $monitor deployed" -ForegroundColor Green
    }
}

# ============================================================
# Step 10: Configure Ingress
# ============================================================
Write-Host "`n[10/10] Configuring Ingress..." -ForegroundColor Yellow

kubectl apply -f "$K8sDir\services\ingress.yaml"
Write-Host "✓ Ingress configured" -ForegroundColor Green

# ============================================================
# Deployment Summary
# ============================================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nDeployment Status:" -ForegroundColor Yellow
kubectl get pods -n $Namespace

Write-Host "`nServices:" -ForegroundColor Yellow
kubectl get svc -n $Namespace

Write-Host "`nIngress:" -ForegroundColor Yellow
kubectl get ingress -n $Namespace

# Get external IP
$ExternalIP = kubectl get ingress ticket-katum-ingress -n $Namespace -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
if (!$ExternalIP) { $ExternalIP = "Pending..." }

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Access Information:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "External IP: $ExternalIP" -ForegroundColor Yellow
Write-Host "API URL: http://$ExternalIP/api/bff" -ForegroundColor Yellow
Write-Host "Eureka: http://$ExternalIP/eureka" -ForegroundColor Yellow
Write-Host "Grafana: http://$ExternalIP/grafana" -ForegroundColor Yellow
Write-Host "Prometheus: http://$ExternalIP/prometheus" -ForegroundColor Yellow

Write-Host "`nUseful Commands:" -ForegroundColor Yellow
Write-Host "View pods: kubectl get pods -n $Namespace" -ForegroundColor Green
Write-Host "View logs: kubectl logs -f deployment/hotel-service -n $Namespace" -ForegroundColor Green
Write-Host "Scale service: kubectl scale deployment hotel-service --replicas=5 -n $Namespace" -ForegroundColor Green
Write-Host "Port forward: kubectl port-forward svc/grafana-service 3000:3000 -n $Namespace" -ForegroundColor Green

Write-Host "`nDeployment completed successfully!" -ForegroundColor Green
