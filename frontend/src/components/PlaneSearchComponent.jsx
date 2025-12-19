import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PlaneSearchComponent = () => {
    const navigate = useNavigate();
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [date, setDate] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Mock cities for now
    const cities = ["New York", "London", "Paris", "Dubai", "Tokyo", "Singapore"];
    const today = new Date().toISOString().split("T")[0];

    const handleSearch = (e) => {
        e.preventDefault();
        if (!source || !destination || !date) {
            toast.error("Please select source, destination and date.");
            return;
        }
        if (source === destination) {
            toast.error("Source and destination cannot be the same.");
            return;
        }

        setIsSearching(true);

        // Simulate API call
        setTimeout(() => {
            localStorage.setItem("planeSearchDetails", JSON.stringify({ source, destination, date }));
            setIsSearching(false);
            navigate("/plane-list");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden transform transition-all duration-500 hover:scale-102">

                {/* Left Side Image - Using an SVG directly if file doesn't exist */}
                <div className="md:w-1/2 p-8 flex items-center justify-center bg-sky-50">
                    <svg className="w-full h-64 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                {/* Right Side Form */}
                <div className="md:w-1/2 p-8 space-y-6">
                    <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center animate-pulse">
                        Book Your Flight
                    </h1>

                    <div className="space-y-4">
                        {/* From City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                            <select
                                onChange={(e) => setSource(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                                value={source}
                            >
                                <option value="">Select departure city</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* To City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                            <select
                                onChange={(e) => setDestination(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                                value={destination}
                            >
                                <option value="">Select destination city</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Travel Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={today}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                            />
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            disabled={!source || !destination || !date || isSearching}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSearching ? 'Searching...' : 'Search Flights'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaneSearchComponent;
