import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTrips, type Trip } from '../services/tripService';
import { Calendar, DollarSign, MapPin, Plus } from 'lucide-react';

const MyTripsPage: React.FC = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('ALL');

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            setLoading(true);
            const data = await getMyTrips();
            setTrips(data);
        } catch (err) {
            console.error('Failed to load trips:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTrips = trips.filter((trip) => {
        if (filter === 'ALL') return true;
        return trip.status === filter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PLANNED':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'IN_PROGRESS':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Trips</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all your trips in one place</p>
                        </div>
                        <button
                            onClick={() => navigate('/trips/new')}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                        >
                            <Plus className="w-5 h-5" />
                            New Trip
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mt-6">
                        {['ALL', 'PLANNED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg font-semibold transition ${filter === status
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trips Grid */}
            <div className="container mx-auto px-4 py-8">
                {filteredTrips.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No trips found</p>
                        <button
                            onClick={() => navigate('/trips/new')}
                            className="mt-4 text-orange-500 hover:text-orange-600 font-semibold"
                        >
                            Create your first trip
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTrips.map((trip) => {
                            // Determine navigation based on trip status
                            const handleTripClick = () => {
                                navigate(`/trips/${trip.tripId}`);
                            };

                            return (
                                <div
                                    key={trip.tripId}
                                    onClick={handleTripClick}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold">{trip.tripName}</h3>
                                                <p className="text-sm opacity-90 mt-1">{trip.tripType}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                                                {trip.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">
                                                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="text-sm">Budget: NPR {trip.budget.toLocaleString()}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">Progress: {trip.progressPercentage}%</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-orange-500 h-2 rounded-full transition-all"
                                                style={{ width: `${trip.progressPercentage}%` }}
                                            ></div>
                                        </div>

                                        {trip.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{trip.description}</p>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {trip.durationDays} days • NPR {trip.budgetRemaining.toLocaleString()} remaining
                                        </p>
                                        {trip.status === 'PLANNED' && trip.progressPercentage < 100 && (
                                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-semibold">
                                                Click to continue planning →
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTripsPage;
