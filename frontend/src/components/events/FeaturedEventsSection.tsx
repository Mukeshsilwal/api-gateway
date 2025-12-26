import React, { useState, useEffect } from 'react';
import { ArrowRight, Search, Filter } from 'lucide-react';
import EventCard from './EventCard';
import eventService from '../../services/eventService';
import { toast } from 'react-toastify';

/**
 * FeaturedEventsSection Component
 * Displays featured/upcoming events on the homepage
 */
export function FeaturedEventsSection() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');

    const categories = ['ALL', 'MUSIC', 'SPORTS', 'CONFERENCE', 'WORKSHOP', 'FESTIVAL'];

    useEffect(() => {
        fetchEvents();
    }, [activeFilter]);

    const fetchEvents = async () => {
        try {
            setLoading(true);

            const searchParams = {
                status: 'PUBLISHED',
                limit: 6, // Show only 6 events on homepage
                sort: 'startDateTime',
                order: 'ASC'
            };

            // Add category filter if not ALL
            if (activeFilter !== 'ALL') {
                searchParams.category = activeFilter;
            }

            const response = await eventService.searchEvents(searchParams);

            // Handle paginated response structure: response.data.content
            let eventData = response.data || response || [];

            // Extract from pagination wrapper if present
            if (eventData && typeof eventData === 'object' && !Array.isArray(eventData)) {
                if (eventData.content && Array.isArray(eventData.content)) {
                    eventData = eventData.content;
                } else if (eventData.data && Array.isArray(eventData.data)) {
                    eventData = eventData.data;
                }
            }

            // Ensure we have an array
            setEvents(Array.isArray(eventData) ? eventData : []);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load events');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
                    <div>
                        <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
                            Upcoming Events
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Discover concerts, sports, conferences and more
                        </p>
                    </div>
                    <a
                        href="/events"
                        className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2"
                    >
                        Browse All Events <ArrowRight size={18} />
                    </a>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveFilter(category)}
                            className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${activeFilter === category
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden animate-pulse"
                            >
                                <div className="h-48 bg-gray-200 dark:bg-white/10"></div>
                                <div className="p-6">
                                    <div className="h-6 bg-gray-200 dark:bg-white/10 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 mb-4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🎭</div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            No events found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {activeFilter === 'ALL'
                                ? 'No upcoming events at the moment. Check back soon!'
                                : `No ${activeFilter.toLowerCase()} events found. Try another category.`}
                        </p>
                        <button
                            onClick={() => setActiveFilter('ALL')}
                            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                        >
                            View All Categories
                        </button>
                    </div>
                )}

                {/* Quick Search CTA */}
                {events.length > 0 && (
                    <div className="mt-12 bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-2xl p-8 shadow-lg">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Looking for something specific?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Search events by name, location, or date
                                </p>
                            </div>
                            <a
                                href="/events"
                                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all whitespace-nowrap"
                            >
                                <Search size={20} />
                                Advanced Search
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default FeaturedEventsSection;
