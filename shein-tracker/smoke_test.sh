#!/bin/bash

# Shein Cart Tracker API Smoke Test
# This script tests the main API endpoints to verify server functionality

set -e

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:5000/api}"
API_URL="$API_BASE_URL/orders"
ADMIN_URL="$API_BASE_URL/admin/login"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
    ((TOTAL_TESTS++))
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if server is running
check_server() {
    print_header "Checking Server Status"

    if curl -s -f "$API_BASE_URL/estimate/config" > /dev/null 2>&1; then
        print_pass "Server is running at $API_BASE_URL"
        return 0
    else
        print_fail "Server is not responding at $API_BASE_URL"
        print_info "Make sure the backend server is running: cd backend && npm run dev"
        return 1
    fi
}

# Test 1: Create Order
test_create_order() {
    print_header "Test 1: Create Order (POST /orders)"

    # Generate unique order ID
    ORDER_ID="ORD-$(date +%s%N | cut -b1-6)"
    print_info "Using Order ID: $ORDER_ID"

    # Prepare request body
    ORDER_DATA=$(cat <<EOF
{
  "orderId": "$ORDER_ID",
  "cartUrl": "https://shein.com/cart/test123",
  "mode": "price",
  "city": "Tripoli",
  "contactMethod": "whatsapp",
  "contactInfo": "+218910000000",
  "originalPrice": 100.00,
  "convertedPrice": 490.00,
  "weightFee": 0.00,
  "deliveryFee": 25.00,
  "totalEstimated": 515.00
}
EOF
)

    print_test "Sending POST request to /orders"

    # Send request and capture response
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$ORDER_DATA" \
        "$API_URL")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    print_info "HTTP Status Code: $HTTP_CODE"
    print_info "Response Body: $BODY"

    # Verify response
    if [ "$HTTP_CODE" = "201" ]; then
        print_pass "Received 201 Created status"

        # Check if response contains success: true
        if echo "$BODY" | grep -q '"success":true'; then
            print_pass "Response contains success: true"

            # Extract and save the database ID for subsequent tests
            DB_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
            if [ -n "$DB_ID" ]; then
                print_pass "Extracted database ID: $DB_ID"
                echo "$DB_ID" > /tmp/smoke_test_db_id.txt
                echo "$ORDER_ID" > /tmp/smoke_test_order_id.txt
            else
                print_fail "Could not extract database ID from response"
            fi
        else
            print_fail "Response does not contain success: true"
        fi
    else
        print_fail "Expected 201 status, got $HTTP_CODE"
    fi
}

# Test 2: Get Order by Database ID
test_get_order_by_id() {
    print_header "Test 2: Get Order by Database ID (GET /orders/{id})"

    if [ ! -f /tmp/smoke_test_db_id.txt ]; then
        print_fail "No database ID available from previous test"
        return
    fi

    DB_ID=$(cat /tmp/smoke_test_db_id.txt)
    print_info "Using Database ID: $DB_ID"

    print_test "Sending GET request to /orders/$DB_ID"

    RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/$DB_ID")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    print_info "HTTP Status Code: $HTTP_CODE"
    print_info "Response Body: $BODY"

    if [ "$HTTP_CODE" = "200" ]; then
        print_pass "Received 200 OK status"

        if echo "$BODY" | grep -q '"success":true'; then
            print_pass "Response contains success: true"

            if echo "$BODY" | grep -q "\"orderId\":\"$ORDER_ID\""; then
                print_pass "Response contains correct order ID"
            else
                print_fail "Response does not contain expected order ID"
            fi
        else
            print_fail "Response does not contain success: true"
        fi
    else
        print_fail "Expected 200 status, got $HTTP_CODE"
    fi
}

# Test 3: Get Order by Order ID
test_get_order_by_order_id() {
    print_header "Test 3: Get Order by Order ID (GET /orders/order-id/{orderId})"

    if [ ! -f /tmp/smoke_test_order_id.txt ]; then
        print_fail "No order ID available from previous test"
        return
    fi

    ORDER_ID=$(cat /tmp/smoke_test_order_id.txt)
    print_info "Using Order ID: $ORDER_ID"

    print_test "Sending GET request to /orders/order-id/$ORDER_ID"

    RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/order-id/$ORDER_ID")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    print_info "HTTP Status Code: $HTTP_CODE"
    print_info "Response Body: $BODY"

    if [ "$HTTP_CODE" = "200" ]; then
        print_pass "Received 200 OK status"

        if echo "$BODY" | grep -q '"success":true'; then
            print_pass "Response contains success: true"
        else
            print_fail "Response does not contain success: true"
        fi
    else
        print_fail "Expected 200 status, got $HTTP_CODE"
    fi
}

# Test 4: Get Estimate Config
test_get_estimate_config() {
    print_header "Test 4: Get Estimate Config (GET /estimate/config)"

    print_test "Sending GET request to /estimate/config"

    RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/estimate/config")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    print_info "HTTP Status Code: $HTTP_CODE"

    if [ "$HTTP_CODE" = "200" ]; then
        print_pass "Received 200 OK status"

        if echo "$BODY" | grep -q '"success":true'; then
            print_pass "Response contains success: true"

            if echo "$BODY" | grep -q '"settings"'; then
                print_pass "Response contains settings"
            fi

            if echo "$BODY" | grep -q '"cities"'; then
                print_pass "Response contains cities"
            fi
        else
            print_fail "Response does not contain success: true"
        fi
    else
        print_fail "Expected 200 status, got $HTTP_CODE"
    fi
}

# Test 5: Admin Login
test_admin_login() {
    print_header "Test 5: Admin Login (POST /admin/login)"

    # Use default admin credentials from .env.example
    ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
    ADMIN_PASSWORD="${ADMIN_PASSWORD:-password}"

    print_info "Using email: $ADMIN_EMAIL"

    LOGIN_DATA=$(cat <<EOF
{
  "email": "$ADMIN_EMAIL",
  "password": "$ADMIN_PASSWORD"
}
EOF
)

    print_test "Sending POST request to /admin/login"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$LOGIN_DATA" \
        "$ADMIN_URL")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    print_info "HTTP Status Code: $HTTP_CODE"

    if [ "$HTTP_CODE" = "200" ]; then
        print_pass "Received 200 OK status"

        if echo "$BODY" | grep -q '"success":true'; then
            print_pass "Response contains success: true"

            # Extract token for potential use in protected endpoint tests
            TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
            if [ -n "$TOKEN" ]; then
                print_pass "Successfully extracted JWT token"
                echo "$TOKEN" > /tmp/smoke_test_token.txt
            else
                print_fail "Could not extract token from response"
            fi
        else
            print_fail "Response does not contain success: true"
        fi
    else
        print_fail "Expected 200 status, got $HTTP_CODE"
        print_info "Note: This test may fail if default admin credentials are not set"
    fi
}

# Test 6: Create Order with Weight Mode
test_create_order_weight_mode() {
    print_header "Test 6: Create Order with Weight Mode (POST /orders)"

    ORDER_ID="ORD-WEIGHT-$(date +%s%N | cut -b1-6)"
    print_info "Using Order ID: $ORDER_ID"

    ORDER_DATA=$(cat <<EOF
{
  "orderId": "$ORDER_ID",
  "mode": "weight",
  "city": "Benghazi",
  "contactMethod": "messenger",
  "originalPrice": 0,
  "convertedPrice": 0,
  "weightFee": 150.00,
  "deliveryFee": 30.00,
  "totalEstimated": 180.00
}
EOF
)

    print_test "Sending POST request with weight mode"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$ORDER_DATA" \
        "$API_URL")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    print_info "HTTP Status Code: $HTTP_CODE"

    if [ "$HTTP_CODE" = "201" ]; then
        print_pass "Received 201 Created status for weight mode"

        if echo "$BODY" | grep -q '"success":true'; then
            print_pass "Response contains success: true"

            if echo "$BODY" | grep -q '"mode":"weight"'; then
                print_pass "Order created with correct mode: weight"
            fi
        else
            print_fail "Response does not contain success: true"
        fi
    else
        print_fail "Expected 201 status, got $HTTP_CODE"
    fi
}

# Test 7: Validation Error - Missing Required Fields
test_validation_error() {
    print_header "Test 7: Validation Error - Missing Required Fields"

    print_test "Sending POST request without required fields"

    ORDER_DATA='{"cartUrl": "https://shein.com/cart/test"}'

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$ORDER_DATA" \
        "$API_URL")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    print_info "HTTP Status Code: $HTTP_CODE"

    if [ "$HTTP_CODE" = "400" ]; then
        print_pass "Received 400 Bad Request status as expected"
    else
        print_fail "Expected 400 status for validation error, got $HTTP_CODE"
    fi
}

# Print summary
print_summary() {
    print_header "Test Summary"

    echo -e "Total Tests:  $TOTAL_TESTS"
    echo -e "${GREEN}Passed:       $PASSED_TESTS${NC}"
    echo -e "${RED}Failed:       $FAILED_TESTS${NC}"

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}All tests passed!${NC}"
        return 0
    else
        echo -e "\n${RED}Some tests failed. Please review the output above.${NC}"
        return 1
    fi
}

# Cleanup
cleanup() {
    print_info "Cleaning up temporary files..."
    rm -f /tmp/smoke_test_db_id.txt
    rm -f /tmp/smoke_test_order_id.txt
    rm -f /tmp/smoke_test_token.txt
}

# Main execution
main() {
    print_header "Shein Cart Tracker API Smoke Test"
    print_info "API Base URL: $API_BASE_URL"
    print_info "Started at: $(date)"

    # Run tests
    check_server || { print_summary; exit 1; }
    test_create_order
    test_get_order_by_id
    test_get_order_by_order_id
    test_get_estimate_config
    test_admin_login
    test_create_order_weight_mode
    test_validation_error

    # Print summary and cleanup
    print_summary
    cleanup

    print_info "Completed at: $(date)"
}

# Run main function
main
