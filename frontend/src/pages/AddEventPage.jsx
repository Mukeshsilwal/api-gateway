import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import eventService from '../services/eventService';
import imageService from '../services/image.service';

export function AddEventPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [eventData, setEventData] = useState({
        name: '',
        category: 'MUSIC',
        type: 'OFFLINE',
        startDateTime: '',
        endDateTime: '',
        timezone: 'Asia/Kathmandu',
        description: '',
        shortDescription: '',
        coverImage: null,
        images: [],
        tags: '',
        language: 'English',
        // Venue (for offline/hybrid)
        venueName: '',
        venueAddress: '',
        venueCity: '',
        venueState: '',
        venueCountry: 'Nepal',
        venuePostalCode: '',
        venueCapacity: '',
        // Online link (for online/hybrid)
        onlineLink: '',
        // Ticketing
        ticketTypes: [],
        salesStartDate: '',
        salesEndDate: '',
        maxTicketsPerOrder: 10,
        minTicketsPerOrder: 1,
        // Additional details
        ageRestriction: '',
        dressCode: '',
        parkingInfo: '',
        accessibilityFeatures: '',
        refundPolicy: '',
        status: 'DRAFT'
    });

    const [currentTicket, setCurrentTicket] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        availableFrom: '',
        availableTo: '',
        benefits: '',
        isActive: true
    });

    const categories = ['MUSIC', 'SPORTS', 'CONFERENCE', 'WORKSHOP', 'EXHIBITION', 'FESTIVAL', 'THEATER', 'COMEDY', 'OTHER'];
    const eventTypes = ['OFFLINE', 'ONLINE', 'HYBRID'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData(prev => ({ ...prev, [name]: value }));
    };

    const handleTicketChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentTicket(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addTicketType = () => {
        if (!currentTicket.name || !currentTicket.price || !currentTicket.quantity) {
            toast.error('Please fill in ticket name, price, and quantity');
            return;
        }

        const ticket = {
            id: Date.now(),
            name: currentTicket.name,
            description: currentTicket.description,
            price: parseFloat(currentTicket.price),
            quantity: parseInt(currentTicket.quantity),
            availableFrom: currentTicket.availableFrom || eventData.salesStartDate,
            availableTo: currentTicket.availableTo || eventData.salesEndDate,
            benefits: currentTicket.benefits.split(',').map(b => b.trim()).filter(b => b),
            sortOrder: eventData.ticketTypes.length,
            isActive: currentTicket.isActive
        };

        setEventData(prev => ({
            ...prev,
            ticketTypes: [...prev.ticketTypes, ticket]
        }));

        setCurrentTicket({
            name: '',
            description: '',
            price: '',
            quantity: '',
            availableFrom: '',
            availableTo: '',
            benefits: '',
            isActive: true
        });
    };

    const removeTicket = (ticketId) => {
        setEventData(prev => ({
            ...prev,
            ticketTypes: prev.ticketTypes.filter(t => t.id !== ticketId)
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // Validation
            if (!eventData.name || !eventData.startDateTime || !eventData.endDateTime) {
                toast.error('Please fill in event name and dates');
                return;
            }

            if (eventData.type !== 'ONLINE' && !eventData.venueName) {
                toast.error('Please provide venue information for offline/hybrid events');
                return;
            }

            if (eventData.type !== 'OFFLINE' && !eventData.onlineLink) {
                toast.error('Please provide online link for online/hybrid events');
                return;
            }

            // Upload images
            let coverImageUrl = '';
            let imageUrls = [];

            if (eventData.coverImage) {
                toast.info('Uploading cover image...');
                coverImageUrl = await imageService.uploadImage(eventData.coverImage);
            }

            if (eventData.images && eventData.images.length > 0) {
                toast.info(`Uploading ${eventData.images.length} additional images...`);
                for (const image of eventData.images) {
                    const url = await imageService.uploadImage(image);
                    imageUrls.push(url);
                }
            }

            // Prepare event data
            const eventPayload = {
                name: eventData.name,
                category: eventData.category,
                type: eventData.type,
                startDateTime: eventData.startDateTime,
                endDateTime: eventData.endDateTime,
                timezone: eventData.timezone,
                description: eventData.description,
                shortDescription: eventData.shortDescription,
                coverImage: coverImageUrl,
                images: imageUrls,
                tags: eventData.tags.split(',').map(t => t.trim()).filter(t => t),
                language: eventData.language,
                status: 'PENDING_REVIEW', // Submit for admin review
            };

            // Add venue for offline/hybrid
            if (eventData.type !== 'ONLINE') {
                eventPayload.venue = {
                    name: eventData.venueName,
                    address: {
                        street: eventData.venueAddress,
                        city: eventData.venueCity,
                        state: eventData.venueState,
                        country: eventData.venueCountry,
                        postalCode: eventData.venuePostalCode
                    },
                    capacity: parseInt(eventData.venueCapacity) || 0
                };
            }

            // Add online link for online/hybrid
            if (eventData.type !== 'OFFLINE') {
                eventPayload.onlineLink = eventData.onlineLink;
            }

            // Add ticketing info
            if (eventData.ticketTypes.length > 0) {
                eventPayload.ticketing = {
                    ticketTypes: eventData.ticketTypes.map(({ id, ...ticket }) => ticket),
                    salesStartDate: eventData.salesStartDate,
                    salesEndDate: eventData.salesEndDate,
                    maxTicketsPerOrder: eventData.maxTicketsPerOrder,
                    minTicketsPerOrder: eventData.minTicketsPerOrder
                };
            }

            // Add additional details
            eventPayload.additionalDetails = {
                ageRestriction: eventData.ageRestriction,
                dressCode: eventData.dressCode,
                parkingInfo: eventData.parkingInfo,
                accessibilityFeatures: eventData.accessibilityFeatures.split(',').map(f => f.trim()).filter(f => f),
                refundPolicy: eventData.refundPolicy
            };

            console.log('Creating event:', eventPayload);
            toast.info('Creating event...');

            const response = await eventService.createEvent(eventPayload);
            console.log('Event created:', response);

            toast.success('Event created successfully!');
            navigate('/admin/panel', { state: { tab: 'events' } });
        } catch (error) {
            console.error('Error creating event:', error);
            toast.error(error.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: 'Basic Info' },
        { number: 2, title: 'Venue & Schedule' },
        { number: 3, title: 'Ticketing' },
        { number: 4, title: 'Review' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Create New Event</h1>
                            <p className="text-purple-100 mt-1">Complete all steps to create your event</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/panel')}
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
                                <div key={s.number} className={`flex flex-col items-center bg-gray-50 px-4 ${step >= s.number ? 'text-purple-600' : 'text-gray-400'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${step >= s.number ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>
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
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={eventData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g. Tech Conference 2025"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                                    <select
                                        name="category"
                                        value={eventData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type *</label>
                                    <select
                                        name="type"
                                        value={eventData.type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        {eventTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                                    <input
                                        type="text"
                                        name="shortDescription"
                                        value={eventData.shortDescription}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Brief one-line description"
                                        maxLength={150}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                    <textarea
                                        name="description"
                                        value={eventData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Detailed event description..."
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={eventData.tags}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="tech, conference, networking"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                                    <input
                                        type="text"
                                        name="language"
                                        value={eventData.language}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="English"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setEventData(prev => ({ ...prev, coverImage: e.target.files[0] }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Images</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => setEventData(prev => ({ ...prev, images: Array.from(e.target.files) }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Venue & Schedule */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Venue & Schedule</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        name="startDateTime"
                                        value={eventData.startDateTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        name="endDateTime"
                                        value={eventData.endDateTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                {eventData.type !== 'ONLINE' && (
                                    <>
                                        <div className="md:col-span-2">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Venue Information</h3>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Venue Name *</label>
                                            <input
                                                type="text"
                                                name="venueName"
                                                value={eventData.venueName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="Convention Center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity</label>
                                            <input
                                                type="number"
                                                name="venueCapacity"
                                                value={eventData.venueCapacity}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                            <input
                                                type="text"
                                                name="venueAddress"
                                                value={eventData.venueAddress}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="Street Address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                            <input
                                                type="text"
                                                name="venueCity"
                                                value={eventData.venueCity}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="Kathmandu"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                                            <input
                                                type="text"
                                                name="venueCountry"
                                                value={eventData.venueCountry}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="Nepal"
                                            />
                                        </div>
                                    </>
                                )}

                                {eventData.type !== 'OFFLINE' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Online Link *</label>
                                        <input
                                            type="url"
                                            name="onlineLink"
                                            value={eventData.onlineLink}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="https://zoom.us/j/..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Ticketing */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ticketing</h2>

                            {/* Add Ticket Form */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3">Add Ticket Type</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input
                                        type="text"
                                        name="name"
                                        value={currentTicket.name}
                                        onChange={handleTicketChange}
                                        placeholder="Ticket Name (e.g. Early Bird)"
                                        className="px-4 py-2 border border-gray-300 rounded-xl"
                                    />
                                    <input
                                        type="number"
                                        name="price"
                                        value={currentTicket.price}
                                        onChange={handleTicketChange}
                                        placeholder="Price"
                                        className="px-4 py-2 border border-gray-300 rounded-xl"
                                    />
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={currentTicket.quantity}
                                        onChange={handleTicketChange}
                                        placeholder="Quantity"
                                        className="px-4 py-2 border border-gray-300 rounded-xl"
                                    />
                                    <input
                                        type="text"
                                        name="benefits"
                                        value={currentTicket.benefits}
                                        onChange={handleTicketChange}
                                        placeholder="Benefits (comma separated)"
                                        className="px-4 py-2 border border-gray-300 rounded-xl"
                                    />
                                </div>
                                <button
                                    onClick={addTicketType}
                                    className="w-full py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                                >
                                    Add Ticket Type
                                </button>
                            </div>

                            {/* Added Tickets */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Added Ticket Types</h4>
                                {eventData.ticketTypes.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No ticket types added yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {eventData.ticketTypes.map((ticket) => (
                                            <div key={ticket.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{ticket.name}</p>
                                                    <p className="text-sm text-gray-500">Price: NPR {ticket.price} | Quantity: {ticket.quantity}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeTicket(ticket.id)}
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

                            {/* Sales Period */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sales Start Date</label>
                                    <input
                                        type="datetime-local"
                                        name="salesStartDate"
                                        value={eventData.salesStartDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sales End Date</label>
                                    <input
                                        type="datetime-local"
                                        name="salesEndDate"
                                        value={eventData.salesEndDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{eventData.name}</h3>
                                <div className="space-y-2 text-gray-700">
                                    <p><span className="font-semibold">Category:</span> {eventData.category}</p>
                                    <p><span className="font-semibold">Type:</span> {eventData.type}</p>
                                    <p><span className="font-semibold">Start:</span> {eventData.startDateTime}</p>
                                    <p><span className="font-semibold">End:</span> {eventData.endDateTime}</p>
                                    {eventData.type !== 'ONLINE' && (
                                        <p><span className="font-semibold">Venue:</span> {eventData.venueName}, {eventData.venueCity}</p>
                                    )}
                                    {eventData.type !== 'OFFLINE' && (
                                        <p><span className="font-semibold">Online Link:</span> {eventData.onlineLink}</p>
                                    )}
                                    <p><span className="font-semibold">Ticket Types:</span> {eventData.ticketTypes.length}</p>
                                    <p className="italic mt-3">{eventData.description}</p>
                                </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-blue-800 text-sm">
                                <p className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">Note:</span> Event will be submitted for admin review before publishing.
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
                    {step < 4 ? (
                        <button
                            onClick={() => setStep(prev => Math.min(4, prev + 1))}
                            className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg font-semibold"
                        >
                            Next Step →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : '✓ Create Event'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
