import { BookingResponseDto } from '../../types/dto';
import { CheckCircle, Clock, CreditCard, Calendar, MapPin } from 'lucide-react';

interface BookingTimelineProps {
    booking: BookingResponseDto;
}

/**
 * Booking Timeline Component
 * Displays booking status and timeline using BookingResponseDto
 */
const BookingTimeline: React.FC<BookingTimelineProps> = ({ booking }) => {
    const steps = [
        {
            id: 1,
            title: 'Booking Confirmed',
            status: 'completed',
            icon: CheckCircle,
            timestamp: new Date().toISOString(), // Would come from booking.createdAt
        },
        {
            id: 2,
            title: 'Payment',
            status: booking.paymentStatus === 'PAID' ? 'completed' : 'current',
            icon: CreditCard,
            description: booking.paymentStatus === 'PAID' ? 'Payment successful' : 'Payment pending',
        },
        {
            id: 3,
            title: 'Check-in',
            status: booking.paymentStatus === 'PAID' ? 'pending' : 'disabled',
            icon: Calendar,
            timestamp: booking.checkIn,
        },
        {
            id: 4,
            title: 'Check-out',
            status: 'pending',
            icon: MapPin,
            timestamp: booking.checkOut,
        },
    ];

    const getStepColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500 text-white';
            case 'current':
                return 'bg-blue-500 text-white animate-pulse';
            case 'pending':
                return 'bg-gray-200 text-gray-400';
            default:
                return 'bg-gray-100 text-gray-300';
        }
    };

    const getLineColor = (currentStatus: string, nextStatus: string) => {
        if (currentStatus === 'completed') return 'bg-green-500';
        if (currentStatus === 'current') return 'bg-gradient-to-r from-green-500 to-gray-200';
        return 'bg-gray-200';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Status</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Reference:</span>
                    <span className="font-mono font-semibold text-blue-600">{booking.bookingReference}</span>
                </div>
            </div>

            {/* Booking Details Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-gray-600 mb-1">Hotel</div>
                        <div className="font-semibold text-gray-900">{booking.hotelName}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-600 mb-1">Room Type</div>
                        <div className="font-semibold text-gray-900">{booking.roomType}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-600 mb-1">Check-in</div>
                        <div className="font-semibold text-gray-900">{formatDate(booking.checkIn)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-600 mb-1">Check-out</div>
                        <div className="font-semibold text-gray-900">{formatDate(booking.checkOut)}</div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-100">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Amount</span>
                        <span className="text-xl font-bold text-blue-600">
                            NPR {booking.totalAmount.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.id} className="relative">
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getStepColor(step.status)}`}>
                                    <Icon size={20} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-8">
                                    <div className="font-semibold text-gray-900">{step.title}</div>
                                    {step.description && (
                                        <div className="text-sm text-gray-600 mt-1">{step.description}</div>
                                    )}
                                    {step.timestamp && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            <Clock size={12} className="inline mr-1" />
                                            {formatDate(step.timestamp)}
                                        </div>
                                    )}

                                    {/* Action Button for Current Step */}
                                    {step.status === 'current' && booking.paymentStatus === 'PENDING' && (
                                        <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold">
                                            Complete Payment
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Connecting Line */}
                            {!isLast && (
                                <div
                                    className={`absolute left-6 top-12 w-0.5 h-full -ml-px ${getLineColor(step.status, steps[index + 1].status)}`}
                                    style={{ height: '100%' }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Status Badge */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Booking Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}>
                        {booking.status}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BookingTimeline;
