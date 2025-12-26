import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import hotelsApi from '../api/hotelsApi';
import toast from "react-hot-toast";

export const useHotelSearch = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [hotels, setHotels] = useState([]);
    const [filters, setFilters] = useState(null);
    const [cities, setCities] = useState([]);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 0,
        limit: 10,
        total: 0,
        hasMore: true
    });

    // Initial search params from URL or defaults
    const [searchParams, setSearchParams] = useState({
        city: '',
        searchQuery: '',
        minStarRating: 0,
        minPrice: 0,
        maxPrice: 10000,
        amenities: [],
        sortBy: 'popularity',
        ...location.state?.searchParams
    });

    // Fetch static data (cities, filters)
    useEffect(() => {
        const fetchStaticData = async () => {
            try {
                const [citiesData, filtersData] = await Promise.all([
                    hotelsApi.getCities(),
                    hotelsApi.getFilters()
                ]);
                setCities(citiesData);
                setFilters(filtersData);
            } catch (err) {
                console.error('Failed to load static data', err);
                // Don't block the app, just log
            }
        };
        fetchStaticData();
    }, []);

    // Search function
    const searchHotels = useCallback(async (params = {}, isLoadMore = false) => {
        setLoading(true);
        setError(null);
        try {
            const mergedParams = { ...searchParams, ...params };

            // Update URL/Navigation state if needed
            // navigate('/hotels', { state: { searchParams: mergedParams } });

            const requestData = {
                ...mergedParams,
                page: isLoadMore ? pagination.page + 1 : 0,
                limit: pagination.limit
            };

            const response = await hotelsApi.searchHotels(requestData);

            if (isLoadMore) {
                setHotels(prev => [...prev, ...response.content]);
            } else {
                setHotels(response.content);
            }

            setPagination({
                page: response.number,
                limit: response.size,
                total: response.totalElements,
                hasMore: !response.last
            });

            setSearchParams(mergedParams);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to search hotels');
            toast.error('Unable to fetch hotels. Try again.');
        } finally {
            setLoading(false);
        }
    }, [searchParams, pagination.limit, pagination.page]);

    // Debounced search update
    const updateSearchParams = (newParams) => {
        setSearchParams(prev => ({ ...prev, ...newParams }));
    };

    return {
        hotels,
        loading,
        error,
        cities,
        filters,
        searchParams,
        pagination,
        searchHotels,
        updateSearchParams,
        setHotels
    };
};
