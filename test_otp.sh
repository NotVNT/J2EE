#!/bin/bash
# Register a test user
curl -s -X POST https://moneymanager-api-lr63.onrender.com/api/v1.0/register \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Test User", "email": "test-otp-debug2@example.com", "password": "password123"}' > /dev/null

# Activate profile if needed (we might need to activate to login?)
# The db requires activation token, wait, let's just create a quick test script to hit local backend.
