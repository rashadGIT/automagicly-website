#!/bin/bash

echo "🔍 Monitoring for private events..."
echo "=================================="
echo ""
echo "Instructions:"
echo "1. Keep this script running"
echo "2. Go to Google Calendar in your browser"
echo "3. Edit an event and set visibility to 'Private'"
echo "4. Save the event"
echo "5. Watch this script detect the change!"
echo ""
echo "Press Ctrl+C to stop"
echo "=================================="
echo ""

LAST_COUNT=0

while true; do
    # Fetch current private event count
    RESPONSE=$(curl -s http://localhost:3000/api/calendar/check-private 2>/dev/null)

    if [ $? -eq 0 ]; then
        PRIVATE_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['privateEventStats']['private'])" 2>/dev/null)
        TOTAL_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['privateEventStats']['total'])" 2>/dev/null)
        PUBLIC_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['privateEventStats']['public'])" 2>/dev/null)
        DEFAULT_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['privateEventStats']['default'])" 2>/dev/null)

        TIMESTAMP=$(date '+%H:%M:%S')

        # Check if count changed
        if [ "$PRIVATE_COUNT" != "$LAST_COUNT" ]; then
            if [ "$PRIVATE_COUNT" -gt "$LAST_COUNT" ]; then
                echo ""
                echo "🎉 ✅ PRIVATE EVENT DETECTED! 🎉"
                echo "=================================="
            fi
            LAST_COUNT=$PRIVATE_COUNT
        fi

        # Clear line and print status
        echo -ne "\r[$TIMESTAMP] Total: $TOTAL_COUNT | 🔒 Private: $PRIVATE_COUNT | 🌍 Public: $PUBLIC_COUNT | 📋 Default: $DEFAULT_COUNT"

        if [ "$PRIVATE_COUNT" -gt 0 ]; then
            echo -ne " ✅ SUCCESS!"
        fi
    else
        echo -ne "\r[ERROR] Could not connect to API"
    fi

    sleep 3
done
