import React, { useState, useEffect } from 'react';
import { Heart, MapPin } from 'lucide-react';
import { HotelCard } from './HotelCard';
import PropTypes from 'prop-types';


/**
 * RecommendationsSection Component
 * Displays personalized hotel recommendations
 */
const RecommendationsSection = ({ hotels = [] }) => {

    if (hotels.length === 0) {
        return null;
    }


    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Heart className="text-red-500 fill-red-500" />
                        Recommended For You
                    </h2>
                    <p className="text-slate-600 mt-2 flex items-center gap-1">
                        <MapPin size={16} />
                        Based on your location and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {hotels.map((hotel, index) => (
                        <HotelCard key={hotel.hotelCode || hotel.hotelId || `hotel-${index}`} hotel={hotel} />
                    ))}
                </div>
            </div>
        </section>
    );
};

RecommendationsSection.propTypes = {
    userId: PropTypes.string,
    limit: PropTypes.number
};

export default RecommendationsSection;
