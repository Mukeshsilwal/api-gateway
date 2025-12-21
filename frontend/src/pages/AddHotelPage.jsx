import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import hotelService from '../services/hotel.service';
import imageService from '../services/image.service';
import useGeolocation from '../hooks/useGeolocation';

export function AddHotelPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const { location, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
    const [hotelData, setHotelData] = useState({
        name: '',
        hotelCode: '',
        address: '',
        city: '',
        country: 'Nepal',
        zipCode: '',
        phone: '',
        email: '',
        description: '',
        rating: 5,
        stars: 5,
        latitude: 0,
        longitude: 0,
        website: '',
        amenities: [],
        featured: false,
        images: []
    });

    // Update coordinates when location is received
    useEffect(() => {
        if (location) {
            setHotelData(prev => ({
                ...prev,
                latitude: location.lat,
                longitude: location.lon
            }));
            toast.success('Location captured successfully!');
        }
    }, [location]);

    // Show geolocation errors
    useEffect(() => {
        if (geoError) {
            toast.error(geoError);
        }
    }, [geoError]);

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

    const handleSubmit = async () => {
        try {
            // Comprehensive Frontend Validation
            const errors = [];

            // Name
            if (!hotelData.name?.trim()) errors.push("Hotel name is required");
            else if (hotelData.name.length < 3 || hotelData.name.length > 100) errors.push("Hotel name must be between 3 and 100 characters");

            // Hotel Code
            if (!hotelData.hotelCode?.trim()) errors.push("Hotel code is required");
            else if (!/^[A-Z0-9-_]{3,20}$/.test(hotelData.hotelCode)) errors.push("Hotel code must be 3-20 uppercase alphanumeric chars (hyphens/underscores allowed)");

            // City
            if (!hotelData.city?.trim()) errors.push("City is required");
            else if (hotelData.city.length < 2 || hotelData.city.length > 50) errors.push("City must be between 2 and 50 characters");

            // Address
            if (!hotelData.address?.trim()) errors.push("Address is required");
            else if (hotelData.address.length > 200) errors.push("Address must not exceed 200 characters");

            // Phone
            if (!hotelData.phone?.trim()) errors.push("Phone number is required");
            else if (!/^\+?[1-9]\d{1,14}$/.test(hotelData.phone)) errors.push("Invalid phone number format (E.164)");

            // Email
            if (hotelData.email && hotelData.email.length > 100) errors.push("Email must not exceed 100 characters");
            // Basic email regex
            if (hotelData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hotelData.email)) errors.push("Invalid email format");

            // Stars
            if (!hotelData.stars || hotelData.stars < 1 || hotelData.stars > 5) errors.push("Stars must be between 1 and 5");

            // Description
            if (hotelData.description && hotelData.description.length > 1000) errors.push("Description must not exceed 1000 characters");

            // Amenities
            if (hotelData.amenities.length > 20) errors.push("Maximum 20 amenities allowed");

            // Coordinates
            if (hotelData.latitude === 0 || hotelData.longitude === 0) {
                errors.push("Please provide valid GPS coordinates");
            } else {
                if (hotelData.latitude < -90 || hotelData.latitude > 90) errors.push("Latitude must be between -90 and 90");
                if (hotelData.longitude < -180 || hotelData.longitude > 180) errors.push("Longitude must be between -180 and 180");
            }

            // Images
            if (hotelData.images && hotelData.images.length > 10) errors.push("Maximum 10 images allowed");

            if (errors.length > 0) {
                // Show all errors or just the first few
                errors.forEach(err => toast.error(err));
                return;
            }

            const { images, ...hotelInfo } = hotelData;
            let uploadedImageUrls = [];

            // Step 1: Upload hotel images if provided
            if (images && images.length > 0) {
                toast.info(`Uploading ${images.length} hotel image(s)...`);

                try {
                    // Upload all images
                    for (let i = 0; i < images.length; i++) {
                        const image = images[i];
                        console.log(`Uploading image ${i + 1}/${images.length}:`, image.name);

                        const imageUrl = await imageService.uploadImage(image);
                        console.log(`Image ${i + 1} uploaded successfully:`, imageUrl);
                        uploadedImageUrls.push(imageUrl);
                    }

                    console.log('All images uploaded successfully:', uploadedImageUrls);
                    toast.success(`${uploadedImageUrls.length} image(s) uploaded successfully!`);
                } catch (imageError) {
                    console.error('Image upload failed:', imageError);
                    toast.error(`Image upload failed: ${imageError.message}`);
                    return; // Stop if image upload fails
                }
            }

            // Step 2: Create hotel with complete data
            toast.info('Creating hotel...');

            const hotelDataToSend = {
                ...hotelInfo,
                images: uploadedImageUrls,
                hotelImageUrl: uploadedImageUrls[0] || '', // Use first image as main image
                // Convert numeric fields properly
                rating: parseFloat(hotelInfo.rating) || 5.0,
                stars: parseInt(hotelInfo.stars) || 5,
                latitude: parseFloat(hotelInfo.latitude),
                longitude: parseFloat(hotelInfo.longitude)
            };

            console.log('Sending hotel data:', JSON.stringify(hotelDataToSend, null, 2));

            try {
                const response = await hotelService.createHotel(hotelDataToSend);
                console.log('Hotel created successfully:', response);

                toast.success('Hotel created successfully!');
                navigate('/admin/panel', { state: { tab: 'hotels' } });
            } catch (hotelError) {
                console.error('Hotel creation failed:', hotelError);

                // Extract detailed error message
                let errorMessage = 'Failed to create hotel';

                if (hotelError.response?.data) {
                    const errorData = hotelError.response.data;
                    console.error('Backend validation error:', errorData);

                    // Handle validation errors
                    if (errorData.errors && Array.isArray(errorData.errors)) {
                        errorMessage = errorData.errors.map(e => e.message || e).join(', ');
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (typeof errorData === 'string') {
                        errorMessage = errorData;
                    }
                } else if (hotelError.message) {
                    errorMessage = hotelError.message;
                }

                toast.error(errorMessage);
                // Don't re-throw, just log and show error
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            // If error wasn't already handled by inner catch, show it
            if (!error.response) {
                toast.error(error.message || 'An unexpected error occurred');
            }
        }
    };

    const steps = [
        { number: 1, title: 'Basic Info' },
        { number: 2, title: 'Contact & Location' },
        { number: 3, title: 'Review' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Add New Hotel</h1>
                            <p className="text-teal-100 mt-1">Complete all steps to add your hotel</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin')}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                            {steps.map((s) => (
                                <div key={s.number} className={`flex flex-col items-center bg-gray-50 px-4 ${step >= s.number ? 'text-teal-600' : 'text-gray-400'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${step >= s.number ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>
                                        {s.number}
                                    </div>
                                    <span className="text-sm font-semibold">{s.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Step Content */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hotel Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={hotelData.name}
                                        onChange={handleHotelChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="e.g. Hotel Himalaya"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hotel Code *</label>
                                    <input
                                        type="text"
                                        name="hotelCode"
                                        value={hotelData.hotelCode}
                                        onChange={handleHotelChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="e.g. HTL-001"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={hotelData.description}
                                    onChange={handleHotelChange}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="Brief description of the hotel..."
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating (Stars)</label>
                                <div className="flex items-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRatingChange(star)}
                                            className={`text-3xl focus:outline-none transition-colors ${star <= hotelData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                    <span className="ml-2 text-gray-600 font-medium">{hotelData.rating} Stars</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Hotel Images</label>
                                <div className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-xl hover:border-teal-500 transition-colors">
                                    <div className="space-y-2 text-center">
                                        <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-semibold text-teal-600 hover:text-teal-500 focus-within:outline-none">
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
                                            <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden border-2 border-gray-200">
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
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact & Location</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={hotelData.address}
                                        onChange={handleHotelChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="Street Address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={hotelData.city}
                                        onChange={handleHotelChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={hotelData.country}
                                        onChange={handleHotelChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="Country"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={hotelData.phone}
                                        onChange={handleHotelChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="Contact Number"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={hotelData.email}
                                        onChange={handleHotelChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="Contact Email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Zip Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={hotelData.zipCode}
                                        onChange={handleHotelChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="Postal Code"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={hotelData.website}
                                        onChange={handleHotelChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="https://example.com"
                                    />
                                </div>

                                {/* GPS Coordinates Section with Get Location Button */}
                                <div className="md:col-span-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-semibold text-gray-700">GPS Coordinates *</label>
                                        <button
                                            type="button"
                                            onClick={requestLocation}
                                            disabled={geoLoading}
                                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                        >
                                            {geoLoading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Getting Location...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Get Current Location
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                name="latitude"
                                                value={hotelData.latitude}
                                                onChange={handleHotelChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                                placeholder="27.7172"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                name="longitude"
                                                value={hotelData.longitude}
                                                onChange={handleHotelChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                                placeholder="85.3240"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amenities</label>
                                    <input
                                        type="text"
                                        name="amenities"
                                        value={hotelData.amenities.join(', ')}
                                        onChange={(e) => {
                                            const amenitiesList = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                                            setHotelData(prev => ({ ...prev, amenities: amenitiesList }));
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="Free WiFi, Pool, Gym, Restaurant (comma separated)"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="featured"
                                            checked={hotelData.featured}
                                            onChange={(e) => setHotelData(prev => ({ ...prev, featured: e.target.checked }))}
                                            className="w-5 h-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm font-semibold text-gray-700">Mark as Featured Hotel</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Confirm</h2>
                            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{hotelData.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">Code: {hotelData.hotelCode}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-yellow-500 text-xl">★</span>
                                        <span className="font-bold text-lg">{hotelData.rating}</span>
                                    </div>
                                </div>
                                <div className="space-y-2 text-gray-700">
                                    <p><span className="font-semibold">Address:</span> {hotelData.address}, {hotelData.city}, {hotelData.country}</p>
                                    <p><span className="font-semibold">Phone:</span> {hotelData.phone}</p>
                                    <p><span className="font-semibold">Email:</span> {hotelData.email}</p>
                                    <p className="italic mt-3">{hotelData.description}</p>
                                </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-blue-800 text-sm">
                                <p className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">Note:</span> You can add rooms to this hotel from the &quot;Manage Rooms&quot; section after creating the hotel.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Footer */}
                <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center">
                    <button
                        onClick={() => setStep(prev => Math.max(1, prev - 1))}
                        disabled={step === 1}
                        className={`px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        ← Back
                    </button>
                    <div className="text-sm text-gray-600">
                        Step {step} of {steps.length}
                    </div>
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(prev => Math.min(3, prev + 1))}
                            className="px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-lg font-semibold"
                        >
                            Next Step →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold"
                        >
                            ✓ Confirm & Add Hotel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
