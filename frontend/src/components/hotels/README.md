# Hotel Recommendation Module

This module provides a complete frontend integration for the Hotel Recommendation System, including search, filtering, details, and booking availability.

## Features

- **Advanced Search**: Search by city, keywords, with autocomplete.
- **Filters**: Filter by price range, star rating, and amenities.
- **Hotel Details**: View full hotel information, images, and amenities.
- **Availability Check**: Real-time room availability checking.
- **Nearby Hotels**: Geolocation-based search for hotels near you.
- **Recommendations**: Personalized hotel recommendations.
- **Responsive Design**: Fully responsive UI for mobile and desktop.

## Setup

1.  **Environment Variables**
    Ensure your `.env` file contains the API base URL:
    ```env
    REACT_APP_API_BASE_URL=http://localhost:8080
    ```

2.  **Dependencies**
    This module uses `axios` for API requests and `react-toastify` for notifications.
    ```bash
    npm install axios react-toastify react-infinite-scroll-component
    ```

## API Endpoints

The module interacts with the following backend endpoints:

- `POST /api/hotels/search` - Advanced search
- `GET /api/hotels/nearby` - Nearby hotels
- `GET /api/hotels/{id}` - Hotel details
- `POST /api/hotels/{id}/availability` - Check availability
- `GET /api/hotels/cities` - List of cities
- `GET /api/hotels/filters` - Filter options

## Testing

Run the unit tests using:
```bash
npm test src/components/hotels/HotelComponents.test.js
```

## Example Curl Commands

Use these commands to verify backend responses:

**Search Hotels:**
```bash
curl -X POST "http://localhost:8080/api/hotels/search" \
 -H "Content-Type: application/json" \
 -d '{
   "city":"Kathmandu",
   "minStars":3,
   "maxPrice":200,
   "amenities":["wifi"],
   "page":0,
   "size":20
 }'
```

**Get Hotel Details:**
```bash
curl -X GET "http://localhost:8080/api/hotels/1"
```

**Check Availability:**
```bash
curl -X POST "http://localhost:8080/api/hotels/1/availability" \
 -H "Content-Type: application/json" \
 -d '{ "checkIn": "2025-12-15", "checkOut": "2025-12-17", "rooms": 1, "numberOfGuests": 2 }'
```

**Get Nearby Hotels:**
```bash
curl -X POST "http://localhost:8080/api/hotels/nearby" \
 -H "Content-Type: application/json" \
 -d '{
   "latitude": 27.7172,
   "longitude": 85.3240,
   "radiusKm": 5
 }'
```
