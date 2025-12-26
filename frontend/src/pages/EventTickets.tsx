import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Download, Home, Share2, CheckCircle, Calendar, MapPin, User } from 'lucide-react';
import apiService from '../services/api.service';

interface Attendee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    ticketType: {
        id: number;
        name: string;
        price: number;
    };
    qrCode: string;
    ticketId: string;
    checkInStatus: string;
}

interface EventData {
    id: number;
    title: string;
    venue: string;
    eventDate: string;
    eventTime: string;
    imageUrl?: string;
}

interface BookingData {
    bookingReference: string;
    totalAmount: number;
    platformFee: number;
    tax: number;
    grandTotal: number;
    paymentStatus: string;
    status: string;
    contactEmail: string;
    contactPhone: string;
    bookedAt: string;
    confirmedAt?: string;
    event: EventData;
    attendees: Attendee[];
}

export default function EventTickets() {
    const { bookingReference } = useParams<{ bookingReference: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [booking, setBooking] = useState<BookingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tripId, setTripId] = useState<string | null>(null);

    useEffect(() => {
        fetchBookingDetails();
        checkTripContext();
    }, [bookingReference]);

    const checkTripContext = () => {
        // Check navigation state first
        const state = (location as any).state;
        if (state?.fromPayment && state?.tripId) {
            setTripId(state.tripId);
            return;
        }

        // Check sessionStorage as fallback
        const context = sessionStorage.getItem('bookingContext');
        if (context) {
            try {
                const parsedContext = JSON.parse(context);
                if (parsedContext.tripId) {
                    setTripId(parsedContext.tripId);
                }
            } catch (e) {
                console.error('Failed to parse booking context:', e);
            }
        }
    };

    const fetchBookingDetails = async () => {
        if (!bookingReference) {
            setError('No booking reference provided');
            setLoading(false);
            return;
        }

        try {
            console.log('📥 Fetching booking details:', bookingReference);

            // Fetch from BFF endpoint
            const response = await apiService.get(`/api/bff/v1/bookings/event/${bookingReference}`);

            console.log('✅ Booking data received:', response.data);
            setBooking(response.data);
            setLoading(false);
        } catch (err: any) {
            console.error('❌ Error fetching booking:', err);
            setError(err.message || 'Failed to load booking details');
            setLoading(false);
            toast.error('Failed to load tickets');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Event Tickets - ${booking?.event.title}`,
                    text: `My tickets for ${booking?.event.title}`,
                    url: url
                });
                toast.success('Shared successfully!');
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleDownload = () => {
        // For now, just trigger print
        // TODO: Generate PDF in the future
        handlePrint();
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="max-w-md w-full p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Loading your tickets...</h2>
                    <p className="text-gray-600 mt-2">Please wait</p>
                </Card>
            </div>
        );
    }

    // Error state
    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
                <Card className="max-w-md w-full p-8 text-center border-red-200">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'Could not find your booking'}</p>
                    <Button onClick={() => navigate('/')} className="w-full">
                        <Home size={18} className="mr-2" />
                        Return to Home
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8 px-4">
            {/* Header - Hide on print */}
            <div className="max-w-4xl mx-auto mb-6 print:hidden">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-600">
                        <Home size={18} className="mr-2" />
                        Home
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleShare}>
                            <Share2 size={18} className="mr-2" />
                            Share
                        </Button>
                        <Button variant="outline" onClick={handleDownload}>
                            <Download size={18} className="mr-2" />
                            Download
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
                {/* Success Banner */}
                <Card className="mb-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 border-none shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Booking Confirmed!</h1>
                            <p className="text-emerald-50">Your tickets are ready</p>
                            <p className="text-sm text-emerald-100 mt-1">
                                Booking Reference: <span className="font-mono font-bold">{booking.bookingReference}</span>
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Event Details */}
                <Card className="mb-6 p-6 shadow-lg">
                    <div className="flex gap-6">
                        {booking.event.imageUrl && (
                            <img
                                src={booking.event.imageUrl}
                                alt={booking.event.title}
                                className="w-32 h-32 object-cover rounded-lg"
                            />
                        )}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">{booking.event.title}</h2>
                            <div className="space-y-2 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-indigo-600" />
                                    <span>{new Date(booking.event.eventDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} at {booking.event.eventTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} className="text-indigo-600" />
                                    <span>{booking.event.venue}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Tickets */}
                <div className="space-y-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Your Tickets ({booking.attendees?.length || 0})</h3>

                    {booking.attendees && booking.attendees.length > 0 ? (
                        booking.attendees.map((attendee, index) => (
                            <Card key={attendee.id} className="p-6 shadow-lg hover:shadow-xl transition-shadow page-break-inside-avoid">
                                <div className="flex gap-6">
                                    {/* QR Code */}
                                    <div className="flex-shrink-0">
                                        <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                                            <img
                                                src={attendee.qrCode}
                                                alt={`QR Code for ${attendee.firstName}`}
                                                className="w-32 h-32"
                                            />
                                        </div>
                                        <p className="text-xs text-center text-gray-500 mt-2 font-mono">
                                            {attendee.ticketId}
                                        </p>
                                    </div>

                                    {/* Ticket Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 mb-1">
                                                    Ticket #{index + 1}
                                                </h4>
                                                <p className="text-sm text-gray-500">{attendee.ticketType.name}</p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${attendee.checkInStatus === 'CHECKED_IN'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {attendee.checkInStatus === 'CHECKED_IN' ? 'Checked In' : 'Valid'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Attendee Name</p>
                                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <User size={16} className="text-gray-400" />
                                                    {attendee.firstName} {attendee.lastName}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Email</p>
                                                <p className="font-medium text-gray-700 text-sm">{attendee.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Phone</p>
                                                <p className="font-medium text-gray-700">{attendee.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Price</p>
                                                <p className="font-bold text-gray-900">NPR {attendee.ticketType.price.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <p className="text-xs text-blue-800">
                                                <strong>Note:</strong> Present this QR code at the event entrance for check-in
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="p-8 text-center">
                            <p className="text-gray-500">No tickets found for this booking</p>
                        </Card>
                    )}
                </div>

                {/* Payment Summary */}
                <Card className="p-6 shadow-lg print:page-break-before">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>NPR {booking.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Platform Fee</span>
                            <span>NPR {booking.platformFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax (13%)</span>
                            <span>NPR {booking.tax.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-gray-900">
                            <span>Grand Total</span>
                            <span>NPR {booking.grandTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Payment Status</span>
                            <span className="font-semibold text-green-600">{booking.paymentStatus}</span>
                        </div>
                    </div>
                </Card>

                {/* Contact Info */}
                <Card className="mt-6 p-6 bg-gray-50 border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Booking Contact</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{booking.contactEmail}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">{booking.contactPhone}</p>
                        </div>
                    </div>
                </Card>

                {/* Action Buttons - Hide on print */}
                <div className="mt-8 flex flex-col gap-3 print:hidden">
                    {tripId && (
                        <Button
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white h-14 text-lg font-bold shadow-lg"
                            onClick={() => navigate(`/trips/${tripId}`)}
                        >
                            🎯 Continue Planning Your Trip
                        </Button>
                    )}
                    <div className="flex gap-4">
                        <Button
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12"
                            onClick={handlePrint}
                        >
                            <Download size={18} className="mr-2" />
                            Print Tickets
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-12"
                            onClick={() => navigate('/')}
                        >
                            <Home size={18} className="mr-2" />
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .page-break-inside-avoid {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    .print\\:page-break-before {
                        page-break-before: always;
                        break-before: always;
                    }
                }
            `}</style>
        </div>
    );
}
