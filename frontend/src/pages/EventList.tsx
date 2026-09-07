import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar } from 'lucide-react';
import eventService from '../services/eventService';
import EventCard from '../components/EventCard';
import LoadingFallback from '../components/LoadingFallback';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

interface Event {
    id: string;
    title: string;
    description: string;
    venue?: {
        name: string;
    };
    category: string;
    [key: string]: any;
}

const EventList: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchEvents();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [searchQuery, selectedCategory, events]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            // Only show PUBLISHED events in customer-facing view
            const response = await eventService.searchEvents({ status: 'PUBLISHED' });
            // Handle Response wrapper: response.data could be the array or could be wrapped
            let eventData = response.data;

            // If data is wrapped in another object (e.g., { content: [...] }), extract it
            if (eventData && typeof eventData === 'object' && !Array.isArray(eventData)) {
                // Check for pagination response
                if (eventData.content && Array.isArray(eventData.content)) {
                    eventData = eventData.content;
                } else if (eventData.data && Array.isArray(eventData.data)) {
                    eventData = eventData.data;
                }
            }

            // Ensure we have an array
            const events = Array.isArray(eventData) ? eventData : [];
            setEvents(events);
            setFilteredEvents(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            setEvents([]);
            setFilteredEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await eventService.getCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories(['Music', 'Sports', 'Arts', 'Technology', 'Food', 'Other']);
        }
    };

    const filterEvents = () => {
        let filtered = events;

        if (searchQuery) {
            filtered = filtered.filter(event =>
                event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.venue?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(event => event.category === selectedCategory);
        }

        setFilteredEvents(filtered);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category === selectedCategory ? '' : category);
    };

    if (loading) {
        return <LoadingFallback fullScreen message="Loading events..." />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
            <NavigationBar />

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white pt-28 pb-16 shadow-inner">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Discover Amazing Events
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl">
                        Find and book tickets for concerts, sports, conferences, and exhibitions across Nepal
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 w-full">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-800 p-6">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search events by name, location, or description..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div>
                        <div className="flex items-center mb-3">
                            <Filter className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categories:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                                    }`}
                            >
                                All Events
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                {filteredEvents.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800 text-center py-16 px-6">
                        <Calendar className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            No events found
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            Try adjusting your search or category filters
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Found
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default EventList;
