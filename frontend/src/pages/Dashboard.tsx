/**
 * User Dashboard Page
 * Demonstrates the new API integration with React Query hooks
 */

import { useDashboard } from '@/hooks/auth/useAuth';
import { useBookings } from '@/hooks/booking/useBooking';

export const Dashboard = () => {
    // Get user data from localStorage
    const userDataStr = localStorage.getItem('userData');
    const userData = userDataStr ? JSON.parse(userDataStr) : null;

    // Fetch dashboard data using React Query
    const { data: dashboard, isLoading, error } = useDashboard(
        userData?.email || '',
        userData?.id || 0
    );

    // Fetch user bookings
    const { data: bookings } = useBookings(userData?.id || 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600">
                    <h2 className="text-xl font-bold">Error loading dashboard</h2>
                    <p>{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">
                Welcome, {dashboard?.userProfile.fullName}!
            </h1>

            {/* Booking Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Total Bookings</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {dashboard?.bookingSummary.totalBookings || 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Active</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {dashboard?.bookingSummary.activeBookings || 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
                    <p className="text-3xl font-bold text-gray-600">
                        {dashboard?.bookingSummary.completedBookings || 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Cancelled</h3>
                    <p className="text-3xl font-bold text-red-600">
                        {dashboard?.bookingSummary.cancelledBookings || 0}
                    </p>
                </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Active Sessions</h2>
                {dashboard?.activeSessions && dashboard.activeSessions.length > 0 ? (
                    <div className="space-y-3">
                        {dashboard.activeSessions.map((session) => (
                            <div
                                key={session.sessionId}
                                className={`p-4 rounded border ${session.current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{session.ipAddress}</p>
                                        <p className="text-sm text-gray-600">{session.userAgent}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Last active: {new Date(session.lastActivity).toLocaleString()}
                                        </p>
                                    </div>
                                    {session.current && (
                                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                            Current
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No active sessions</p>
                )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
                {bookings && bookings.length > 0 ? (
                    <div className="space-y-3">
                        {bookings.slice(0, 5).map((booking) => (
                            <div key={booking.id} className="p-4 rounded border border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{booking.bookingType}</p>
                                        <p className="text-sm text-gray-600">
                                            Booking ID: #{booking.id}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(booking.bookingDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">
                                            {booking.currency} {booking.totalAmount}
                                        </p>
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${booking.status === 'CONFIRMED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : booking.status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No bookings yet</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
