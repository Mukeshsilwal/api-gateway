import React, { useMemo } from 'react';
import BookingCard from './BookingCard';
import { SearchSlash, TrendingUp } from 'lucide-react';

interface BookingListProps {
    bookings: any[];
}

const BookingList: React.FC<BookingListProps> = ({ bookings }) => {

    const totalCost = useMemo(() => {
        return bookings.reduce((sum, booking) => sum + (Number(booking.amount) || 0), 0);
    }, [bookings]);

    if (!bookings || bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <SearchSlash className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No bookings yet</p>
                <p className="text-sm">Book flights, hotels, or events to see them here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">Total Booking Value</p>
                        <h3 className="text-3xl font-bold">NPR {totalCost.toLocaleString()}</h3>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="mt-4 flex gap-4 text-sm text-blue-100">
                    <div className="bg-white/10 px-3 py-1 rounded-full">
                        {bookings.filter(b => b.bookingType === 'HOTEL').length} Hotels
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full">
                        {bookings.filter(b => b.bookingType === 'BUS').length} Bus Trips
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full">
                        {bookings.filter(b => b.bookingType === 'EVENT').length} Events
                    </div>
                </div>
            </div>

            {/* Bookings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking, index) => (
                    <BookingCard key={index} booking={booking} />
                ))}
            </div>
        </div>
    );
};

export default BookingList;
