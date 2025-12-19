import React, { useState, useEffect } from 'react';
import hotelsApi from '../../api/hotelsApi';
import { useNavigate } from 'react-router-dom';

export function RecommendationsWidget() {
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const data = await hotelsApi.getRecommendations();
                setRecommendations(data.slice(0, 4)); // Show top 4
            } catch (error) {
                console.error('Failed to load recommendations', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    if (loading) return null; // Or a small skeleton
    if (!recommendations.length) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl shadow-xl p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

            <h2 className="text-2xl font-bold mb-6 relative z-10">Recommended for You</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {recommendations.map((hotel) => (
                    <div
                        key={hotel.hotelId}
                        onClick={() => navigate(`/hotels/${hotel.hotelId}`)}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer group"
                    >
                        <div className="h-32 rounded-lg overflow-hidden mb-3">
                            <img
                                src={hotel.thumbnailUrl || 'https://placehold.co/300x200?text=No+Image'}
                                alt={hotel.hotelName}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <h3 className="font-bold text-lg truncate">{hotel.hotelName}</h3>
                        <p className="text-indigo-200 text-sm mb-2">{hotel.city}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-yellow-400 text-sm">★ {hotel.stars}</span>
                            <span className="font-bold">Rs. {hotel.price}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
