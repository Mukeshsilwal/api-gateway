import React from 'react';
import { Bus, Hotel, Calendar, CheckCircle, Clock, XCircle, MapPin, Tag } from 'lucide-react';

interface BookingCardProps {
    booking: any;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
    const { bookingType, status, amount, bookingDate, details, bookingReference } = booking;

    const getIcon = () => {
        switch (bookingType) {
            case 'BUS': return <Bus className="w-5 h-5 text-blue-500" />;
            case 'HOTEL': return <Hotel className="w-5 h-5 text-purple-500" />;
            case 'EVENT': return <Calendar className="w-5 h-5 text-orange-500" />;
            default: return <Tag className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Helper to render specific details based on type
    const renderDetails = () => {
        if (!details) return null;

        // Note: 'details' might be a JSON string or object depending on backend serialization
        // Assuming it's an object for now, or we might need to parse it if it comes as string
        const data = typeof details === 'string' ? JSON.parse(details) : details;

        switch (bookingType) {
            case 'BUS':
                return (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{data.operatorName || 'Bus Operator'}</span>
                            <span>•</span>
                            <span>{data.busType || 'Standard'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>{data.source} → {data.destination}</span>
                        </div>
                        <div>Seats: {data.seatNumbers ? data.seatNumbers.join(', ') : 'N/A'}</div>
                    </div>
                );
            case 'HOTEL':
                return (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                        <div className="font-medium text-gray-900 dark:text-white">{data.hotelName || 'Hotel Name'}</div>
                        <div>Room: {data.roomType || 'Standard'}</div>
                        <div className="flex gap-4">
                            <div>Check-in: {data.checkIn ? new Date(data.checkIn).toLocaleDateString() : 'N/A'}</div>
                            <div>Check-out: {data.checkOut ? new Date(data.checkOut).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    </div>
                );
            case 'EVENT':
                return (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                        <div className="font-medium text-gray-900 dark:text-white">{data.eventName || 'Event Name'}</div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>{data.location || 'Location'}</span>
                        </div>
                        <div>Tickets: {data.ticketCount || 1} x {data.ticketType || 'General'}</div>
                    </div>
                );
            default:
                return <p className="text-sm text-gray-500">No additional details</p>;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {getIcon()}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                            {bookingType === 'BUS' ? 'Bus Ticket' :
                                bookingType === 'HOTEL' ? 'Hotel Booking' :
                                    bookingType === 'EVENT' ? 'Event Ticket' : 'Booking'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ref: {bookingReference}</p>
                    </div>
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
                    {status}
                </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 py-3">
                {renderDetails()}
            </div>

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Booked on {formatDate(bookingDate)}
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                    NPR {amount?.toLocaleString()}
                </div>
            </div>
        </div>
    );
};

export default BookingCard;
