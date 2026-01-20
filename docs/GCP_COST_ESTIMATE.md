# GCP Cost Estimate for CIO Dashboard

Detailed cost breakdown and estimates for running CIO Dashboard on Google Cloud Platform using Cloud Run and Firebase Hosting.

## Summary

| Configuration | Estimated Monthly Cost |
|--------------|----------------------|
| **Development/Testing** (scale-to-zero) | $0 - $5 |
| **Low Traffic Production** (always-on) | $20 - $40 |
| **Medium Traffic Production** | $50 - $100 |
| **High Traffic Production** | $150 - $300 |

## Service Breakdown

### 1. Cloud Run (Backend)

Cloud Run pricing is based on:
- **CPU allocation** (charged per vCPU-second)
- **Memory allocation** (charged per GiB-second)
- **Requests** (charged per million requests)
- **Network egress** (charged per GiB)

#### Pricing (as of 2025)

**Compute:**
- CPU: $0.00002400 per vCPU-second
- Memory: $0.00000250 per GiB-second
- Requests: $0.40 per million requests

**Free Tier (Monthly):**
- 2 million requests
- 360,000 vCPU-seconds
- 180,000 GiB-seconds

#### Scenario A: Scale-to-Zero (minInstances=0)

**Configuration:**
```bash
Memory: 2Gi
CPU: 2
Min Instances: 0
Max Instances: 5
```

**Usage Pattern (Development/Testing):**
- 10,000 requests/month
- Average response time: 500ms
- Cold start impact: ~2s for first request

**Cost Calculation:**
```
Requests: 10,000 / 1,000,000 × $0.40 = $0.004
CPU: (10,000 × 0.5s × 2 vCPU) = 10,000 vCPU-seconds
  10,000 × $0.00002400 = $0.24
Memory: (10,000 × 0.5s × 2 GiB) = 10,000 GiB-seconds
  10,000 × $0.00000250 = $0.025

Total: ~$0.27/month (within free tier)
```

**With Free Tier: $0/month**

#### Scenario B: Always-On (minInstances=1)

**Configuration:**
```bash
Memory: 2Gi
CPU: 2
Min Instances: 1
Max Instances: 5
```

**Usage Pattern (Low Traffic Production):**
- 100,000 requests/month
- Average response time: 100ms (no cold starts)
- 1 instance always running

**Cost Calculation:**
```
Always-on instance (30 days × 24 hours):
  CPU: 720 hours × 3600s × 2 vCPU = 5,184,000 vCPU-seconds
    5,184,000 × $0.00002400 = $124.42
  Memory: 720 hours × 3600s × 2 GiB = 5,184,000 GiB-seconds
    5,184,000 × $0.00000250 = $12.96

Additional request processing:
  CPU: (100,000 × 0.1s × 2) = 20,000 vCPU-seconds
    20,000 × $0.00002400 = $0.48
  Memory: (100,000 × 0.1s × 2) = 20,000 GiB-seconds
    20,000 × $0.00000250 = $0.05

Requests: 100,000 / 1,000,000 × $0.40 = $0.04

Subtotal: $137.95

With Free Tier:
  CPU: $124.42 - (360,000 × $0.00002400) = $124.42 - $8.64 = $115.78
  Memory: $12.96 - (180,000 × $0.00000250) = $12.96 - $0.45 = $12.51
  Requests: Free (under 2M)

Total: ~$128.77/month
```

**Actual Cost (after free tier): ~$129/month**

However, if you optimize to smaller resources:

**Optimized Configuration:**
```bash
Memory: 1Gi
CPU: 1
Min Instances: 1
```

**Optimized Cost:**
```
CPU: 5,184,000 vCPU-seconds × 1 vCPU × $0.00002400 = $62.21
Memory: 5,184,000 GiB-seconds × 1 GiB × $0.00000250 = $6.48
After free tier: ~$60/month
```

**Optimized Always-On: ~$60/month**

#### Scenario C: Medium Traffic Production

**Configuration:**
```bash
Memory: 2Gi
CPU: 2
Min Instances: 1
Max Instances: 5
```

**Usage Pattern:**
- 1,000,000 requests/month
- Average response time: 100ms
- Peak: 2-3 instances

**Cost Calculation:**
```
Always-on base: $128.77 (from Scenario B)
Additional scaling instances: ~$20-40
Total: ~$150-170/month
```

### 2. Firebase Hosting (Frontend)

Firebase Hosting pricing:
- **Storage:** $0.026 per GB/month
- **Bandwidth:** $0.15 per GB (after 10 GB free)
- **Free Tier:** 10 GB storage, 10 GB bandwidth/month

#### Typical Frontend Costs

**React/Vite Build:**
- Build size: ~5-10 MB
- Storage: 0.01 GB × $0.026 = $0.0003/month

**Traffic:**
- 1,000 visitors/month: ~5-10 GB bandwidth
- 10,000 visitors/month: ~50-100 GB bandwidth

**Cost Calculation:**
```
Low Traffic (5 GB): Free
Medium Traffic (50 GB): (50 - 10) × $0.15 = $6.00/month
High Traffic (100 GB): (100 - 10) × $0.15 = $13.50/month
```

**Firebase Hosting Cost: $0-15/month**

### 3. Container Registry / Artifact Registry

**Pricing:**
- Storage: $0.10 per GB/month (first 0.5 GB free)
- Egress: Standard network pricing

**Typical Usage:**
- Docker image size: ~1.5 GB (PostgreSQL + FastAPI)
- Versions kept: 2-3 old versions

**Cost:**
```
Storage: 3 × 1.5 GB × $0.10 = $0.45/month
With free tier: $0/month (if under 0.5 GB total or minimal)
```

**Registry Cost: ~$0-5/month**

### 4. Additional Services (Optional)

#### Cloud SQL (if migrating from in-container DB)
- **Not included in this setup** (using in-container PostgreSQL)
- If used: $7-50/month for smallest instance

#### Cloud Monitoring/Logging
- **Free Tier:** First 50 GB logs/month
- Basic monitoring: Free
- Advanced: ~$1-5/month

#### Load Balancing (if needed)
- Not needed for single Cloud Run service
- $0/month

## Total Cost Estimates

### Development/Testing Environment

```
Cloud Run (scale-to-zero):        $0    (free tier)
Firebase Hosting:                 $0    (free tier)
Container Registry:               $0    (free tier)
─────────────────────────────────────
Total:                            $0-5/month
```

**Ideal for:** Personal projects, development, testing, low-traffic demos

### Production - Cost-Optimized

```
Cloud Run (minInstances=0):       $0-10  (with traffic)
Firebase Hosting (moderate):      $5
Container Registry:               $1
Monitoring:                       $1
─────────────────────────────────────
Total:                            $7-17/month
```

**Trade-off:** Cold starts (2-5 second delay on first request after idle period)

### Production - Performance-Optimized

```
Cloud Run (minInstances=1, 1Gi):  $60
Firebase Hosting (moderate):      $5
Container Registry:               $1
Monitoring:                       $2
─────────────────────────────────────
Total:                            $68/month
```

**Benefits:** No cold starts, consistent performance

### Production - High Performance

```
Cloud Run (minInstances=1, 2Gi):  $129
Firebase Hosting (high traffic):  $10
Container Registry:               $2
Monitoring:                       $3
─────────────────────────────────────
Total:                            $144/month
```

**Benefits:** Better performance, handles more concurrent requests

## Comparison with Current Infrastructure

### AWS EC2 (Current)

**Typical Setup:**
- EC2 t3.medium: $30/month
- RDS PostgreSQL db.t3.micro: $15/month
- Application Load Balancer: $16/month
- Data transfer: $5/month
- **Total: ~$66/month minimum**

**Trade-offs:**
- Always running (no scale-to-zero)
- More consistent performance
- More operational overhead

### Vercel (Frontend Current)

**Pricing:**
- Free tier: 100 GB bandwidth
- Pro: $20/month (1 TB bandwidth)

**Current: $0-20/month**

### Combined Current Cost

```
EC2 Backend:    $66/month
Vercel Frontend: $0-20/month
─────────────────────────────
Total Current:   $66-86/month
```

### GCP Migration Savings

| Scenario | Monthly Cost | vs Current | Savings |
|----------|-------------|-----------|---------|
| Scale-to-Zero | $0-5 | -$66 to -$81 | **$61-81** |
| Cost-Optimized | $7-17 | -$49 to -$69 | **$49-69** |
| Performance (1Gi) | $68 | -$18 to +$2 | **$0-18** |
| Performance (2Gi) | $144 | +$58 to +$78 | **-$58 to -$78** |

**Recommendation:** Start with scale-to-zero or cost-optimized, upgrade if cold starts become an issue.

## Cost Optimization Tips

### 1. Use Scale-to-Zero for Development

```bash
MIN_INSTANCES=0 ./deploy/deploy-backend.sh PROJECT_ID
```

**Savings:** ~$60-130/month compared to always-on

### 2. Optimize Resource Allocation

Start small and scale up only if needed:
```bash
# Start with minimum
MEMORY=512Mi CPU=1 ./deploy/deploy-backend.sh PROJECT_ID

# Scale up if needed
MEMORY=1Gi CPU=1 ./deploy/deploy-backend.sh PROJECT_ID
```

### 3. Use Regional Deployments

Deploy to regions closest to users:
- US: `us-central1`, `us-east1`
- Europe: `europe-west1`
- Asia: `asia-east1`

**Savings:** Reduced latency and egress costs

### 4. Enable CDN for Firebase Hosting

Firebase Hosting has built-in CDN (free)
- Reduces bandwidth costs
- Improves performance globally

### 5. Clean Up Old Container Images

```bash
# List images
gcloud container images list --repository=gcr.io/PROJECT_ID

# Delete old versions
gcloud container images delete IMAGE_URL
```

**Savings:** ~$5-10/month in storage

### 6. Monitor and Adjust

```bash
# View Cloud Run metrics
gcloud run services describe cio-dashboard-backend --region us-central1

# Adjust based on actual usage
```

**Key metrics to watch:**
- Request count
- CPU utilization
- Memory utilization
- Cold start frequency

### 7. Set Maximum Instances Cap

```bash
MAX_INSTANCES=3 ./deploy/deploy-backend.sh PROJECT_ID
```

**Protection:** Prevents unexpected costs from traffic spikes

## Budget Alerts

### Set Up Billing Alerts

1. Go to **Cloud Console → Billing → Budgets & Alerts**
2. Create budget alert at $50, $100, $150
3. Get email notifications when thresholds reached

### Example gcloud Command

```bash
# Create budget alert
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="CIO Dashboard Budget" \
  --budget-amount=100USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

## Cost Monitoring

### View Current Spend

```bash
# Via gcloud
gcloud billing accounts list

# Via Console
# Go to: https://console.cloud.google.com/billing
```

### Export Billing Data

Set up BigQuery export for detailed analysis:
1. Go to **Billing → Billing Export**
2. Enable **BigQuery export**
3. Analyze with SQL queries

## Conclusion

**Recommended Setup:**

**Development:**
- Scale-to-zero Cloud Run (minInstances=0)
- Firebase Hosting free tier
- **Cost: $0-5/month**

**Production (Low-Medium Traffic):**
- Optimized Cloud Run (1Gi, 1 CPU, minInstances=1)
- Firebase Hosting
- **Cost: $60-70/month**
- **Savings over EC2: $15-25/month**

**Production (High Traffic):**
- Standard Cloud Run (2Gi, 2 CPU, minInstances=1)
- Firebase Hosting with higher bandwidth
- **Cost: $140-150/month**
- **More expensive than EC2 but with better scalability**

**Best Value:** Start with scale-to-zero ($0-5/month) and upgrade to always-on only when cold starts impact user experience.

## Additional Resources

- [Cloud Run Pricing Calculator](https://cloud.google.com/products/calculator)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [GCP Free Tier](https://cloud.google.com/free)
- [Cloud Run Configuration Guide](CLOUD_RUN_CONFIGURATION.md)
