import React from 'react';
import { useNavigate } from 'react-router-dom';

export function HotelCard({ hotel }: { hotel: any }) {
    const navigate = useNavigate();

    const hotelId = hotel.hotelId || hotel.id || hotel.hotelCode;
    const hotelName = hotel.hotelName || hotel.name || 'Boutique Hotel';
    const city = hotel.city || hotel.address || 'Nepal';
    const stars = hotel.stars || hotel.starRating || (hotel.rating ? Math.round(hotel.rating) : 4);
    const price = hotel.price || hotel.minPrice || hotel.startingPrice || (hotel.rooms?.[0]?.basePrice) || 2500;
    const description = hotel.shortDescription || hotel.description || 'Experience comfort and hospitality at its finest.';
    
    // Image handling
    let imageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
    if (hotel.thumbnailUrl) {
        imageUrl = hotel.thumbnailUrl;
    } else if (Array.isArray(hotel.images) && hotel.images.length > 0) {
        imageUrl = hotel.images[0];
    } else if (typeof hotel.images === 'string' && hotel.images) {
        imageUrl = hotel.images;
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-800 group flex flex-col h-full">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={hotelName}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-sm">★</span>
                        <span className="font-bold text-gray-800 dark:text-slate-200 text-sm">{stars}</span>
                    </div>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-teal-600 transition-colors">
                            {hotelName}
                        </h3>
                        <p className="text-gray-500 dark:text-slate-400 text-sm flex items-center gap-1 mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {city}
                        </p>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-slate-300 text-sm line-clamp-2 mb-4 h-10">
                    {description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800 mt-auto">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold">Starts from</p>
                        <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                            Rs. {price}
                            <span className="text-sm text-gray-400 font-normal">/night</span>
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/hotels/${hotelId}`)}
                        className="px-4 py-2 bg-gray-900 dark:bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 dark:hover:bg-teal-700 transition-colors shadow-sm"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}
