import React, { useState } from 'react';
import hotelsApi from '../../api/hotelsApi';
import { HotelCard } from './HotelCard';
import toast from "react-hot-toast";

export function NearbyHotels() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState(5);
    const [location, setLocation] = useState(null);
    const [searched, setSearched] = useState(false);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                await fetchNearbyHotels(latitude, longitude, radius);
            },
            (error) => {
                console.error('Geolocation error', error);
                toast.error('Unable to retrieve your location');
                setLoading(false);
            }
        );
    };

    const fetchNearbyHotels = async (lat, lon, rad) => {
        try {
            setLoading(true);
            const data = await hotelsApi.searchNearbyHotels({
                latitude: lat,
                longitude: lon,
                radiusKm: rad,
                limit: 6
            });
            setHotels(data.content || []);
            setSearched(true);
        } catch (error) {
            console.error('Failed to fetch nearby hotels', error);
            toast.error('Failed to find nearby hotels');
        } finally {
            setLoading(false);
        }
    };

    const handleRadiusChange = (e) => {
        const newRadius = Number(e.target.value);
        setRadius(newRadius);
        if (location) {
            fetchNearbyHotels(location.latitude, location.longitude, newRadius);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hotels Near You</h2>
                    <p className="text-gray-500">Find the best places to stay around your current location</p>
                </div>

                <div className="flex items-center gap-4">
                    {location && (
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Radius (km):</label>
                            <select
                                value={radius}
                                onChange={handleRadiusChange}
                                className="border-gray-300 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="1">1 km</option>
                                <option value="2">2 km</option>
                                <option value="5">5 km</option>
                                <option value="10">10 km</option>
                                <option value="20">20 km</option>
                            </select>
                        </div>
                    )}

                    {!location && (
                        <button
                            onClick={handleGetLocation}
                            disabled={loading}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                            Use My Location
                        </button>
                    )}
                </div>
            </div>

            {loading && !hotels.length && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                </div>
            )}

            {!loading && searched && hotels.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No hotels found within {radius}km of your location.</p>
                    <button
                        onClick={() => handleRadiusChange({ target: { value: 20 } })}
                        className="mt-2 text-teal-600 font-medium hover:underline"
                    >
                        Try increasing the radius
                    </button>
                </div>
            )}

            {hotels.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.map((hotel, index) => (
                        <HotelCard key={hotel.hotelId || hotel.id || hotel.hotelCode || index} hotel={hotel} />
                    ))}
                </div>
            )}
        </div>
    );
}
