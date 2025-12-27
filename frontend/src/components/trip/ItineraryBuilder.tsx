import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Plus, Bus, Hotel, Calendar } from 'lucide-react';
import { initializeItinerary } from '../../services/tripService';
import toast from 'react-hot-toast';

interface ItineraryBuilderProps {
    itineraryDays: any[];
    journeys: any[];
    tripId: string;
}

const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ itineraryDays, journeys, tripId }) => {
    const navigate = useNavigate();
    const [initializing, setInitializing] = React.useState(false);

    const handleInitialize = async () => {
        try {
            setInitializing(true);
            await initializeItinerary(Number(tripId));
            toast.success('Itinerary initialized! Refreshing...');
            window.location.reload();
        } catch (error) {
            toast.error('Failed to initialize itinerary');
            console.error(error);
        } finally {
            setInitializing(false);
        }
    };

    // Group journeys by day
    const getJourneysForDay = (dayId: number) => {
        return journeys.filter((j: any) => j.itineraryDayId === dayId);
    };

    if (itineraryDays.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
                <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your itinerary is empty</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">Start planning your trip by adding generic days or bookings.</p>
                <button
                    onClick={handleInitialize}
                    disabled={initializing}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50"
                >
                    {initializing ? 'Initializing...' : 'Initialize Itinerary'}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {itineraryDays.sort((a, b) => a.dayNumber - b.dayNumber).map((day: any) => (
                <div key={day.dayId} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                    {/* Day Header */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center group">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                    Day {day.dayNumber}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {day.title || `Day ${day.dayNumber}`}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-11">
                                {new Date(day.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {day.location && (
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-600">
                                    <MapPin className="w-3 h-3" />
                                    {day.location}
                                </div>
                            )}
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Day Content (Journeys) */}
                    <div className="p-4 sm:p-6">
                        <div className="space-y-4">
                            {getJourneysForDay(day.dayId).length === 0 ? (
                                <div className="border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-lg p-6 text-center">
                                    <p className="text-gray-400 text-sm mb-3">No activities planned for this day.</p>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => navigate(`/buslist?tripId=${tripId}`)}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline flex items-center justify-center gap-1"
                                        >
                                            <Bus className="w-4 h-4" /> Bus
                                        </button>
                                        <button
                                            onClick={() => navigate(`/hotels?tripId=${tripId}`)}
                                            className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:underline flex items-center justify-center gap-1"
                                        >
                                            <Hotel className="w-4 h-4" /> Hotel
                                        </button>
                                        <button
                                            onClick={() => navigate(`/events?tripId=${tripId}`)}
                                            className="text-pink-600 hover:text-pink-700 text-sm font-medium hover:underline flex items-center justify-center gap-1"
                                        >
                                            <Calendar className="w-4 h-4" /> Event
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                getJourneysForDay(day.dayId).map((journey: any) => (
                                    <div key={journey.journeyId} className="flex gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors group relative">

                                        {/* Time Column */}
                                        <div className="w-16 flex flex-col items-center pt-1 shrink-0">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                {journey.bookingReference?.departureTime ?
                                                    new Date(journey.bookingReference.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                                    '--:--'
                                                }
                                            </span>
                                            <div className="h-full w-0.5 bg-gray-100 dark:bg-gray-700 mt-2 group-last:hidden"></div>
                                        </div>

                                        {/* Icon */}
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{journey.type?.toLowerCase().replace('_', ' ')} Journey</h4>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Confirmed</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {journey.bookingReference?.source} <span className="text-gray-400 mx-1">➔</span> {journey.bookingReference?.destination}
                                            </p>

                                            {journey.bookingReference?.seatNumber && (
                                                <div className="mt-2 flex gap-3">
                                                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                        Seat: {journey.bookingReference.seatNumber}
                                                    </span>
                                                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                        Ref: {journey.bookingReference.bookingId}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ItineraryBuilder;
