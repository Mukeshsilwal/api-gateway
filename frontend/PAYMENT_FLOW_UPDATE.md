# Final Payment Flow - HTML Form Injection

## Actual Backend Response

The backend returns an HTML form that needs to be injected and auto-submitted:

```json
{
  "statusCode": 200,
  "message": "Payment initiated",
  "data": {
    "paymentResponse": {
      "status": "INITIATED",
      "data": {
        "htmlForm": "<html><body onload=\"document.forms[0].submit()\">...</body></html>",
        "transactionId": "TXN-1765732276621-ACBDA6B8",
        "totalAmount": 5100.0,
        "amount": 5000.0
      }
    }
  }
}
```

## Implementation

### 1. Extract HTML Form
`bookingApi.js` extracts the `htmlForm` from the nested response:

```javascript
const htmlForm = data.data?.paymentResponse?.data?.htmlForm;
const transactionId = data.data?.paymentResponse?.data?.transactionId;
```

### 2. Store in SessionStorage
`useEsewaPayment.js` stores the form:

```javascript
setBookingContext({
  bookingId,
  amount,
  htmlForm,
  transactionId,
  bookingData
});
```

### 3. Inject and Auto-Submit
`PaymentRedirect.jsx` injects the HTML form:

```javascript
const container = document.createElement('div');
container.innerHTML = htmlForm;
document.body.appendChild(container);
// Form auto-submits due to onload attribute
```

## Flow Summary

1. ✅ Call `/bookings/complete` → get bookingId, amount
2. ✅ Call `/payments/initiate/esewa` → get htmlForm
3. ✅ Store htmlForm in sessionStorage
4. ✅ Navigate to `/payment/redirect`
5. ✅ Inject htmlForm into page
6. ✅ Form auto-submits (GET request to eSewa)
7. ✅ User completes payment on eSewa
8. ✅ eSewa redirects to success/failure URL
9. ✅ Verify payment
10. ✅ Show confirmation

## Key Points

- ✅ Backend controls all payment parameters
- ✅ Frontend just injects and displays the form
- ✅ Form uses GET method (as per eSewa requirement)
- ✅ Auto-submit via `onload` attribute
- ✅ No hardcoded URLs or merchant codes
