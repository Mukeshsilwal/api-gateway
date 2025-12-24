import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import authService from '../services/authService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Calendar, MapPin, Clock, AlertCircle, Ticket, Bed } from 'lucide-react';

interface Booking {
    id: string;
    bookingDate?: string;
    createdAt?: string;
    status: string;
    totalAmount: number;
    type: 'HOTEL' | 'BUS' | 'EVENT' | 'PLANE';

    // Hotel specific
    hotelName?: string;
    roomType?: string;
    roomName?: string;
    checkInDate?: string;
    checkOutDate?: string;

    // Bus/Vehicle specific
    busName?: string;
    source?: string;
    destination?: string;
    departureDateTime?: string;
}

const MyBookings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = authService.getCurrentUser();
            if (!user) return; // Should be handled by ProtectedRoute usually

            let response: any;
            if (activeTab === 'upcoming') {
                response = await bookingService.getUpcomingBookings(0, 50);
            } else {
                response = await bookingService.getBookingHistory(0, 50);
            }

            // Handle paginated response or direct array
            const bookingsList: Booking[] = response.content || response.bookings || response || [];

            // Sort by date based on tab
            const sorted = [...bookingsList].sort((a, b) => {
                const dateStringA = a.bookingDate || a.createdAt || '';
                const dateStringB = b.bookingDate || b.createdAt || '';
                const dateA = new Date(dateStringA).getTime();
                const dateB = new Date(dateStringB).getTime();
                return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA;
            });

            setBookings(sorted);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
            setError("Failed to load your bookings. Please try again.");
            // Mock data for demo if API fails
            if (process.env.NODE_ENV === 'development') {
                const mockBookings: Booking[] = [
                    {
                        id: 'BK-MOCK-001',
                        bookingDate: new Date().toISOString(),
                        status: 'CONFIRMED',
                        totalAmount: 15000,
                        type: 'HOTEL',
                        hotelName: 'Hotel Himalaya',
                        roomType: 'Deluxe Suite',
                        checkInDate: '2025-01-10',
                        checkOutDate: '2025-01-15'
                    },
                    {
                        id: 'BK-MOCK-002',
                        bookingDate: new Date(Date.now() - 86400000).toISOString(),
                        status: 'COMPLETED',
                        totalAmount: 1200,
                        type: 'BUS',
                        busName: 'Greenline Tours',
                        source: 'Kathmandu',
                        destination: 'Pokhara',
                        departureDateTime: '2024-12-15T07:00:00'
                    }
                ];
                setBookings(mockBookings.filter(b => activeTab === 'upcoming' ? b.status === 'CONFIRMED' : b.status === 'COMPLETED'));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const tabs = [
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'history', label: 'Past Bookings' }
    ];

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                    <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        Book New Trip
                    </Link>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6 flex">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === tab.id
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error && bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-red-100">
                        <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Could not load bookings</h3>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <button onClick={fetchBookings} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Try Again
                        </button>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                        <div className="bg-gray-50 text-gray-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Ticket size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No {activeTab} bookings</h3>
                        <p className="text-gray-500 mb-6">You don't have any bookings in this category yet.</p>
                        <Link to="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Start Exploring
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition hover:shadow-md">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                            <span className="text-sm text-gray-400">#{booking.id}</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {booking.type === 'HOTEL' ? booking.hotelName : booking.busName || 'Bus Trip'}
                                        </h3>

                                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                                            {booking.type === 'HOTEL' ? (
                                                <>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={16} className="text-gray-400" />
                                                        <span>{formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Bed size={16} className="text-gray-400" />
                                                        <span>{booking.roomType || booking.roomName || 'Standard Room'}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={16} className="text-gray-400" />
                                                        <span>{booking.source} → {booking.destination}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={16} className="text-gray-400" />
                                                        <span>{booking.departureDateTime ? new Date(booking.departureDateTime).toLocaleString() : 'N/A'}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                                            <p className="text-lg font-bold text-indigo-600">NPR {booking.totalAmount?.toLocaleString()}</p>
                                        </div>
                                        <button className="w-full mt-4 md:mt-0 text-sm font-medium text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MyBookings;
