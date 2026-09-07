import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';

export interface EventCardData {
    id: number | string;
    imageUrl?: string;
    coverImage?: string; // Added backend field
    title: string;
    name?: string; // Added backend field
    description?: string;
    startDateTime: string;
    endDateTime?: string;
    venue?: {
        name: string;
    };
    totalCapacity?: number;
    availableSeats?: number;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    category?: string;
}

interface EventCardProps {
    event: EventCardData;
    featured?: boolean;
}

/**
 * EventCard Component
 * Reusable card component for displaying event information
 */
const EventCard: React.FC<EventCardProps> = ({ event, featured = false }) => {
    const navigate = useNavigate();

    // Handle field mismatches between frontend interface and backend entity
    const displayTitle = event.title || event.name || 'Untitled Event';
    const displayImage = event.imageUrl || event.coverImage || '/api/placeholder/400/300';

    const location = useLocation();

    // Ensure ID is valid for navigation
    const handleNavigation = (path: string) => {
        if (event.id) {
            const params = new URLSearchParams(location.search);
            const tripId = params.get('tripId');
            navigate(`${path}${tripId ? `?tripId=${tripId}` : ''}`);
        } else {
            console.error('Event ID is missing');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Date TBA';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return 'Time TBA';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleClick = () => {
        handleNavigation(`/events/${event.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className={`
                bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800 overflow-hidden cursor-pointer
                transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:border-indigo-500/50 group
                ${featured ? 'border-2 border-indigo-500' : ''}
            `}
        >
            {/* Event Image */}
            <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                    src={displayImage}
                    alt={displayTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {featured && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow">
                        Featured
                    </div>
                )}
                {event.category && (
                    <div className="absolute top-2 left-2 bg-slate-950/75 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-white/10">
                        {event.category}
                    </div>
                )}
            </div>

            {/* Event Details */}
            <div className="p-5">
                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {displayTitle}
                </h3>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {event.description}
                </p>

                {/* Event Info */}
                <div className="space-y-2">
                    {/* Date & Time */}
                    <div className="flex items-center text-slate-700 dark:text-slate-300 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                        <span>
                            {formatDate(event.startDateTime)}
                            {event.endDateTime && ` - ${formatDate(event.endDateTime)}`}
                        </span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center text-slate-700 dark:text-slate-300 text-sm">
                        <span className="ml-6">{formatTime(event.startDateTime)}</span>
                    </div>

                    {/* Location */}
                    {event.venue && (
                        <div className="flex items-center text-slate-700 dark:text-slate-300 text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-red-500 dark:text-red-400" />
                            <span className="line-clamp-1">{event.venue.name}</span>
                        </div>
                    )}

                    {/* Capacity */}
                    {event.totalCapacity && (
                        <div className="flex items-center text-slate-700 dark:text-slate-300 text-sm">
                            <Users className="w-4 h-4 mr-2 text-emerald-500 dark:text-emerald-400" />
                            <span>
                                {event.availableSeats || event.totalCapacity} / {event.totalCapacity} seats
                            </span>
                        </div>
                    )}

                    {/* Price Range */}
                    {event.minPrice !== undefined && (
                        <div className="flex items-center text-slate-900 dark:text-white font-semibold text-sm mt-3">
                            <Tag className="w-4 h-4 mr-2 text-amber-500" />
                            <span>
                                From ${event.minPrice}
                                {event.maxPrice && event.maxPrice !== event.minPrice && ` - $${event.maxPrice}`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Status Badge & Button */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span
                        className={`
                            px-3 py-1 rounded-full text-xs font-semibold
                            ${event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300 dark:border dark:border-green-800/50' : ''}
                            ${event.status === 'DRAFT' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-700' : ''}
                            ${event.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 dark:border dark:border-red-800/50' : ''}
                            ${event.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 dark:border dark:border-blue-800/50' : ''}
                            ${!event.status ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' : ''}
                        `}
                    >
                        {event.status || 'Available'}
                    </span>

                    {/* Book Now Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event.id}`);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
