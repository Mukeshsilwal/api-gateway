# Add to Cart Integration Example

This document provides a template for adding "Add to Cart" functionality to booking pages.

## Implementation Pattern

### 1. Import the Cart Hook

```typescript
import { useUnifiedBookingCart } from '../hooks/useUnifiedBookingCart';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';
```

### 2. Initialize the Hook

```typescript
const { addToCart } = useUnifiedBookingCart();
```

### 3. Create Add to Cart Handler

```typescript
const handleAddToCart = () => {
    // Validate selection
    if (!hasValidSelection) {
        toast.error('Please select items first');
        return;
    }

    // Add to cart
    addToCart({
        type: 'EVENT' | 'HOTEL' | 'BUS',
        name: 'Item Name',
        amount: totalAmount,
        payload: {
            // Service-specific data for API
            // This will be sent to the unified booking endpoint
        },
        metadata: {
            // Display metadata for cart UI
            description: '...',
            imageUrl: '...',
            // Service-specific metadata
        },
    });

    toast.success('Added to cart!');
    
    // Optional: Reset selections
    resetSelections();
};
```

### 4. Add Button to UI

```tsx
<button
    onClick={handleAddToCart}
    disabled={!hasValidSelection}
    className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
>
    <ShoppingCart size={20} />
    Add to Cart
</button>
```

## Service-Specific Examples

### EVENT Booking

```typescript
addToCart({
    type: 'EVENT',
    name: event.name,
    amount: totalAmount,
    payload: {
        eventId: event.id,
        tickets: [
            { ticketTypeId: 1, quantity: 2 },
            { ticketTypeId: 2, quantity: 1 }
        ],
        email: '', // Collected at checkout
        phone: '',
    },
    metadata: {
        eventDate: event.startDateTime,
        eventLocation: `${event.venue.city}, ${event.venue.country}`,
        ticketType: 'VIP',
        quantity: 3,
        imageUrl: event.coverImage,
    },
});
```

### HOTEL Booking

```typescript
addToCart({
    type: 'HOTEL',
    name: hotel.name,
    amount: totalAmount,
    payload: {
        hotelId: hotel.id,
        roomTypeId: selectedRoom.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guestCount,
    },
    metadata: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        roomType: selectedRoom.name,
        guests: guestCount,
        nights: numberOfNights,
        imageUrl: hotel.images[0],
    },
});
```

### BUS Booking

```typescript
addToCart({
    type: 'BUS',
    name: `${bus.from} → ${bus.to}`,
    amount: totalAmount,
    payload: {
        busId: bus.id,
        seats: selectedSeats,
        departureDate: bus.departureTime,
    },
    metadata: {
        from: bus.from,
        to: bus.to,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        seatNumbers: selectedSeats,
        imageUrl: bus.imageUrl,
    },
});
```

## Best Practices

1. **Validate Before Adding**: Always check if user has made valid selections
2. **Show Feedback**: Use toast notifications for success/error
3. **Reset After Adding**: Clear selections after successful add
4. **Disable When Invalid**: Disable button when no selection made
5. **Dual Options**: Offer both "Add to Cart" and "Book Now" for flexibility
6. **Clear Messaging**: Explain the difference between cart and direct booking

## UI Layout Recommendation

```tsx
<div className="space-y-3">
    {/* Add to Cart - Primary for multi-service */}
    <button onClick={handleAddToCart} className="...orange...">
        <ShoppingCart /> Add to Cart
    </button>

    {/* Book Now - For single service */}
    <button onClick={handleBookNow} className="...purple...">
        Book Now
    </button>

    <p className="text-xs text-gray-500 text-center">
        Add to cart for multi-service booking or book now for instant checkout
    </p>
</div>
```
