import React from 'react';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

/**
 * EventCard Component
 * Displays event information in a beautiful card format with lazy-loaded images
 */
export function EventCard({ event }) {
    const navigate = useNavigate();

    const {
        id,
        name,
        category,
        coverImage,
        shortDescription,
        startDateTime,
        venue,
        ticketTypes = [],
        status
    } = event;

    // Calculate min price from ticket types
    const minPrice = ticketTypes.length > 0
        ? Math.min(...ticketTypes.map(t => t.price))
        : 0;

    // Calculate available tickets
    const availableTickets = ticketTypes.reduce((sum, t) => sum + (t.quantity - (t.quantitySold || 0)), 0);

    // Format date
    const eventDate = new Date(startDateTime);
    const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = eventDate.getDate();

    // Category colors
    const categoryColors = {
        MUSIC: 'bg-purple-500',
        SPORTS: 'bg-green-500',
        CONFERENCE: 'bg-blue-500',
        WORKSHOP: 'bg-yellow-500',
        EXHIBITION: 'bg-pink-500',
        FESTIVAL: 'bg-red-500',
        THEATER: 'bg-indigo-500',
        COMEDY: 'bg-purple-500',
        OTHER: 'bg-gray-500'
    };

    const categoryColor = categoryColors[category] || 'bg-gray-500';

    const handleClick = () => {
        navigate(`/events/${id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
        >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
                <LazyLoadImage
                    src={coverImage || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop'}
                    alt={name}
                    effect="blur"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3C/svg%3E"
                    threshold={100}
                    loading="lazy"
                />

                {/* Category Badge */}
                <div className={`absolute top-3 left-3 ${categoryColor} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                    {category}
                </div>

                {/* Date Badge */}
                <div className="absolute top-3 right-3 bg-white rounded-xl overflow-hidden text-center shadow-lg">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1">
                        <span className="text-xs font-bold">{month}</span>
                    </div>
                    <div className="px-3 py-1">
                        <span className="text-2xl font-bold text-gray-900">{day}</span>
                    </div>
                </div>

                {/* Status Badge */}
                {status === 'SOLD_OUT' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-6 py-2 rounded-full font-bold text-lg">
                            SOLD OUT
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                    {shortDescription || 'An amazing event you don\'t want to miss!'}
                </p>

                {/* Event Meta */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-purple-500" />
                        <span className="line-clamp-1">{venue?.city || 'Kathmandu'}, {venue?.country || 'Nepal'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-purple-500" />
                        <span>{eventDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        {availableTickets > 0 ? (
                            <div className="flex items-center gap-1">
                                <Ticket size={14} className="text-green-500" />
                                <span className="text-sm font-medium text-green-600">
                                    {availableTickets} tickets left
                                </span>
                            </div>
                        ) : status !== 'SOLD_OUT' ? (
                            <span className="text-sm text-gray-500">Check availability</span>
                        ) : (
                            <span className="text-sm font-medium text-red-600">Sold Out</span>
                        )}
                    </div>

                    <div className="text-right">
                        {minPrice > 0 ? (
                            <>
                                <div className="text-xs text-gray-500">From</div>
                                <div className="text-lg font-bold text-purple-600">
                                    NPR {minPrice.toLocaleString()}
                                </div>
                            </>
                        ) : (
                            <div className="text-lg font-bold text-green-600">FREE</div>
                        )}
                    </div>
                </div>

                {/* Hover Button */}
                <button className="mt-4 w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:shadow-lg">
                    Book Now →
                </button>
            </div>
        </div>
    );
}

export default EventCard;
