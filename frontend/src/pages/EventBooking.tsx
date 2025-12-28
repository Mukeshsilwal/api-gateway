import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, User, Mail, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import eventService from '../services/eventService';

interface Attendee {
    ticketTypeId: number;
    ticketTypeName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    [key: string]: any;
}

export function EventBooking() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { event, selectedTickets } = location.state || {}; // Cast as any or define proper interface

    const [step, setStep] = useState(1); // 1: Attendee Info, 2: Review, 3: Payment Gateway, 4: Processing
    const [loading, setLoading] = useState(false);
    const [contactInfo, setContactInfo] = useState({
        email: '',
        phone: ''
    });
    const [attendees, setAttendees] = useState<Attendee[]>([]);

    // Extract tripId from URL params if present
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tripId = params.get('tripId');

        if (tripId) {
            // Store tripId in booking context for later use
            sessionStorage.setItem('bookingContext', JSON.stringify({
                tripId: tripId,
                isUnifiedBooking: false
            }));
            console.log('🎯 Trip context stored:', tripId);
        }
    }, [location.search]);

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            // User not authenticated, redirect to login
            toast('Please login to continue booking', { icon: 'ℹ️' });

            // Save current booking details to session storage to restore after login
            if (event && selectedTickets) {
                sessionStorage.setItem('pendingBooking', JSON.stringify({
                    eventId,
                    event,
                    selectedTickets,
                    returnUrl: window.location.pathname
                }));
            }

            // Redirect to login with return URL
            navigate('/login', {
                state: { from: window.location.pathname }
            });
            return;
        }
    }, [navigate, eventId, event, selectedTickets]);

    // Initialize attendees array based on selected tickets
    useEffect(() => {
        if (!event || !selectedTickets) {
            // Check if there's a pending booking from session storage
            const pendingBooking = sessionStorage.getItem('pendingBooking');
            if (pendingBooking) {
                const booking = JSON.parse(pendingBooking);
                // This would need to be handled differently - perhaps redirect back to event details
                sessionStorage.removeItem('pendingBooking');
            }
            navigate('/events');
            return;
        }

        const attendeesList: Attendee[] = [];
        Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
            const ticket = event.ticketTypes.find((t: any) => t.id === parseInt(ticketTypeId));
            for (let i = 0; i < (quantity as number); i++) {
                attendeesList.push({
                    ticketTypeId: parseInt(ticketTypeId),
                    ticketTypeName: ticket.name,
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: ''
                });
            }
        });
        setAttendees(attendeesList);
    }, [event, selectedTickets, navigate]);

    const calculateTotal = () => {
        let total = 0;
        Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
            const ticket = event.ticketTypes.find((t: any) => t.id === parseInt(ticketTypeId));
            if (ticket) {
                total += ticket.price * (quantity as number);
            }
        });
        return total;
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContactInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleAttendeeChange = (index: number, field: keyof Attendee, value: string) => {
        setAttendees(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const validateAttendeeInfo = () => {
        // Validate contact info
        if (!contactInfo.email || !contactInfo.phone) {
            toast.error('Please provide contact email and phone');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactInfo.email)) {
            toast.error('Please provide a valid email address');
            return false;
        }

        // Validate all attendees
        for (let i = 0; i < attendees.length; i++) {
            const attendee = attendees[i];
            if (!attendee.firstName || !attendee.lastName || !attendee.email) {
                toast.error(`Please complete information for Attendee ${i + 1}`);
                return false;
            }
            if (!emailRegex.test(attendee.email)) {
                toast.error(`Invalid email for Attendee ${i + 1}`);
                return false;
            }
        }

        return true;
    };

    const handleProceedToReview = () => {
        if (validateAttendeeInfo()) {
            setStep(2);
        }
    };

    const handleCreateBooking = async () => {
        try {
            setLoading(true);
            setStep(3);

            // Get userId from stored user data
            const userDataStr = localStorage.getItem('userData');
            let userId = null;
            if (userDataStr) {
                try {
                    const userData = JSON.parse(userDataStr);
                    userId = userData.id || userData.userId;
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }

            if (!userId) {
                toast.error('User session expired. Please login again.');
                navigate('/login');
                return;
            }

            // Prepare tickets array for API
            const tickets = Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => ({
                ticketTypeId: parseInt(ticketTypeId),
                quantity: quantity
            }));

            const bookingData = {
                eventId: parseInt(eventId as string),
                userId: userId,
                tickets: tickets,
                attendees: attendees,
                contactEmail: contactInfo.email,
                contactPhone: contactInfo.phone,
                tripId: JSON.parse(sessionStorage.getItem('bookingContext') || '{}').tripId || undefined
            };

            console.log('📤 Creating event booking with data:', bookingData);
            const response = await eventService.createBooking(bookingData);

            console.log('📥 Full API response:', response);
            console.log('📦 Response structure:', {
                hasData: !!response.data,
                dataKeys: response.data ? Object.keys(response.data) : [],
                fullResponse: response
            });

            // Handle BFF Response wrapper structure
            // The BFF returns: { status: number, message: string, data: { bookingReference, paymentUrl, ... } }
            let actualData = response.data;

            // If response.data has a 'data' property, unwrap it (BFF Response wrapper)
            if (actualData && typeof actualData === 'object' && 'data' in actualData) {
                console.log('🔓 Unwrapping Response object');
                actualData = actualData.data;
            }

            console.log('✅ Actual booking data:', actualData);

            const bookingReference = actualData?.bookingReference;
            const paymentUrl = actualData?.paymentUrl;
            const htmlForm = actualData?.htmlForm;

            console.log('📋 Extracted values:', {
                bookingReference,
                paymentUrl: paymentUrl ? 'present' : 'missing',
                htmlForm: htmlForm ? 'present' : 'missing',
                hasPaymentMethod: !!(htmlForm || paymentUrl)
            });

            if (!bookingReference) {
                console.error('❌ No booking reference found in response');
                throw new Error('Booking created but no reference returned');
            }

            // Priority 1: HTML Form (eSewa V2 API)
            if (htmlForm) {
                console.log('📝 Rendering eSewa HTML form for auto-submission');

                // Explicitly save booking context for redirection
                if (bookingData.tripId) {
                    sessionStorage.setItem('bookingContext', JSON.stringify({
                        tripId: bookingData.tripId,
                        isUnifiedBooking: false
                    }));
                }

                toast.success('Booking created! Redirecting to eSewa...');

                // Small delay to ensure toast is visible
                await new Promise(resolve => setTimeout(resolve, 500));

                // Create a temporary div to hold the form
                const formContainer = document.createElement('div');
                formContainer.innerHTML = htmlForm;
                document.body.appendChild(formContainer);

                // Manually submit the form (onload event doesn't fire for dynamically inserted HTML)
                const form = formContainer.querySelector('form');
                if (form) {
                    console.log('✅ HTML form found, submitting to eSewa...');
                    form.submit(); // Manually trigger form submission
                } else {
                    console.error('❌ Form element not found in HTML');
                    throw new Error('Payment form not found');
                }

                // Don't set loading to false - page will redirect
                return; // Exit early as form will handle redirect
            }

            // Priority 2: Payment URL (fallback for non-eSewa or legacy)
            if (paymentUrl) {
                // Redirect to payment gateway
                console.log('💳 Redirecting to eSewa payment gateway:', paymentUrl);
                toast.success('Booking created! Redirecting to payment...');

                // Small delay to ensure toast is visible
                await new Promise(resolve => setTimeout(resolve, 500));
                window.location.href = paymentUrl;
            } else {
                // Navigate to confirmation (for free events or if payment failed)
                console.warn('⚠️ No payment method found in response, navigating to confirmation');
                toast('Payment method not available. Please contact support.', { icon: '⚠️' });
                navigate(`/events/booking/${bookingReference}/confirmation`);
            }
        } catch (error: any) {
            console.error('❌ Error creating booking:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                responseData: error.response?.data
            });

            setStep(2); // Go back to review

            let errorMessage = 'Failed to create booking';

            // Try to extract error from BFF Response wrapper
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.data?.message) {
                errorMessage = error.response.data.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!event || !selectedTickets) {
        return null;
    }

    const totalAmount = calculateTotal();
    const serviceFee = totalAmount * 0.05; // 5% service fee
    const grandTotal = totalAmount + serviceFee;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900">Complete Your Booking</h1>
                    <p className="text-gray-600 mt-2">{event.name}</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-4">
                        {[
                            { num: 1, label: 'Attendee Info' },
                            { num: 2, label: 'Review' },
                            { num: 3, label: 'Payment' }
                        ].map((s) => (
                            <div key={s.num} className="flex items-center">
                                <div className={`flex flex-col items-center ${s.num < 3 ? 'mr-4' : ''}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s.num
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {step > s.num ? <CheckCircle size={20} /> : s.num}
                                    </div>
                                    <span className={`text-sm mt-2 ${step >= s.num ? 'text-purple-600 font-semibold' : 'text-gray-500'}`}>
                                        {s.label}
                                    </span>
                                </div>
                                {s.num < 3 && (
                                    <div className={`w-24 h-1 ${step > s.num ? 'bg-purple-600' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Attendee Information */}
                        {step === 1 && (
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendee Information</h2>

                                {/* Contact Information */}
                                <div className="mb-8 p-6 bg-purple-50 rounded-xl border border-purple-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={contactInfo.email}
                                                onChange={handleContactChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Phone *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={contactInfo.phone}
                                                onChange={handleContactChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="+977 98XXXXXXXX"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Attendee Details */}
                                <div className="space-y-6">
                                    {attendees.map((attendee, index) => (
                                        <div key={index} className="p-6 border border-gray-200 rounded-xl">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                Attendee {index + 1} - {attendee.ticketTypeName}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        First Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={attendee.firstName}
                                                        onChange={(e) => handleAttendeeChange(index, 'firstName', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="John"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Last Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={attendee.lastName}
                                                        onChange={(e) => handleAttendeeChange(index, 'lastName', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="Doe"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Email *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={attendee.email}
                                                        onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="attendee@email.com"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Phone (Optional)
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={attendee.phone}
                                                        onChange={(e) => handleAttendeeChange(index, 'phone', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="+977 98XXXXXXXX"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleProceedToReview}
                                    className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                                >
                                    Continue to Review
                                </button>
                            </div>
                        )}

                        {/* Step 2: Review */}
                        {step === 2 && (
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Booking</h2>

                                {/* Event Info */}
                                <div className="mb-6 p-6 bg-gray-50 rounded-xl">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{event.name}</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>{new Date(event.startDateTime).toLocaleDateString('en-US', {
                                                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}</span>
                                        </div>
                                        {event.venue && (
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} />
                                                <span>{event.venue.name}, {event.venue.city}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Attendees Summary */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Attendees ({attendees.length})</h3>
                                    <div className="space-y-2">
                                        {attendees.map((attendee, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <User size={18} className="text-purple-600" />
                                                <span className="font-medium">
                                                    {attendee.firstName} {attendee.lastName}
                                                </span>
                                                <span className="text-sm text-gray-500">({attendee.ticketTypeName})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Confirmation will be sent to:</h3>
                                    <div className="space-y-1 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} />
                                            <span>{contactInfo.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} />
                                            <span>{contactInfo.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCreateBooking}
                                        disabled={loading}
                                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Proceed to Payment'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Processing */}
                        {step === 3 && (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing your booking...</h2>
                                <p className="text-gray-600">Please wait while we create your booking</p>
                            </div>
                        )}
                    </div>

                    {/* Order Summary (Sidebar) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>

                            {/* Ticket Breakdown */}
                            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                                {Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
                                    const ticket = event.ticketTypes.find((t: any) => t.id === parseInt(ticketTypeId));
                                    if (!ticket) return null;
                                    return (
                                        <div key={ticketTypeId} className="flex justify-between text-sm">
                                            <span className="text-gray-700">
                                                {ticket.name} × {quantity as number}
                                            </span>
                                            <span className="font-semibold">
                                                NPR {(ticket.price * (quantity as number)).toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Price Summary */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">NPR {totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Service Fee (5%)</span>
                                    <span className="font-semibold">NPR {serviceFee.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="pt-4 border-t-2 border-gray-300">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-purple-600">
                                        NPR {grandTotal.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Security Badge */}
                            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                                <div className="flex items-center gap-2 text-green-700 text-sm">
                                    <CheckCircle size={18} />
                                    <span className="font-semibold">Secure Checkout</span>
                                </div>
                                <p className="text-xs text-green-600 mt-1">
                                    Your payment information is encrypted and secure
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default EventBooking;
