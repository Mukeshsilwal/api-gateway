import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTripFullItinerary, updateTrip, addCheckpoint, updateTripStatus } from '../services/tripService';
import { MapPin, Calendar, DollarSign, LayoutList, List, AlertCircle, User, Plus, CheckCircle, Ticket } from 'lucide-react';
import LoadingFallback from '../components/LoadingFallback';
import ItineraryBuilder from '../components/trip/ItineraryBuilder';
import TimelineStream from '../components/trip/TimelineStream';
import GuideSelection from '../components/trips/GuideSelection';
import AddCheckpointModal from '../components/trips/AddCheckpointModal';
import BookingList from '../components/trip/BookingList';
import toast from 'react-hot-toast';

const TripOverviewPage: React.FC = () => {
    const { tripId } = useParams<{ tripId: string }>();
    const [tripData, setTripData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'ITINERARY' | 'TIMELINE' | 'GUIDE' | 'BOOKINGS'>('ITINERARY');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

    const handleGuideSelect = async (guide: any) => {
        try {
            await updateTrip(Number(tripId), { guideId: guide.guideId });
            setTripData((prev: any) => ({ ...prev, guideId: guide.guideId }));
            toast.success(`Guide ${guide.fullName} assigned!`);
        } catch (error) {
            toast.error("Failed to assign guide");
        }
    };

    const handleAddCheckpoint = async (checkpointData: any) => {
        try {
            await addCheckpoint(checkpointData.journeyId, checkpointData);
            toast.success('Activity added to timeline!');
            loadTripData(); // Refresh data to show new checkpoint
        } catch (error) {
            console.error(error);
            toast.error('Failed to add activity');
        }
    };

    const handleCompleteTrip = async () => {
        if (!confirm('Are you sure you want to mark this trip as completed? This usually means you have finished your journey.')) return;
        try {
            await updateTripStatus(Number(tripId), 'COMPLETED');
            toast.success('Trip marked as completed!');
            setTripData((prev: any) => ({ ...prev, status: 'COMPLETED' }));
        } catch (error) {
            toast.error('Failed to update status');
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

    const { tripName, startDate, endDate, budget, budgetRemaining, itineraryDays = [], journeys = [], checkpoints = [], timelineEvents = [], bookings = [], guideId, status } = tripData;

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

                        {/* Status & Actions */}
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-1.5 rounded-full font-semibold text-sm ${status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                }`}>
                                {status || 'Active'}
                            </div>
                            {status !== 'COMPLETED' && status !== 'CANCELLED' && (
                                <button
                                    onClick={handleCompleteTrip}
                                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-1.5 rounded-full text-sm font-semibold hover:opacity-90 transition flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark Complete
                                </button>
                            )}
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
                    <button
                        onClick={() => setActiveTab('BOOKINGS')}
                        className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'BOOKINGS'
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Ticket className="w-5 h-5" />
                            Bookings
                        </div>
                        {activeTab === 'BOOKINGS' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('GUIDE')}
                        className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'GUIDE'
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Trip Guide
                        </div>
                        {activeTab === 'GUIDE' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500"></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4 py-8">
                {activeTab === 'ITINERARY' && (
                    <ItineraryBuilder
                        itineraryDays={itineraryDays}
                        journeys={journeys}
                        tripId={tripId!}
                    />
                )}
                {activeTab === 'TIMELINE' && (
                    <div className="relative">
                        <div className="absolute right-0 top-0 z-10">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Activity
                            </button>
                        </div>
                        <TimelineStream
                            journeys={journeys}
                            checkpoints={checkpoints || []}
                            timelineEvents={timelineEvents || []}
                        />
                    </div>
                )}
                {activeTab === 'BOOKINGS' && (
                    <BookingList bookings={bookings || []} />
                )}
                {activeTab === 'GUIDE' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8 border border-blue-100 dark:border-blue-800">
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">Enhance Your Experience</h3>
                            <p className="text-blue-700 dark:text-blue-400">Hire a local expert to guide you through your journey. Verified guides ensure a safe and enriching experience.</p>
                        </div>
                        <GuideSelection
                            onSelect={handleGuideSelect}
                            selectedGuideId={guideId}
                        />
                    </div>
                )}
            </div>

            <AddCheckpointModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddCheckpoint}
                journeys={journeys}
            />
        </div>
    );
};

export default TripOverviewPage;
