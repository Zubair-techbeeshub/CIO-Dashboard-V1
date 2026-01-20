#!/bin/bash
# Enable required GCP services for Cloud Run deployment

set -e

echo "🔧 Enabling required GCP services..."

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "❌ Error: Not authenticated with gcloud"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Get the current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No GCP project is set"
    echo "Please run: gcloud config set project PROJECT_ID"
    exit 1
fi

echo "📍 Using GCP Project: $PROJECT_ID"

# Enable required APIs
echo "🔄 Enabling Cloud Run API..."
gcloud services enable run.googleapis.com --project=$PROJECT_ID

echo "🔄 Enabling Container Registry API..."
gcloud services enable containerregistry.googleapis.com --project=$PROJECT_ID

echo "🔄 Enabling Cloud Build API..."
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

echo "🔄 Enabling Artifact Registry API..."
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID

echo ""
echo "✅ All required services have been enabled!"
echo ""
echo "📝 Next steps:"
echo "   1. Deploy backend: ./deploy/deploy-backend.sh $PROJECT_ID"
echo "   2. Deploy frontend: ./deploy/deploy-frontend.sh BACKEND_URL"
echo "   Or deploy both: ./deploy/deploy-all.sh $PROJECT_ID"
echo ""
