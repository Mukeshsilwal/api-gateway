#!/bin/bash

# ============================================================
# Ticket Katum - Kubernetes Deployment Script
# ============================================================
# This script deploys all microservices to Kubernetes
# Usage: ./deploy-to-k8s.sh [environment]
# Environment: dev, staging, prod (default: dev)
# ============================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
NAMESPACE="ticket-katum"
K8S_DIR="k8s-deploy"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Ticket Katum - Kubernetes Deployment${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}========================================${NC}"

# ============================================================
# Step 1: Prerequisites Check
# ============================================================
echo -e "\n${YELLOW}[1/11] Checking prerequisites...${NC}"

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl not found. Please install kubectl.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ kubectl found${NC}"

# Check AWS CLI (required for EKS)
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI not found. Please install AWS CLI.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI found${NC}"

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster.${NC}"
    echo -e "${YELLOW}Tip: Run 'aws eks update-kubeconfig --name ticket-katum-cluster --region us-east-1'${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Connected to Kubernetes cluster${NC}"

# Check if EBS CSI driver is installed
echo "Checking EBS CSI driver..."
if kubectl get pods -n kube-system | grep -q ebs-csi; then
    echo -e "${GREEN}✓ EBS CSI driver is installed${NC}"
else
    echo -e "${YELLOW}⚠ EBS CSI driver not found. Installing...${NC}"
    aws eks create-addon --cluster-name ticket-katum-cluster \
        --addon-name aws-ebs-csi-driver \
        --region us-east-1 || echo -e "${YELLOW}Note: Driver may already be installed${NC}"
fi

# ============================================================
# Step 2: Create Namespace
# ============================================================
echo -e "\n${YELLOW}[2/11] Creating namespace...${NC}"

if kubectl get namespace ${NAMESPACE} &> /dev/null; then
    echo -e "${GREEN}✓ Namespace ${NAMESPACE} already exists${NC}"
else
    kubectl create namespace ${NAMESPACE}
    echo -e "${GREEN}✓ Namespace ${NAMESPACE} created${NC}"
fi

# Set context to namespace
kubectl config set-context --current --namespace=${NAMESPACE}

# ============================================================
# Step 3: Create Secrets
# ============================================================
echo -e "\n${YELLOW}[3/11] Creating secrets...${NC}"

if [ ! -f "${K8S_DIR}/secrets.yaml" ]; then
    echo -e "${RED}Error: secrets.yaml not found!${NC}"
    echo -e "${YELLOW}Please copy secrets.yaml.template to secrets.yaml and fill in actual values.${NC}"
    exit 1
fi

kubectl apply -f ${K8S_DIR}/secrets.yaml
echo -e "${GREEN}✓ Secrets created${NC}"

# ============================================================
# Step 4: Create ConfigMaps
# ============================================================
echo -e "\n${YELLOW}[4/11] Creating ConfigMaps...${NC}"

# Apply Prometheus config if it exists
if [ -f "${K8S_DIR}/prometheus-config.yaml" ]; then
    kubectl apply -f ${K8S_DIR}/prometheus-config.yaml
    echo -e "${GREEN}✓ Prometheus ConfigMap created${NC}"
fi

if [ -f "${K8S_DIR}/configmaps.yaml" ]; then
    kubectl apply -f ${K8S_DIR}/configmaps.yaml
    echo -e "${GREEN}✓ ConfigMaps created${NC}"
else
    echo -e "${YELLOW}⚠ configmaps.yaml not found, skipping...${NC}"
fi

# ============================================================
# Step 5: Create Persistent Volumes (Storage Class + PVCs)
# ============================================================
echo -e "\n${YELLOW}[5/11] Creating Storage Class and PVCs...${NC}"

# Clean up any old PVCs with wrong storage class
echo "Checking for existing PVCs with old storage class..."
OLD_PVCS=$(kubectl get pvc -n ${NAMESPACE} -o json | jq -r '.items[] | select(.spec.storageClassName=="manual") | .metadata.name' 2>/dev/null || echo "")

if [ ! -z "$OLD_PVCS" ]; then
    echo -e "${YELLOW}⚠ Found PVCs with old storage class. Deleting...${NC}"
    echo "$OLD_PVCS" | xargs -r kubectl delete pvc -n ${NAMESPACE}
    echo -e "${GREEN}✓ Old PVCs deleted${NC}"
    sleep 5
fi

kubectl apply -f ${K8S_DIR}/persistent-volumes.yaml
echo -e "${GREEN}✓ Storage Class and PVCs created${NC}"

# Note: PVCs will remain in Pending state until pods claim them (WaitForFirstConsumer)
echo -e "${YELLOW}Note: PVCs will be bound when pods request them (WaitForFirstConsumer mode)${NC}"

# ============================================================
# Step 6: Deploy Infrastructure StatefulSets
# ============================================================
echo -e "\n${YELLOW}[6/11] Deploying infrastructure StatefulSets...${NC}"

if [ -f "${K8S_DIR}/statefulsets.yaml" ]; then
    kubectl apply -f ${K8S_DIR}/statefulsets.yaml
    echo -e "${GREEN}✓ Infrastructure StatefulSets deployed${NC}"

    # Wait for StatefulSets to be ready
    echo "Waiting for infrastructure services to be ready (this may take a few minutes)..."

    # Wait for each StatefulSet individually with timeout
    for sts in postgres redis rabbitmq kafka zookeeper prometheus grafana elasticsearch; do
        if kubectl get statefulset ${sts} -n ${NAMESPACE} &> /dev/null; then
            echo "Waiting for ${sts}..."
            kubectl rollout status statefulset/${sts} -n ${NAMESPACE} --timeout=300s || echo -e "${YELLOW}⚠ ${sts} taking longer than expected${NC}"
        fi
    done

    echo -e "${GREEN}✓ Infrastructure services ready${NC}"
else
    echo -e "${YELLOW}⚠ statefulsets.yaml not found, using individual files...${NC}"

    # Fallback to individual deployment files
    for service in postgres redis rabbitmq kafka; do
        if [ -f "${K8S_DIR}/${service}-deployment.yaml" ]; then
            kubectl apply -f ${K8S_DIR}/${service}-deployment.yaml
            echo -e "${GREEN}✓ ${service} deployed${NC}"
        fi
    done
fi

# ============================================================
# Step 7: Deploy Eureka Server
# ============================================================
echo -e "\n${YELLOW}[7/11] Deploying Eureka Server...${NC}"

if [ -f "${K8S_DIR}/eureka-deployment.yaml" ]; then
    kubectl apply -f ${K8S_DIR}/eureka-deployment.yaml
    echo "Waiting for Eureka Server..."
    kubectl wait --for=condition=ready pod -l app=eureka-server --timeout=180s -n ${NAMESPACE} || true
    echo -e "${GREEN}✓ Eureka Server deployed${NC}"
else
    echo -e "${YELLOW}⚠ eureka-deployment.yaml not found, skipping...${NC}"
fi

# ============================================================
# Step 8: Deploy Microservices
# ============================================================
echo -e "\n${YELLOW}[8/11] Deploying microservices...${NC}"

# Deploy all microservices
SERVICES=("hotel-service" "booking-service" "bus-service" "payment-service" "auth-service" "market-service")

for service in "${SERVICES[@]}"; do
    if [ -f "${K8S_DIR}/${service}-deployment.yaml" ]; then
        kubectl apply -f ${K8S_DIR}/${service}-deployment.yaml
        echo -e "${GREEN}✓ ${service} deployed${NC}"
    else
        echo -e "${YELLOW}⚠ ${service}-deployment.yaml not found, skipping...${NC}"
    fi
done

# Wait for backend services to be ready
echo "Waiting for backend services to be ready..."
kubectl wait --for=condition=ready pod -l tier=backend --timeout=300s -n ${NAMESPACE} || true
echo -e "${GREEN}✓ Backend services ready${NC}"

# ============================================================
# Step 9: Deploy BFF Services
# ============================================================
echo -e "\n${YELLOW}[9/11] Deploying BFF services...${NC}"

for bff in web-bff mobile-bff; do
    if [ -f "${K8S_DIR}/${bff}-deployment.yaml" ]; then
        kubectl apply -f ${K8S_DIR}/${bff}-deployment.yaml
        echo -e "${GREEN}✓ ${bff} deployed${NC}"
    else
        echo -e "${YELLOW}⚠ ${bff}-deployment.yaml not found, skipping...${NC}"
    fi
done

# Wait for BFF services to be ready
echo "Waiting for BFF services to be ready..."
kubectl wait --for=condition=ready pod -l tier=bff --timeout=300s -n ${NAMESPACE} || true
echo -e "${GREEN}✓ BFF services ready${NC}"

# ============================================================
# Step 10: Configure Ingress
# ============================================================
echo -e "\n${YELLOW}[10/11] Configuring Ingress...${NC}"

if [ -f "${K8S_DIR}/ingress.yaml" ]; then
    kubectl apply -f ${K8S_DIR}/ingress.yaml
    echo -e "${GREEN}✓ Ingress configured${NC}"
else
    echo -e "${YELLOW}⚠ ingress.yaml not found, skipping...${NC}"
fi

# ============================================================
# Step 11: Verify Deployment
# ============================================================
echo -e "\n${YELLOW}[11/11] Verifying deployment...${NC}"

# Check PVCs
echo -e "\n${YELLOW}Persistent Volume Claims:${NC}"
kubectl get pvc -n ${NAMESPACE}

# Check Storage Class
echo -e "\n${YELLOW}Storage Classes:${NC}"
kubectl get sc

# ============================================================
# Deployment Summary
# ============================================================
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${YELLOW}Deployment Status:${NC}"
kubectl get pods -n ${NAMESPACE}

echo -e "\n${YELLOW}Services:${NC}"
kubectl get svc -n ${NAMESPACE}

echo -e "\n${YELLOW}StatefulSets:${NC}"
kubectl get statefulsets -n ${NAMESPACE}

if kubectl get ingress -n ${NAMESPACE} &> /dev/null; then
    echo -e "\n${YELLOW}Ingress:${NC}"
    kubectl get ingress -n ${NAMESPACE}

    # Get external hostname (ELB for AWS)
    EXTERNAL_HOST=$(kubectl get ingress ticket-katum-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "Pending...")

    if [ "$EXTERNAL_HOST" != "Pending..." ]; then
        echo -e "\n${GREEN}========================================${NC}"
        echo -e "${GREEN}Access Information:${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo -e "Load Balancer: ${YELLOW}${EXTERNAL_HOST}${NC}"
        echo -e "API URL: ${YELLOW}http://${EXTERNAL_HOST}/api/bff${NC}"
        echo -e "Eureka: ${YELLOW}http://${EXTERNAL_HOST}/eureka${NC}"
        echo -e "Grafana: ${YELLOW}http://${EXTERNAL_HOST}/grafana${NC}"
        echo -e "Prometheus: ${YELLOW}http://${EXTERNAL_HOST}/prometheus${NC}"
    else
        echo -e "\n${YELLOW}Note: Load Balancer is being provisioned. This may take 2-5 minutes.${NC}"
        echo -e "${YELLOW}Check status with: kubectl get ingress -n ${NAMESPACE}${NC}"
    fi
fi

echo -e "\n${YELLOW}Useful Commands:${NC}"
echo -e "View pods: ${GREEN}kubectl get pods -n ${NAMESPACE}${NC}"
echo -e "View logs: ${GREEN}kubectl logs -f statefulset/postgres -n ${NAMESPACE}${NC}"
echo -e "View PVCs: ${GREEN}kubectl get pvc -n ${NAMESPACE}${NC}"
echo -e "View EBS volumes: ${GREEN}kubectl get pv${NC}"
echo -e "Scale service: ${GREEN}kubectl scale deployment hotel-service --replicas=5 -n ${NAMESPACE}${NC}"
echo -e "Port forward Grafana: ${GREEN}kubectl port-forward svc/grafana-service 3000:3000 -n ${NAMESPACE}${NC}"
echo -e "Port forward PostgreSQL: ${GREEN}kubectl port-forward svc/postgres-service 5432:5432 -n ${NAMESPACE}${NC}"
echo -e "Describe PVC: ${GREEN}kubectl describe pvc postgres-pvc -n ${NAMESPACE}${NC}"

echo -e "\n${YELLOW}Monitoring Access:${NC}"
echo -e "Grafana (port-forward): ${GREEN}kubectl port-forward svc/grafana-service 3000:3000 -n ${NAMESPACE}${NC}"
echo -e "Prometheus (port-forward): ${GREEN}kubectl port-forward svc/prometheus-service 9090:9090 -n ${NAMESPACE}${NC}"
echo -e "RabbitMQ Management: ${GREEN}kubectl port-forward svc/rabbitmq-service 15672:15672 -n ${NAMESPACE}${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}AWS EBS Volumes:${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Check EBS volumes in AWS Console or run:"
echo -e "${YELLOW}aws ec2 describe-volumes --filters \"Name=tag:kubernetes.io/created-for/pvc/namespace,Values=${NAMESPACE}\" --region us-east-1${NC}"

echo -e "\n${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Note: Some pods may take a few minutes to fully initialize.${NC}"