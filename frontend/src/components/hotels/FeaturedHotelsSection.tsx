import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { HotelCard } from './HotelCard';
import PropTypes from 'prop-types';


/**
 * FeaturedHotelsSection Component
 * Displays featured hotels in a carousel
 */
const FeaturedHotelsSection = ({ hotels = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        if (hotels.length <= 3) return;
        setCurrentIndex((prev) => (prev >= hotels.length - 3 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        if (hotels.length <= 3) return;
        setCurrentIndex((prev) => (prev <= 0 ? hotels.length - 3 : prev - 1));
    };

    if (hotels.length === 0) {
        return null;
    }


    return (
        <section className="py-12 bg-gradient-to-br from-primary/5 to-purple-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Sparkles className="text-primary" />
                            Featured Hotels
                        </h2>
                        <p className="text-slate-600 mt-2">Handpicked accommodations just for you</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={prevSlide}
                            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:bg-primary hover:text-white"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:bg-primary hover:text-white"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                <div className="relative overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out gap-6"
                        style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
                    >
                        {hotels.map((hotel, index) => (
                            <div key={hotel.hotelCode || hotel.hotelId || hotel.id || `hotel-${index}`} className="flex-shrink-0 w-full md:w-1/3">
                                <HotelCard hotel={hotel} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

FeaturedHotelsSection.propTypes = {
    limit: PropTypes.number
};

export default FeaturedHotelsSection;
