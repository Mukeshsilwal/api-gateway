import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';

/**
 * EventCard Component
 * Reusable card component for displaying event information
 */
const EventCard = ({ event, featured = false }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleClick = () => {
        navigate(`/events/${event.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className={`
                bg-white rounded-lg shadow-md overflow-hidden cursor-pointer
                transform transition-all duration-300 hover:scale-105 hover:shadow-xl
                ${featured ? 'border-2 border-blue-500' : ''}
            `}
        >
            {/* Event Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={event.imageUrl || '/api/placeholder/400/300'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                {featured && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                    </div>
                )}
                {event.category && (
                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                        {event.category}
                    </div>
                )}
            </div>

            {/* Event Details */}
            <div className="p-4">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                </p>

                {/* Event Info */}
                <div className="space-y-2">
                    {/* Date & Time */}
                    <div className="flex items-center text-gray-700 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        <span>
                            {formatDate(event.startDateTime)}
                            {event.endDateTime && ` - ${formatDate(event.endDateTime)}`}
                        </span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center text-gray-700 text-sm">
                        <span className="ml-6">{formatTime(event.startDateTime)}</span>
                    </div>

                    {/* Location */}
                    {event.venue && (
                        <div className="flex items-center text-gray-700 text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-red-500" />
                            <span className="line-clamp-1">{event.venue.name}</span>
                        </div>
                    )}

                    {/* Capacity */}
                    {event.totalCapacity && (
                        <div className="flex items-center text-gray-700 text-sm">
                            <Users className="w-4 h-4 mr-2 text-green-500" />
                            <span>
                                {event.availableSeats || event.totalCapacity} / {event.totalCapacity} seats
                            </span>
                        </div>
                    )}

                    {/* Price Range */}
                    {event.minPrice !== undefined && (
                        <div className="flex items-center text-gray-900 font-semibold text-sm mt-3">
                            <Tag className="w-4 h-4 mr-2 text-yellow-500" />
                            <span>
                                From ${event.minPrice}
                                {event.maxPrice && event.maxPrice !== event.minPrice && ` - $${event.maxPrice}`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex items-center justify-between">
                    <span
                        className={`
                            px-3 py-1 rounded-full text-xs font-semibold
                            ${event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : ''}
                            ${event.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : ''}
                            ${event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                            ${event.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : ''}
                        `}
                    >
                        {event.status || 'Available'}
                    </span>

                    {/* Book Now Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event.id}/book`);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
