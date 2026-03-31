#!/bin/bash
RESPONSE=$(curl -s -X POST https://moneymanager-api-lr63.onrender.com/api/v1.0/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test-otp-debug2@example.com", "password": "password123"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
  echo "Login failed. $RESPONSE"
  exit 1
fi

echo "Token: $TOKEN"

curl -v -X POST https://moneymanager-api-lr63.onrender.com/api/v1.0/incomes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "luong c", "amount": 400000, "date": "2026-03-26", "categoryId": 1, "icon": ""}'
