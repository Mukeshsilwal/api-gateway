import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTripFullItinerary } from '../services/tripService';
import { MapPin, Calendar, DollarSign, LayoutList, List, AlertCircle } from 'lucide-react';
import LoadingFallback from '../components/LoadingFallback';
import ItineraryBuilder from '../components/trip/ItineraryBuilder';
import TimelineStream from '../components/trip/TimelineStream';

const TripOverviewPage: React.FC = () => {
    const { tripId } = useParams<{ tripId: string }>();
    const [tripData, setTripData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'ITINERARY' | 'TIMELINE'>('ITINERARY');

    useEffect(() => {
        if (tripId) {
            loadTripData();
        }
    }, [tripId]);

    const loadTripData = async () => {
        try {
            setLoading(true);
            const data = await getTripFullItinerary(Number(tripId));
            setTripData(data);

            // Auto-switch to Timeline if Itinerary is empty but we have journey data
            if (data.itineraryDays?.length === 0 && (data.checkpoints?.length > 0 || data.journeys?.length > 0)) {
                setActiveTab('TIMELINE');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load trip itinerary');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingFallback fullScreen message="Loading detailed itinerary..." />;

    if (error || !tripData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300">
                    <AlertCircle className="w-6 h-6" />
                    <p>{error || 'Trip not found'}</p>
                </div>
            </div>
        );
    }

    const { tripName, startDate, endDate, budget, budgetRemaining, itineraryDays = [], journeys = [], checkpoints = [], timelineEvents = [] } = tripData;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tripName}</h1>
                            <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-400 mt-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-500" />
                                    <span>{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-green-500" />
                                    <span>Budget: NPR {budget?.toLocaleString()} <span className="text-gray-400 text-sm">(Left: {budgetRemaining?.toLocaleString()})</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                    <span>{itineraryDays.length} Days Planned</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Pill */}
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-1.5 rounded-full font-semibold text-sm">
                            Active Trip
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="container mx-auto px-4 flex gap-8 border-b border-gray-200 dark:border-gray-700 mt-4">
                    <button
                        onClick={() => setActiveTab('ITINERARY')}
                        className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'ITINERARY'
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <LayoutList className="w-5 h-5" />
                            Itinerary
                        </div>
                        {activeTab === 'ITINERARY' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('TIMELINE')}
                        className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'TIMELINE'
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <List className="w-5 h-5" />
                            Timeline
                        </div>
                        {activeTab === 'TIMELINE' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500"></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4 py-8">
                {activeTab === 'ITINERARY' ? (
                    <ItineraryBuilder
                        itineraryDays={itineraryDays}
                        journeys={journeys}
                        tripId={tripId!}
                    />
                ) : (
                    <TimelineStream
                        journeys={journeys}
                        checkpoints={checkpoints || []}
                        timelineEvents={timelineEvents || []}
                    />
                )}
            </div>
        </div>
    );
};

export default TripOverviewPage;
