import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService'; // Import payment service
import toast from 'react-hot-toast';
import { X, Loader } from 'lucide-react';

interface BookingModalProps {
    room: any;
    context: any;
    onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ room, context, onClose }) => {
    const [priceDetails, setPriceDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);

    // Calculate Price on Mount
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                // Ensure dates are in correct format (ISO 8601 LocalDateTime usually)
                // If context.checkInDate is YYYY-MM-DD, append time
                const checkIn = context.checkInDate.includes('T') ? context.checkInDate : `${context.checkInDate}T14:00:00`;
                const checkOut = context.checkOutDate.includes('T') ? context.checkOutDate : `${context.checkOutDate}T11:00:00`;

                const payload = {
                    roomId: room.id,
                    rentTypeId: parseInt(room.rentTypeId),
                    mealPlanId: room.mealPlanId ? parseInt(room.mealPlanId) : null,
                    checkIn: checkIn,
                    checkOut: checkOut
                };
                const response: any = await bookingService.calculatePrice(payload);
                if (response.statusCode === 200) {
                    setPriceDetails(response.data);
                } else {
                    toast.error("Could not calculate price.");
                }
            } catch (err) {
                console.error("Price calculation failed", err);
                toast.error("Failed to calculate price plan.");
            } finally {
                setLoading(false);
            }
        };
        if (room && context.checkInDate && context.checkOutDate) {
            fetchPrice();
        }
    }, [room, context]);

    const navigate = useNavigate();
    const location = useLocation();

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            const checkIn = context.checkInDate.includes('T') ? context.checkInDate : `${context.checkInDate}T14:00:00`;
            const checkOut = context.checkOutDate.includes('T') ? context.checkOutDate : `${context.checkOutDate}T11:00:00`;

            const bookingRequest = {
                hotelId: room.hotelId,
                roomType: room.roomType || room.name,
                rentTypeId: parseInt(room.rentTypeId),
                mealPlanId: room.mealPlanId ? parseInt(room.mealPlanId) : null,
                checkIn: checkIn,
                checkOut: checkOut,
                guestsCount: context.guests,
                specialRequests: "",
                customerName: "Guest User",
                customerEmail: "guest@example.com",
                customerPhone: "9800000000"
            };

            // Lock Room
            const response: any = await bookingService.lockRoom(bookingRequest);

            if (response.statusCode === 201 && response.data) {
                const bookingData = response.data;
                toast.success("Room Locked! Redirecting to payment...");

                // Initiate Payment
                const currentUser = JSON.parse(sessionStorage.getItem('user')) || { id: 'GUEST', name: 'Guest', email: 'guest@example.com' };

                const paymentData = {
                    customerId: currentUser.id,
                    amount: bookingData.totalAmount || priceDetails.total,
                    tid: bookingData.bookingReference,
                    bookingType: 'HOTEL',
                    bookingDetails: {
                        hotelId: room.hotelId,
                        roomId: room.id,
                        checkIn: checkIn,
                        checkOut: checkOut
                    },
                    customerName: currentUser.name || bookingRequest.customerName,
                    customerEmail: currentUser.email || bookingRequest.customerEmail,
                    successUrl: `${window.location.origin}/hotel-booking-confirmation`,
                    failureUrl: `${window.location.origin}/payment/failed`
                };

                await paymentService.initiatePayment('esewa', paymentData);

            } else {
                toast.error("Failed to initiate booking (Lock failed).");
            }
        } catch (err: any) {
            console.error("Booking error", err);
            if (err.response && err.response.status === 403) {
                toast("Please log in to complete your booking.", { icon: '⚠️' });
                navigate('/login', { state: { from: location } });
            } else if (err.status === 403) { // Fallback if err.response is not set but status is
                toast("Please log in to complete your booking.", { icon: '⚠️' });
                navigate('/login', { state: { from: location } });
            } else {
                toast.error(err.message || "Booking Failed");
            }
        } finally {
            setConfirming(false);
        }
    };

    if (!room) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Confirm Booking</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-3">
                            <Loader className="animate-spin text-indigo-600" size={32} />
                            <p className="text-gray-500 text-sm">Calculating best price...</p>
                        </div>
                    ) : priceDetails ? (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">{room.name}</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Check-in:</span>
                                        <span className="font-medium text-gray-900">{context.checkInDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Check-out:</span>
                                        <span className="font-medium text-gray-900">{context.checkOutDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Guests:</span>
                                        <span className="font-medium text-gray-900">{context.guests}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-200 my-4"></div>

                            {/* Price Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Rate ({priceDetails.units} units)</span>
                                    <span>{priceDetails.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Meal Plan Cost</span>
                                    <span>{priceDetails.mealCost}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>{priceDetails.tax}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end border-t border-gray-200 pt-3">
                                <span className="text-gray-900 font-bold">Total Price</span>
                                <span className="text-2xl font-bold text-indigo-600">
                                    NPR {priceDetails.total}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-red-500">
                            Failed to load price details. Please try again.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                        disabled={confirming}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || !priceDetails || confirming}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {confirming && <Loader className="animate-spin" size={16} />}
                        {confirming ? 'Processing...' : 'Confirm & Pay'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
