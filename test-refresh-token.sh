#!/bin/bash

# Refresh Token Testing Script
# This script tests the JWT refresh token functionality

BASE_URL="http://localhost:9090"

echo "=========================================="
echo "JWT Refresh Token Testing"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Login
echo -e "${YELLOW}Test 1: Login${NC}"
echo "POST $BASE_URL/api/v1/users/login"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin",
    "pumpCode": "PUMP001"
  }')

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract tokens
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Login failed - no access token received${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Login successful${NC}"
  echo "Access Token: ${ACCESS_TOKEN:0:50}..."
  echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
fi

echo ""
echo "=========================================="

# Test 2: Use Access Token
echo -e "${YELLOW}Test 2: Use Access Token for API Call${NC}"
echo "GET $BASE_URL/api/v1/users/me"

ME_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $ME_RESPONSE"

if echo "$ME_RESPONSE" | grep -q "userId"; then
  echo -e "${GREEN}✅ Access token works for API calls${NC}"
else
  echo -e "${RED}❌ Access token failed${NC}"
fi

echo ""
echo "=========================================="

# Test 3: Try to use Refresh Token for API call (should fail)
echo -e "${YELLOW}Test 3: Try Refresh Token for API Call (should fail)${NC}"
echo "GET $BASE_URL/api/v1/users/me"

REFRESH_API_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/users/me" \
  -H "Authorization: Bearer $REFRESH_TOKEN")

echo "Response: $REFRESH_API_RESPONSE"

if echo "$REFRESH_API_RESPONSE" | grep -q "userId"; then
  echo -e "${RED}❌ SECURITY ISSUE: Refresh token should not work for API calls!${NC}"
else
  echo -e "${GREEN}✅ Refresh token correctly rejected for API calls${NC}"
fi

echo ""
echo "=========================================="

# Test 4: Refresh the token
echo -e "${YELLOW}Test 4: Refresh Token${NC}"
echo "POST $BASE_URL/api/v1/users/refresh"

REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/users/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "Response: $REFRESH_RESPONSE"
echo ""

# Extract new tokens
NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
NEW_REFRESH_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$NEW_ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Token refresh failed${NC}"
else
  echo -e "${GREEN}✅ Token refresh successful${NC}"
  echo "New Access Token: ${NEW_ACCESS_TOKEN:0:50}..."
  echo "New Refresh Token: ${NEW_REFRESH_TOKEN:0:50}..."
fi

echo ""
echo "=========================================="

# Test 5: Use New Access Token
echo -e "${YELLOW}Test 5: Use New Access Token${NC}"
echo "GET $BASE_URL/api/v1/users/me"

NEW_ME_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/users/me" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

echo "Response: $NEW_ME_RESPONSE"

if echo "$NEW_ME_RESPONSE" | grep -q "userId"; then
  echo -e "${GREEN}✅ New access token works${NC}"
else
  echo -e "${RED}❌ New access token failed${NC}"
fi

echo ""
echo "=========================================="

# Test 6: Try invalid refresh token
echo -e "${YELLOW}Test 6: Invalid Refresh Token (should fail)${NC}"
echo "POST $BASE_URL/api/v1/users/refresh"

INVALID_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/users/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "invalid.token.here"
  }')

echo "Response: $INVALID_RESPONSE"

if echo "$INVALID_RESPONSE" | grep -q "error\|INVALID"; then
  echo -e "${GREEN}✅ Invalid token correctly rejected${NC}"
else
  echo -e "${RED}❌ Invalid token should be rejected${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Testing Complete!${NC}"
echo "=========================================="
