# Deployment Guide

## Prerequisites
- AWS Account with appropriate permissions
- Docker installed
- Kubernetes cluster configured
- Domain name registered
- SSL certificates

## Infrastructure Setup

### 1. AWS Resources
```bash
# Configure AWS CLI
aws configure

# Create EKS Cluster
eksctl create cluster -f infrastructure/eks-cluster.yaml

# Create RDS Instance
aws rds create-db-instance --db-instance-identifier municipal-feedback \
    --db-instance-class db.t3.medium \
    --engine postgres \
    --allocated-storage 20

# Create ElastiCache Cluster
aws elasticache create-cache-cluster --cache-cluster-id municipal-feedback \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1
```

## Component Deployment

### 1. Backend Services

```bash
# Build Docker image
docker build -t municipal-feedback-backend ./backend

# Push to ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin aws_account_id.dkr.ecr.region.amazonaws.com
docker tag municipal-feedback-backend:latest aws_account_id.dkr.ecr.region.amazonaws.com/municipal-feedback-backend:latest
docker push aws_account_id.dkr.ecr.region.amazonaws.com/municipal-feedback-backend:latest

# Deploy to Kubernetes
kubectl apply -f infrastructure/k8s/backend/
```

### 2. Municipality Dashboard

```bash
# Build Next.js application
cd dashboard
yarn build

# Build Docker image
docker build -t municipal-feedback-dashboard .

# Push to ECR
docker tag municipal-feedback-dashboard:latest aws_account_id.dkr.ecr.region.amazonaws.com/municipal-feedback-dashboard:latest
docker push aws_account_id.dkr.ecr.region.amazonaws.com/municipal-feedback-dashboard:latest

# Deploy to Kubernetes
kubectl apply -f infrastructure/k8s/dashboard/
```

### 3. Mobile Application

```bash
# Build Expo application
cd mobile-app
expo build:android
expo build:ios

# Deploy to stores
expo upload:android
expo upload:ios
```

## Environment Configuration

### 1. Backend Environment Variables
```yaml
# infrastructure/k8s/backend/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  NODE_ENV: production
  API_VERSION: v1
  # Add other non-sensitive configurations
```

```yaml
# infrastructure/k8s/backend/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
data:
  JWT_SECRET: <base64-encoded-value>
  # Add other sensitive configurations
```

### 2. Dashboard Environment Variables
```yaml
# infrastructure/k8s/dashboard/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: dashboard-config
data:
  NEXT_PUBLIC_API_URL: https://api.yourdomain.com
  # Add other non-sensitive configurations
```

## SSL/TLS Configuration

### 1. Install cert-manager
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.7.1/cert-manager.yaml
```

### 2. Configure Let's Encrypt
```yaml
# infrastructure/k8s/cert-manager/issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@domain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

## Monitoring Setup

### 1. Install Prometheus & Grafana
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack
```

### 2. Configure Logging
```bash
# Install ELK Stack
helm repo add elastic https://helm.elastic.co
helm repo update
helm install elasticsearch elastic/elasticsearch
helm install kibana elastic/kibana
helm install filebeat elastic/filebeat
```

## Backup Configuration

### 1. Database Backups
```bash
# Configure automated backups for RDS
aws rds modify-db-instance \
    --db-instance-identifier municipal-feedback \
    --backup-retention-period 7 \
    --preferred-backup-window "03:00-04:00"
```

### 2. Application Data Backups
```bash
# Configure S3 lifecycle rules
aws s3api put-bucket-lifecycle-configuration \
    --bucket municipal-feedback-uploads \
    --lifecycle-configuration file://infrastructure/s3-lifecycle.json
```

## Scaling Configuration

### 1. Horizontal Pod Autoscaling
```yaml
# infrastructure/k8s/backend/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Rollback Procedures

### 1. Backend Rollback
```bash
# Roll back to previous deployment
kubectl rollout undo deployment/backend

# Roll back to specific revision
kubectl rollout undo deployment/backend --to-revision=2
```

### 2. Dashboard Rollback
```bash
# Roll back to previous deployment
kubectl rollout undo deployment/dashboard

# Roll back to specific revision
kubectl rollout undo deployment/dashboard --to-revision=2
```

## Health Checks

### 1. Configure Liveness Probes
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
```

### 2. Configure Readiness Probes
```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Troubleshooting

### Common Issues and Solutions

1. **Database Connection Issues**
   - Check security group settings
   - Verify credentials in secrets
   - Check network connectivity

2. **Pod Startup Failures**
   - Check pod logs: `kubectl logs <pod-name>`
   - Check events: `kubectl get events`
   - Verify resource limits

3. **SSL Certificate Issues**
   - Check cert-manager logs
   - Verify DNS settings
   - Check domain validation 