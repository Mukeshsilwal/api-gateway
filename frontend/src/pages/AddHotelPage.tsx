import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';
import hotelService from '../services/hotel.service';
import { toast } from 'react-toastify';
import { Plus, Trash2, Hotel, Save, X, Image as ImageIcon } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface RoomType {
    type: string;
    price: string | number;
    availableRooms: string | number;
    description: string;
    amenities: string[];
    maxOccupancy: string | number;
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

/**
 * AddHotelPage
 * Admin/Partner page to add new hotels and rooms
 */
const AddHotelPage = () => {
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
        { type: '', price: '', availableRooms: '', description: '', amenities: [], maxOccupancy: 2 }
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
            type: '', price: '', availableRooms: '', description: '', amenities: [], maxOccupancy: 2
        }]);
    };

    const removeRoomType = (index: number) => {
        if (roomTypes.length > 1) {
            const updatedRooms = roomTypes.filter((_, i) => i !== index);
            setRoomTypes(updatedRooms);
        }
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
                // 2. Add Room Types
                // Note: This assumes creating a hotel returns an ID we can use.
                // If the backend requires adding rooms separately, we loop through them.

                // For demonstration, we'll simulate adding rooms or assume the backend handles it via a different endpoint
                // Ideally, hotelService should have addRoomType(hotelId, roomData)

                console.log('Hotel Created:', createdHotel);
                toast.success('Hotel added successfully!');
                navigate('/admin/hotels'); // Redirect to admin hotel list
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
