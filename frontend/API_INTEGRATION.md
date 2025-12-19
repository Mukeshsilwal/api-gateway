# API Integration Documentation

Complete reference for backend API integration in the Bus Ticket Frontend.

## API Configuration

Base configuration is in `src/config/api.js`:

```javascript
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL,
  ENDPOINTS: {
    // ... endpoint definitions
  }
};
```

## API Service

The `ApiService` (src/services/api.service.js`) provides centralized HTTP request handling.

### Features

- **Automatic Authentication**: Adds JWT token to all requests
- **Retry Logic**: Retries failed requests (network errors, 5xx)
- **Timeout Handling**: 30-second request timeout
- **Error Formatting**: Consistent error structure
- **Security**: Removes sensitive data from logs in production

### Usage Examples

```javascript
import ApiService from '../services/api.service';
import API_CONFIG from '../config/api';

// GET request
const response = await ApiService.get(API_CONFIG.ENDPOINTS.GET_BUSES);
const data = await response.json();

// POST request
const payload = { name: 'John', email: 'john@example.com' };
const response = await ApiService.post(API_CONFIG.ENDPOINTS.CREATE_BOOKING, payload);

// PUT request
const updateData = { status: 'confirmed' };
const response = await ApiService.put(`/booking/${id}`, updateData);

// DELETE request
const response = await ApiService.delete(`/booking/${id}`);
```

## Authentication Endpoints

### Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "role": "ROLE_USER",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

### Register

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "phone": "+977 9800000000"
}
```

**Response:**
```json
{
  "code": 201,
  "message": "Registration successful",
  "data": {
    "userId": 1
  }
}
```

## Booking Endpoints

### Search Buses

**Endpoint:** `POST /bus/search`

**Request:**
```json
{
  "source": "Kathmandu",
  "destination": "Pokhara",
  "date": "2025-12-01"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Buses found",
  "data": [
    {
      "id": 1,
      "busName": "Greenline Travels",
      "route12": {
        "sourceBusStop": { "name": "Kathmandu" },
        "destinationBusStop": { "name": "Pokhara" }
      },
      "departureDateTime": "2025-12-01T08:00:00",
      "seats": [
        {
          "id": 1,
          "seatNumber": "A1",
          "price": 1500,
          "reserved": false,
          "status": "AVAILABLE"
        }
      ]
    }
  ]
}
```

### Create Booking

**Endpoint:** `POST /booking/post`

**Request:**
```json
{
  "bookingId": 1,
  "fullName": "John Doe",
  "userId": 1,
  "email": "user@example.com",
  "seatIds": [1, 2]
}
```

**Response:**
```json
{
  "code": 201,
  "message": "Booking created successfully",
  "data": {
    "bookingId": "BK12345",
    "tickets": [
      {
        "ticketId": "TK001",
        "seatNumber": "A1"
      },
      {
        "ticketId": "TK002",
        "seatNumber": "A2"
      }
    ]
  }
}
```

## Payment Endpoints

### Initiate Payment

**Endpoint:** `POST /payment/initiate/{provider}`

Providers: `esewa`, `khalti`, `imepay`

**Request (eSewa):**
```json
{
  "customerId": 1,
  "amount": 3000,
  "metadata": {
    "productId": "BUS-TICKET-2025",
    "tid": "1234567890"
  },
  "successUrl": "https://yourdomain.com/ticket-confirm",
  "failureUrl": "https://yourdomain.com/booking-failed",
  "customerEmail": "user@example.com",
  "customerName": "John Doe"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Payment initiated",
  "data": {
    "gatewayUrl": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    "params": {
      "amount": "3000",
      "tax_amount": "0",
      "total_amount": "3000",
      "transaction_uuid": "1234567890",
      "product_code": "EPAYTEST",
      "product_service_charge": "0",
      "product_delivery_charge": "0",
      "success_url": "https://yourdomain.com/ticket-confirm",
      "failure_url": "https://yourdomain.com/booking-failed",
      "signed_field_names": "total_amount,transaction_uuid,product_code",
      "signature": "abc123..."
    }
  }
}
```

**Request (Khalti):**
```json
{
  "public_key": "test_public_key_xxxxx",
  "mobile": "9800000000",
  "transaction_pin": "",
  "product_identity": "1234567890",
  "product_name": "Bus Ticket Booking",
  "amount": 300000,
  "return_url": "https://yourdomain.com/ticket-confirm",
  "website_url": "https://yourdomain.com"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Payment initialized",
  "data": {
    "payment_url": "https://khalti.com/payment/confirm/?pidx=xxxxx"
  }
}
```

### Verify Payment

**Endpoint:** `GET /payment/verify?pidx={pidx}&provider={provider}`

**Response:**
```json
{
  "code": 200,
  "message": "Payment verified",
  "data": {
    "status": "COMPLETED",
    "amount": 3000,
    "transactionId": "TXN123456"
  }
}
```

## Admin Endpoints

### Get All Bookings

**Endpoint:** `GET /booking/get`

**Headers:** Authorization: Bearer {admin_token}

**Response:**
```json
{
  "code": 200,
  "message": "Bookings retrieved",
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "email": "user@example.com",
      "status": "CONFIRMED",
      "createdAt": "2025-11-29T10:00:00"
    }
  ]
}
```

### Create Bus

**Endpoint:** `POST /admin/routeBus`

**Headers:** Authorization: Bearer {admin_token}

**Request:**
```json
{
  "busName": "Greenline Travels",
  "busNumber": "BA 1 PA 1234",
  "routeId": 1,
  "departureDateTime": "2025-12-01T08:00:00",
  "totalSeats": 40
}
```

## Error Handling

### Error Response Format

```json
{
  "code": 400,
  "message": "Validation error",
  "errors": {
    "email": "Invalid email format",
    "phone": "Phone number is required"
  }
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate entry)
- **500**: Internal Server Error

### Frontend Error Handling

```javascript
try {
  const response = await ApiService.post(endpoint, data);
  
  if (!response.ok) {
    const error = await response.json();
    toast.error(error.message || 'Request failed');
    return;
  }
  
  const data = await response.json();
  // Handle success
} catch (error) {
  if (error.isTimeout) {
    toast.error('Request timeout. Check your connection.');
  } else {
    toast.error('An error occurred. Please try again.');
  }
  Logger.error('API Error:', error);
}
```

## Request/Response Interceptors

### Request Interceptor (Automatic)

All requests automatically include:
- **Authorization Header**: `Bearer {token}` (if logged in)
- **Content-Type**: `application/json` (unless FormData)
- **Timeout**: 30 seconds
- **Retry Logic**: 2 retries for network/5xx errors

### Response Interceptor (Automatic)

All responses are processed to:
- Parse JSON automatically
- Extract error messages
- Log errors (development only)
- Handle timeouts

## CORS Configuration

Backend must allow requests from:
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

Required CORS headers:
```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## Rate Limiting

The API implements rate limiting:
- **Anonymous requests**: 100 requests/minute
- **Authenticated requests**: 1000 requests/minute

Frontend handles rate limiting with:
- Retry logic with exponential backoff
- User-friendly error messages
- Request queuing

## Websocket Integration (Future)

For real-time features (planned):

```javascript
const ws = new WebSocket(`wss://api.yourdomain.com/ws`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

## Testing API Integration

### Using the API Service

```javascript
// In a test file
import ApiService from '../services/api.service';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'test' })
  })
);

// Test
const response = await ApiService.get('/test');
expect(fetch).toHaveBeenCalledWith(
  'http://localhost:8080/test',
  expect.objectContaining({
    method: 'GET',
    headers: expect.objectContaining({
      'Content-Type': 'application/json'
    })
  })
);
```

## Best Practices

1. **Always use ApiService**: Don't use fetch directly
2. **Handle errors**: Use try-catch blocks
3. **Validate inputs**: Before making API calls
4. **Show loading states**: During API calls
5. **Log errors**: Use Logger in development
6. **Sanitize data**: Use validators before sending
7. **Check authentication**: Before protected calls

## Support

For API integration issues:
1. Check network tab in browser devtools
2. Verify backend is running and accessible
3. Check API endpoint configuration
4. Review authentication tokens
5. Contact backend team

---

**Last Updated:** November 2025
