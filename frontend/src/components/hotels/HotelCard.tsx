import React from 'react';
import { useNavigate } from 'react-router-dom';

export function HotelCard({ hotel }) {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={hotel.thumbnailUrl || 'https://placehold.co/400x300?text=No+Image'}
                    alt={hotel.hotelName}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-sm">★</span>
                        <span className="font-bold text-gray-800 text-sm">{hotel.stars}</span>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
                            {hotel.hotelName}
                        </h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {hotel.city}
                        </p>
                    </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
                    {hotel.shortDescription || 'Experience luxury and comfort at its finest.'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Starts from</p>
                        <p className="text-lg font-bold text-teal-600">
                            Rs. {hotel.price}
                            <span className="text-sm text-gray-400 font-normal">/night</span>
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/hotels/${hotel.hotelId}`)}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}
