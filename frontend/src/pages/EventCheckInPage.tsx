import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CheckInManager from '../components/checkin/CheckInManager';
import eventService from '../services/eventService';

const EventCheckInPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [eventName, setEventName] = useState('Loading...');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await eventService.getEventDetails(Number(eventId));
                const event = response.data || response;
                setEventName(event.basicInfo?.name || event.name || 'Event');
            } catch (error) {
                console.error('Error fetching event:', error);
                setEventName('Unknown Event');
            }
        };

        if (eventId) {
            fetchEvent();
        }
    }, [eventId]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/panel')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Event Check-In
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {eventName}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Check-In Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {eventId && (
                    <CheckInManager eventId={Number(eventId)} eventName={eventName} />
                )}
            </div>
        </div>
    );
};

export default EventCheckInPage;
