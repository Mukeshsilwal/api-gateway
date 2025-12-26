import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';
import hotelService from '../services/hotel.service';
import { toast } from 'react-toastify';
import { Hotel, Save, MapPin } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ImageUpload from '../components/common/ImageUpload';
import useGeolocation from '../hooks/useGeolocation';



interface HotelForm {
    name: string;
    hotelCode: string; // Added hotelCode
    description: string;
    amenities: string[];
    contactInfo: string;
    address: string;
    city: string;
    country: string;
    latitude: string | number;
    longitude: string | number;
    minPrice: string | number;
    maxPrice: string | number; // Added maxPrice
    stars: string | number; // Added stars
    rating: string | number;
    images: string[];
    totalRooms: string | number;
}



/**
 * AddHotelPage
 * Admin/Partner page to add new hotels and rooms
 */
export const AddHotelPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Hotel Details State
    const [hotelData, setHotelData] = useState<HotelForm>({
        name: '',
        hotelCode: '',
        address: '',
        city: '',
        country: 'Nepal',
        description: '',
        amenities: [],
        contactInfo: '',
        latitude: '',
        longitude: '',
        minPrice: '',
        maxPrice: '',
        stars: 3,
        rating: 0,
        images: [],
        totalRooms: 0
    });

    // Geolocation Hook
    const { location: userLocation, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

    // Update form when location is fetched
    useEffect(() => {
        if (userLocation) {
            setHotelData(prev => ({
                ...prev,
                latitude: userLocation.lat,
                longitude: userLocation.lon
            }));
            toast.success('Location obtained successfully');
        }
    }, [userLocation]);

    useEffect(() => {
        if (geoError) {
            toast.error(geoError);
        }
    }, [geoError]);

    // Available Amenities Options
    const amenityOptions = [
        "WiFi", "Swimming Pool", "Gym", "Spa", "Restaurant", "Bar",
        "Parking", "Conference Room", "Air Conditioning", "Room Service"
    ];

    const handleHotelChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setHotelData(prev => ({ ...prev, [name]: value }));
    };

    const handleHotelAmenityToggle = (amenity: string) => {
        setHotelData(prev => {
            const newAmenities = prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity];
            return { ...prev, amenities: newAmenities };
        });
    };

    // Track active uploads
    const [activeUploads, setActiveUploads] = useState(0);

    const handleUploadStatus = (isUploading: boolean) => {
        setActiveUploads(prev => isUploading ? prev + 1 : Math.max(0, prev - 1));
    };

    const isSubmitDisabled = loading || activeUploads > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hotelData.name || !hotelData.address || !hotelData.city || !hotelData.country || !hotelData.description || !hotelData.hotelCode || !hotelData.stars) {
            toast.error('Please fill in all required hotel details (including Hotel Code and Stars)');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Hotel
            const hotelPayload = {
                ...hotelData,
                latitude: Number(hotelData.latitude) || 0,
                longitude: Number(hotelData.longitude) || 0,
                minPrice: Number(hotelData.minPrice) || 0,
                maxPrice: Number(hotelData.maxPrice) || Number(hotelData.minPrice) || 0,
                stars: Number(hotelData.stars) || 3,
                rating: Number(hotelData.rating) || 0,
                totalRooms: Number(hotelData.totalRooms) || 0
            };

            const createdHotel = await hotelService.createHotel(hotelPayload) as any;

            if (createdHotel && createdHotel.id) {
                toast.success('Hotel added successfully! Please add rooms in the Hotel Manager.');
                navigate('/admin');
            } else {
                throw new Error('Failed to create hotel - No ID returned');
            }

        } catch (error: any) {
            console.error('Error adding hotel:', error);
            toast.error(error.message || 'Failed to add hotel');
        } finally {
            setLoading(false);
        }
    };

    // Render Steps
    const renderStep1 = () => (
        <Card className="p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
                <Hotel className="text-indigo-600" />
                Hotel Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={hotelData.name}
                        onChange={(e) => {
                            const name = e.target.value;
                            // Auto-generate code if code is empty or matches previous auto-gen
                            // MUST be uppercase for backend validation
                            const code = name.toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                            setHotelData(prev => ({
                                ...prev,
                                name,
                                hotelCode: prev.hotelCode && prev.hotelCode !== code.substring(0, prev.hotelCode.length) ? prev.hotelCode : code
                            }));
                        }}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Grand Hyatt Kathmandu"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Code (Unique) *</label>
                    <input
                        type="text"
                        name="hotelCode"
                        value={hotelData.hotelCode}
                        onChange={handleHotelChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                        placeholder="e.g. GRAND-HYATT-KTM"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input
                        type="text"
                        name="address"
                        value={hotelData.address}
                        onChange={handleHotelChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Lazimpat Road"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                        type="text"
                        name="city"
                        value={hotelData.city}
                        onChange={handleHotelChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Kathmandu"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <input
                        type="text"
                        name="country"
                        value={hotelData.country}
                        onChange={handleHotelChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Nepal"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                        name="description"
                        value={hotelData.description}
                        onChange={handleHotelChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 h-24"
                        placeholder="Brief description of the hotel..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                    <input
                        type="text"
                        name="contactInfo"
                        value={hotelData.contactInfo}
                        onChange={handleHotelChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Phone or Email"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating (1-5) *</label>
                        <select
                            name="stars"
                            value={hotelData.stars}
                            onChange={(e) => setHotelData(prev => ({ ...prev, stars: e.target.value }))}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="1">1 Star</option>
                            <option value="2">2 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="5">5 Stars</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Rating (0-5)</label>
                        <input
                            type="number"
                            name="rating"
                            min="0"
                            max="5"
                            step="0.1"
                            value={hotelData.rating}
                            onChange={handleHotelChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (NPR)</label>
                        <input
                            type="number"
                            name="minPrice"
                            min="0"
                            value={hotelData.minPrice}
                            onChange={handleHotelChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Min Price"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (NPR)</label>
                        <input
                            type="number"
                            name="maxPrice"
                            min="0"
                            value={hotelData.maxPrice}
                            onChange={handleHotelChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Max Price"
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Location Coordinates</label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={requestLocation}
                            disabled={geoLoading}
                            className="flex items-center gap-1 text-xs"
                        >
                            {geoLoading ? (
                                <span className="animate-spin">⌛</span>
                            ) : (
                                <MapPin size={14} />
                            )}
                            {geoLoading ? 'Getting Location...' : 'Get Current Location'}
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                            <input
                                type="number"
                                name="latitude"
                                step="any"
                                value={hotelData.latitude}
                                onChange={handleHotelChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. 27.7172"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                            <input
                                type="number"
                                name="longitude"
                                step="any"
                                value={hotelData.longitude}
                                onChange={handleHotelChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. 85.3240"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                    {amenityOptions.map(amenity => (
                        <button
                            key={amenity}
                            type="button"
                            onClick={() => handleHotelAmenityToggle(amenity)}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${hotelData.amenities.includes(amenity)
                                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {amenity}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hotel Images */}
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">Hotel Images</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotelData.images.map((imageUrl, index) => (
                        <div key={index}>
                            <ImageUpload
                                value={imageUrl}
                                onChange={(url) => {
                                    const newImages = [...hotelData.images];
                                    if (url) {
                                        newImages[index] = url;
                                    } else {
                                        newImages.splice(index, 1);
                                    }
                                    setHotelData(prev => ({ ...prev, images: newImages }));
                                }}
                                onUploadStatusChange={handleUploadStatus}
                                label={`Image ${index + 1}`}
                                description="Upload hotel image (recommended 1200x800px)"
                            />
                        </div>
                    ))}
                    {hotelData.images.length < 5 && (
                        <div>
                            <ImageUpload
                                value=""
                                onChange={(url) => {
                                    if (url) {
                                        setHotelData(prev => ({
                                            ...prev,
                                            images: [...prev.images, url]
                                        }));
                                    }
                                }}
                                onUploadStatusChange={handleUploadStatus}
                                label={`Add Image ${hotelData.images.length + 1}`}
                                description="Upload hotel image (recommended 1200x800px)"
                            />
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-2">You can upload up to 5 images. Images are uploaded immediately.</p>
                {activeUploads > 0 && <p className="text-sm text-amber-600 font-medium mt-2 animate-pulse">Uploading {activeUploads} image(s)... Please wait.</p>}
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={handleSubmit} disabled={isSubmitDisabled} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Save size={18} />
                    {loading ? 'Creating...' : (activeUploads > 0 ? `Waiting for Uploads...` : 'Create Hotel')}
                </Button>
            </div>
        </Card >
    );




    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-900">Add New Hotel</h1>
                        <p className="text-slate-600 mt-2">Enter hotel details. You can add rooms later in the Hotel Manager.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {renderStep1()}
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AddHotelPage;
