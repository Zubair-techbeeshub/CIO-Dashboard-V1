#!/bin/bash
# Deploy backend to Google Cloud Run

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
REGION=${2:-us-central1}
MIN_INSTANCES=${MIN_INSTANCES:-0}
MAX_INSTANCES=${MAX_INSTANCES:-5}
MEMORY=${MEMORY:-2Gi}
CPU=${CPU:-2}
TIMEOUT=${TIMEOUT:-300}
SERVICE_NAME=${SERVICE_NAME:-cio-dashboard-backend}

# Usage
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: PROJECT_ID is required${NC}"
    echo ""
    echo "Usage: $0 PROJECT_ID [REGION]"
    echo ""
    echo "Example: $0 my-project-id us-central1"
    echo ""
    echo "Optional environment variables:"
    echo "  MIN_INSTANCES=0     # Minimum instances (default: 0 for scale-to-zero)"
    echo "  MAX_INSTANCES=5     # Maximum instances (default: 5)"
    echo "  MEMORY=2Gi          # Memory allocation (default: 2Gi)"
    echo "  CPU=2               # CPU allocation (default: 2)"
    echo "  TIMEOUT=300         # Request timeout in seconds (default: 300)"
    echo "  SERVICE_NAME=...    # Service name (default: cio-dashboard-backend)"
    exit 1
fi

PROJECT_ID=$1

echo "🚀 Deploying CIO Dashboard Backend to Cloud Run"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Project ID:       $PROJECT_ID"
echo "📍 Region:           $REGION"
echo "📍 Service Name:     $SERVICE_NAME"
echo "📍 Memory:           $MEMORY"
echo "📍 CPU:              $CPU"
echo "📍 Min Instances:    $MIN_INSTANCES"
echo "📍 Max Instances:    $MAX_INSTANCES"
echo "📍 Timeout:          ${TIMEOUT}s"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
echo "🔧 Setting GCP project..."
gcloud config set project $PROJECT_ID

# Check if Dockerfile.cloudrun exists
if [ ! -f "backend/Dockerfile.cloudrun" ]; then
    echo -e "${RED}❌ Error: backend/Dockerfile.cloudrun not found${NC}"
    echo "Please make sure you're running this script from the repository root"
    exit 1
fi

# Generate a secure JWT secret if not provided
JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)}

# Deploy to Cloud Run using source-based deployment
echo "📦 Building and deploying to Cloud Run..."
echo "   This may take 5-10 minutes..."
echo ""

cd backend

gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory $MEMORY \
    --cpu $CPU \
    --timeout $TIMEOUT \
    --min-instances $MIN_INSTANCES \
    --max-instances $MAX_INSTANCES \
    --set-env-vars "DB_HOST=localhost,DB_PORT=5432,DB_NAME=cio_dashboard,DB_USER=postgres,DB_PASSWORD=postgres,ENVIRONMENT=production,DEBUG=False,JWT_SECRET_KEY=$JWT_SECRET" \
    --dockerfile Dockerfile.cloudrun \
    --project $PROJECT_ID

cd ..

# Get the service URL
echo ""
echo "🔍 Retrieving service URL..."
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)' --project $PROJECT_ID)

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Error: Failed to retrieve backend URL${NC}"
    exit 1
fi

# Save backend URL to file for frontend deployment
echo "$BACKEND_URL" > .backend-url.txt

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Backend URL: $BACKEND_URL"
echo "📄 API Docs:    $BACKEND_URL/docs"
echo "🏥 Health:      $BACKEND_URL/api/health"
echo ""
echo "📝 Next steps:"
echo "   1. Test backend: ./deploy/test-backend.sh $BACKEND_URL"
echo "   2. Deploy frontend: ./deploy/deploy-frontend.sh $BACKEND_URL"
echo ""
echo "💡 Backend URL saved to .backend-url.txt"
echo ""

# Wait a moment and test health endpoint
echo "🏥 Testing health endpoint..."
sleep 5
if curl -f -s "${BACKEND_URL}/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed - service may still be starting up${NC}"
    echo "   Try accessing $BACKEND_URL/docs in a few minutes"
fi
echo ""
