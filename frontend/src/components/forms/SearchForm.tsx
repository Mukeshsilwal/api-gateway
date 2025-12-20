import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

interface SearchFormProps {
    onSearch: (params: SearchParams) => void;
    type: 'hotel' | 'bus';
}

export interface SearchParams {
    location?: string;
    origin?: string;
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    date?: string;
    guests?: number;
    rooms?: number;
}

/**
 * Unified Search Form Component
 * Supports both hotel and bus searches
 */
const SearchForm: React.FC<SearchFormProps> = ({ onSearch, type }) => {
    const [params, setParams] = useState<SearchParams>({
        guests: 2,
        rooms: 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(params);
    };

    const updateParam = (key: keyof SearchParams, value: any) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Hotel Search Fields */}
                {type === 'hotel' && (
                    <>
                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin size={16} className="inline mr-1" />
                                Location
                            </label>
                            <input
                                type="text"
                                placeholder="Where are you going?"
                                value={params.location || ''}
                                onChange={(e) => updateParam('location', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Check-in */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-1" />
                                Check-in
                            </label>
                            <input
                                type="date"
                                value={params.checkIn || ''}
                                onChange={(e) => updateParam('checkIn', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Check-out */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-1" />
                                Check-out
                            </label>
                            <input
                                type="date"
                                value={params.checkOut || ''}
                                onChange={(e) => updateParam('checkOut', e.target.value)}
                                min={params.checkIn || new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Guests & Rooms */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Users size={16} className="inline mr-1" />
                                Guests & Rooms
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    placeholder="Guests"
                                    value={params.guests || ''}
                                    onChange={(e) => updateParam('guests', parseInt(e.target.value))}
                                    className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    placeholder="Rooms"
                                    value={params.rooms || ''}
                                    onChange={(e) => updateParam('rooms', parseInt(e.target.value))}
                                    className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Bus Search Fields */}
                {type === 'bus' && (
                    <>
                        {/* Origin */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin size={16} className="inline mr-1" />
                                From
                            </label>
                            <input
                                type="text"
                                placeholder="Origin city"
                                value={params.origin || ''}
                                onChange={(e) => updateParam('origin', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Destination */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin size={16} className="inline mr-1" />
                                To
                            </label>
                            <input
                                type="text"
                                placeholder="Destination city"
                                value={params.destination || ''}
                                onChange={(e) => updateParam('destination', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Travel Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-1" />
                                Travel Date
                            </label>
                            <input
                                type="date"
                                value={params.date || ''}
                                onChange={(e) => updateParam('date', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Passengers */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Users size={16} className="inline mr-1" />
                                Passengers
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="4"
                                placeholder="Number of passengers"
                                value={params.guests || ''}
                                onChange={(e) => updateParam('guests', parseInt(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Search Button */}
            <div className="mt-6">
                <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <Search size={20} />
                    <span>Search {type === 'hotel' ? 'Hotels' : 'Buses'}</span>
                </button>
            </div>
        </form>
    );
};

export default SearchForm;
