#!/bin/bash
# Test script for POST /groceries/generate
# Usage: ./test-generate.sh

REGION="eu-south-1"
GROCERY_FN="cooking-web-stack-GroceryFunction-GwMj403e8v4v"
TASK_FN="cooking-web-stack-TaskFunction-gWAytI6idlyc"
USER_ID="LOCAL_TEST_ID"

# ============================
# MODIFICA QUESTI PARAMETRI
# ============================
DAYS="[2]"          # giorni della spesa (0=Mon, 6=Sun)
PLAN=3                 # piano (1-4)
UNPLANNED='["insalata di pomodori", "pasta e fagioli"]'         # pasti extra, es: '["Pizza","Insalata"]'
EXTRA=""               # istruzioni extra per l'AI
REPLACE=true           # true = cancella grocery vecchie
# ============================

echo "=== POST /groceries/generate ==="
echo "Shopping days: $DAYS | Plan: $PLAN | Replace: $REPLACE"
echo ""

# 1. Crea il payload (escape quotes in UNPLANNED for JSON body string)
UNPLANNED_ESC=$(echo "$UNPLANNED" | sed 's/"/\\"/g')

cat > /tmp/gen-event.json << EOF
{
  "resource": "/groceries/generate",
  "path": "/groceries/generate",
  "httpMethod": "POST",
  "headers": {},
  "body": "{\"days\":$DAYS,\"plan\":$PLAN,\"unplanned\":$UNPLANNED_ESC,\"extra\":\"$EXTRA\",\"replace\":$REPLACE}",
  "requestContext": {"authorizer": {"claims": {"sub": "$USER_ID"}}},
  "pathParameters": null,
  "queryStringParameters": null
}
EOF

# 2. Invoca la GroceryFunction
aws lambda invoke \
    --function-name "$GROCERY_FN" \
    --invocation-type "RequestResponse" \
    --payload fileb:///tmp/gen-event.json \
    --region "$REGION" \
    /tmp/gen-output.json > /dev/null 2>&1

RESPONSE=$(cat /tmp/gen-output.json)
echo "Response: $RESPONSE"

# 3. Estrai il taskID
TASK_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; r=json.load(sys.stdin); print(json.loads(r['body'])['taskID'])" 2>/dev/null)

if [ -z "$TASK_ID" ]; then
    echo "ERRORE: nessun taskID nella risposta"
    exit 1
fi

echo "Task ID: $TASK_ID"
echo ""
echo "=== Polling GET /tasks/$TASK_ID ==="

# 4. Polling del task
while true; do
    cat > /tmp/task-event.json << EOF
{
  "resource": "/tasks/{taskID}",
  "path": "/tasks/$TASK_ID",
  "httpMethod": "GET",
  "headers": {},
  "body": null,
  "requestContext": {"authorizer": {"claims": {"sub": "$USER_ID"}}},
  "pathParameters": {"taskID": "$TASK_ID"},
  "queryStringParameters": null
}
EOF

    aws lambda invoke \
        --function-name "$TASK_FN" \
        --invocation-type "RequestResponse" \
        --payload fileb:///tmp/task-event.json \
        --region "$REGION" \
        /tmp/task-output.json > /dev/null 2>&1

    STATUS=$(cat /tmp/task-output.json | python3 -c "import sys,json; r=json.load(sys.stdin); print(json.loads(r['body'])['status'])" 2>/dev/null)

    if [ "$STATUS" = "1" ]; then
        echo "Status: COMPLETED"
        break
    elif [ "$STATUS" = "-1" ]; then
        echo "Status: FAILED"
        cat /tmp/task-output.json
        exit 1
    else
        echo "Status: RUNNING... (polling in 3s)"
        sleep 3
    fi
done

# 5. Mostra le grocery generate
echo ""
echo "=== Grocery generate ==="
aws dynamodb query \
    --table-name CookingAppData \
    --key-condition-expression "PK = :pk AND begins_with(SK, :sk)" \
    --expression-attribute-values "{\":pk\":{\"S\":\"USER#$USER_ID\"},\":sk\":{\"S\":\"GROCERY#\"}}" \
    --region "$REGION" \
    --query "Items[].{description:description.S,weekDay:weekDay.N,checked:checked.BOOL}" \
    --output table
