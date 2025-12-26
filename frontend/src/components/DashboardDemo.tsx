import React, { useState, useEffect } from 'react';
import webBffService from '../services/webBffService';

const DashboardDemo = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [criticalError, setCriticalError] = useState(null);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                // Smart agent call: Handles retries, caching, and mapping internally
                const data = await webBffService.getDashboardData();
                setDashboardData(data);
                setCriticalError(null);
            } catch (err) {
                // If we reach here, retries failed and no stale cache was available
                setCriticalError('Service unavailable. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    if (criticalError) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                <h3 className="font-bold">Error</h3>
                <p>{criticalError}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!dashboardData) return null;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

            {/* Partial Error Notification */}
            {Object.keys(dashboardData.errors).length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                {Object.values(dashboardData.errors).join(', ')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bookings Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
                    {dashboardData.recentBookings.length === 0 ? (
                        <p className="text-gray-500">No recent bookings found.</p>
                    ) : (
                        <ul className="space-y-3">
                            {dashboardData.recentBookings.map(booking => (
                                <li key={booking.id} className="border-b pb-2 last:border-0">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{booking.serviceName}</span>
                                        <span className="text-green-600 font-bold">${booking.amount}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {booking.date} • {booking.status}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Hotels Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Recommended Hotels</h2>
                    {dashboardData.recommendedHotels.length === 0 ? (
                        <p className="text-gray-500">No recommendations available.</p>
                    ) : (
                        <ul className="space-y-4">
                            {dashboardData.recommendedHotels.map(hotel => (
                                <li key={hotel.id} className="flex gap-4">
                                    {hotel.image && (
                                        <img src={hotel.image} alt={hotel.name} className="w-16 h-16 object-cover rounded" />
                                    )}
                                    <div>
                                        <h4 className="font-bold">{hotel.name}</h4>
                                        <p className="text-sm text-gray-600">{hotel.location}</p>
                                        <span className="text-yellow-500 text-sm">★ {hotel.rating}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardDemo;
