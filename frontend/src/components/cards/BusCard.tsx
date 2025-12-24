import { BusDto } from '../../types/dto';
import { Bus, Clock, MapPin, Users, DollarSign } from 'lucide-react';

interface BusCardProps {
    bus: BusDto;
    onSelect?: (busId: number) => void;
    onViewSeats?: (busId: number) => void;
}

/**
 * Bus Card Component
 * Displays bus information using BusDto
 */
const BusCard: React.FC<BusCardProps> = ({ bus, onSelect, onViewSeats }) => {
    const formatTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const availableSeats = bus.seats?.filter(seat => seat.status === 'AVAILABLE').length || 0;
    const totalSeats = bus.numberOfSeats || bus.seats?.length || 0;

    const handleSelectClick = () => {
        onSelect?.(bus.routeId);
    };

    const handleViewSeatsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onViewSeats?.(bus.routeId);
    };

    return (
        <div
            onClick={handleSelectClick}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-blue-300"
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Bus className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{bus.busName}</h3>
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${bus.busType === 'AC'
                                    ? 'bg-blue-100 text-blue-700'
                                    : bus.busType === 'Deluxe'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-gray-100 text-gray-700'
                                }`}>
                                {bus.busType}
                            </span>
                        </div>
                    </div>

                    {/* Date Badge */}
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Travel Date</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {formatDate(bus.date)}
                        </div>
                    </div>
                </div>

                {/* Route Info */}
                {bus.routeDto && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-green-600" />
                                <div>
                                    <div className="text-xs text-gray-500">From</div>
                                    <div className="font-semibold text-gray-900">{bus.routeDto.origin}</div>
                                </div>
                            </div>

                            <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-300"></div>

                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-red-600" />
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">To</div>
                                    <div className="font-semibold text-gray-900">{bus.routeDto.destination}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Departure Time & Seats */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-blue-600" />
                            <div>
                                <div className="text-xs text-gray-500">Departure</div>
                                <div className="font-semibold text-gray-900">
                                    {formatTime(bus.departureDateTime)}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Users size={18} className="text-purple-600" />
                            <div>
                                <div className="text-xs text-gray-500">Available</div>
                                <div className={`font-semibold ${availableSeats > 10
                                        ? 'text-green-600'
                                        : availableSeats > 0
                                            ? 'text-orange-600'
                                            : 'text-red-600'
                                    }`}>
                                    {availableSeats}/{totalSeats} seats
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <DollarSign size={14} />
                            <span>Price Range</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            NPR {bus.basePrice.toLocaleString()}
                            {bus.maxPrice > bus.basePrice && (
                                <span className="text-sm font-normal text-gray-500">
                                    {' '}- {bus.maxPrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleViewSeatsClick}
                        disabled={availableSeats === 0}
                        className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${availableSeats === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                            }`}
                    >
                        {availableSeats === 0 ? 'Sold Out' : 'Select Seats'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusCard;
