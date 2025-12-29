@echo off
echo Creating a sample event in Travel Service (Port 8093)...
curl -X POST http://localhost:8093/api/events ^
  -H "Content-Type: application/json" ^
  -d "{\"title\": \"Himalayan Trek\", \"description\": \"A beautiful trek in the mountains\", \"startDate\": \"2025-10-01\", \"endDate\": \"2025-10-15\", \"location\": \"Nepal\", \"price\": 1500, \"status\": \"PUBLISHED\", \"type\": \"TREKKING\"}"

echo.
echo Verifying event creation...
curl http://localhost:8093/api/events/search
echo.
echo Done. If you see the event JSON above, the admin panel should now show data.
