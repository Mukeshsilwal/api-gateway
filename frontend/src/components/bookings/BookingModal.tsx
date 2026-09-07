import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import authService from '../../services/authService';
import { submitHtmlForm } from '../../utils/paymentUtils';
import toast from 'react-hot-toast';
import { X, Loader, User, Mail, Phone, MessageSquare } from 'lucide-react';

interface BookingModalProps {
    room: any;
    context: any;
    onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ room, context, onClose }) => {
    const [priceDetails, setPriceDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve real customer data from authService or localStorage
    const getStoredUser = () => {
        const authUser = authService.getUserData();
        if (authUser) return authUser;
        try {
            const raw = localStorage.getItem('userData') || localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    };

    const currentUser = getStoredUser();
    const defaultName = currentUser
        ? (`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name || currentUser.username || '')
        : '';
    const defaultEmail = currentUser?.email || '';
    const defaultPhone = currentUser?.phoneNumber || currentUser?.phone || '';

    const [customerName, setCustomerName] = useState(defaultName);
    const [customerEmail, setCustomerEmail] = useState(defaultEmail);
    const [customerPhone, setCustomerPhone] = useState(defaultPhone);
    const [specialRequests, setSpecialRequests] = useState('');

    // Update if user data becomes available
    useEffect(() => {
        if (!customerName && defaultName) setCustomerName(defaultName);
        if (!customerEmail && defaultEmail) setCustomerEmail(defaultEmail);
        if (!customerPhone && defaultPhone) setCustomerPhone(defaultPhone);
    }, [defaultName, defaultEmail, defaultPhone]);

    // Calculate Price on Mount
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const checkIn = context.checkInDate.includes('T') ? context.checkInDate : `${context.checkInDate}T14:00:00`;
                const checkOut = context.checkOutDate.includes('T') ? context.checkOutDate : `${context.checkOutDate}T11:00:00`;

                const payload = {
                    hotelId: room.hotelId,
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

    const handleConfirm = async () => {
        if (!customerName.trim()) {
            toast.error("Please enter your full name.");
            return;
        }
        if (!customerEmail.trim()) {
            toast.error("Please enter your email address.");
            return;
        }
        if (!customerPhone.trim()) {
            toast.error("Please enter your contact phone number.");
            return;
        }

        const token = authService.getToken();
        if (!token) {
            toast("Please log in to complete your booking.", { icon: '⚠️' });
            navigate('/login', { state: { from: location } });
            return;
        }

        setConfirming(true);
        try {
            const checkIn = context.checkInDate.includes('T') ? context.checkInDate : `${context.checkInDate}T14:00:00`;
            const checkOut = context.checkOutDate.includes('T') ? context.checkOutDate : `${context.checkOutDate}T11:00:00`;

            const bookingRequest = {
                hotelId: room.hotelId,
                roomId: room.id,
                roomType: room.roomType || room.name,
                rentTypeId: (room.rentTypeId && !isNaN(parseInt(room.rentTypeId))) ? parseInt(room.rentTypeId) : 1,
                mealPlanId: (room.mealPlanId && !isNaN(parseInt(room.mealPlanId))) ? parseInt(room.mealPlanId) : 1,
                checkIn: checkIn,
                checkOut: checkOut,
                guestsCount: context.guests ? Number(context.guests) : 1,
                specialRequests: specialRequests.trim(),
                customerName: customerName.trim(),
                customerEmail: customerEmail.trim(),
                customerPhone: customerPhone.trim()
            };

            // 1. Lock Room
            const response: any = await bookingService.lockRoom(bookingRequest);

            if ((response.statusCode === 201 || response.statusCode === 200) && response.data) {
                const bookingData = response.data;
                toast.success("Room Locked! Redirecting to payment...");

                // 2. Prepare Payment Initiation Data
                const userId = currentUser?.id ? String(currentUser.id) : "1";
                const paymentData = {
                    customerId: userId,
                    amount: bookingData.totalAmount || priceDetails.total,
                    bookingId: bookingData.bookingReference,
                    tid: bookingData.bookingReference,
                    hotelId: room.hotelId,
                    bookingType: 'HOTEL',
                    bookingDetails: {
                        hotelId: room.hotelId,
                        roomId: room.id,
                        checkIn: checkIn,
                        checkOut: checkOut
                    },
                    customerName: customerName.trim(),
                    customerEmail: customerEmail.trim(),
                    customerPhone: customerPhone.trim(),
                    currency: 'NPR',
                    provider: 'esewa',
                    successUrl: `${window.location.origin}/hotel-booking-confirmation`,
                    failureUrl: `${window.location.origin}/payment/failed`,
                    metadata: {
                        bookingId: bookingData.bookingReference,
                        hotelId: String(room.hotelId),
                        roomId: String(room.id)
                    }
                };

                // Store in sessionStorage for confirmation page recovery
                sessionStorage.setItem('lastBooking', JSON.stringify({
                    bookingId: bookingData.bookingReference,
                    confirmationNumber: bookingData.bookingReference,
                    hotelName: room.hotelName || 'Hotel Stay',
                    roomType: room.roomType || room.name,
                    numberOfRooms: 1,
                    checkInDate: context.checkInDate,
                    checkOutDate: context.checkOutDate,
                    status: 'PENDING',
                    currency: 'NPR',
                    totalAmount: bookingData.totalAmount || priceDetails.total,
                    customerName: customerName.trim(),
                    customerEmail: customerEmail.trim()
                }));

                // 3. Initiate Payment
                const paymentRes: any = await paymentService.initiatePayment('esewa', paymentData);

                // Extract HTML form from payment response
                const pData = paymentRes?.data?.paymentResponse?.data 
                    || paymentRes?.paymentResponse?.data 
                    || paymentRes?.data 
                    || paymentRes;
                const htmlForm = pData?.htmlForm || paymentRes?.htmlForm;

                if (htmlForm) {
                    submitHtmlForm(htmlForm);
                } else if (pData?.payment_url || pData?.gatewayUrl) {
                    window.location.href = pData.payment_url || pData.gatewayUrl;
                } else {
                    toast.success("Booking initiated! Check your bookings dashboard.");
                    navigate('/hotel-booking-confirmation', { state: { bookingData } });
                }
            } else {
                toast.error("Failed to lock room: " + (response.message || "Unknown error"));
            }
        } catch (err: any) {
            console.error("Booking error", err);
            if (err.response?.status === 401 || err.response?.status === 403 || err.status === 403) {
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
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">Confirm Booking</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-3">
                            <Loader className="animate-spin text-indigo-600" size={32} />
                            <p className="text-gray-500 text-sm">Calculating best price...</p>
                        </div>
                    ) : priceDetails ? (
                        <>
                            {/* Room & Stay Overview */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">{room.name || room.roomType}</h3>
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

                            {/* Guest Details Form */}
                            <div className="space-y-3 pt-2">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                                    <User size={16} className="text-indigo-600" />
                                    Guest Contact Details
                                </h4>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                            <input
                                                type="email"
                                                value={customerEmail}
                                                onChange={(e) => setCustomerEmail(e.target.value)}
                                                placeholder="email@example.com"
                                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                            <input
                                                type="tel"
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                                placeholder="98XXXXXXXX"
                                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Special Requests (Optional)</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            value={specialRequests}
                                            onChange={(e) => setSpecialRequests(e.target.value)}
                                            placeholder="Quiet room, extra bed, early check-in, etc."
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-200 my-3"></div>

                            {/* Price Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Rate ({priceDetails.units} units)</span>
                                    <span>NPR {priceDetails.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Meal Plan Cost</span>
                                    <span>NPR {priceDetails.mealCost}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (13%)</span>
                                    <span>NPR {priceDetails.tax}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end border-t border-gray-200 pt-3">
                                <div>
                                    <span className="text-gray-900 font-bold block">Total Price</span>
                                    <span className="text-xs text-gray-500">Pay securely via eSewa</span>
                                </div>
                                <span className="text-2xl font-bold text-indigo-600">
                                    NPR {priceDetails.total}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6 text-red-500">
                            Failed to load price details. Please try again.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
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
                        {confirming ? 'Processing...' : 'Confirm & Pay with eSewa'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
