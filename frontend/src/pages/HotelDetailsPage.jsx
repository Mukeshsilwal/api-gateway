import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import hotelsApi from '../api/hotelsApi';
import { AvailabilityModal } from '../components/hotels/AvailabilityModal';
import { toast } from 'react-toastify';

export function HotelDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        const fetchHotelDetails = async () => {
            try {
                setLoading(true);
                const data = await hotelsApi.getHotelDetails(id);
                setHotel(data);
            } catch (err) {
                console.error('Failed to load hotel details', err);
                setError('Failed to load hotel details. Please try again.');
                toast.error('Unable to fetch hotel details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchHotelDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="text-red-500 text-xl font-semibold mb-4">{error || 'Hotel not found'}</div>
                <button
                    onClick={() => navigate('/hotels')}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                    Back to Hotels
                </button>
            </div>
        );
    }

    const images = hotel.images && hotel.images.length > 0
        ? hotel.images
        : [hotel.thumbnailUrl || 'https://placehold.co/800x600?text=No+Image'];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Image Gallery */}
            <div className="relative h-[50vh] bg-gray-900">
                <img
                    src={images[activeImageIndex]}
                    alt={hotel.hotelName}
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{hotel.hotelName}</h1>
                    <div className="flex items-center gap-4 text-white/90">
                        <span className="flex items-center gap-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {hotel.city}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="text-yellow-400 text-xl">★</span>
                            <span className="font-bold">{hotel.stars} Stars</span>
                        </span>
                    </div>
                </div>

                {/* Image Thumbnails */}
                {images.length > 1 && (
                    <div className="absolute bottom-8 right-8 flex gap-2 overflow-x-auto max-w-md">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-teal-500 scale-105' : 'border-white/50 opacity-70 hover:opacity-100'}`}
                            >
                                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Hotel</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {hotel.description || 'No description available.'}
                            </p>
                        </div>

                        {/* Amenities */}
                        {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {hotel.amenities.map((amenity, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl">
                                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews Summary (Placeholder) */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Guest Reviews</h2>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="text-4xl font-bold text-gray-900">4.5</div>
                                <div>
                                    <div className="flex text-yellow-400">★★★★★</div>
                                    <p className="text-sm text-gray-500">Based on 128 reviews</p>
                                </div>
                            </div>
                            {/* Review items would go here */}
                            <p className="text-gray-500 italic">Reviews feature coming soon.</p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                            <div className="mb-6">
                                <p className="text-sm text-gray-500 uppercase font-semibold">Starting from</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-teal-600">Rs. {hotel.price || 'N/A'}</span>
                                    <span className="text-gray-500">/night</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsAvailabilityModalOpen(true)}
                                className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                Check Availability
                            </button>

                            <div className="mt-6 space-y-4 text-sm text-gray-600 border-t pt-6">
                                <div className="flex justify-between">
                                    <span>Check-in</span>
                                    <span className="font-semibold">2:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Check-out</span>
                                    <span className="font-semibold">12:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cancellation</span>
                                    <span className="font-semibold text-green-600">Free up to 24h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AvailabilityModal
                isOpen={isAvailabilityModalOpen}
                onClose={() => setIsAvailabilityModalOpen(false)}
                hotel={hotel}
            />
        </div>
    );
}
