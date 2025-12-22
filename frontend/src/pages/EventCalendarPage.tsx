import React from 'react';
import EventCalendar from '../components/calendar/EventCalendar';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const EventCalendarPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/events"
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Event Calendar
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                View all events in calendar format
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <EventCalendar />
            </div>
        </div>
    );
};

export default EventCalendarPage;
