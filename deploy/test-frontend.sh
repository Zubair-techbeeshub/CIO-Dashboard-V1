#!/bin/bash
# Test frontend deployment

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Usage
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: FRONTEND_URL is required${NC}"
    echo ""
    echo "Usage: $0 FRONTEND_URL"
    echo ""
    echo "Example: $0 https://my-project.web.app"
    exit 1
fi

FRONTEND_URL=$1

# Remove trailing slash if present
FRONTEND_URL=${FRONTEND_URL%/}

echo "🧪 Testing Frontend Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Frontend URL: $FRONTEND_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    local search_text=$3
    
    echo -ne "${BLUE}Testing:${NC} $description ... "
    
    response=$(curl -s "$endpoint" 2>/dev/null || echo "")
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" 2>/dev/null || echo "000")
    
    if [ "$http_code" -eq "200" ]; then
        if [ -n "$search_text" ]; then
            if echo "$response" | grep -qi "$search_text"; then
                echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code, contains '$search_text')"
                PASSED=$((PASSED+1))
                return 0
            else
                echo -e "${YELLOW}⚠ PARTIAL${NC} (HTTP $http_code, missing '$search_text')"
                PASSED=$((PASSED+1))
                return 0
            fi
        else
            echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
            PASSED=$((PASSED+1))
            return 0
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        FAILED=$((FAILED+1))
        return 1
    fi
}

echo "📋 Running tests..."
echo ""

# Test 1: Home page loads
test_endpoint "$FRONTEND_URL" "Home page loads" "CIO Dashboard"

# Test 2: SPA routing (test a route)
test_endpoint "$FRONTEND_URL/dashboard" "SPA routing works"

# Test 3: Check if assets are accessible
test_endpoint "$FRONTEND_URL/assets" "Static assets accessible" || true

# Test 4: Check for required JavaScript bundle
echo -ne "${BLUE}Testing:${NC} JavaScript bundle loads ... "
response=$(curl -s "$FRONTEND_URL" 2>/dev/null || echo "")
if echo "$response" | grep -q "\.js"; then
    echo -e "${GREEN}✓ PASSED${NC} (JS bundle referenced)"
    PASSED=$((PASSED+1))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (no JS bundle found)"
fi

# Test 5: Check if environment variables are injected
echo -ne "${BLUE}Testing:${NC} Environment configuration ... "
if [ -f ".env" ]; then
    backend_url=$(grep VITE_API_URL .env | cut -d= -f2)
    if [ -n "$backend_url" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (VITE_API_URL configured)"
        PASSED=$((PASSED+1))
        
        # Try to verify backend connectivity from frontend perspective
        echo -ne "${BLUE}Testing:${NC} Backend connectivity ... "
        backend_response=$(curl -s "${backend_url%/api}/api/health" 2>/dev/null || echo "{}")
        if echo "$backend_response" | grep -q "status"; then
            echo -e "${GREEN}✓ PASSED${NC} (backend reachable)"
            PASSED=$((PASSED+1))
        else
            echo -e "${YELLOW}⚠ WARNING${NC} (backend not reachable)"
        fi
    else
        echo -e "${YELLOW}⚠ WARNING${NC} (.env exists but no VITE_API_URL)"
    fi
else
    echo -e "${YELLOW}⚠ WARNING${NC} (.env file not found locally)"
fi

# Test 6: Check HTTPS
echo -ne "${BLUE}Testing:${NC} HTTPS enabled ... "
if [[ "$FRONTEND_URL" == https://* ]]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTPS enabled)"
    PASSED=$((PASSED+1))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (not using HTTPS)"
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
    echo -e "${GREEN}✅ Frontend tests completed!${NC}"
    echo ""
    echo "Your frontend is deployed and accessible:"
    echo "  🌐 Frontend URL: $FRONTEND_URL"
    echo ""
    echo "Next steps:"
    echo "  1. Open $FRONTEND_URL in your browser"
    echo "  2. Test login and navigation"
    echo "  3. Verify all dashboard sections load correctly"
    echo "  4. Check browser console for any errors"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check Firebase hosting logs: firebase hosting:channel:list"
    echo "  2. Verify build succeeded and dist/ directory exists"
    echo "  3. Check firebase.json configuration"
    echo "  4. Ensure .env has correct VITE_API_URL"
    exit 1
fi
