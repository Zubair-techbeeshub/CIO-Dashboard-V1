# Cloud Run Configuration Guide

Comprehensive guide to understanding and configuring Google Cloud Run settings for the CIO Dashboard backend deployment.

## Table of Contents

1. [Overview](#overview)
2. [Resource Configuration](#resource-configuration)
3. [Scaling Configuration](#scaling-configuration)
4. [Environment Variables](#environment-variables)
5. [Network Configuration](#network-configuration)
6. [Performance Tuning](#performance-tuning)
7. [Best Practices](#best-practices)

## Overview

Cloud Run is a fully managed serverless platform that automatically scales your containerized applications. Key benefits:

- **Pay only for what you use** (with scale-to-zero)
- **Automatic scaling** based on traffic
- **No infrastructure management**
- **Built-in HTTPS and CDN**
- **Fast deployment** (minutes)

## Resource Configuration

### Memory Allocation

Cloud Run allows memory from **128Mi to 32Gi**.

```bash
# Minimum (not recommended for PostgreSQL)
MEMORY=512Mi ./deploy/deploy-backend.sh PROJECT_ID

# Recommended for development
MEMORY=1Gi ./deploy/deploy-backend.sh PROJECT_ID

# Recommended for production (default)
MEMORY=2Gi ./deploy/deploy-backend.sh PROJECT_ID

# High performance
MEMORY=4Gi ./deploy/deploy-backend.sh PROJECT_ID
```

**CIO Dashboard Requirements:**
- **PostgreSQL** needs ~256-512 MB minimum
- **FastAPI** needs ~256-512 MB minimum
- **Recommended:** 1-2 GB total
- **High traffic:** 2-4 GB

**Impact:**
- More memory = higher cost
- Less memory = potential out-of-memory errors
- PostgreSQL performance depends on available memory

### CPU Allocation

Cloud Run allows CPU from **0.08 to 8 vCPUs**.

```bash
# Minimum
CPU=1 ./deploy/deploy-backend.sh PROJECT_ID

# Recommended (default)
CPU=2 ./deploy/deploy-backend.sh PROJECT_ID

# High performance
CPU=4 ./deploy/deploy-backend.sh PROJECT_ID
```

**CIO Dashboard Requirements:**
- **PostgreSQL** benefits from multiple CPUs
- **FastAPI** can use multiple CPUs for concurrency
- **Recommended:** 1-2 CPUs
- **High traffic:** 2-4 CPUs

**CPU Throttling:**
- With minInstances=0: CPU is throttled when idle
- With minInstances≥1: CPU is always allocated
- Request processing always gets full CPU

### CPU-Memory Ratio

Cloud Run enforces CPU-memory ratios:

| Memory | Min CPU | Max CPU |
|--------|---------|---------|
| 512Mi  | 1       | 1       |
| 1Gi    | 1       | 1       |
| 2Gi    | 1       | 2       |
| 4Gi    | 1       | 4       |
| 8Gi    | 2       | 8       |

**Example Valid Combinations:**
```bash
# Valid
MEMORY=1Gi CPU=1       ✓
MEMORY=2Gi CPU=2       ✓
MEMORY=4Gi CPU=2       ✓

# Invalid
MEMORY=512Mi CPU=2     ✗
MEMORY=1Gi CPU=2       ✗
```

## Scaling Configuration

### Minimum Instances (minInstances)

Controls how many instances are kept "warm" at all times.

```bash
# Scale-to-zero (cost-optimized)
MIN_INSTANCES=0 ./deploy/deploy-backend.sh PROJECT_ID

# Always-on (performance-optimized)
MIN_INSTANCES=1 ./deploy/deploy-backend.sh PROJECT_ID

# High availability
MIN_INSTANCES=2 ./deploy/deploy-backend.sh PROJECT_ID
```

**minInstances=0 (Scale-to-Zero):**
- **Cost:** Pay only for active requests
- **Cold start:** 5-30 seconds for first request after idle
- **Idle timeout:** ~15 minutes before scaling to zero
- **Best for:** Development, testing, low-traffic apps
- **Monthly cost:** $0-20 (depending on traffic)

**minInstances=1 (Always-On):**
- **Cost:** Pay for 1 instance 24/7 + additional traffic
- **Cold start:** None
- **Response time:** Consistent (100-500ms)
- **Best for:** Production apps, user-facing services
- **Monthly cost:** ~$60-130 (depending on resources)

**minInstances≥2:**
- **Cost:** Higher baseline cost
- **Availability:** Better fault tolerance
- **Best for:** Critical production apps with SLA requirements
- **Monthly cost:** $120-260+

### Maximum Instances (maxInstances)

Controls the upper limit for auto-scaling.

```bash
# Conservative (default)
MAX_INSTANCES=5 ./deploy/deploy-backend.sh PROJECT_ID

# Moderate
MAX_INSTANCES=10 ./deploy/deploy-backend.sh PROJECT_ID

# High traffic
MAX_INSTANCES=20 ./deploy/deploy-backend.sh PROJECT_ID
```

**Purpose:**
- Prevent unexpected costs from traffic spikes
- Limit downstream system load
- Control resource consumption

**CIO Dashboard Recommendations:**
- **Development:** 2-3 instances
- **Production:** 5-10 instances
- **High traffic:** 10-20 instances

### Auto-Scaling Behavior

Cloud Run automatically scales based on:
- **Request concurrency** (default: 80 requests per instance)
- **CPU utilization**
- **Memory utilization**

**Scaling Formula:**
```
instances = ceil(active_requests / concurrency)
```

**Example:**
- 100 concurrent requests ÷ 80 = 2 instances
- 500 concurrent requests ÷ 80 = 7 instances

**Tuning Concurrency:**
```bash
gcloud run services update cio-dashboard-backend \
  --concurrency 100 \
  --region us-central1
```

Higher concurrency = fewer instances = lower cost (but higher latency)

## Timeout Configuration

Maximum time for request processing.

```bash
# Default (5 minutes)
TIMEOUT=300 ./deploy/deploy-backend.sh PROJECT_ID

# Longer for complex operations
TIMEOUT=600 ./deploy/deploy-backend.sh PROJECT_ID

# Maximum allowed
TIMEOUT=3600 ./deploy/deploy-backend.sh PROJECT_ID
```

**CIO Dashboard:**
- Most API requests: < 1 second
- Database initialization: 10-30 seconds
- Complex queries: 1-5 seconds
- **Recommended:** 300 seconds (5 minutes)

**Note:** Timeout includes container startup time

## Environment Variables

### Database Configuration

```bash
# Built-in PostgreSQL (localhost)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cio_dashboard
DB_USER=postgres
DB_PASSWORD=postgres
```

**Security Note:** Password should be changed in production.

### Application Configuration

```bash
# Environment
ENVIRONMENT=production
DEBUG=False

# CORS
ALLOWED_ORIGINS=https://your-frontend.web.app,https://your-frontend.firebaseapp.com

# JWT
JWT_SECRET_KEY=your-secure-random-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
```

### Setting Environment Variables

**During deployment:**
```bash
gcloud run deploy cio-dashboard-backend \
  --set-env-vars "DB_HOST=localhost,DEBUG=False" \
  --region us-central1
```

**Update existing service:**
```bash
gcloud run services update cio-dashboard-backend \
  --update-env-vars "ALLOWED_ORIGINS=https://new-frontend.web.app" \
  --region us-central1
```

**Remove environment variable:**
```bash
gcloud run services update cio-dashboard-backend \
  --remove-env-vars "OLD_VAR" \
  --region us-central1
```

**Using secrets (recommended for sensitive data):**
```bash
# Create secret
echo -n "super-secret-key" | gcloud secrets create jwt-secret --data-file=-

# Use in Cloud Run
gcloud run services update cio-dashboard-backend \
  --update-secrets JWT_SECRET_KEY=jwt-secret:latest \
  --region us-central1
```

## Network Configuration

### Ingress Settings

Control what traffic can reach your service.

```bash
# Allow all (default)
gcloud run services update cio-dashboard-backend \
  --ingress all \
  --region us-central1

# Allow only from Cloud Load Balancer
gcloud run services update cio-dashboard-backend \
  --ingress internal-and-cloud-load-balancing \
  --region us-central1

# Allow only from within VPC
gcloud run services update cio-dashboard-backend \
  --ingress internal \
  --region us-central1
```

**CIO Dashboard:** Use `all` (default) for public API access.

### Authentication

```bash
# Allow unauthenticated (default)
--allow-unauthenticated

# Require authentication
--no-allow-unauthenticated
```

**CIO Dashboard:** Uses `--allow-unauthenticated` with application-level auth (JWT).

### VPC Connector (Optional)

Connect to resources in a VPC (Cloud SQL, etc.):

```bash
gcloud run services update cio-dashboard-backend \
  --vpc-connector projects/PROJECT_ID/locations/REGION/connectors/CONNECTOR_NAME \
  --region us-central1
```

**Not needed** for the current setup (using in-container PostgreSQL).

## Performance Tuning

### Cold Start Optimization

**Reduce cold start time:**

1. **Optimize Docker image:**
   ```dockerfile
   # Use smaller base images
   FROM python:3.11-slim
   
   # Multi-stage builds
   FROM python:3.11 as builder
   ...
   FROM python:3.11-slim
   COPY --from=builder ...
   ```

2. **Minimize dependencies:**
   - Remove unused packages
   - Use lightweight alternatives

3. **Keep containers warm:**
   ```bash
   MIN_INSTANCES=1 ./deploy/deploy-backend.sh PROJECT_ID
   ```

4. **Use startup probe:**
   ```bash
   gcloud run services update cio-dashboard-backend \
     --startup-probe period=10,timeout=3,initial-delay=0,failure-threshold=3 \
     --region us-central1
   ```

### Request Performance

**Improve response time:**

1. **Database connection pooling:**
   - Already configured in FastAPI
   - Reuse connections across requests

2. **Caching:**
   - Add Redis/Memcache for frequently accessed data
   - Cache at application level

3. **Increase CPU:**
   ```bash
   CPU=4 ./deploy/deploy-backend.sh PROJECT_ID
   ```

4. **Optimize queries:**
   - Add indexes to database tables
   - Use pagination for large datasets
   - Minimize N+1 queries

### Resource Monitoring

**View metrics:**
```bash
# Via gcloud
gcloud run services describe cio-dashboard-backend \
  --region us-central1 \
  --format json

# Via Console
# Go to: Cloud Run → Service → Metrics
```

**Key metrics to watch:**
- Request count
- Request latency (p50, p95, p99)
- CPU utilization
- Memory utilization
- Container instance count
- Cold start count

## Best Practices

### 1. Start Small, Scale Up

```bash
# Begin with minimum viable resources
MEMORY=1Gi CPU=1 MIN_INSTANCES=0 ./deploy/deploy-backend.sh PROJECT_ID

# Monitor and adjust based on metrics
# Increase if needed
MEMORY=2Gi CPU=2 MIN_INSTANCES=1 ./deploy/deploy-backend.sh PROJECT_ID
```

### 2. Use Scale-to-Zero for Development

```bash
# Development environment
MIN_INSTANCES=0 ./deploy/deploy-backend.sh dev-project

# Production environment
MIN_INSTANCES=1 ./deploy/deploy-backend.sh prod-project
```

### 3. Set Resource Limits

```bash
# Prevent runaway costs
MAX_INSTANCES=5 MEMORY=2Gi CPU=2 ./deploy/deploy-backend.sh PROJECT_ID
```

### 4. Use Secrets for Sensitive Data

```bash
# Don't pass secrets as plain environment variables
# Use Secret Manager instead
gcloud secrets create db-password --data-file=-
gcloud run services update cio-dashboard-backend \
  --update-secrets DB_PASSWORD=db-password:latest
```

### 5. Enable Request Logging

```bash
# Already enabled by default
# View logs with:
gcloud run services logs read cio-dashboard-backend --region us-central1
```

### 6. Tag Deployments

```bash
# Tag for rollback capability
gcloud run deploy cio-dashboard-backend \
  --tag v1-0-0 \
  --region us-central1
```

### 7. Use Health Checks

```bash
# Already configured in Dockerfile.cloudrun
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/docs || exit 1
```

### 8. Monitor Costs

Set up billing alerts at $50, $100, $150 to avoid surprises.

## Configuration Presets

### Development/Testing

```bash
MEMORY=1Gi \
CPU=1 \
MIN_INSTANCES=0 \
MAX_INSTANCES=2 \
TIMEOUT=300 \
./deploy/deploy-backend.sh dev-project
```

**Cost:** ~$0-5/month  
**Cold starts:** Yes (~5-10s)  
**Best for:** Feature development, testing

### Production - Cost-Optimized

```bash
MEMORY=1Gi \
CPU=1 \
MIN_INSTANCES=0 \
MAX_INSTANCES=5 \
TIMEOUT=300 \
./deploy/deploy-backend.sh prod-project
```

**Cost:** ~$10-30/month  
**Cold starts:** Yes (~5-10s)  
**Best for:** Low-traffic production, MVP launches

### Production - Performance-Optimized

```bash
MEMORY=2Gi \
CPU=2 \
MIN_INSTANCES=1 \
MAX_INSTANCES=10 \
TIMEOUT=300 \
./deploy/deploy-backend.sh prod-project
```

**Cost:** ~$130-180/month  
**Cold starts:** No  
**Best for:** Business-critical applications

### High-Traffic Production

```bash
MEMORY=4Gi \
CPU=4 \
MIN_INSTANCES=2 \
MAX_INSTANCES=20 \
TIMEOUT=300 \
./deploy/deploy-backend.sh prod-project
```

**Cost:** ~$260-400/month  
**Cold starts:** No  
**Best for:** High-traffic, mission-critical services

## Troubleshooting

### Service Won't Start

**Check resource limits:**
```bash
# Increase memory if out-of-memory
MEMORY=4Gi ./deploy/deploy-backend.sh PROJECT_ID

# Increase timeout if startup is slow
TIMEOUT=600 ./deploy/deploy-backend.sh PROJECT_ID
```

### High Latency

**Solutions:**
1. Enable always-on: `MIN_INSTANCES=1`
2. Increase CPU: `CPU=4`
3. Increase memory: `MEMORY=4Gi`
4. Check database performance
5. Add caching layer

### Frequent Scaling

**Adjust concurrency:**
```bash
# Lower concurrency = more instances = better performance
gcloud run services update cio-dashboard-backend \
  --concurrency 50 \
  --region us-central1
```

### High Costs

**Optimization steps:**
1. Enable scale-to-zero: `MIN_INSTANCES=0`
2. Reduce resources: `MEMORY=1Gi CPU=1`
3. Set max instances: `MAX_INSTANCES=5`
4. Check for memory leaks
5. Review actual usage patterns

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Cloud Run Best Practices](https://cloud.google.com/run/docs/best-practices)
- [Troubleshooting Guide](TROUBLESHOOTING_GCP.md)
- [Cost Estimates](GCP_COST_ESTIMATE.md)
