/**
 * Example: How to integrate production eSewa flow into booking pages
 * 
 * This file demonstrates how to use the useEsewaPayment hook
 * in your booking components (HotelBooking.jsx, ticketDetails.jsx, etc.)
 */

import React, { useState } from 'react';
import useEsewaPayment, { PAYMENT_STATES } from '../hooks/useEsewaPayment';
import BookingStatus from '../components/BookingStatus';
import { toast } from 'react-toastify';

export default function ExampleBookingPage() {
    const [bookingData, setBookingData] = useState({
        // Your booking form data
        name: '',
        email: '',
        // ... other fields
    });

    // Use the payment hook
    const { initiatePayment, state, error } = useEsewaPayment();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!bookingData.name || !bookingData.email) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            // Prepare booking payload according to your backend schema
            const payload = {
                type: 'hotel', // or 'bus'
                hotelId: 'H123',
                roomIds: ['R1'],
                checkIn: '2025-01-01',
                checkOut: '2025-01-05',
                guests: [{
                    firstName: bookingData.name.split(' ')[0],
                    lastName: bookingData.name.split(' ')[1] || '',
                    email: bookingData.email,
                    phone: bookingData.phone
                }],
                contactDetails: {
                    email: bookingData.email,
                    phone: bookingData.phone
                }
            };

            // Initiate payment - this will:
            // 1. Call /api/bff/v1/bookings/initiate
            // 2. Store context in sessionStorage
            // 3. Navigate to /payment/redirect
            // 4. Redirect to eSewa
            await initiatePayment(payload);

        } catch (err) {
            toast.error(err.message || 'Failed to initiate payment');
        }
    };

    // Show loading state during initiation
    if (state === PAYMENT_STATES.INITIATING) {
        return (
            <BookingStatus
                state={state}
                message="Creating your booking..."
            />
        );
    }

    // Show error state
    if (state === PAYMENT_STATES.FAILED && error) {
        toast.error(error);
    }

    // Render your booking form
    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Complete Your Booking</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                        type="text"
                        value={bookingData.name}
                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={state === PAYMENT_STATES.INITIATING}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                    {state === PAYMENT_STATES.INITIATING ? 'Processing...' : 'Pay with eSewa'}
                </button>
            </form>
        </div>
    );
}

/**
 * INTEGRATION NOTES:
 * 
 * 1. Replace your existing booking submission logic with `initiatePayment(payload)`
 * 2. The hook handles all the complexity:
 *    - API calls
 *    - SessionStorage management
 *    - Navigation
 *    - Error handling
 * 
 * 3. After payment, user returns to /payment/success which:
 *    - Verifies payment
 *    - Completes booking (with retry)
 *    - Falls back to polling if needed
 *    - Shows appropriate UI states
 * 
 * 4. No need to manually handle:
 *    - eSewa form submission
 *    - Payment verification
 *    - Retry logic
 *    - Polling
 *    - SessionStorage
 * 
 * 5. The hook manages all states:
 *    - idle → initiating → redirecting → (eSewa) → verifying → completing → confirmed
 *    - If completing fails: → polling → confirmed/failed
 */
