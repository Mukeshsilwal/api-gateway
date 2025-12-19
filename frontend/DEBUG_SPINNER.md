# Quick Debug Guide

## Issue: Spinner stuck on "Creating your booking"

### Check Browser Console

Open browser DevTools (F12) and look for errors. You should see one of:

1. **404 Not Found** - Wrong endpoint
2. **400 Bad Request** - Invalid payload
3. **500 Server Error** - Backend issue
4. **Network Error** - Backend not running

### Expected Console Logs

If working correctly, you should see:
```
🚀 initiatePayment called with: {type: "hotel", ...}
📞 Calling /bookings/complete API...
✅ Booking complete response: {bookingId: "...", amount: 5000}
✅ Got bookingId: BK-123 amount: 5000
📞 Calling /payments/initiate/esewa API...
✅ Payment initiation response: {htmlForm: "...", transactionId: "..."}
✅ Stored in sessionStorage, navigating to /payment/redirect
```

### Common Issues

**1. Wrong Endpoint**
- Fixed: Changed `BOOKING_COMPLETE` to `BOOKING_COMPLETE_HOTEL`

**2. Backend Not Running**
- Check: `http://localhost:8080/api/bff/v1/bookings/complete`
- Should return 405 Method Not Allowed (not 404)

**3. Invalid Payload**
- Check console for what's being sent
- Compare with backend DTO requirements

**4. CORS Error**
- Backend needs to allow `http://localhost:3000`

### Manual Test

Test the endpoint directly:
```bash
curl -X POST http://localhost:8080/api/bff/v1/bookings/complete \
  -H "Content-Type: application/json" \
  -d '{"type":"hotel","hotelId":"H123",...}'
```

Should return:
```json
{
  "bookingId": "BK-123",
  "amount": 5000
}
```
