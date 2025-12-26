import React, { useState, useEffect } from 'react';
import hotelsApi from '../../api/hotelsApi';

export function CityStatsCard({ city }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (city) {
            hotelsApi.getCityStats(city).then(setStats).catch(console.error);
        }
    }, [city]);

    if (!stats) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h4 className="font-bold text-gray-900 mb-3">{city} Overview</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-teal-50 rounded-lg p-2">
                    <p className="text-xs text-teal-600 font-semibold uppercase">Hotels</p>
                    <p className="text-lg font-bold text-teal-900">{stats.totalHotels || 0}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-blue-600 font-semibold uppercase">Avg Price</p>
                    <p className="text-lg font-bold text-blue-900">Rs. {Math.round(stats.averagePrice || 0)}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2">
                    <p className="text-xs text-purple-600 font-semibold uppercase">Rating</p>
                    <p className="text-lg font-bold text-purple-900">{stats.averageRating?.toFixed(1) || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
}
