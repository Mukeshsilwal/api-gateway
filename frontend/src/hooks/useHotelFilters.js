import { useState, useCallback } from 'react';

/**
 * Custom hook for managing hotel filter state
 * @returns {Object} Filter state and handlers
 */
const useHotelFilters = () => {
    const [filters, setFilters] = useState({
        radiusKm: 10,
        minStarRating: null,
        maxPrice: null,
        amenities: [],
        sortBy: 'distance'
    });

    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const setRadius = useCallback((value) => {
        updateFilter('radiusKm', value);
    }, [updateFilter]);

    const setMinStars = useCallback((value) => {
        updateFilter('minStarRating', value);
    }, [updateFilter]);

    const setMaxPrice = useCallback((value) => {
        updateFilter('maxPrice', value);
    }, [updateFilter]);

    const setAmenities = useCallback((value) => {
        updateFilter('amenities', value);
    }, [updateFilter]);

    const setSortBy = useCallback((value) => {
        updateFilter('sortBy', value);
    }, [updateFilter]);

    const toggleAmenity = useCallback((amenity) => {
        setFilters(prev => {
            const currentAmenities = prev.amenities || [];
            const isSelected = currentAmenities.includes(amenity);

            return {
                ...prev,
                amenities: isSelected
                    ? currentAmenities.filter(a => a !== amenity)
                    : [...currentAmenities, amenity]
            };
        });
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            radiusKm: 10,
            minStarRating: null,
            maxPrice: null,
            amenities: [],
            sortBy: 'distance'
        });
    }, []);

    return {
        filters,
        setRadius,
        setMinStars,
        setMaxPrice,
        setAmenities,
        setSortBy,
        toggleAmenity,
        resetFilters,
        updateFilter
    };
};

export default useHotelFilters;
