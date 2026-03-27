#!/bin/bash
# Test script for Plans API
# Usage: ./test-plans.sh

REGION="eu-south-1"
PLAN_FN="cooking-web-stack-PlanFunction-st6DlkUdO0FF"
MEAL_FN="cooking-web-stack-MealFunction-g6nZsVnsqmcD"
USER_ID="LOCAL_TEST_ID"

# ============================
# HELPER: invoke lambda
# ============================
invoke() {
    local payload="$1"
    echo "$payload" > /tmp/plan-event.json
    aws lambda invoke \
        --function-name "$2" \
        --invocation-type "RequestResponse" \
        --payload fileb:///tmp/plan-event.json \
        --region "$REGION" \
        /tmp/plan-out.json > /dev/null 2>&1
    cat /tmp/plan-out.json
}

# ============================
# 1. GET /plans (stato iniziale)
# ============================
echo "=== 1. GET /plans (stato iniziale) ==="
RESULT=$(invoke '{
  "resource": "/plans",
  "httpMethod": "GET",
  "headers": {},
  "body": null,
  "requestContext": {"authorizer": {"claims": {"sub": "'"$USER_ID"'"}}},
  "pathParameters": null
}' "$PLAN_FN")

echo "$RESULT" | python3 -c "import sys,json; r=json.load(sys.stdin); print(json.dumps(json.loads(r['body']), indent=2))" 2>/dev/null
echo ""

# ============================
# 2. Crea meal nel plan 1
# ============================
echo "=== 2. Creazione meal nel plan 1 ==="
RESULT=$(invoke '{
  "resource": "/meals",
  "httpMethod": "POST",
  "headers": {},
  "body": "{\"description\":\"Pasta al pomodoro\",\"icon\":\"🍝\",\"weekDay\":0,\"plan\":1}",
  "requestContext": {"authorizer": {"claims": {"sub": "'"$USER_ID"'"}}}
}' "$MEAL_FN")
MEAL1_ID=$(echo "$RESULT" | python3 -c "import sys,json; r=json.load(sys.stdin); print(json.loads(r['body'])['itemID'])" 2>/dev/null)
echo "Meal 1 creato: $MEAL1_ID"

RESULT=$(invoke '{
  "resource": "/meals",
  "httpMethod": "POST",
  "headers": {},
  "body": "{\"description\":\"Insalata mista\",\"icon\":\"🥗\",\"weekDay\":2,\"plan\":2}",
  "requestContext": {"authorizer": {"claims": {"sub": "'"$USER_ID"'"}}}
}' "$MEAL_FN")
MEAL2_ID=$(echo "$RESULT" | python3 -c "import sys,json; r=json.load(sys.stdin); print(json.loads(r['body'])['itemID'])" 2>/dev/null)
echo "Meal 2 creato (plan 2): $MEAL2_ID"
echo ""

# ============================
# 3. GET /plans (con dati)
# ============================
echo "=== 3. GET /plans (con dati) ==="
RESULT=$(invoke '{
  "resource": "/plans",
  "httpMethod": "GET",
  "headers": {},
  "body": null,
  "requestContext": {"authorizer": {"claims": {"sub": "'"$USER_ID"'"}}},
  "pathParameters": null
}' "$PLAN_FN")
echo "$RESULT" | python3 -c "import sys,json; r=json.load(sys.stdin); print(json.dumps(json.loads(r['body']), indent=2))" 2>/dev/null
echo ""

# ============================
# 4. PATCH /plans/current → 2
# ============================
echo "=== 4. PATCH /plans/current → 2 ==="
RESULT=$(invoke '{
  "resource": "/plans/current",
  "httpMethod": "PATCH",
  "headers": {},
  "body": "{\"current\":2}",
  "requestContext": {"authorizer": {"claims": {"sub": "'"$USER_ID"'"}}}
}' "$PLAN_FN")
STATUS=$(echo "$RESULT" | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['statusCode'])" 2>/dev/null)
echo "Status: $STATUS"
echo ""

# ============================
# 5. GET /plans (verifica current = 2)
# ============================
echo "=== 5. GET /plans (current dovrebbe essere 2) ==="
RESULT=$(invoke '{
  "resource": "/plans",
  "httpMethod": "GET",
  "headers": {},
  "body": null,
  "requestContext": {"authorizer": {"claims": {"sub": "'"$USER_ID"'"}}},
  "pathParameters": null
}' "$PLAN_FN")
echo "$RESULT" | python3 -c "import sys,json; r=json.load(sys.stdin); print(json.dumps(json.loads(r['body']), indent=2))" 2>/dev/null
echo ""

# ============================
# 6. PATCH /plans/current → 3 (vuoto, deve fallire 404)
# ============================
echo "=== 6. PATCH /plans/current → 3 (vuoto, atteso 404) ==="
RESULT=$(invoke '{
  "resource": "/plans/current",
  "httpMethod": "PATCH",
  "headers": {},
  "body": "{\"current\":3}",
  "requestContext": {"authorizer": {"claims": {"sub": "'"$USER_ID"'"}}}
}' "$PLAN_FN")
STATUS=$(echo "$RESULT" | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['statusCode'])" 2>/dev/null)
echo "Status: $STATUS (atteso: 404)"
echo ""

# ============================
# 7. DELETE /plans/2
# ============================
echo "=== 7. DELETE /plans/2 ==="
RESULT=$(invoke '{
  "resource": "/plans/{planNR}",
  "httpMethod": "DELETE",
  "headers": {},
  "body": null,
  "pathParameters": {"planNR": "2"},
  "requestContext": {"authorizer": {"claims": {"sub": "'"$USER_ID"'"}}}
}' "$PLAN_FN")
STATUS=$(echo "$RESULT" | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['statusCode'])" 2>/dev/null)
echo "Status: $STATUS (atteso: 204)"
echo ""

# ============================
# 8. GET /plans (current auto-switched)
# ============================
echo "=== 8. GET /plans (current dovrebbe auto-switch a 1) ==="
RESULT=$(invoke '{
  "resource": "/plans",
  "httpMethod": "GET",
  "headers": {},
  "body": null,
  "requestContext": {"authorizer": {"claims": {"sub": "'"$USER_ID"'"}}},
  "pathParameters": null
}' "$PLAN_FN")
echo "$RESULT" | python3 -c "import sys,json; r=json.load(sys.stdin); print(json.dumps(json.loads(r['body']), indent=2))" 2>/dev/null
echo ""

# ============================
# CLEANUP: cancella meal rimasto
# ============================
echo "=== CLEANUP ==="
if [ -n "$MEAL1_ID" ]; then
    invoke '{
      "resource": "/meals/{itemID}",
      "httpMethod": "DELETE",
      "headers": {},
      "body": null,
      "pathParameters": {"itemID": "'"$MEAL1_ID"'"},
      "requestContext": {"authorizer": {"claims": {"sub": "'"$USER_ID"'"}}}
    }' "$MEAL_FN" > /dev/null
    echo "Meal $MEAL1_ID eliminato"
fi
echo "Done!"
