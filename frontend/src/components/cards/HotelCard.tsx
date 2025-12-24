import { HotelDto } from '../../types/dto';
import { Star, MapPin, Users, Wifi, Coffee, Car } from 'lucide-react';

interface HotelCardProps {
    hotel: HotelDto;
    onBook?: (hotelId: number) => void;
    onViewDetails?: (hotelId: number) => void;
}

/**
 * Hotel Card Component
 * Displays hotel information using HotelDto
 */
const HotelCard: React.FC<HotelCardProps> = ({ hotel, onBook, onViewDetails }) => {
    const amenityIcons: Record<string, React.ReactNode> = {
        'WiFi': <Wifi size={16} />,
        'Parking': <Car size={16} />,
        'Restaurant': <Coffee size={16} />,
    };

    const handleBookClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onBook?.(hotel.id);
    };

    const handleCardClick = () => {
        onViewDetails?.(hotel.id);
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
        >
            {/* Image Carousel */}
            <div className="relative h-48 overflow-hidden">
                {hotel.images && hotel.images.length > 0 ? (
                    <img
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">
                            {hotel.name.charAt(0)}
                        </span>
                    </div>
                )}

                {/* Rating Badge */}
                {hotel.rating && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{hotel.rating.toFixed(1)}</span>
                    </div>
                )}

                {/* Availability Indicator */}
                {hotel.availableRooms !== undefined && (
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${hotel.availableRooms > 5
                            ? 'bg-green-500 text-white'
                            : hotel.availableRooms > 0
                                ? 'bg-orange-500 text-white'
                                : 'bg-red-500 text-white'
                        }`}>
                        {hotel.availableRooms > 0
                            ? `${hotel.availableRooms} rooms left`
                            : 'Sold out'}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Hotel Name & Location */}
                <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                        {hotel.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <MapPin size={14} />
                        <span className="line-clamp-1">{hotel.city}, {hotel.country}</span>
                    </div>
                </div>

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
                            >
                                {amenityIcons[amenity] || <Users size={14} />}
                                <span>{amenity}</span>
                            </div>
                        ))}
                        {hotel.amenities.length > 4 && (
                            <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                +{hotel.amenities.length - 4} more
                            </div>
                        )}
                    </div>
                )}

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                        <div className="text-xs text-gray-500">Starting from</div>
                        <div className="text-2xl font-bold text-gray-900">
                            NPR {hotel.startingPrice.toLocaleString()}
                            <span className="text-sm font-normal text-gray-500">/night</span>
                        </div>
                    </div>

                    <button
                        onClick={handleBookClick}
                        disabled={hotel.availableRooms === 0}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${hotel.availableRooms === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                            }`}
                    >
                        {hotel.availableRooms === 0 ? 'Sold Out' : 'Book Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HotelCard;
