import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTripDashboard, updateTripStatus, type TripDashboard } from '../services/tripService';
import { MapPin, Calendar, DollarSign, AlertTriangle, Bus, Hotel, Ticket, Clock, CheckCircle, Navigation, Lightbulb, ShieldAlert } from 'lucide-react';
import analytics from '../services/analytics';

const TripDashboardPage: React.FC = () => {
    const { tripId } = useParams<{ tripId: string }>();
    const [dashboard, setDashboard] = useState<TripDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (tripId) {
            loadDashboard();
        }
    }, [tripId]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await getTripDashboard(Number(tripId));
            setDashboard(data);

            // Track Trip View
            analytics.trackEvent(analytics.Events.TRIP_VIEWED, {
                trip_id: data.trip.tripId,
                trip_name: data.trip.tripName,
                status: data.trip.status
            });
        } catch (err: any) {
            setError(err.message || 'Failed to load trip dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateTripStatus(Number(tripId), newStatus);
            loadDashboard();
        } catch (err: any) {
            alert('Failed to update trip status');
        }
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (dashboard?.trip?.status === 'IN_PROGRESS') {
            intervalId = setInterval(async () => {
                try {
                    // Poll for latest tracking info
                    const data = await getTripDashboard(Number(tripId));
                    setDashboard(prev => prev ? { ...prev, liveTracking: data.liveTracking } : data);
                } catch (e) {
                    console.error("Failed to poll tracking data", e);
                }
            }, 30000); // Poll every 30 seconds
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [dashboard?.trip?.status, tripId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
                <div className="bg-white dark:bg-gray-800 shadow h-48"></div>
                <div className="container mx-auto px-4 -mt-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-64"></div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-48"></div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-48"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !dashboard) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">{error || 'Trip not found'}</p>
                </div>
            </div>
        );
    }

    const { trip, bookings, liveTracking, activeAlerts, recommendations = [] } = dashboard;

    // Sort checkpoints by scheduledTime
    const sortedCheckpoints = trip.checkpoints ? [...trip.checkpoints].sort((a: any, b: any) =>
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    ) : [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{trip.tripName}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{trip.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${trip.status === 'IN_PROGRESS'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : trip.status === 'COMPLETED'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        : trip.status === 'PARTIAL_BOOKING'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    }`}
                            >
                                {trip.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Trip Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">Duration</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{trip.durationDays || 0} days</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-sm">Budget</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">NPR {(trip.budget || 0).toLocaleString()}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Remaining: NPR {(trip.budgetRemaining || 0).toLocaleString()}</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">Progress</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{trip.progressPercentage || 0}%</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                                <div
                                    className="bg-orange-500 h-2 rounded-full transition-all"
                                    style={{ width: `${trip.progressPercentage || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                <Ticket className="w-4 h-4" />
                                <span className="text-sm">Bookings</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {dashboard.bookingSummary?.confirmed || 0} / {dashboard.bookingSummary?.total || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {dashboard.bookingSummary?.pending || 0} pending
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative overflow-hidden">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm">Active Alerts</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeAlerts.length}</p>
                            {activeAlerts.length > 0 && (
                                <div className="absolute top-0 right-0 p-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Timeline */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Timeline */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Navigation className="w-6 h-6 text-orange-500" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trip Timeline</h2>
                            </div>

                            {sortedCheckpoints.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Your journey is unwritten</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Start by adding bookings to build your timeline.</p>
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    {sortedCheckpoints.map((cp: any, index: number) => {
                                        const isLast = index === sortedCheckpoints.length - 1;
                                        const statusColors = {
                                            PENDING: 'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600',
                                            COMPLETED: 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-500',
                                            IN_PROGRESS: 'bg-orange-100 border-orange-500 dark:bg-orange-900/30 dark:border-orange-500',
                                            MISSED: 'bg-red-100 border-red-500 dark:bg-red-900/30 dark:border-red-500',
                                            DELAYED: 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-500'
                                        };
                                        const currentStatusColor = statusColors[cp.status as keyof typeof statusColors] || statusColors.PENDING;

                                        return (
                                            <div key={cp.checkpointId} className="flex gap-4 relative">
                                                {/* Connecting Line */}
                                                {!isLast && (
                                                    <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                                                )}

                                                {/* Icon Node */}
                                                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${cp.status === 'COMPLETED' ? 'bg-green-500 border-green-500 text-white' :
                                                    cp.status === 'IN_PROGRESS' ? 'bg-orange-500 border-orange-500 text-white' :
                                                        'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                                                    }`}>
                                                    {cp.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5" /> :
                                                        cp.checkpointType.includes('HOTEL') ? <Hotel className="w-5 h-5" /> :
                                                            cp.checkpointType.includes('BUS') || cp.checkpointType.includes('DEPARTURE') ? <Bus className="w-5 h-5" /> :
                                                                <MapPin className="w-5 h-5" />}
                                                </div>

                                                {/* Content Card */}
                                                <div className={`flex-1 mb-6 rounded-lg border p-4 ${currentStatusColor}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                                                {cp.locationName}
                                                            </h3>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                                <span className="font-semibold">{cp.checkpointType.replace('_', ' ')}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 justify-end">
                                                                <Clock className="w-4 h-4" />
                                                                <span>{new Date(cp.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-500">
                                                                {new Date(cp.scheduledTime).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {cp.notes && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 bg-white/50 dark:bg-black/20 p-2 rounded">
                                                            {cp.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Smart Insights (Personalization) */}
                        {recommendations.length > 0 && (
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-900/20 rounded-lg shadow-sm p-6 border border-orange-200 dark:border-orange-800/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <Lightbulb className="w-6 h-6 text-orange-600" />
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Smart Insights</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {recommendations.map((rec: any, index: number) => (
                                        <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white dark:border-gray-700">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${rec.importance === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                                                    rec.importance === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                                                        'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {rec.type === 'SAFETY' ? <ShieldAlert className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{rec.title}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Live Tracking */}
                        {liveTracking.hasLiveData && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Live Tracking</h2>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Live</span>
                                    </div>
                                    {liveTracking.latestLocation && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <p>Latitude: {liveTracking.latestLocation.latitude}</p>
                                            <p>Longitude: {liveTracking.latestLocation.longitude}</p>
                                            <p className="mt-2 text-xs">
                                                Last updated: {new Date(liveTracking.latestLocation.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Trip Actions</h2>

                            {trip.status === 'PLANNED' && (
                                <button
                                    onClick={() => handleStatusChange('IN_PROGRESS')}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition mb-3"
                                >
                                    Start Trip
                                </button>
                            )}

                            {trip.status === 'IN_PROGRESS' && (
                                <button
                                    onClick={() => handleStatusChange('COMPLETED')}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition mb-3"
                                >
                                    Complete Trip
                                </button>
                            )}

                            <button className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2">
                                <Navigation className="w-4 h-4" />
                                Download Offline Map
                            </button>
                        </div>

                        {/* Active Alerts */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Active Alerts</h2>
                            {activeAlerts.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">No active alerts</p>
                            ) : (
                                <div className="space-y-3">
                                    {activeAlerts.map((alert: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg ${alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                                                }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{alert.title}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.description}</p>
                                                    <span className="inline-block mt-2 px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs font-semibold">
                                                        {alert.severity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bookings Summary */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Bookings</h2>
                            {bookings.length === 0 ? (
                                <div className="text-center py-6">
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                        <Ticket className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-2">No bookings yet</p>
                                    <a href="/" className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline">
                                        Browse Options
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bookings.map((booking: any, index: number) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            {booking.type === 'BUS' && <Bus className="w-6 h-6 text-blue-500" />}
                                            {booking.type === 'HOTEL' && <Hotel className="w-6 h-6 text-purple-500" />}
                                            {booking.type === 'EVENT' && <Ticket className="w-6 h-6 text-green-500" />}
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{booking.description || booking.type}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Ref: {booking.bookingReference || '#'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripDashboardPage;
