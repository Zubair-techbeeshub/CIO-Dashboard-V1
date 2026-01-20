#!/bin/bash
# Deploy frontend to Firebase Hosting

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Usage
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: BACKEND_URL is required${NC}"
    echo ""
    echo "Usage: $0 BACKEND_URL [PROJECT_ID]"
    echo ""
    echo "Example: $0 https://cio-dashboard-backend-xxx.run.app"
    echo "         $0 https://cio-dashboard-backend-xxx.run.app my-project-id"
    echo ""
    exit 1
fi

BACKEND_URL=$1
PROJECT_ID=$2

echo "🚀 Deploying CIO Dashboard Frontend to Firebase Hosting"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Backend URL: $BACKEND_URL"
if [ -n "$PROJECT_ID" ]; then
    echo "📍 Project ID:  $PROJECT_ID"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Error: Firebase CLI is not installed${NC}"
    echo ""
    echo "Please install it with:"
    echo "  npm install -g firebase-tools"
    echo ""
    echo "Then login:"
    echo "  firebase login"
    exit 1
fi

# Check if Node.js and npm are installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed${NC}"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo -e "${RED}❌ Error: firebase.json not found${NC}"
    echo "Please make sure you're running this script from the repository root"
    exit 1
fi

# Check if .firebaserc exists
if [ ! -f ".firebaserc" ]; then
    echo -e "${YELLOW}⚠️  Warning: .firebaserc not found${NC}"
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ Error: PROJECT_ID is required when .firebaserc doesn't exist${NC}"
        exit 1
    fi
    echo "Creating .firebaserc with project: $PROJECT_ID"
    cat > .firebaserc <<EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF
fi

# Create or update .env with backend URL
echo "🔧 Configuring environment variables..."
cat > .env <<EOF
VITE_API_URL=${BACKEND_URL}/api
EOF

echo "   ✓ Created .env with VITE_API_URL=${BACKEND_URL}/api"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo ""
echo "🔨 Building frontend..."
npm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: Build failed - dist directory not found${NC}"
    exit 1
fi

# Deploy to Firebase
echo ""
echo "🚀 Deploying to Firebase Hosting..."
if [ -n "$PROJECT_ID" ]; then
    firebase deploy --only hosting --project $PROJECT_ID
else
    firebase deploy --only hosting
fi

# Get the deployed URL
echo ""
echo "🔍 Retrieving frontend URL..."
if [ -n "$PROJECT_ID" ]; then
    FRONTEND_URL="https://${PROJECT_ID}.web.app"
else
    # Try to get project ID from .firebaserc
    FIREBASE_PROJECT=$(grep -o '"default"[[:space:]]*:[[:space:]]*"[^"]*"' .firebaserc | cut -d'"' -f4)
    if [ -n "$FIREBASE_PROJECT" ]; then
        FRONTEND_URL="https://${FIREBASE_PROJECT}.web.app"
    else
        FRONTEND_URL="(check Firebase console for URL)"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Frontend URL: $FRONTEND_URL"
echo "🔗 Backend URL:  $BACKEND_URL"
echo ""
echo "📝 Next steps:"
echo "   1. Test frontend: ./deploy/test-frontend.sh $FRONTEND_URL"
echo "   2. Update backend ALLOWED_ORIGINS with: $FRONTEND_URL"
echo ""
echo "💡 To update ALLOWED_ORIGINS in Cloud Run:"
echo "   gcloud run services update cio-dashboard-backend \\"
echo "     --update-env-vars ALLOWED_ORIGINS=$FRONTEND_URL \\"
echo "     --region us-central1"
echo ""
