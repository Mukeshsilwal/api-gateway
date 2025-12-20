import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Mail, Phone, Download, Share2, Home } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import eventService from '../services/eventService';

export function BookingConfirmation() {
    const { bookingReference } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingReference]);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const response = await eventService.getBookingDetails(bookingReference);
            setBooking(response.data || response);
        } catch (error) {
            console.error('Error fetching booking:', error);
            toast.error('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTickets = () => {
        toast.info('Downloading tickets... (Feature coming soon)');
        // TODO: Implement PDF download
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `My Booking - ${booking?.event?.name}`,
                text: `I've booked tickets for ${booking?.event?.name}!`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleAddToCalendar = () => {
        if (!booking?.event) return;

        const event = booking.event;
        const startDate = new Date(event.startDateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date(event.endDateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.venue?.name || '')}`;

        window.open(calendarUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading booking details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
                    <p className="text-gray-600 mb-6">We couldn't find a booking with reference: {bookingReference}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
                    >
                        Go to Homepage
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const { event, tickets = [], totalAmount, paymentStatus } = booking;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                {/* Success Header */}
                <div className="max-w-4xl mx-auto mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-600 text-lg">
                        Your booking has been confirmed and tickets have been sent to your email.
                    </p>
                    <div className="mt-4 inline-block bg-purple-100 px-6 py-3 rounded-xl">
                        <span className="text-sm text-purple-600 font-semibold">Booking Reference: </span>
                        <span className="text-lg font-bold text-purple-900">{bookingReference}</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Tickets */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Event Info */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Details</h2>
                            {event && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{event.name}</h3>
                                    <div className="space-y-2 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={18} className="text-purple-600" />
                                            <span>{new Date(event.startDateTime).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        </div>
                                        {event.venue && (
                                            <div className="flex items-center gap-2">
                                                <MapPin size={18} className="text-purple-600" />
                                                <span>{event.venue.name}, {event.venue.city}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tickets */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Tickets ({tickets.length})</h2>

                            <div className="space-y-4">
                                {tickets.map((ticket, index) => (
                                    <div key={index} className="border-2 border-purple-200 rounded-xl p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* QR Code */}
                                            <div className="flex-shrink-0">
                                                <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center p-2 border-2 border-gray-300">
                                                    {ticket.qrCode ? (
                                                        <img
                                                            src={ticket.qrCode}
                                                            alt="QR Code"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <QRCodeSVG
                                                            value={JSON.stringify({
                                                                bookingRef: bookingReference,
                                                                ticketId: ticket.ticketId || `TKT-${index + 1}`,
                                                                attendee: ticket.attendeeName || `Attendee ${index + 1}`,
                                                                event: event?.name || 'Event',
                                                                date: event?.startDateTime
                                                            })}
                                                            size={112}
                                                            level="H"
                                                            includeMargin={false}
                                                            className="w-full h-full"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Ticket Details */}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {ticket.attendeeName || `Ticket ${index + 1}`}
                                                        </h3>
                                                        <p className="text-sm text-purple-600 font-semibold">
                                                            {ticket.ticketType}
                                                        </p>
                                                    </div>
                                                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                        VALID
                                                    </div>
                                                </div>

                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <p><strong>Ticket ID:</strong> {ticket.ticketId}</p>
                                                    {ticket.seatNumber && (
                                                        <p><strong>Seat:</strong> {ticket.seatNumber}</p>
                                                    )}
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-gray-300">
                                                    <p className="text-xs text-gray-500">
                                                        Present this QR code at the venue entrance
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Important Information */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Information</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>Please arrive at least 30 minutes before the event starts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>Carry a valid ID for verification at the venue</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>Screenshots of QR codes are accepted</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>Tickets are non-transferable and non-refundable</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column - Actions & Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>

                            <div className="space-y-3">
                                <button
                                    onClick={handleDownloadTickets}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    <Download size={18} />
                                    Download Tickets
                                </button>

                                <button
                                    onClick={handleAddToCalendar}
                                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
                                >
                                    <Calendar size={18} />
                                    Add to Calendar
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                                >
                                    <Share2 size={18} />
                                    Share
                                </button>

                                <button
                                    onClick={() => navigate('/my-bookings')}
                                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                                >
                                    <Home size={18} />
                                    View My Bookings
                                </button>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>

                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="font-semibold">NPR {totalAmount?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Status</span>
                                    <span className={`font-semibold ${paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {paymentStatus || 'COMPLETED'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                    <CheckCircle size={16} />
                                    <span className="font-semibold">Payment Successful</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Support */}
                        <div className="bg-gray-100 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Need Help?</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} />
                                    <span>support@ticketkatum.com</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={14} />
                                    <span>+977 98XXXXXXXX</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="max-w-4xl mx-auto mt-8 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-purple-600 hover:text-purple-700 font-semibold"
                    >
                        ← Back to Homepage
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default BookingConfirmation;
