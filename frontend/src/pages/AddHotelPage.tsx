import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';
import hotelService from '../services/hotel.service';
import { toast } from 'react-toastify';
import { Plus, Trash2, Hotel, Save, X, Image as ImageIcon } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ImageUpload from '../components/common/ImageUpload';

interface PricingConfiguration {
    rentType: string;
    mealPlan: string;
    mealService: string;
    price: string | number;
}

interface RoomType {
    type: string;
    price: string | number;
    availableRooms: string | number;
    description: string;
    amenities: string[];
    maxOccupancy: string | number;
    images: string[];
    pricingConfigurations: PricingConfiguration[];
    allowedRentTypes: string[];
    allowedMealPlans: string[];
    allowedMealServices: string[];
}

interface HotelForm {
    name: string;
    location: string;
    description: string;
    amenities: string[];
    contactInfo: string;
    latitude: string | number;
    longitude: string | number;
    minPrice: string | number;
    rating: string | number;
    images: string[];
    totalRooms: string | number;
}

const RENT_TYPES = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' }
];

const MEAL_PLANS = [
    { value: 'NONE', label: 'No Meal' },
    { value: 'BREAKFAST', label: 'Breakfast' },
    { value: 'HALF_BOARD', label: 'Half Board' },
    { value: 'FULL_BOARD', label: 'Full Board' }
];

const MEAL_SERVICES = [
    { value: 'BUFFET', label: 'Buffet' },
    { value: 'ROOM_SERVICE', label: 'Room Service' },
    { value: 'ALACARTE', label: 'A la Carte' }
];

/**
 * AddHotelPage
 * Admin/Partner page to add new hotels and rooms
 */
export const AddHotelPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Hotel Details State
    const [hotelData, setHotelData] = useState<HotelForm>({
        name: '',
        location: '',
        description: '',
        amenities: [],
        contactInfo: '',
        latitude: '',
        longitude: '',
        minPrice: '',
        rating: 0,
        images: [],
        totalRooms: 0
    });

    // Room Types State
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([
        {
            type: '',
            price: '',
            availableRooms: '',
            description: '',
            amenities: [],
            maxOccupancy: 2,
            images: [],
            pricingConfigurations: [],
            allowedRentTypes: ['DAILY'],
            allowedMealPlans: ['NONE'],
            allowedMealServices: ['BUFFET']
        }
    ]);

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

    const handleRoomChange = (index: number, field: keyof RoomType, value: any) => {
        const updatedRooms = [...roomTypes];
        updatedRooms[index] = { ...updatedRooms[index], [field]: value };
        setRoomTypes(updatedRooms);
    };

    const addRoomType = () => {
        setRoomTypes([...roomTypes, {
            type: '',
            price: '',
            availableRooms: '',
            description: '',
            amenities: [],
            maxOccupancy: 2,
            images: [],
            pricingConfigurations: [],
            allowedRentTypes: ['DAILY'],
            allowedMealPlans: ['NONE'],
            allowedMealServices: ['BUFFET']
        }]);
    };

    const removeRoomType = (index: number) => {
        if (roomTypes.length > 1) {
            const updatedRooms = roomTypes.filter((_, i) => i !== index);
            setRoomTypes(updatedRooms);
        }
    };

    const handlePricingConfigAdd = (roomIndex: number) => {
        const updatedRooms = [...roomTypes];
        updatedRooms[roomIndex].pricingConfigurations.push({
            rentType: 'DAILY',
            mealPlan: 'NONE',
            mealService: 'BUFFET',
            price: ''
        });
        setRoomTypes(updatedRooms);
    };

    const handlePricingConfigChange = (roomIndex: number, configIndex: number, field: keyof PricingConfiguration, value: string | number) => {
        const updatedRooms = [...roomTypes];
        updatedRooms[roomIndex].pricingConfigurations[configIndex] = {
            ...updatedRooms[roomIndex].pricingConfigurations[configIndex],
            [field]: value
        };
        setRoomTypes(updatedRooms);
    };

    const handlePricingConfigRemove = (roomIndex: number, configIndex: number) => {
        const updatedRooms = [...roomTypes];
        updatedRooms[roomIndex].pricingConfigurations = updatedRooms[roomIndex].pricingConfigurations.filter((_, i) => i !== configIndex);
        setRoomTypes(updatedRooms);
    };

    const validateForm = () => {
        if (!hotelData.name || !hotelData.location || !hotelData.description) {
            toast.error('Please fill in all required hotel details');
            return false;
        }

        for (const room of roomTypes) {
            if (!room.type || !room.price || !room.availableRooms) {
                toast.error('Please fill in all required room details');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            // 1. Create Hotel
            const hotelPayload = {
                ...hotelData,
                latitude: Number(hotelData.latitude) || 0,
                longitude: Number(hotelData.longitude) || 0,
                minPrice: Number(hotelData.minPrice) || 0,
                rating: Number(hotelData.rating) || 0,
                totalRooms: Number(hotelData.totalRooms) || 0
            };

            const createdHotel = await hotelService.createHotel(hotelPayload);

            if (createdHotel && createdHotel.id) {
                const hotelId = createdHotel.id;

                // 2. Create Room Types
                if (roomTypes && roomTypes.length > 0) {
                    toast.info(`Creating ${roomTypes.length} room type(s)...`);

                    let createdRoomsCount = 0;
                    for (let i = 0; i < roomTypes.length; i++) {
                        const roomType = roomTypes[i];
                        try {
                            const roomPayload = {
                                roomType: roomType.type,
                                basePrice: parseFloat(roomType.price as string),
                                maxPrice: parseFloat(roomType.price as string),
                                capacity: parseInt(roomType.maxOccupancy as string) || 2,
                                amenities: roomType.amenities || [],
                                description: roomType.description || '',
                                active: true,
                                images: roomType.images || [],
                                roomNumber: `${roomType.type.substring(0, 3).toUpperCase()}-${i + 1}`,
                                // Pricing configuration
                                pricingConfigurations: roomType.pricingConfigurations.map(c => ({
                                    ...c,
                                    price: parseFloat(c.price as string)
                                })),
                                allowedRentTypes: roomType.allowedRentTypes,
                                allowedMealPlans: roomType.allowedMealPlans,
                                allowedMealServices: roomType.allowedMealServices
                            };

                            await hotelService.addRoom(hotelId, roomPayload);
                            createdRoomsCount++;

                            // Show progress
                            if (roomTypes.length > 1) {
                                toast.info(`Created room ${i + 1} of ${roomTypes.length}`, { autoClose: 1000 });
                            }
                        } catch (error: any) {
                            console.error(`Failed to create room type ${roomType.type}:`, error);
                            toast.error(`Failed to create room type: ${roomType.type}`);
                        }
                    }

                    if (createdRoomsCount > 0) {
                        toast.success(`Hotel created with ${createdRoomsCount} room type(s)!`);
                    } else {
                        toast.warning('Hotel created but no rooms were added. Please add rooms manually.');
                    }
                } else {
                    toast.success('Hotel added successfully!');
                }

                navigate('/admin/hotels');
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
                        onChange={handleHotelChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Grand Hyatt Kathmandu"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                        type="text"
                        name="location"
                        value={hotelData.location}
                        onChange={handleHotelChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Lazimpat, Kathmandu"
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                        type="number"
                        name="latitude"
                        step="any"
                        value={hotelData.latitude}
                        onChange={handleHotelChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                        type="number"
                        name="longitude"
                        step="any"
                        value={hotelData.longitude}
                        onChange={handleHotelChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
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
                                label={`Add Image ${hotelData.images.length + 1}`}
                                description="Upload hotel image (recommended 1200x800px)"
                            />
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-2">You can upload up to 5 images. Images are uploaded immediately.</p>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={() => setCurrentStep(2)}>
                    Next: Room Types
                </Button>
            </div>
        </Card>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            {roomTypes.map((room, index) => (
                <Card key={index} className="p-6 relative">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Room Type #{index + 1}</h3>
                        {roomTypes.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeRoomType(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                            <input
                                type="text"
                                value={room.type}
                                onChange={(e) => handleRoomChange(index, 'type', e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                placeholder="e.g. Deluxe King"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night *</label>
                            <input
                                type="number"
                                value={room.price}
                                onChange={(e) => handleRoomChange(index, 'price', e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                placeholder="NPR"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                            <input
                                type="number"
                                value={room.availableRooms}
                                onChange={(e) => handleRoomChange(index, 'availableRooms', e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={room.description}
                                onChange={(e) => handleRoomChange(index, 'description', e.target.value)}
                                className="w-full p-2 border rounded-lg h-20"
                            />
                        </div>
                    </div>

                    {/* Room Images */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Room Images</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {room.images.map((imageUrl, imgIndex) => (
                                <div key={imgIndex}>
                                    <ImageUpload
                                        value={imageUrl}
                                        onChange={(url) => {
                                            const newImages = [...room.images];
                                            if (url) {
                                                newImages[imgIndex] = url;
                                            } else {
                                                newImages.splice(imgIndex, 1);
                                            }
                                            handleRoomChange(index, 'images', newImages);
                                        }}
                                        label={`Image ${imgIndex + 1}`}
                                        description="Upload room image (recommended 1200x800px)"
                                    />
                                </div>
                            ))}
                            {room.images.length < 3 && (
                                <div>
                                    <ImageUpload
                                        value=""
                                        onChange={(url) => {
                                            if (url) {
                                                handleRoomChange(index, 'images', [...room.images, url]);
                                            }
                                        }}
                                        label={`Add Image ${room.images.length + 1}`}
                                        description="Upload room image (recommended 1200x800px)"
                                    />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">You can upload up to 3 images per room type.</p>
                    </div>

                    {/* Pricing Configuration */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-800">Pricing Configuration</h4>
                            <button
                                type="button"
                                onClick={() => handlePricingConfigAdd(index)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                <Plus size={16} /> Add Pricing Rule
                            </button>
                        </div>

                        <div className="space-y-3">
                            {room.pricingConfigurations.length === 0 && (
                                <p className="text-sm text-gray-500 italic text-center py-2">No pricing rules added. Click "Add Pricing Rule" to configure pricing.</p>
                            )}
                            {room.pricingConfigurations.map((config, configIndex) => (
                                <div key={configIndex} className="flex flex-wrap items-end gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="w-full sm:w-auto flex-1">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Rent Type</label>
                                        <select
                                            value={config.rentType}
                                            onChange={(e) => handlePricingConfigChange(index, configIndex, 'rentType', e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border rounded-lg"
                                        >
                                            {RENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="w-full sm:w-auto flex-1">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Meal Plan</label>
                                        <select
                                            value={config.mealPlan}
                                            onChange={(e) => handlePricingConfigChange(index, configIndex, 'mealPlan', e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border rounded-lg"
                                        >
                                            {MEAL_PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="w-full sm:w-auto flex-1">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Service</label>
                                        <select
                                            value={config.mealService}
                                            onChange={(e) => handlePricingConfigChange(index, configIndex, 'mealService', e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border rounded-lg"
                                        >
                                            {MEAL_SERVICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Price (NPR)</label>
                                        <input
                                            type="number"
                                            value={config.price}
                                            onChange={(e) => handlePricingConfigChange(index, configIndex, 'price', e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border rounded-lg"
                                            placeholder="Price"
                                            min="0"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handlePricingConfigRemove(index, configIndex)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove rule"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            ))}

            <div className="flex justify-center">
                <Button variant="outline" onClick={addRoomType} className="gap-2">
                    <Plus size={18} /> Add Another Room Type
                </Button>
            </div>

            <div className="flex justify-between pt-6 border-t">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="gap-2 bg-green-600 hover:bg-green-700">
                    <Save size={18} /> {loading ? 'Saving...' : 'Save Hotel & Rooms'}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-900">Add New Hotel</h1>
                        <p className="text-slate-600 mt-2">Enter hotel details and room configurations</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                            <span className={currentStep >= 1 ? 'text-indigo-900 font-medium' : 'text-gray-500'}>Hotel Details</span>
                            <div className="w-12 h-1 bg-gray-200">
                                <div className={`h-full bg-indigo-600 transition-all ${currentStep > 1 ? 'w-full' : 'w-0'}`}></div>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                            <span className={currentStep >= 2 ? 'text-indigo-900 font-medium' : 'text-gray-500'}>Room Types</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AddHotelPage;
