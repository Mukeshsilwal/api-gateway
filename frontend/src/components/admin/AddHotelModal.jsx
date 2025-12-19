import React, { useState } from 'react';
import PropTypes from 'prop-types';

export function AddHotelModal({ isOpen, onClose, onSave }) {
    const [step, setStep] = useState(1);
    const [hotelData, setHotelData] = useState({
        name: '',
        hotelCode: '',
        address: '',
        city: '',
        country: 'Nepal',
        phone: '',
        email: '',
        description: '',
        rating: 5,
        stars: 5,
        images: [],
        rooms: []
    });

    const [currentRoom, setCurrentRoom] = useState({
        roomNumber: '',
        type: '',
        description: '',
        capacity: '',
        basePrice: '',
        maxPrice: '',
        amenities: '', // Comma separated string for input
        active: true
    });

    if (!isOpen) return null;

    const handleHotelChange = (e) => {
        const { name, value } = e.target;
        setHotelData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'rating' ? { stars: value } : {})
        }));
    };

    const handleRatingChange = (newRating) => {
        setHotelData(prev => ({ ...prev, rating: newRating, stars: newRating }));
    };

    const handleRoomChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentRoom(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addRoom = () => {
        // Validation
        if (!currentRoom.roomNumber.trim()) {
            alert('Room number is required');
            return;
        }
        if (!/^[A-Z0-9-]{1,10}$/.test(currentRoom.roomNumber)) {
            alert('Room number must be 1-10 chars, uppercase letters, numbers, and hyphens only');
            return;
        }
        if (!currentRoom.type) {
            alert('Room type is required');
            return;
        }
        const basePrice = parseFloat(currentRoom.basePrice);
        if (isNaN(basePrice) || basePrice <= 0 || basePrice > 999999.99) {
            alert('Base price must be between 0.01 and 999,999.99');
            return;
        }
        const maxPrice = currentRoom.maxPrice ? parseFloat(currentRoom.maxPrice) : basePrice;
        if (currentRoom.maxPrice && (isNaN(maxPrice) || maxPrice <= 0 || maxPrice > 999999.99)) {
            alert('Max price must be between 0.01 and 999,999.99');
            return;
        }
        const capacity = parseInt(currentRoom.capacity);
        if (isNaN(capacity) || capacity < 1 || capacity > 20) {
            alert('Capacity must be between 1 and 20');
            return;
        }

        // Convert comma separated amenities to array/set
        const amenitiesList = currentRoom.amenities
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        if (amenitiesList.length > 20) {
            alert('Maximum 20 amenities allowed');
            return;
        }

        const roomToAdd = {
            id: Date.now(),
            roomNumber: currentRoom.roomNumber,
            roomType: currentRoom.type,
            basePrice: basePrice,
            maxPrice: maxPrice,
            capacity: capacity,
            description: currentRoom.description,
            amenities: amenitiesList,
            active: currentRoom.active
        };

        setHotelData(prev => ({
            ...prev,
            rooms: [...prev.rooms, roomToAdd]
        }));

        // Reset form
        setCurrentRoom({
            roomNumber: '',
            type: '',
            description: '',
            capacity: '',
            basePrice: '',
            maxPrice: '',
            amenities: '',
            active: true
        });
    };

    const removeRoom = (roomId) => {
        setHotelData(prev => ({
            ...prev,
            rooms: prev.rooms.filter(r => r.id !== roomId)
        }));
    };

    const handleSubmit = () => {
        onSave(hotelData);
        onClose();
    };

    const steps = [
        { number: 1, title: 'Basic Info' },
        { number: 2, title: 'Contact & Location' },
        { number: 3, title: 'Rooms' },
        { number: 4, title: 'Review' }
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Add New Hotel</h3>
                        <button onClick={onClose} className="text-white hover:text-gray-200">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                            {steps.map((s) => (
                                <div key={s.number} className={`flex flex-col items-center bg-gray-50 px-2 ${step >= s.number ? 'text-teal-600' : 'text-gray-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 transition-colors ${step >= s.number ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {s.number}
                                    </div>
                                    <span className="text-xs font-medium">{s.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={hotelData.name}
                                            onChange={handleHotelChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            placeholder="e.g. Hotel Himalaya"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Code</label>
                                        <input
                                            type="text"
                                            name="hotelCode"
                                            value={hotelData.hotelCode}
                                            onChange={handleHotelChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            placeholder="e.g. HTL-001"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={hotelData.description}
                                        onChange={handleHotelChange}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="Brief description of the hotel..."
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating (Stars)</label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => handleRatingChange(star)}
                                                className={`text-2xl focus:outline-none ${star <= hotelData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Images</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-teal-500 transition-colors">
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
                                                    <span>Upload files</span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files);
                                                            setHotelData(prev => ({ ...prev, images: files }));
                                                        }}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    </div>
                                    {hotelData.images && hotelData.images.length > 0 && (
                                        <div className="mt-4 grid grid-cols-4 gap-4">
                                            {Array.from(hotelData.images).map((file, index) => (
                                                <div key={index} className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt="Preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={hotelData.address}
                                            onChange={handleHotelChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            placeholder="Street Address"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={hotelData.city}
                                            onChange={handleHotelChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={hotelData.country}
                                            onChange={handleHotelChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            placeholder="Country"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={hotelData.phone}
                                            onChange={handleHotelChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            placeholder="Contact Number"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={hotelData.email}
                                            onChange={handleHotelChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            placeholder="Contact Email"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <h4 className="font-semibold text-gray-800 mb-3">Add Room</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="text"
                                            name="roomNumber"
                                            value={currentRoom.roomNumber}
                                            onChange={handleRoomChange}
                                            placeholder="Room Number (e.g. 101)"
                                            className="px-4 py-2 border border-gray-300 rounded-xl"
                                        />
                                        <input
                                            type="text"
                                            name="type"
                                            value={currentRoom.type}
                                            onChange={handleRoomChange}
                                            placeholder="Room Type (e.g. Deluxe)"
                                            className="px-4 py-2 border border-gray-300 rounded-xl"
                                        />
                                        <input
                                            type="number"
                                            name="basePrice"
                                            value={currentRoom.basePrice}
                                            onChange={handleRoomChange}
                                            placeholder="Base Price"
                                            className="px-4 py-2 border border-gray-300 rounded-xl"
                                        />
                                        <input
                                            type="number"
                                            name="maxPrice"
                                            value={currentRoom.maxPrice}
                                            onChange={handleRoomChange}
                                            placeholder="Max Price (Optional)"
                                            className="px-4 py-2 border border-gray-300 rounded-xl"
                                        />
                                        <input
                                            type="number"
                                            name="capacity"
                                            value={currentRoom.capacity}
                                            onChange={handleRoomChange}
                                            placeholder="Capacity (persons)"
                                            className="px-4 py-2 border border-gray-300 rounded-xl"
                                        />
                                        <input
                                            type="text"
                                            name="amenities"
                                            value={currentRoom.amenities}
                                            onChange={handleRoomChange}
                                            placeholder="Amenities (comma separated)"
                                            className="px-4 py-2 border border-gray-300 rounded-xl"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <textarea
                                            name="description"
                                            value={currentRoom.description}
                                            onChange={handleRoomChange}
                                            rows="2"
                                            placeholder="Room Description"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                                        ></textarea>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <input
                                            type="checkbox"
                                            name="active"
                                            checked={currentRoom.active}
                                            onChange={handleRoomChange}
                                            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                        />
                                        <label className="text-sm text-gray-700">Active</label>
                                    </div>

                                    <button
                                        onClick={addRoom}
                                        disabled={!currentRoom.roomNumber || !currentRoom.type || !currentRoom.basePrice}
                                        className="w-full py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Add Room
                                    </button>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3">Added Rooms</h4>
                                    {hotelData.rooms.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No rooms added yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {hotelData.rooms.map((room) => (
                                                <div key={room.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Room {room.roomNumber} - {room.type}</p>
                                                        <p className="text-sm text-gray-500">Price: {room.basePrice} | Capacity: {room.capacity}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeRoom(room.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg">{hotelData.name}</h4>
                                            <p className="text-sm text-gray-500">{hotelData.hotelCode}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-yellow-500">★</span>
                                            <span className="font-medium">{hotelData.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mt-2">{hotelData.address}, {hotelData.city}, {hotelData.country}</p>
                                    <p className="text-gray-600 text-sm mt-1">Phone: {hotelData.phone} | Email: {hotelData.email}</p>
                                    <p className="text-gray-600 mt-2 text-sm italic">{hotelData.description}</p>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-800 mb-2">Room Configuration Summary</h5>
                                    <div className="border rounded-xl overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room #</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {hotelData.rooms.map((room) => (
                                                    <tr key={room.id}>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{room.roomNumber}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{room.type}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">{room.basePrice}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">{room.capacity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                        <button
                            onClick={() => setStep(prev => Math.max(1, prev - 1))}
                            disabled={step === 1}
                            className={`px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Back
                        </button>
                        {step < 4 ? (
                            <button
                                onClick={() => setStep(prev => Math.min(4, prev + 1))}
                                className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-lg"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold"
                            >
                                Confirm & Add Hotel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

AddHotelModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
};
