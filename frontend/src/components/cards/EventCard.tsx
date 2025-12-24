import { EventCardDto } from '../../types/event-dto';
import { Calendar, MapPin, Users, Tag, TrendingUp } from 'lucide-react';

interface EventCardProps {
    event: EventCardDto;
    onBook?: (eventId: number) => void;
    onViewDetails?: (eventId: number) => void;
}

/**
 * Event Card Component
 * Displays event information using EventCardDto
 */
const EventCard: React.FC<EventCardProps> = ({ event, onBook, onViewDetails }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'MUSIC': 'bg-purple-100 text-purple-700',
            'SPORTS': 'bg-green-100 text-green-700',
            'CONFERENCE': 'bg-blue-100 text-blue-700',
            'WORKSHOP': 'bg-purple-100 text-purple-700',
            'FESTIVAL': 'bg-pink-100 text-pink-700',
            'EXHIBITION': 'bg-indigo-100 text-indigo-700',
            'THEATER': 'bg-red-100 text-red-700',
            'COMEDY': 'bg-yellow-100 text-yellow-700',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    const handleCardClick = () => {
        onViewDetails?.(event.id);
    };

    const handleBookClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onBook?.(event.id);
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                {event.coverImage ? (
                    <img
                        src={event.coverImage}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-5xl font-bold">
                            {event.name.charAt(0)}
                        </span>
                    </div>
                )}

                {/* Category Badge */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.category)}`}>
                    {event.category}
                </div>

                {/* Featured Badge */}
                {event.isFeatured && (
                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <TrendingUp size={12} />
                        Featured
                    </div>
                )}

                {/* Type Badge */}
                <div className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${event.type === 'ONLINE'
                        ? 'bg-blue-500 text-white'
                        : event.type === 'HYBRID'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-800 text-white'
                    }`}>
                    {event.type}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Event Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {event.name}
                </h3>

                {/* Organizer */}
                <div className="text-sm text-gray-600 mb-3">
                    by <span className="font-semibold">{event.organizerName}</span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <Calendar size={16} className="text-blue-600" />
                    <span>{formatDate(event.startDateTime)}</span>
                    <span className="text-gray-400">•</span>
                    <span>{formatTime(event.startDateTime)}</span>
                </div>

                {/* Location */}
                {event.venueName && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                        <MapPin size={16} className="text-red-600" />
                        <span className="line-clamp-1">{event.venueName}, {event.city}</span>
                    </div>
                )}

                {/* Price & Availability */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                        <div className="text-xs text-gray-500">Starting from</div>
                        <div className="text-xl font-bold text-gray-900">
                            NPR {event.minPrice.toLocaleString()}
                            {event.maxPrice > event.minPrice && (
                                <span className="text-sm font-normal text-gray-500">
                                    {' '}- {event.maxPrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                            <Users size={12} />
                            <span>{event.ticketsAvailable} left</span>
                        </div>
                        <button
                            onClick={handleBookClick}
                            disabled={event.ticketsAvailable === 0}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${event.ticketsAvailable === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                                }`}
                        >
                            {event.ticketsAvailable === 0 ? 'Sold Out' : 'Book Now'}
                        </button>
                    </div>
                </div>

                {/* Rating */}
                {event.rating && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        className={`w-4 h-4 ${star <= event.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-sm text-gray-600">{event.rating.toFixed(1)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard;
