import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById, updateTrip, type Trip } from '../services/tripService';
import { CheckCircle, Bus, Hotel, Ticket } from 'lucide-react';
import { toast } from 'react-toastify';
import GuideSelection from '../components/trips/GuideSelection';
import TimelineBuilder, { Checkpoint } from '../components/trips/TimelineBuilder';
import { Guide } from '../services/guideService';

export default function ContinueTripPage() {
    const { tripId } = useParams<{ tripId: string }>();
    const navigate = useNavigate();

    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'bookings' | 'itinerary' | 'guide'>('bookings');
    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
    // TODO: Load checkpoints from trip data if available
    useEffect(() => {
        // Placeholder for future implementation: setCheckpoints(trip.checkpoints);
        console.log('Checkpoints state ready:', setCheckpoints);
    }, []);

    useEffect(() => {
        if (tripId) {
            loadTrip();
        }
    }, [tripId]);

    const loadTrip = async () => {
        try {
            setLoading(true);
            const tripData = await getTripById(Number(tripId));
            setTrip(tripData);
        } catch (err) {
            console.error('Failed to load trip:', err);
            toast.error('Failed to load trip');
            navigate('/trips');
        } finally {
            setLoading(false);
        }
    };

    const navigateToSearch = (type: 'bus' | 'hotel' | 'event') => {
        if (!trip) return;

        const params = new URLSearchParams();
        params.set('tripId', trip.tripId.toString());
        params.set('tripName', trip.tripName);
        params.set('date', trip.startDate.split('T')[0]);

        let path = '';
        if (type === 'bus') path = '/bus';
        if (type === 'hotel') path = '/hotels';
        if (type === 'event') path = '/events';

        navigate(`${path}?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Trip Not Found</h2>
                    <button onClick={() => navigate('/trips')} className="text-orange-500 hover:text-orange-600">
                        Back to My Trips
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Continue Planning Your Trip</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{trip.tripName} - Add bookings, set itinerary, or hire a guide</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3 mb-6">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                        <h3 className="font-semibold text-green-900 dark:text-green-300">Trip Loaded Successfully!</h3>
                        <p className="text-sm text-green-800 dark:text-green-400">Continue building your journey.</p>
                    </div>
                </div>

                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {['bookings', 'itinerary', 'guide'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border border-t-0 border-gray-200 dark:border-gray-700 p-6 min-h-[400px]">
                    {activeTab === 'bookings' && (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors cursor-pointer group p-6" onClick={() => navigateToSearch('bus')}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
                                            <Bus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Book Bus Tickets</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Find comfortable rides</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300 group-hover:bg-orange-100 group-hover:text-orange-700">Start Search →</div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors cursor-pointer group p-6" onClick={() => navigateToSearch('hotel')}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition">
                                            <Hotel className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reserve Hotels</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Stay in top-rated places</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300 group-hover:bg-orange-100 group-hover:text-orange-700">Start Search →</div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors cursor-pointer group p-6" onClick={() => navigateToSearch('event')}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center group-hover:bg-green-200 transition">
                                            <Ticket className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Find Events</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Discover local activities</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300 group-hover:bg-orange-100 group-hover:text-orange-700">Start Search →</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'itinerary' && (
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Plan your journey step-by-step.</p>
                            <TimelineBuilder
                                checkpoints={checkpoints}
                                onAddCheckpoint={() => alert('Add checkpoint functionality to be implemented')}
                                onRemoveCheckpoint={(i) => console.log('Remove checkpoint at index:', i)}
                            />
                        </div>
                    )}

                    {activeTab === 'guide' && (
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Hire a local expert to enhance your trip.</p>
                            <GuideSelection onSelect={async (guide) => {
                                try {
                                    setSelectedGuide(guide);
                                    await updateTrip(trip.tripId, { guideId: guide.guideId });
                                    setTrip(prev => prev ? { ...prev, guideId: guide.guideId } : null);
                                    toast.success(`Guide ${guide.fullName} assigned!`);
                                } catch (error) {
                                    toast.error("Failed to assign guide");
                                    setSelectedGuide(null);
                                }
                            }} selectedGuideId={selectedGuide?.guideId || trip.guideId} />
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button onClick={() => navigate(`/trips/${trip.tripId}`)} className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        I'm Done Planning
                    </button>
                </div>
            </div>
        </div>
    );
}
