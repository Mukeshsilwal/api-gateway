# Trip Service API Documentation

Base URL: `http://localhost:8087/trip-service`

## Authentication

All endpoints (except actuator and swagger) require JWT authentication.

**Header**: `Authorization: Bearer <JWT_TOKEN>`

---

## Trip Management Endpoints

### 1. Create Trip

**POST** `/api/trips`

Creates a new trip for the authenticated user.

**Request Body**:
```json
{
  "tripName": "Weekend Pokhara Trip",
  "tripType": "DOMESTIC",
  "touristType": "NEPALI",
  "startDate": "2025-12-28",
  "endDate": "2025-12-30",
  "budget": 15000.00,
  "description": "A relaxing weekend getaway to Pokhara"
}
```

**Response** (201 Created):
```json
{
  "tripId": 1,
  "userId": 123,
  "tripName": "Weekend Pokhara Trip",
  "tripType": "DOMESTIC",
  "touristType": "NEPALI",
  "status": "PLANNED",
  "startDate": "2025-12-28",
  "endDate": "2025-12-30",
  "budget": 15000.00,
  "actualCost": 0.00,
  "description": "A relaxing weekend getaway to Pokhara",
  "durationDays": 3,
  "budgetRemaining": 15000.00,
  "createdAt": "2025-12-24T16:00:00",
  "updatedAt": "2025-12-24T16:00:00"
}
```

---

### 2. Get Trip by ID

**GET** `/api/trips/{tripId}`

Retrieves basic trip information.

**Response** (200 OK):
```json
{
  "tripId": 1,
  "userId": 123,
  "tripName": "Weekend Pokhara Trip",
  "status": "PLANNED",
  ...
}
```

---

### 3. Get Trip with Full Details

**GET** `/api/trips/{tripId}/details`

Retrieves trip with checkpoints, bookings, and participants.

**Response** (200 OK):
```json
{
  "tripId": 1,
  "tripName": "Weekend Pokhara Trip",
  "checkpoints": [
    {
      "checkpointId": 1,
      "checkpointType": "DEPARTURE",
      "locationName": "Kathmandu Bus Park",
      "scheduledTime": "2025-12-28T07:00:00",
      "status": "PENDING",
      "isUpcoming": true
    }
  ],
  "bookings": [
    {
      "id": 1,
      "bookingType": "BUS",
      "bookingId": 456,
      "bookingReference": "BUS-2025-001",
      "amount": 800.00,
      "status": "CONFIRMED"
    }
  ],
  "participants": [],
  "completedCheckpoints": 0,
  "totalCheckpoints": 4,
  "progressPercentage": 0
}
```

---

### 4. Get My Trips

**GET** `/api/trips/my-trips`

Retrieves all trips for the authenticated user.

**Response** (200 OK):
```json
[
  {
    "tripId": 1,
    "tripName": "Weekend Pokhara Trip",
    "status": "PLANNED",
    ...
  },
  {
    "tripId": 2,
    "tripName": "Everest Base Camp Trek",
    "status": "IN_PROGRESS",
    ...
  }
]
```

---

### 5. Get My Trips by Status

**GET** `/api/trips/my-trips/status/{status}`

Filters user trips by status.

**Path Parameters**:
- `status`: PLANNED | IN_PROGRESS | COMPLETED | CANCELLED

**Response** (200 OK):
```json
[
  {
    "tripId": 1,
    "tripName": "Weekend Pokhara Trip",
    "status": "PLANNED",
    ...
  }
]
```

---

### 6. Get User Trips

**GET** `/api/trips/user/{userId}`

Retrieves all trips for a specific user (admin endpoint).

**Response** (200 OK): Same as Get My Trips

---

### 7. Get Active Trips

**GET** `/api/trips/active`

Retrieves all currently active trips (admin endpoint).

**Response** (200 OK):
```json
[
  {
    "tripId": 2,
    "tripName": "Everest Base Camp Trek",
    "status": "IN_PROGRESS",
    "startDate": "2025-12-20",
    "endDate": "2025-12-30",
    ...
  }
]
```

---

### 8. Update Trip

**PUT** `/api/trips/{tripId}`

Updates trip details (partial update).

**Request Body**:
```json
{
  "tripName": "Extended Pokhara Trip",
  "endDate": "2025-12-31",
  "budget": 20000.00,
  "description": "Extended stay with additional activities"
}
```

**Response** (200 OK): Updated trip object

---

### 9. Update Trip Status

**PUT** `/api/trips/{tripId}/status?status={status}`

Updates the trip status.

**Query Parameters**:
- `status`: PLANNED | IN_PROGRESS | COMPLETED | CANCELLED

**Response** (200 OK): Updated trip object

**Events Published**:
- `trip.started` when status changes to IN_PROGRESS
- `trip.completed` when status changes to COMPLETED
- `trip.cancelled` when status changes to CANCELLED

---

### 10. Cancel Trip

**DELETE** `/api/trips/{tripId}`

Cancels a trip (soft delete - sets status to CANCELLED).

**Response** (204 No Content)

---

## Validation Rules

### Create Trip Request

- **tripName**: Required, 3-255 characters
- **tripType**: Required (DOMESTIC | INTERNATIONAL)
- **touristType**: Required (NEPALI | INTERNATIONAL)
- **startDate**: Required, must be today or future date
- **endDate**: Required, must be after or equal to startDate
- **budget**: Optional, must be > 0 if provided
- **description**: Optional, max 2000 characters

### Update Trip Request

All fields are optional (partial update):
- **tripName**: 3-255 characters
- **status**: PLANNED | IN_PROGRESS | COMPLETED | CANCELLED
- **startDate**: Any valid date
- **endDate**: Any valid date
- **budget**: Must be > 0
- **description**: Max 2000 characters

---

## Error Responses

### Validation Error (400 Bad Request)

```json
{
  "timestamp": "2025-12-24T16:00:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Invalid request parameters",
  "validationErrors": {
    "tripName": "Trip name must be between 3 and 255 characters",
    "startDate": "Start date must be today or in the future"
  }
}
```

### Not Found (404)

```json
{
  "timestamp": "2025-12-24T16:00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Trip not found with ID: 999"
}
```

---

## Kafka Events

The service publishes events to the `trip-events` topic:

### Event Schema

```json
{
  "eventType": "trip.created | trip.updated | trip.started | trip.completed | trip.cancelled",
  "tripId": 1,
  "userId": 123,
  "tripName": "Weekend Pokhara Trip",
  "status": "PLANNED",
  "startDate": "2025-12-28",
  "endDate": "2025-12-30",
  "timestamp": "2025-12-24T16:00:00"
}
```

### Event Types

- `trip.created`: When a new trip is created
- `trip.updated`: When trip details are updated
- `trip.started`: When trip status changes to IN_PROGRESS
- `trip.completed`: When trip status changes to COMPLETED
- `trip.cancelled`: When trip is cancelled

---

## Caching

The service uses Redis caching for:

- **trips**: Individual trip details (1 hour TTL)
- **trips:details-{tripId}**: Trip with full details (1 hour TTL)

Cache is automatically evicted on:
- Trip update
- Trip deletion
- Status change

---

## Health Check

**GET** `/actuator/health`

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "redis": { "status": "UP" },
    "kafka": { "status": "UP" }
  }
}
```

---

## Swagger UI

Interactive API documentation available at:

`http://localhost:8087/trip-service/swagger-ui.html`

---

## Example Usage Flow

### 1. Plan a Trip

```bash
POST /api/trips
{
  "tripName": "Pokhara Weekend",
  "tripType": "DOMESTIC",
  "touristType": "NEPALI",
  "startDate": "2025-12-28",
  "endDate": "2025-12-30",
  "budget": 15000.00
}
```

### 2. Add Bookings (via booking-service)

```bash
POST /booking-service/api/bookings/unified
{
  "tripId": 1,
  "bookingType": "BUS",
  "bookingDetails": {...}
}
```

### 3. Start Trip

```bash
PUT /api/trips/1/status?status=IN_PROGRESS
```

### 4. Track Progress

```bash
GET /api/trips/1/details
```

### 5. Complete Trip

```bash
PUT /api/trips/1/status?status=COMPLETED
```

---

## Notes

- All timestamps are in ISO 8601 format
- All monetary values are in NPR (Nepali Rupees)
- User ID is extracted from JWT token
- Trip IDs are auto-generated sequential numbers
