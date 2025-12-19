import React from 'react';
import { SlidersHorizontal, DollarSign, Star, MapPin, X } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * HotelFilters Component
 * Filter panel for hotel search
 */
const HotelFilters = ({ filters, onFilterChange, onReset }) => {
    const amenitiesList = ['WiFi', 'Restaurant', 'Pool', 'Gym', 'Parking', 'Spa'];
    const sortOptions = [
        { value: 'distance', label: 'Distance' },
        { value: 'price', label: 'Price' },
        { value: 'rating', label: 'Rating' }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal size={20} />
                    Filters
                </h3>
                <button
                    onClick={onReset}
                    className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                >
                    <X size={16} />
                    Reset
                </button>
            </div>

            <div className="space-y-6">
                {/* Distance Radius */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                        <MapPin size={16} />
                        Distance: {filters.radiusKm} km
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={filters.radiusKm}
                        onChange={(e) => onFilterChange('radiusKm', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>1 km</span>
                        <span>50 km</span>
                    </div>
                </div>

                {/* Star Rating */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                        <Star size={16} />
                        Minimum Star Rating
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((stars) => (
                            <button
                                key={stars}
                                onClick={() => onFilterChange('minStarRating', filters.minStarRating === stars ? null : stars)}
                                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${filters.minStarRating === stars
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {stars}★
                            </button>
                        ))}
                    </div>
                </div>

                {/* Max Price */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                        <DollarSign size={16} />
                        Max Price: {filters.maxPrice ? `NPR ${filters.maxPrice}` : 'Any'}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="10000"
                        step="500"
                        value={filters.maxPrice || 10000}
                        onChange={(e) => onFilterChange('maxPrice', Number(e.target.value) === 10000 ? null : Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Any</span>
                        <span>NPR 10,000</span>
                    </div>
                </div>

                {/* Amenities */}
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">
                        Amenities
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {amenitiesList.map((amenity) => (
                            <label
                                key={amenity}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${filters.amenities?.includes(amenity)
                                        ? 'bg-primary/10 border-2 border-primary'
                                        : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={filters.amenities?.includes(amenity)}
                                    onChange={() => {
                                        const newAmenities = filters.amenities?.includes(amenity)
                                            ? filters.amenities.filter(a => a !== amenity)
                                            : [...(filters.amenities || []), amenity];
                                        onFilterChange('amenities', newAmenities);
                                    }}
                                    className="w-4 h-4 accent-primary"
                                />
                                <span className="text-xs font-medium text-slate-700">{amenity}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Sort By */}
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">
                        Sort By
                    </label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => onFilterChange('sortBy', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

HotelFilters.propTypes = {
    filters: PropTypes.shape({
        radiusKm: PropTypes.number,
        minStarRating: PropTypes.number,
        maxPrice: PropTypes.number,
        amenities: PropTypes.arrayOf(PropTypes.string),
        sortBy: PropTypes.string
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired
};

export default HotelFilters;
