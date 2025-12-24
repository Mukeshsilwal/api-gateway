import { Calendar, MapPin, Users, Clock, Trash2 } from 'lucide-react';
import { CartItem as CartItemType, BookingServiceType } from '../../types/unifiedBooking';

interface CartItemProps {
    item: CartItemType;
    onRemove: (itemId: string) => void;
}

/**
 * Cart Item Component
 * Displays individual booking item in cart with service-specific details
 */
export const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
    const getServiceIcon = (type: BookingServiceType) => {
        switch (type) {
            case 'EVENT':
                return '🎫';
            case 'HOTEL':
                return '🏨';
            case 'BUS':
                return '🚌';
            default:
                return '📦';
        }
    };

    const getServiceColor = (type: BookingServiceType) => {
        switch (type) {
            case 'EVENT':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'HOTEL':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'BUS':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{getServiceIcon(item.type)}</span>
                    <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getServiceColor(item.type)}`}>
                            {item.type}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => onRemove(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    aria-label="Remove item"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Item Name */}
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {item.name}
            </h3>

            {/* Service-Specific Details */}
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-3">
                {/* Event Details */}
                {item.type === 'EVENT' && (
                    <>
                        {item.metadata.eventDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(item.metadata.eventDate).toLocaleDateString()}</span>
                            </div>
                        )}
                        {item.metadata.eventLocation && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{item.metadata.eventLocation}</span>
                            </div>
                        )}
                        {item.metadata.ticketType && item.metadata.quantity && (
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{item.metadata.quantity}x {item.metadata.ticketType}</span>
                            </div>
                        )}
                    </>
                )}

                {/* Hotel Details */}
                {item.type === 'HOTEL' && (
                    <>
                        {item.metadata.checkIn && item.metadata.checkOut && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {new Date(item.metadata.checkIn).toLocaleDateString()} - {new Date(item.metadata.checkOut).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {item.metadata.roomType && (
                            <div className="flex items-center gap-2">
                                <span>🛏️</span>
                                <span>{item.metadata.roomType}</span>
                            </div>
                        )}
                        {item.metadata.guests && (
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{item.metadata.guests} {item.metadata.guests === 1 ? 'guest' : 'guests'}</span>
                            </div>
                        )}
                        {item.metadata.nights && (
                            <div className="text-xs text-gray-500">
                                {item.metadata.nights} {item.metadata.nights === 1 ? 'night' : 'nights'}
                            </div>
                        )}
                    </>
                )}

                {/* Bus Details */}
                {item.type === 'BUS' && (
                    <>
                        {item.metadata.from && item.metadata.to && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{item.metadata.from} → {item.metadata.to}</span>
                            </div>
                        )}
                        {item.metadata.departureTime && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(item.metadata.departureTime).toLocaleString()}</span>
                            </div>
                        )}
                        {item.metadata.seatNumbers && item.metadata.seatNumbers.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span>💺</span>
                                <span>Seats: {item.metadata.seatNumbers.join(', ')}</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    NPR {item.amount.toLocaleString()}
                </span>
            </div>
        </div>
    );
};

export default CartItem;
