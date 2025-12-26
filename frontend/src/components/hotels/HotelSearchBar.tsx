import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import hotelsApi from '../../api/hotelsApi';

export function HotelSearchBar({ initialCity = '', initialQuery = '', onSearch }) {
    const navigate = useNavigate();
    const [city, setCity] = useState(initialCity);
    const [query, setQuery] = useState(initialQuery);
    const [cities, setCities] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Load cities for autocomplete
    useEffect(() => {
        hotelsApi.getCities().then(setCities).catch(console.error);
    }, []);

    // Handle outside click to close suggestions
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch({ city, searchQuery: query });
        } else {
            navigate('/hotels', { state: { searchParams: { city, searchQuery: query } } });
        }
    };

    const filteredCities = cities.filter(c =>
        c.toLowerCase().includes(city.toLowerCase())
    );

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6" ref={wrapperRef}>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                {/* City Input with Autocomplete */}
                <div className="relative flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Destination</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-all"
                            placeholder="Where are you going?"
                            value={city}
                            onChange={(e) => {
                                setCity(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                        />
                    </div>

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && city && filteredCities.length > 0 && (
                        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-xl py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                            {filteredCities.map((c, index) => (
                                <div
                                    key={index}
                                    className="cursor-pointer select-none relative py-2 pl-10 pr-4 hover:bg-teal-50 text-gray-900"
                                    onClick={() => {
                                        setCity(c);
                                        setShowSuggestions(false);
                                    }}
                                >
                                    <span className="block truncate font-medium">{c}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search Query Input */}
                <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Keywords (Optional)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-all"
                            placeholder="Hotel name, landmark..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                    <button
                        type="submit"
                        className="w-full md:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all"
                    >
                        Search Hotels
                    </button>
                </div>
            </form>
        </div>
    );
}
