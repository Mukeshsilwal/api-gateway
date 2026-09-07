import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Hotel, Save, Star } from 'lucide-react';
import hotelService from '../../services/hotel.service';
import { HotelDto } from '../../types/dto';

interface EditHotelModalProps {
    isOpen: boolean;
    onClose: () => void;
    hotel: HotelDto | null;
    onHotelUpdated: () => void;
}

export const EditHotelModal: React.FC<EditHotelModalProps> = ({
    isOpen,
    onClose,
    hotel,
    onHotelUpdated
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        hotelCode: '',
        address: '',
        city: '',
        country: 'Nepal',
        phone: '',
        email: '',
        description: '',
        stars: 3,
        rating: 0,
        minPrice: '',
        maxPrice: '',
        amenities: [] as string[]
    });

    const amenityOptions = [
        "WiFi", "Swimming Pool", "Gym", "Spa", "Restaurant", "Bar",
        "Parking", "Conference Room", "Air Conditioning", "Room Service"
    ];

    useEffect(() => {
        if (hotel) {
            let parsedAmenities: string[] = [];
            if (Array.isArray(hotel.amenities)) {
                parsedAmenities = hotel.amenities;
            } else if (typeof (hotel as any).amenities === 'string') {
                parsedAmenities = (hotel as any).amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
            }

            setFormData({
                name: hotel.name || '',
                hotelCode: hotel.hotelCode || '',
                address: hotel.address || '',
                city: hotel.city || '',
                country: hotel.country || 'Nepal',
                phone: hotel.phone || (hotel as any).contactPhone || '',
                email: hotel.email || (hotel as any).contactEmail || '',
                description: hotel.description || '',
                stars: hotel.stars || (hotel as any).starRating || 3,
                rating: hotel.rating || 0,
                minPrice: hotel.minPrice != null ? String(hotel.minPrice) : (hotel.startingPrice != null ? String(hotel.startingPrice) : ''),
                maxPrice: hotel.maxPrice != null ? String(hotel.maxPrice) : '',
                amenities: parsedAmenities
            });
        }
    }, [hotel]);

    if (!isOpen || !hotel) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAmenityToggle = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim()) {
            toast.error('Name, address, and city are required');
            return;
        }

        setLoading(true);
        try {
            const minP = Number(formData.minPrice);
            const maxP = Number(formData.maxPrice);

            const payload: any = {
                name: formData.name.trim(),
                hotelCode: formData.hotelCode,
                address: formData.address.trim(),
                city: formData.city.trim(),
                country: formData.country.trim() || 'Nepal',
                phone: formData.phone.trim() || undefined,
                email: formData.email.trim() || undefined,
                description: formData.description.trim() || undefined,
                stars: Number(formData.stars) || 3,
                rating: Number(formData.rating) || 0,
                amenities: formData.amenities
            };

            if (!isNaN(minP) && minP > 0) {
                payload.minPrice = minP;
            }
            if (!isNaN(maxP) && maxP > 0) {
                payload.maxPrice = maxP;
            }

            await hotelService.updateHotel(hotel.id, payload);
            toast.success('Hotel updated successfully!');
            onHotelUpdated();
            onClose();
        } catch (error: any) {
            console.error('Error updating hotel:', error);
            toast.error(error.message || 'Failed to update hotel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-teal-600/10 to-emerald-600/10 dark:from-teal-950/40 dark:to-emerald-950/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-600 text-white rounded-xl shadow-md">
                            <Hotel className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Hotel</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">Code: {formData.hotelCode}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Hotel Name & Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Hotel Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Hotel Code (Read-only)
                            </label>
                            <input
                                type="text"
                                name="hotelCode"
                                value={formData.hotelCode}
                                disabled
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm font-mono cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Address & City */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Address *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                City *
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Contact Phone & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Phone
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g. +977-9812345678"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="hotel@example.com"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Stars & Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Star Rating
                            </label>
                            <div className="flex items-center gap-1.5 pt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setFormData(p => ({ ...p, stars: star }))}
                                        className={`p-1 rounded-lg transition-transform hover:scale-110 ${
                                            star <= formData.stars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'
                                        }`}
                                    >
                                        <Star className="w-6 h-6 fill-current" />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {formData.stars} Stars
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Min Price (Rs.)
                            </label>
                            <input
                                type="number"
                                name="minPrice"
                                min="0"
                                value={formData.minPrice}
                                onChange={handleChange}
                                placeholder="e.g. 1500"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Max Price (Rs.)
                            </label>
                            <input
                                type="number"
                                name="maxPrice"
                                min="0"
                                value={formData.maxPrice}
                                onChange={handleChange}
                                placeholder="e.g. 8000"
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Write a brief overview of the hotel..."
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm transition-all resize-none"
                        />
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Amenities
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {amenityOptions.map(amenity => {
                                const isSelected = formData.amenities.includes(amenity);
                                return (
                                    <button
                                        type="button"
                                        key={amenity}
                                        onClick={() => handleAmenityToggle(amenity)}
                                        className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all flex items-center justify-between ${
                                            isSelected
                                                ? 'bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-950/40 dark:border-teal-500/80 dark:text-teal-300'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/50'
                                        }`}
                                    >
                                        <span>{amenity}</span>
                                        {isSelected && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
