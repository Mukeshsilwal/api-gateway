import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const HotelSearchComponent = () => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    const [city, setCity] = useState("");
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [guests, setGuests] = useState(1);
    const [isSearching, setIsSearching] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!city) {
            toast.error("Please enter a city or location");
            return;
        }

        if (!checkInDate || !checkOutDate) {
            toast.error("Please select check-in and check-out dates");
            return;
        }

        if (checkInDate >= checkOutDate) {
            toast.error("Check-out date must be after check-in date");
            return;
        }

        setIsSearching(true);

        try {
            navigate("/hotels", {
                state: {
                    city,
                    checkInDate,
                    checkOutDate,
                    guests
                }
            });
        } catch (error) {
            toast.error("An error occurred. Please try again.");
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className={`relative overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'bg-white rounded-3xl shadow-2xl' : 'bg-transparent'}`}>

                {/* Initial State: CTA Card */}
                {!isExpanded && (
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl transform transition-all duration-500 hover:scale-[1.02]">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <span className="text-4xl">🏨</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Find Your Perfect Stay</h2>
                        <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                            Luxury hotels, cozy resorts, and budget stays. Experience comfort wherever you go.
                        </p>
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="bg-white text-emerald-600 font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-2xl hover:bg-emerald-50 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Start Hotel Booking
                        </button>
                    </div>
                )}

                {/* Expanded State: Booking Form */}
                <div className={`transition-all duration-700 ease-in-out ${isExpanded ? 'opacity-100 max-h-[800px] p-8 md:p-12' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Search Hotels</h2>
                            <p className="text-gray-500">Find the best deals on hotels</p>
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
                        {/* City Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">City / Location</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Where do you want to stay?"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Check-in */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Check-in</label>
                                <input
                                    type="date"
                                    value={checkInDate}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                    min={today}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Check-out */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Check-out</label>
                                <input
                                    type="date"
                                    value={checkOutDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                    min={checkInDate || today}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Guests */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Guests</label>
                                <select
                                    value={guests}
                                    onChange={(e) => setGuests(parseInt(e.target.value))}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                        <option key={num} value={num}>
                                            {num} Guest{num > 1 ? 's' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSearching}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSearching ? 'Searching...' : 'Search Hotels'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HotelSearchComponent;
