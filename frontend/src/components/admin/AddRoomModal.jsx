import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ROOM_TYPES = [
    { value: 'Standard', label: 'Standard', color: 'from-blue-500 to-blue-600' },
    { value: 'Deluxe', label: 'Deluxe', color: 'from-purple-500 to-purple-600' },
    { value: 'Suite', label: 'Suite', color: 'from-amber-500 to-amber-600' },
    { value: 'Presidential', label: 'Presidential', color: 'from-rose-500 to-rose-600' }
];

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
    { value: 'ALACARTE', label: 'Ali Carte' }
];

const AMENITIES = [
    { id: 'wifi', label: 'WiFi', icon: '📶' },
    { id: 'tv', label: 'TV', icon: '📺' },
    { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
    { id: 'minibar', label: 'Mini Bar', icon: '🍷' },
    { id: 'balcony', label: 'Balcony', icon: '🌅' },
    { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { id: 'gym', label: 'Gym Access', icon: '💪' },
    { id: 'pool', label: 'Pool Access', icon: '🏊' }
];

export function AddRoomModal({ isOpen, onClose, onSave, editingRoom = null, existingRooms = [] }) {
    const [formData, setFormData] = useState({
        roomNumber: '',
        type: 'Standard',
        basePrice: '',
        maxPrice: '',
        capacity: 2,
        amenities: [],
        active: true,
        description: '',
        pricingConfigurations: [], // Array of { rentType, mealPlan, mealService, price }
        allowedRentTypes: ['DAILY'],
        allowedMealPlans: ['NONE'],
        allowedMealServices: ['BUFFET']
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editingRoom) {
            setFormData({
                roomNumber: editingRoom.roomNumber || '',
                type: editingRoom.roomType || editingRoom.type || 'Standard',
                basePrice: editingRoom.basePrice || '',
                maxPrice: editingRoom.maxPrice || '',
                capacity: editingRoom.capacity || 2,
                amenities: editingRoom.amenities || [],
                active: editingRoom.active !== false,
                description: editingRoom.description || '',
                pricingConfigurations: editingRoom.pricingConfigurations || [],
                allowedRentTypes: editingRoom.allowedRentTypes || ['DAILY'],
                allowedMealPlans: editingRoom.allowedMealPlans || ['NONE'],
                allowedMealServices: editingRoom.allowedMealServices || ['BUFFET']
            });
        } else {
            setFormData({
                roomNumber: '',
                type: 'Standard',
                basePrice: '',
                maxPrice: '',
                capacity: 2,
                amenities: [],
                active: true,
                description: '',
                pricingConfigurations: [],
                allowedRentTypes: ['DAILY'],
                allowedMealPlans: ['NONE'],
                allowedMealServices: ['BUFFET']
            });
        }
        setErrors({});
    }, [editingRoom, isOpen]);

    const validate = () => {
        const newErrors = {};

        // Room Number: Not blank, 1-10 chars, Uppercase alphanumeric + hyphens
        if (!formData.roomNumber.trim()) {
            newErrors.roomNumber = 'Room number is required';
        } else if (!/^[A-Z0-9-]{1,10}$/.test(formData.roomNumber)) {
            newErrors.roomNumber = 'Must be 1-10 chars, A-Z, 0-9, and \"-\" only';
        }

        // Base Price: Not null, 0.01 - 999999.99, max 2 decimals
        const basePrice = parseFloat(formData.basePrice);
        if (!formData.basePrice || isNaN(basePrice) || basePrice <= 0) {
            newErrors.basePrice = 'Price must be greater than 0';
        } else if (basePrice > 999999.99) {
            newErrors.basePrice = 'Price cannot exceed 999,999.99';
        }

        // Max Price: 0.01 - 999999.99
        if (formData.maxPrice) {
            const maxPrice = parseFloat(formData.maxPrice);
            if (isNaN(maxPrice) || maxPrice <= 0) {
                newErrors.maxPrice = 'Max price must be greater than 0';
            } else if (maxPrice > 999999.99) {
                newErrors.maxPrice = 'Max price cannot exceed 999,999.99';
            }
        }

        // Capacity: 1 - 20
        const capacity = parseInt(formData.capacity);
        if (!formData.capacity || isNaN(capacity) || capacity < 1 || capacity > 20) {
            newErrors.capacity = 'Capacity must be between 1 and 20';
        }

        // Amenities: Max 20
        if (formData.amenities.length > 20) {
            newErrors.amenities = 'Maximum 20 amenities allowed';
        }

        // Validate Pricing Configurations
        if (formData.pricingConfigurations.length > 0) {
            const invalidConfig = formData.pricingConfigurations.find(config =>
                !config.price || isNaN(parseFloat(config.price)) || parseFloat(config.price) < 0
            );
            if (invalidConfig) {
                newErrors.pricingConfigurations = 'All pricing rules must have a valid non-negative price';
            }
        }

        // Validate Allowed Options
        if (formData.allowedRentTypes.length === 0) {
            newErrors.allowedRentTypes = 'At least one rent type must be selected';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            // Construct payload explicitly to ensure 'type' is not sent, only 'roomType'
            const payload = {
                roomNumber: formData.roomNumber,
                roomType: formData.type,
                basePrice: parseFloat(formData.basePrice),
                maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
                capacity: parseInt(formData.capacity),
                amenities: formData.amenities,
                active: formData.active,
                description: formData.description,
                pricingConfigurations: formData.pricingConfigurations,
                allowedRentTypes: formData.allowedRentTypes,
                allowedMealPlans: formData.allowedMealPlans,
                allowedMealServices: formData.allowedMealServices
            };

            await onSave(payload);
            onClose();
        } catch (error) {
            console.error('Error saving room:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleAmenity = (amenityId) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenityId)
                ? prev.amenities.filter(a => a !== amenityId)
                : [...prev.amenities, amenityId]
        }));
    };

    const handlePricingConfigAdd = () => {
        setFormData(prev => ({
            ...prev,
            pricingConfigurations: [...prev.pricingConfigurations, {
                rentType: 'DAILY',
                mealPlan: 'NONE',
                mealService: 'BUFFET',
                price: ''
            }]
        }));
    };

    const handlePricingConfigChange = (index, field, value) => {
        const newConfigs = [...formData.pricingConfigurations];
        newConfigs[index] = { ...newConfigs[index], [field]: value };
        setFormData(prev => ({ ...prev, pricingConfigurations: newConfigs }));
    };

    const handlePricingConfigRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            pricingConfigurations: prev.pricingConfigurations.filter((_, i) => i !== index)
        }));
    };

    const handleMultiSelectChange = (field, value) => {
        setFormData(prev => {
            const current = prev[field] || [];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    if (!isOpen) return null;

    const activeRooms = existingRooms.filter(r => r.active);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex">
                {/* Existing Rooms Sidebar - Enhanced UI */}
                {!editingRoom && activeRooms.length > 0 && (
                    <div className="w-80 bg-gradient-to-br from-gray-50 to-gray-100 border-r border-gray-200 p-5 overflow-y-auto">
                        <div className="mb-4 pb-3 border-b border-gray-300">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <div className="p-2 bg-teal-500 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <span>Available Rooms</span>
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 ml-11">{activeRooms.length} room{activeRooms.length !== 1 ? 's' : ''} currently active</p>
                        </div>

                        <div className="space-y-3">
                            {activeRooms.map(room => {
                                const roomTypeColors = {
                                    'Standard': 'from-blue-400 to-blue-600',
                                    'Deluxe': 'from-purple-400 to-purple-600',
                                    'Suite': 'from-amber-400 to-amber-600',
                                    'Presidential': 'from-rose-400 to-rose-600',
                                    'Executive': 'from-indigo-400 to-indigo-600'
                                };

                                return (
                                    <div
                                        key={room.id}
                                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        {/* Room Header with Type Color */}
                                        <div className={`bg-gradient-to-r ${roomTypeColors[room.roomType || room.type] || 'from-gray-400 to-gray-600'} px-3 py-2 flex items-center justify-between`}>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                                <span className="font-bold text-white text-sm">#{room.roomNumber}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-white bg-white/20 px-2 py-0.5 rounded-full">
                                                {room.roomType || room.type}
                                            </span>
                                        </div>

                                        {/* Room Details */}
                                        <div className="p-3 space-y-2">
                                            {/* Price */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Base Price
                                                </span>
                                                <span className="text-sm font-bold text-teal-600">
                                                    Rs. {room.basePrice?.toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Amenities Count */}
                                            {room.amenities && room.amenities.length > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>{room.amenities.length} amenit{room.amenities.length !== 1 ? 'ies' : 'y'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Stats */}
                        <div className="mt-5 pt-4 border-t border-gray-300">
                            <div className="bg-white rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Total Rooms</span>
                                    <span className="font-bold text-gray-900">{activeRooms.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Price Range</span>
                                    <span className="font-bold text-gray-900">
                                        Rs. {Math.min(...activeRooms.map(r => r.basePrice)).toLocaleString()} - {Math.max(...activeRooms.map(r => r.basePrice)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Form */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {editingRoom ? 'Edit Room' : 'Add New Room'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                        <div className="space-y-6">
                            {/* Room Number & Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Room Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.roomNumber}
                                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value.toUpperCase() })}
                                        className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.roomNumber ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="e.g., 101"
                                    />
                                    {errors.roomNumber && (
                                        <p className="text-red-500 text-xs mt-1">{errors.roomNumber}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Room Type *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    >
                                        {ROOM_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Base Price, Max Price & Capacity */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Base Price (NPR) *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rs.</span>
                                        <input
                                            type="number"
                                            value={formData.basePrice}
                                            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                            className={`w-full pl-12 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.basePrice ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="e.g., 5000"
                                            min="0.01"
                                            step="0.01"
                                        />
                                    </div>
                                    {errors.basePrice && (
                                        <p className="text-red-500 text-xs mt-1">{errors.basePrice}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Price (NPR)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rs.</span>
                                        <input
                                            type="number"
                                            value={formData.maxPrice}
                                            onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                                            className={`w-full pl-12 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.maxPrice ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="e.g., 7000"
                                            min="0.01"
                                            step="0.01"
                                        />
                                    </div>
                                    {errors.maxPrice && (
                                        <p className="text-red-500 text-xs mt-1">{errors.maxPrice}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Capacity (Persons) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.capacity ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="1-20"
                                        min="1"
                                        max="20"
                                    />
                                    {errors.capacity && (
                                        <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                    rows="3"
                                    placeholder="Brief description of the room..."
                                    maxLength="500"
                                />
                                <div className="text-xs text-gray-500 text-right mt-1">
                                    {formData.description.length}/500
                                </div>
                            </div>

                            {/* --- New Configurations --- */}

                            {/* Allowed Options (Rent Types, Meal Plans, Services) */}
                            <div className="space-y-4 border-t border-gray-200 pt-4">
                                <h3 className="font-semibold text-gray-800">Room Options</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Rent Types */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Rent Types</label>
                                        <div className="space-y-2">
                                            {RENT_TYPES.map(type => (
                                                <label key={type.value} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.allowedRentTypes.includes(type.value)}
                                                        onChange={() => handleMultiSelectChange('allowedRentTypes', type.value)}
                                                        className="rounded text-teal-600 focus:ring-teal-500"
                                                    />
                                                    {type.label}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.allowedRentTypes && (
                                            <p className="text-red-500 text-xs mt-1">{errors.allowedRentTypes}</p>
                                        )}
                                    </div>

                                    {/* Meal Plans */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Meal Plans</label>
                                        <div className="space-y-2">
                                            {MEAL_PLANS.map(plan => (
                                                <label key={plan.value} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.allowedMealPlans.includes(plan.value)}
                                                        onChange={() => handleMultiSelectChange('allowedMealPlans', plan.value)}
                                                        className="rounded text-teal-600 focus:ring-teal-500"
                                                    />
                                                    {plan.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Meal Services */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Meal Services</label>
                                        <div className="space-y-2">
                                            {MEAL_SERVICES.map(service => (
                                                <label key={service.value} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.allowedMealServices.includes(service.value)}
                                                        onChange={() => handleMultiSelectChange('allowedMealServices', service.value)}
                                                        className="rounded text-teal-600 focus:ring-teal-500"
                                                    />
                                                    {service.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Configurations */}
                            <div className="space-y-4 border-t border-gray-200 pt-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">Pricing Configurations</h3>
                                    <button
                                        type="button"
                                        onClick={handlePricingConfigAdd}
                                        className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Rule
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.pricingConfigurations.length === 0 && (
                                        <p className="text-sm text-gray-500 italic text-center py-2">No specific pricing rules added. Base price will apply.</p>
                                    )}
                                    {formData.pricingConfigurations.map((config, index) => (
                                        <div key={index} className="flex flex-wrap items-end gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="w-full sm:w-auto flex-1">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Rent Type</label>
                                                <select
                                                    value={config.rentType}
                                                    onChange={(e) => handlePricingConfigChange(index, 'rentType', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm border rounded-lg"
                                                >
                                                    {RENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="w-full sm:w-auto flex-1">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Meal Plan</label>
                                                <select
                                                    value={config.mealPlan}
                                                    onChange={(e) => handlePricingConfigChange(index, 'mealPlan', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm border rounded-lg"
                                                >
                                                    {MEAL_PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="w-full sm:w-auto flex-1">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Service</label>
                                                <select
                                                    value={config.mealService}
                                                    onChange={(e) => handlePricingConfigChange(index, 'mealService', e.target.value)}
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
                                                    onChange={(e) => handlePricingConfigChange(index, 'price', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm border rounded-lg"
                                                    placeholder="Price"
                                                    min="0"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handlePricingConfigRemove(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove rule"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {errors.pricingConfigurations && (
                                    <p className="text-red-500 text-xs mt-1">{errors.pricingConfigurations}</p>
                                )}
                            </div>

                            {/* Amenities */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Amenities
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {AMENITIES.map(amenity => (
                                        <button
                                            key={amenity.id}
                                            type="button"
                                            onClick={() => toggleAmenity(amenity.id)}
                                            className={`p-3 rounded-xl border-2 transition-all text-center ${formData.amenities.includes(amenity.id)
                                                ? 'border-teal-500 bg-teal-50 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{amenity.icon}</div>
                                            <div className="text-xs font-medium text-gray-700">{amenity.label}</div>
                                        </button>
                                    ))}
                                </div>
                                {errors.amenities && (
                                    <p className="text-red-500 text-xs mt-1">{errors.amenities}</p>
                                )}
                            </div>

                            {/* Availability */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                                />
                                <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Room is available for booking
                                </label>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {editingRoom ? 'Update Room' : 'Add Room'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

AddRoomModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    editingRoom: PropTypes.object,
    existingRooms: PropTypes.array
};
