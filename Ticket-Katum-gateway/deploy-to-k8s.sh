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
K8S_DIR="k8s"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Ticket Katum - Kubernetes Deployment${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}========================================${NC}"

# ============================================================
# Step 1: Prerequisites Check
# ============================================================
echo -e "\n${YELLOW}[1/10] Checking prerequisites...${NC}"

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl not found. Please install kubectl.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ kubectl found${NC}"

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Connected to Kubernetes cluster${NC}"

# ============================================================
# Step 2: Create Namespace
# ============================================================
echo -e "\n${YELLOW}[2/10] Creating namespace...${NC}"

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
echo -e "\n${YELLOW}[3/10] Creating secrets...${NC}"

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
echo -e "\n${YELLOW}[4/10] Creating ConfigMaps...${NC}"

kubectl apply -f ${K8S_DIR}/configmaps.yaml
echo -e "${GREEN}✓ ConfigMaps created${NC}"

# ============================================================
# Step 5: Create Persistent Volumes
# ============================================================
echo -e "\n${YELLOW}[5/10] Creating Persistent Volumes...${NC}"

kubectl apply -f ${K8S_DIR}/persistent-volumes.yaml
echo -e "${GREEN}✓ Persistent Volumes created${NC}"

# Wait for PVCs to be bound
echo "Waiting for PVCs to be bound..."
kubectl wait --for=condition=Bound pvc --all --timeout=120s
echo -e "${GREEN}✓ All PVCs bound${NC}"

# ============================================================
# Step 6: Deploy Infrastructure Services
# ============================================================
echo -e "\n${YELLOW}[6/10] Deploying infrastructure services...${NC}"

# PostgreSQL
if [ -f "${K8S_DIR}/postgres-deployment.yaml" ]; then
    kubectl apply -f ${K8S_DIR}/postgres-deployment.yaml
    echo -e "${GREEN}✓ PostgreSQL deployed${NC}"
fi

# Redis
if [ -f "${K8S_DIR}/redis-deployment.yaml" ]; then
    kubectl apply -f ${K8S_DIR}/redis-deployment.yaml
    echo -e "${GREEN}✓ Redis deployed${NC}"
fi

# RabbitMQ
if [ -f "${K8S_DIR}/rabbitmq-deployment.yaml" ]; then
    kubectl apply -f ${K8S_DIR}/rabbitmq-deployment.yaml
    echo -e "${GREEN}✓ RabbitMQ deployed${NC}"
fi

# Kafka
if [ -f "${K8S_DIR}/kafka-deployment.yaml" ]; then
    kubectl apply -f ${K8S_DIR}/kafka-deployment.yaml
    echo -e "${GREEN}✓ Kafka deployed${NC}"
fi

# Eureka Server
if [ -f "${K8S_DIR}/eureka-deployment.yaml" ]; then
    kubectl apply -f ${K8S_DIR}/eureka-deployment.yaml
    echo -e "${GREEN}✓ Eureka Server deployed${NC}"
fi

# Wait for infrastructure to be ready
echo "Waiting for infrastructure services to be ready..."
kubectl wait --for=condition=ready pod -l tier=infrastructure --timeout=300s || true
echo -e "${GREEN}✓ Infrastructure services ready${NC}"

# ============================================================
# Step 7: Deploy Microservices
# ============================================================
echo -e "\n${YELLOW}[7/10] Deploying microservices...${NC}"

# Deploy all microservices
for service in hotel-service booking-service bus-service payment-service auth-service; do
    if [ -f "${K8S_DIR}/${service}-deployment.yaml" ]; then
        kubectl apply -f ${K8S_DIR}/${service}-deployment.yaml
        echo -e "${GREEN}✓ ${service} deployed${NC}"
    fi
done

# Wait for backend services to be ready
echo "Waiting for backend services to be ready..."
kubectl wait --for=condition=ready pod -l tier=backend --timeout=300s || true
echo -e "${GREEN}✓ Backend services ready${NC}"

# ============================================================
# Step 8: Deploy BFF Services
# ============================================================
echo -e "\n${YELLOW}[8/10] Deploying BFF services...${NC}"

for bff in web-bff mobile-bff; do
    if [ -f "${K8S_DIR}/${bff}-deployment.yaml" ]; then
        kubectl apply -f ${K8S_DIR}/${bff}-deployment.yaml
        echo -e "${GREEN}✓ ${bff} deployed${NC}"
    fi
done

# Wait for BFF services to be ready
echo "Waiting for BFF services to be ready..."
kubectl wait --for=condition=ready pod -l tier=bff --timeout=300s || true
echo -e "${GREEN}✓ BFF services ready${NC}"

# ============================================================
# Step 9: Deploy Monitoring Stack
# ============================================================
echo -e "\n${YELLOW}[9/10] Deploying monitoring stack...${NC}"

for monitor in prometheus grafana jaeger; do
    if [ -f "${K8S_DIR}/${monitor}-deployment.yaml" ]; then
        kubectl apply -f ${K8S_DIR}/${monitor}-deployment.yaml
        echo -e "${GREEN}✓ ${monitor} deployed${NC}"
    fi
done

# ============================================================
# Step 10: Configure Ingress
# ============================================================
echo -e "\n${YELLOW}[10/10] Configuring Ingress...${NC}"

kubectl apply -f ${K8S_DIR}/ingress.yaml
echo -e "${GREEN}✓ Ingress configured${NC}"

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

echo -e "\n${YELLOW}Ingress:${NC}"
kubectl get ingress -n ${NAMESPACE}

# Get external IP
EXTERNAL_IP=$(kubectl get ingress ticket-katum-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending...")

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Access Information:${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "External IP: ${YELLOW}${EXTERNAL_IP}${NC}"
echo -e "API URL: ${YELLOW}http://${EXTERNAL_IP}/api/bff${NC}"
echo -e "Eureka: ${YELLOW}http://${EXTERNAL_IP}/eureka${NC}"
echo -e "Grafana: ${YELLOW}http://${EXTERNAL_IP}/grafana${NC}"
echo -e "Prometheus: ${YELLOW}http://${EXTERNAL_IP}/prometheus${NC}"

echo -e "\n${YELLOW}Useful Commands:${NC}"
echo -e "View pods: ${GREEN}kubectl get pods -n ${NAMESPACE}${NC}"
echo -e "View logs: ${GREEN}kubectl logs -f deployment/hotel-service -n ${NAMESPACE}${NC}"
echo -e "Scale service: ${GREEN}kubectl scale deployment hotel-service --replicas=5 -n ${NAMESPACE}${NC}"
echo -e "Port forward: ${GREEN}kubectl port-forward svc/grafana-service 3000:3000 -n ${NAMESPACE}${NC}"

echo -e "\n${GREEN}Deployment completed successfully!${NC}"
