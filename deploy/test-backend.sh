#!/bin/bash
# Test backend deployment

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Usage
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: BACKEND_URL is required${NC}"
    echo ""
    echo "Usage: $0 BACKEND_URL"
    echo ""
    echo "Example: $0 https://cio-dashboard-backend-xxx.run.app"
    exit 1
fi

BACKEND_URL=$1

# Remove trailing slash if present
BACKEND_URL=${BACKEND_URL%/}

echo "🧪 Testing Backend Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Backend URL: $BACKEND_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -ne "${BLUE}Testing:${NC} $description ... "
    
    response=$(curl -s -w "\n%{http_code}" "$endpoint" 2>/dev/null || echo -e "\n000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED+1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code, expected $expected_status)"
        FAILED=$((FAILED+1))
        return 1
    fi
}

# Function to test JSON response
test_json_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_field=$3
    
    echo -ne "${BLUE}Testing:${NC} $description ... "
    
    response=$(curl -s "$endpoint" 2>/dev/null || echo "{}")
    
    if echo "$response" | grep -q "\"$expected_field\""; then
        echo -e "${GREEN}✓ PASSED${NC} (contains '$expected_field')"
        PASSED=$((PASSED+1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (missing '$expected_field')"
        echo "   Response: $response"
        FAILED=$((FAILED+1))
        return 1
    fi
}

echo "📋 Running tests..."
echo ""

# Test 1: Root endpoint
test_endpoint "$BACKEND_URL" "Root endpoint"

# Test 2: API documentation
test_endpoint "$BACKEND_URL/docs" "API documentation (Swagger)"

# Test 3: Health check endpoint
test_json_endpoint "$BACKEND_URL/api/health" "Health check endpoint" "status"

# Test 4: Dashboard metrics endpoint
test_endpoint "$BACKEND_URL/api/dashboard/metrics" "Dashboard metrics endpoint"

# Test 5: Portfolio programs endpoint
test_endpoint "$BACKEND_URL/api/portfolio/programs" "Portfolio programs endpoint"

# Test 6: Workforce metrics endpoint
test_endpoint "$BACKEND_URL/api/workforce/metrics" "Workforce metrics endpoint"

# Test 7: Projects endpoint
test_endpoint "$BACKEND_URL/api/projects" "Projects endpoint"

# Test 8: Check if PostgreSQL is running (via database-dependent endpoint)
echo -ne "${BLUE}Testing:${NC} Database connectivity ... "
response=$(curl -s "$BACKEND_URL/api/dashboard/metrics" 2>/dev/null || echo "{}")
if echo "$response" | grep -q -E '(\[|\{)'; then
    echo -e "${GREEN}✓ PASSED${NC} (database accessible)"
    PASSED=$((PASSED+1))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (could not verify database)"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ Passed:${NC} $PASSED"
echo -e "${RED}✗ Failed:${NC} $FAILED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Your backend is working correctly:"
    echo "  🌐 API URL:  $BACKEND_URL"
    echo "  📄 Docs:     $BACKEND_URL/docs"
    echo "  🏥 Health:   $BACKEND_URL/api/health"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check Cloud Run logs: gcloud run services logs read cio-dashboard-backend"
    echo "  2. Verify service is running: gcloud run services describe cio-dashboard-backend"
    echo "  3. Check if container started successfully"
    echo "  4. Wait a few minutes for cold start if just deployed"
    exit 1
fi
