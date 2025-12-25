import React, { useEffect, useState } from 'react';
import { getMyTrips, type Trip } from '../services/tripService';
import { Calendar, MapPin, DollarSign } from 'lucide-react';

interface TripSelectorProps {
    onSelectTrip: (tripId: number | null) => void;
    selectedTripId: number | null;
    bookingAmount?: number;
}

const TripSelector: React.FC<TripSelectorProps> = ({ onSelectTrip, selectedTripId, bookingAmount }) => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            setLoading(true);
            const data = await getMyTrips();
            // Filter only active trips (PLANNED or IN_PROGRESS)
            const activeTrips = data.filter(trip =>
                trip.status === 'PLANNED' || trip.status === 'IN_PROGRESS'
            );
            setTrips(activeTrips);
        } catch (err: any) {
            setError(err.message || 'Failed to load trips');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
        );
    }

    if (trips.length === 0) {
        return (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                    No active trips found. Create a trip first to add bookings to it.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Add to Trip (Optional)
            </label>

            <div className="space-y-2">
                {/* Option to not add to any trip */}
                <div
                    onClick={() => onSelectTrip(null)}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${selectedTripId === null
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                >
                    <p className="font-medium text-gray-900 dark:text-white">
                        Don't add to a trip
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Book independently without linking to a trip
                    </p>
                </div>

                {/* List of trips */}
                {trips.map((trip) => {
                    const budgetAfter = bookingAmount
                        ? (trip.budgetRemaining || trip.budget) - bookingAmount
                        : trip.budgetRemaining || trip.budget;
                    const isOverBudget = budgetAfter < 0;

                    return (
                        <div
                            key={trip.tripId}
                            onClick={() => onSelectTrip(trip.tripId)}
                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${selectedTripId === trip.tripId
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                } ${isOverBudget ? 'opacity-60' : ''}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {trip.tripName}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {trip.description}
                                    </p>

                                    <div className="flex flex-wrap gap-3 mt-3">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            <span>{trip.tripType}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <DollarSign className="w-4 h-4" />
                                            <span>NPR {(trip.budgetRemaining || trip.budget || 0).toLocaleString()} remaining</span>
                                        </div>
                                    </div>

                                    {isOverBudget && bookingAmount && (
                                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            ⚠️ This booking exceeds the trip budget by NPR {Math.abs(budgetAfter).toLocaleString()}
                                        </div>
                                    )}
                                </div>

                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${trip.status === 'IN_PROGRESS'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}
                                >
                                    {trip.status}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedTripId && bookingAmount && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        💡 This booking will be automatically added to your selected trip
                    </p>
                </div>
            )}
        </div>
    );
};

export default TripSelector;
