import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, CreditCard, User, Calendar, MapPin, Info, Mail, Phone } from 'lucide-react';
import useEsewaPayment, { PAYMENT_STATES } from '../hooks/useEsewaPayment';
import BookingStatus from '../components/BookingStatus';
import authService from '../services/authService';

const HotelBooking: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { hotel, room, checkIn, checkOut, guests } = location.state || {}; // Cast to any if strictly typed or define interface

    const currentUser = authService.getUserData() || (() => {
        try {
            const raw = localStorage.getItem('userData') || localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const [bookingData, setBookingData] = useState({
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
        email: currentUser?.email || '',
        phone: currentUser?.phoneNumber || currentUser?.phone || '',
        address: '',
        specialRequests: '',
        paymentMethod: 'esewa'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { initiatePayment, state, error: paymentError } = useEsewaPayment();

    useEffect(() => {
        if (!hotel || !room) {
            toast.error("Invalid booking session. Please select a room again.");
            navigate('/hotels');
        }
    }, [hotel, room, navigate]);

    if (!hotel || !room) return null;

    // Calculate nights and total price
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const differenceInTime = end.getTime() - start.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    const nights = differenceInDays > 0 ? differenceInDays : 1;

    const pricePerNight = room.basePrice || room.price || 0;
    const totalPrice = pricePerNight * nights * (parseInt(guests) || 1);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: value }));
    };

    const generateRandomId = () => {
        return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Unified payload for BFF bookings/complete - matching CompleteBookingRequest DTO
            const user = currentUser || {};

            const bookingPayload = {
                bookingRequest: {
                    hotelId: String(hotel.id || hotel.hotelId || hotel.hotelCode),
                    hotelName: hotel.name || hotel.hotelName,
                    roomType: room.roomType || room.type || room.name,
                    numberOfRooms: 1,
                    checkInDate: new Date(checkIn).toISOString().split('T')[0],
                    checkOutDate: new Date(checkOut).toISOString().split('T')[0],
                    numberOfGuests: parseInt(guests) || 1,
                    guests: [
                        {
                            firstName: bookingData.firstName,
                            lastName: bookingData.lastName,
                            email: bookingData.email,
                            phone: bookingData.phone,
                            nationality: 'Nepali',
                            passportNumber: 'N/A',
                            age: '25',
                            gender: 'Male',
                            address: bookingData.address || 'Kathmandu',
                            city: 'Kathmandu'
                        }
                    ],
                    contactDetails: {
                        email: bookingData.email,
                        phone: bookingData.phone,
                        alternatePhone: bookingData.phone,
                        address: bookingData.address || 'Kathmandu'
                    },
                    paymentDetails: {
                        paymentMethod: bookingData.paymentMethod,
                        amount: parseFloat(totalPrice.toString()),
                        currency: 'NPR',
                        transactionId: '',
                        method: bookingData.paymentMethod,
                        status: 'PENDING'
                    },
                    specialRequests: bookingData.specialRequests
                },
                paymentRequest: {
                    amount: totalPrice,
                    currency: 'NPR',
                    provider: bookingData.paymentMethod,
                    successUrl: `${window.location.origin}/payments/${bookingData.paymentMethod}/success`,
                    failureUrl: `${window.location.origin}/payments/${bookingData.paymentMethod}/failure`,
                    metadata: {}
                },
                userId: user.id ? String(user.id) : (user.userId || "GUEST"),
                roomIds: [room.id || room.roomId],
                category: room.category || 'Standard',
                service: 'HOTEL',
                sessionId: generateRandomId()
            };

            // Use the new eSewa payment hook - it handles everything
            await initiatePayment(bookingPayload);

        } catch (error: any) {
            console.error("Booking failed:", error);
            toast.error(error.message || "Failed to complete booking.");
            setIsSubmitting(false);
        }
    };

    // Show loading state during payment initiation
    if (state === PAYMENT_STATES.INITIATING || state === PAYMENT_STATES.REDIRECTING) {
        return (
            <BookingStatus
                state={state}
                message={state === PAYMENT_STATES.INITIATING ? "Creating your booking..." : "Redirecting to payment..."}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            <ShieldCheck size={16} />
                            <span className="font-medium">Secure Booking</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Booking Form */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Guest Details */}
                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</div>
                                    Guest Details
                                </h2>
                                <form id="booking-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                name="firstName"
                                                required
                                                value={bookingData.firstName}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                name="lastName"
                                                required
                                                value={bookingData.lastName}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={bookingData.email}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                                placeholder="name@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={bookingData.phone}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                                placeholder="+977 98XXXXXXXX"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 ml-1">We'll send booking confirmation to this number.</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Requests (Optional)</label>
                                        <textarea
                                            name="specialRequests"
                                            rows={3}
                                            value={bookingData.specialRequests}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                                            placeholder="Any specific preferences or requirements?"
                                        ></textarea>
                                    </div>
                                </form>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</div>
                                    Payment Method
                                </h2>
                                <div className="space-y-4">
                                    <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${bookingData.paymentMethod === 'esewa' ? 'border-[#60bb46] bg-green-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="esewa"
                                            checked={bookingData.paymentMethod === 'esewa'}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 text-[#60bb46] focus:ring-[#60bb46]"
                                        />
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-gray-900">eSewa Mobile Wallet</span>
                                                <span className="text-xs font-bold bg-[#60bb46] text-white px-2 py-0.5 rounded">Recommended</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">Pay securely using your eSewa account</p>
                                        </div>
                                    </label>

                                    <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${bookingData.paymentMethod === 'khalti' ? 'border-[#5c2d91] bg-purple-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="khalti"
                                            checked={bookingData.paymentMethod === 'khalti'}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 text-[#5c2d91] focus:ring-[#5c2d91]"
                                        />
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-gray-900">Khalti Digital Wallet</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">Pay using Khalti wallet or banking</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Booking Summary</h3>

                                <div className="flex gap-4 mb-6">
                                    <img
                                        src={hotel.images?.[0] || "https://placehold.co/100"}
                                        alt={hotel.name}
                                        loading="lazy"
                                        className="w-20 h-20 object-cover rounded-xl shadow-sm"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900 line-clamp-1">{hotel.name}</h4>
                                        <div className="flex items-center text-gray-500 text-xs mt-1">
                                            <MapPin size={12} className="mr-1" />
                                            <span className="line-clamp-1">{hotel.address || hotel.city}</span>
                                        </div>
                                        <div className="flex items-center mt-1.5">
                                            <span className="text-yellow-400 text-xs">★</span>
                                            <span className="text-xs font-bold ml-1 text-gray-700">{hotel.rating || 5.0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 text-sm border-t border-gray-100 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 flex items-center gap-2"><Info size={14} /> Room Type</span>
                                        <span className="font-semibold text-gray-900 text-right max-w-[50%] line-clamp-1">{room.type || room.roomType}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 flex items-center gap-2"><Calendar size={14} /> Check-in</span>
                                        <span className="font-semibold text-gray-900">{new Date(checkIn).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 flex items-center gap-2"><Calendar size={14} /> Check-out</span>
                                        <span className="font-semibold text-gray-900">{new Date(checkOut).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 flex items-center gap-2"><User size={14} /> Guests</span>
                                        <span className="font-semibold text-gray-900">{guests} Person(s)</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 flex items-center gap-2"><Calendar size={14} /> Duration</span>
                                        <span className="font-semibold text-gray-900">{nights} Night(s)</span>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-gray-200 my-6"></div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Room Price</span>
                                        <span>NPR {pricePerNight.toLocaleString()} x {nights}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Taxes & Fees</span>
                                        <span className="text-green-600 font-medium">Included</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-indigo-600 pt-4 border-t border-gray-100 mt-2">
                                        <span>Total</span>
                                        <span>NPR {totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    form="booking-form"
                                    disabled={isSubmitting}
                                    aria-busy={isSubmitting}
                                    className={`w-full mt-8 py-4 rounded-xl font-bold shadow-lg transition-all flex justify-center items-center gap-2 ${isSubmitting
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#60bb46] hover:bg-[#4ca036] text-white hover:shadow-xl hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={20} />
                                            <span>Pay NPR {totalPrice.toLocaleString()}</span>
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                                    <ShieldCheck size={14} className="text-green-600" />
                                    <span>Secure payment powered by eSewa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default HotelBooking;
