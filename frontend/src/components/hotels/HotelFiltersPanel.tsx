import React from 'react';

export function HotelFiltersPanel({ filters, selectedFilters, onChange }) {
    if (!filters) return null;

    const handleStarChange = (rating) => {
        // Implement logic to toggle star rating in selectedFilters
        // This is a simplified version, assuming onChange handles the full update
        // In a real app, you'd likely manage local state or pass a toggle function
        // For this MVP, let's assume selectedFilters.minStarRating is a single value for simplicity
        // or we can support multi-select if the backend supports it.
        // The DTO says 'minStarRating', so it's likely a minimum threshold, not a multi-select.
        // However, the requirements mention "star rating multi-select".
        // Let's stick to the DTO 'minStarRating' for now as per "ALWAYS send request bodies EXACTLY matching DTOs".
        // Actually, the requirements say "star rating multi-select" in UI but DTO has "minStarRating".
        // I will implement a single select for "Minimum Rating" to match DTO strictly.
        onChange({ minStarRating: rating === selectedFilters.minStarRating ? 0 : rating });
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        onChange({ [name]: Number(value) });
    };

    const handleAmenityChange = (amenity) => {
        const currentAmenities = selectedFilters.amenities || [];
        const newAmenities = currentAmenities.includes(amenity)
            ? currentAmenities.filter(a => a !== amenity)
            : [...currentAmenities, amenity];
        onChange({ amenities: newAmenities });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
            {/* Price Range */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 uppercase font-bold">Min Price</label>
                            <input
                                type="number"
                                name="minPrice"
                                value={selectedFilters.minPrice || 0}
                                onChange={handlePriceChange}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 uppercase font-bold">Max Price</label>
                            <input
                                type="number"
                                name="maxPrice"
                                value={selectedFilters.maxPrice || 10000}
                                onChange={handlePriceChange}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="20000"
                        step="100"
                        value={selectedFilters.maxPrice || 10000}
                        onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                </div>
            </div>

            {/* Star Rating */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Star Rating</h3>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <label key={star} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="minStarRating"
                                checked={selectedFilters.minStarRating === star}
                                onChange={() => handleStarChange(star)}
                                className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500"
                            />
                            <div className="flex items-center text-yellow-400 group-hover:scale-105 transition-transform">
                                {[...Array(star)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2. 8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                                <span className="ml-2 text-gray-600 text-sm font-medium group-hover:text-gray-900">& Up</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Amenities */}
            {filters.amenities && filters.amenities.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {filters.amenities.map((amenity) => (
                            <label key={amenity} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedFilters.amenities?.includes(amenity)}
                                    onChange={() => handleAmenityChange(amenity)}
                                    className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                />
                                <span className="text-gray-700 capitalize">{amenity.replace(/_/g, ' ')}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
