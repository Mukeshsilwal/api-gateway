import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import eventService from '../services/eventService';

interface TicketType {
    id: number;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    quantitySold?: number;
}

interface Venue {
    name: string;
    city?: string;
    country?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    capacity?: number;
}

interface EventData {
    id: number | string;
    name: string;
    category: string;
    coverImage?: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    venue?: Venue;
    type: 'OFFLINE' | 'ONLINE' | 'HYBRID';
    onlineLink?: string;
    ticketTypes?: TicketType[];
}

export function EventDetails() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId]);

    useEffect(() => {
        calculateTotal();
    }, [selectedTickets]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            if (eventId) {
                const response = await eventService.getEventById(eventId);
                const eventData = response.data || response;

                // Fetch ticket types separately if not included
                try {
                    const ticketsResponse = await eventService.getEventTickets(eventId);
                    const ticketsData = ticketsResponse.data || ticketsResponse;
                    eventData.ticketTypes = Array.isArray(ticketsData) ? ticketsData : ticketsData.content || [];
                } catch (ticketError) {
                    console.error('Error fetching tickets:', ticketError);
                    eventData.ticketTypes = [];
                }

                setEvent(eventData);
            }
        } catch (error) {
            console.error('Error fetching event:', error);
            toast.error('Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!event) return;

        let total = 0;
        Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
            const ticket = event.ticketTypes?.find(t => t.id === parseInt(ticketTypeId));
            if (ticket) {
                total += ticket.price * quantity;
            }
        });
        setTotalAmount(total);
    };

    const handleTicketQuantityChange = (ticketTypeId: number, change: number) => {
        if (!event || !event.ticketTypes) return;
        const ticket = event.ticketTypes.find(t => t.id === ticketTypeId);
        if (!ticket) return;

        const currentQuantity = selectedTickets[ticketTypeId] || 0;
        const available = ticket.quantity - (ticket.quantitySold || 0);
        const newQuantity = Math.max(0, Math.min(currentQuantity + change, available));

        setSelectedTickets(prev => ({
            ...prev,
            [ticketTypeId]: newQuantity
        }));
    };

    const handleBookNow = () => {
        const hasTickets = Object.values(selectedTickets).some(q => q > 0);
        if (!hasTickets) {
            toast.error('Please select at least one ticket');
            return;
        }

        // Navigate to booking page with selected tickets
        navigate(`/events/${eventId}/book`, {
            state: {
                event,
                selectedTickets
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-20">
                    <div className="animate-pulse">
                        <div className="h-96 bg-gray-200 rounded-2xl mb-8"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                            <div className="h-96 bg-gray-200 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Not Found</h1>
                    <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => navigate('/events')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
                    >
                        Browse All Events
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const { name, category, coverImage, description, startDateTime, endDateTime, venue, type, onlineLink, ticketTypes = [] } = event;
    const eventDate = new Date(startDateTime);
    const eventEndDate = new Date(endDateTime);
    const availableTickets = ticketTypes.reduce((sum, t) => sum + (t.quantity - (t.quantitySold || 0)), 0);
    const minPrice = ticketTypes.length > 0 ? Math.min(...ticketTypes.map(t => t.price)) : 0;

    const categoryColors: { [key: string]: string } = {
        MUSIC: 'bg-purple-500',
        SPORTS: 'bg-green-500',
        CONFERENCE: 'bg-blue-500',
        WORKSHOP: 'bg-yellow-500',
        EXHIBITION: 'bg-pink-500',
        FESTIVAL: 'bg-red-500',
        THEATER: 'bg-indigo-500',
        COMEDY: 'bg-orange-500',
        OTHER: 'bg-gray-500'
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Image Section */}
            <div className="relative h-96 overflow-hidden">
                <img
                    src={coverImage || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200'}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="container mx-auto">
                        <div className={`inline-block ${categoryColors[category] || 'bg-gray-500'} text-white px-4 py-2 rounded-full text-sm font-semibold mb-4`}>
                            {category}
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-4">{name}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-white">
                            <div className="flex items-center gap-2">
                                <Calendar size={20} />
                                <span>{eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={20} />
                                <span>{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {venue && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={20} />
                                    <span>{venue.city}, {venue.country}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Event Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{description}</p>
                        </div>

                        {/* Venue Information */}
                        {venue && type !== 'ONLINE' && (
                            <div className="bg-white rounded-2xl p-8 shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Venue</h2>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold text-gray-800">{venue.name}</h3>
                                    <p className="text-gray-600">
                                        {venue.address?.street}<br />
                                        {venue.address?.city}, {venue.address?.state} {venue.address?.postalCode}<br />
                                        {venue.address?.country}
                                    </p>
                                    {venue.capacity && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Users size={18} />
                                            <span>Capacity: {venue.capacity} people</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Online Event Details */}
                        {type !== 'OFFLINE' && onlineLink && (
                            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Online Event</h2>
                                <p className="text-gray-700 mb-4">
                                    This is an {type === 'HYBRID' ? 'hybrid' : 'online'} event. You'll receive the event link after booking.
                                </p>
                                <div className="flex items-center gap-2 text-blue-600">
                                    <CheckCircle size={18} />
                                    <span>Join from anywhere</span>
                                </div>
                            </div>
                        )}

                        {/* Event Schedule */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule</h2>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-gray-600">Starts:</span>
                                    <span className="ml-2 font-semibold text-gray-900">
                                        {eventDate.toLocaleString('en-US', {
                                            dateStyle: 'full',
                                            timeStyle: 'short'
                                        })}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Ends:</span>
                                    <span className="ml-2 font-semibold text-gray-900">
                                        {eventEndDate.toLocaleString('en-US', {
                                            dateStyle: 'full',
                                            timeStyle: 'short'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Booking Widget (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                            {/* Price Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                                <div className="text-sm opacity-90">Starting from</div>
                                <div className="text-4xl font-bold">
                                    {minPrice > 0 ? `NPR ${minPrice.toLocaleString()}` : 'FREE'}
                                </div>
                                {availableTickets > 0 && (
                                    <div className="mt-2 text-sm opacity-90">
                                        {availableTickets} tickets available
                                    </div>
                                )}
                            </div>

                            {/* Ticket Selection */}
                            <div className="p-6 space-y-4">
                                <h3 className="font-bold text-gray-900 text-lg mb-4">Select Tickets</h3>

                                {ticketTypes.map((ticket) => {
                                    const available = ticket.quantity - (ticket.quantitySold || 0);
                                    const selected = selectedTickets[ticket.id] || 0;

                                    return (
                                        <div key={ticket.id} className="border border-gray-200 rounded-xl p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                                                    {ticket.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-purple-600">
                                                        NPR {ticket.price.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {available} left
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quantity Selector */}
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-sm text-gray-600">Quantity:</span>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleTicketQuantityChange(ticket.id, -1)}
                                                        disabled={selected === 0}
                                                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-semibold">{selected}</span>
                                                    <button
                                                        onClick={() => handleTicketQuantityChange(ticket.id, 1)}
                                                        disabled={selected >= available}
                                                        className="w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Total */}
                                {totalAmount > 0 && (
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <div className="flex justify-between items-center text-lg font-bold">
                                            <span>Total:</span>
                                            <span className="text-purple-600">NPR {totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Book Now Button */}
                                <button
                                    onClick={handleBookNow}
                                    disabled={availableTickets === 0}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {availableTickets === 0 ? 'Sold Out' : 'Proceed to Checkout'}
                                </button>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs text-gray-600">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle size={16} className="text-green-500 mb-1" />
                                        <span>Secure Payment</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <CheckCircle size={16} className="text-green-500 mb-1" />
                                        <span>Instant Delivery</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <CheckCircle size={16} className="text-green-500 mb-1" />
                                        <span>24/7 Support</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default EventDetails;
