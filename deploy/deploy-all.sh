#!/bin/bash
# Deploy both backend and frontend to GCP

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Usage
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: PROJECT_ID is required${NC}"
    echo ""
    echo "Usage: $0 PROJECT_ID [REGION]"
    echo ""
    echo "Example: $0 my-project-id us-central1"
    echo ""
    echo "Optional environment variables:"
    echo "  MIN_INSTANCES=0     # Minimum instances (default: 0)"
    echo "  MAX_INSTANCES=5     # Maximum instances (default: 5)"
    echo "  MEMORY=2Gi          # Memory allocation (default: 2Gi)"
    echo "  CPU=2               # CPU allocation (default: 2)"
    exit 1
fi

PROJECT_ID=$1
REGION=${2:-us-central1}

echo "🚀 Deploying Complete CIO Dashboard to GCP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Project ID: $PROJECT_ID"
echo "📍 Region:     $REGION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    exit 1
fi

if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Error: Firebase CLI is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Step 1: Enable services (if not already enabled)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1: Enabling GCP services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

./deploy/enable-services.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Deploying Backend to Cloud Run"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

./deploy/deploy-backend.sh $PROJECT_ID $REGION

# Read backend URL from file
if [ ! -f ".backend-url.txt" ]; then
    echo -e "${RED}❌ Error: Backend URL file not found${NC}"
    exit 1
fi

BACKEND_URL=$(cat .backend-url.txt)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3: Deploying Frontend to Firebase"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

./deploy/deploy-frontend.sh $BACKEND_URL $PROJECT_ID

# Get frontend URL
FRONTEND_URL="https://${PROJECT_ID}.web.app"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 4: Updating CORS configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔧 Updating backend ALLOWED_ORIGINS..."
gcloud run services update cio-dashboard-backend \
    --update-env-vars ALLOWED_ORIGINS="${FRONTEND_URL},https://${PROJECT_ID}.firebaseapp.com" \
    --region $REGION \
    --project $PROJECT_ID

echo -e "${GREEN}✓ CORS configuration updated${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Your CIO Dashboard is now live!"
echo ""
echo "🌐 Frontend:    $FRONTEND_URL"
echo "🔗 Backend:     $BACKEND_URL"
echo "📄 API Docs:    $BACKEND_URL/docs"
echo "🏥 Health:      $BACKEND_URL/api/health"
echo ""
echo "📝 What to do next:"
echo "   1. Visit $FRONTEND_URL to see your dashboard"
echo "   2. Run tests: ./deploy/test-backend.sh $BACKEND_URL"
echo "   3. Run tests: ./deploy/test-frontend.sh $FRONTEND_URL"
echo ""
echo "💡 Configuration saved:"
echo "   - Backend URL: .backend-url.txt"
echo "   - Environment: .env"
echo "   - Firebase:    .firebaserc"
echo ""
