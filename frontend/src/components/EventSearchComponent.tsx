import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

const EventSearchComponent: React.FC = () => {
    // const navigate = useNavigate(); // Unused for now
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const [eventType, setEventType] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [date, setDate] = useState<string>("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Navigate to event list or search results
        console.log("Searching events:", { eventType, location, date });
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className={`relative overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'bg-white rounded-3xl shadow-2xl' : 'bg-transparent'}`}>

                {/* Initial State: CTA Card */}
                {!isExpanded && (
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl transform transition-all duration-500 hover:scale-[1.02]">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Discover Amazing Events</h2>
                        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                            Concerts, workshops, festivals, and more. Find your next unforgettable experience.
                        </p>
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="bg-white text-blue-600 font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-2xl hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Start Event Booking
                        </button>
                    </div>
                )}

                {/* Expanded State: Booking Form */}
                <div className={`transition-all duration-700 ease-in-out ${isExpanded ? 'opacity-100 max-h-[800px] p-8 md:p-12' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Find Events</h2>
                            <p className="text-gray-500">Search for events near you</p>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Event Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Event Type</label>
                                <select
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">All Categories</option>
                                    <option value="concert">Concerts</option>
                                    <option value="workshop">Workshops</option>
                                    <option value="festival">Festivals</option>
                                    <option value="sports">Sports</option>
                                </select>
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Location</label>
                                <input
                                    type="text"
                                    placeholder="City or Venue"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.01]"
                        >
                            Search Events
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EventSearchComponent;
