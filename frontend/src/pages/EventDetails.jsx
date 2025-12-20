import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Tag, Share2, Heart } from 'lucide-react';
import eventService from '../services/eventService';
import LoadingFallback from '../components/LoadingFallback';

const EventDetails = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            const response = await eventService.getEventDetails(eventId);
            setEvent(response.data);
        } catch (error) {
            console.error('Error fetching event details:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleBookNow = () => {
        navigate(`/events/${eventId}/book`);
    };

    if (loading) {
        return <LoadingFallback fullScreen message="Loading event details..." />;
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
                    <button
                        onClick={() => navigate('/events')}
                        className="text-blue-500 hover:text-blue-600"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600">
                {event.imageUrl && (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12">
                    <div className="text-white">
                        <div className="flex items-center gap-3 mb-4">
                            {event.category && (
                                <span className="bg-blue-500 px-4 py-1 rounded-full text-sm font-semibold">
                                    {event.category}
                                </span>
                            )}
                            <span className="bg-green-500 px-4 py-1 rounded-full text-sm font-semibold">
                                {event.status || 'Available'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
                        <p className="text-xl text-gray-200">{event.description}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Event Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Event Information */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Information</h2>

                            <div className="space-y-4">
                                {/* Date & Time */}
                                <div className="flex items-start">
                                    <Calendar className="w-6 h-6 text-blue-500 mr-4 mt-1" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Date & Time</p>
                                        <p className="text-gray-600">{formatDate(event.startDateTime)}</p>
                                        <p className="text-gray-600">{formatTime(event.startDateTime)}</p>
                                    </div>
                                </div>

                                {/* Location */}
                                {event.venue && (
                                    <div className="flex items-start">
                                        <MapPin className="w-6 h-6 text-red-500 mr-4 mt-1" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Venue</p>
                                            <p className="text-gray-600">{event.venue.name}</p>
                                            {event.venue.address && (
                                                <p className="text-gray-500 text-sm">{event.venue.address}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Capacity */}
                                {event.totalCapacity && (
                                    <div className="flex items-start">
                                        <Users className="w-6 h-6 text-green-500 mr-4 mt-1" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Capacity</p>
                                            <p className="text-gray-600">
                                                {event.availableSeats || event.totalCapacity} seats available
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Duration */}
                                {event.endDateTime && (
                                    <div className="flex items-start">
                                        <Clock className="w-6 h-6 text-purple-500 mr-4 mt-1" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Duration</p>
                                            <p className="text-gray-600">
                                                Until {formatDate(event.endDateTime)} at {formatTime(event.endDateTime)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* About Event */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {event.description}
                            </p>
                        </div>

                        {/* Organizer Info */}
                        {event.organizer && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Organizer</h2>
                                <p className="text-gray-700">{event.organizer}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Tickets</h3>

                            {/* Price Range */}
                            {event.minPrice !== undefined && (
                                <div className="mb-6">
                                    <div className="flex items-center text-gray-700 mb-2">
                                        <Tag className="w-5 h-5 mr-2 text-yellow-500" />
                                        <span className="font-semibold">Price Range</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        ${event.minPrice}
                                        {event.maxPrice && event.maxPrice !== event.minPrice && ` - $${event.maxPrice}`}
                                    </p>
                                </div>
                            )}

                            {/* Book Now Button */}
                            <button
                                onClick={handleBookNow}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors mb-4"
                            >
                                Book Now
                            </button>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                                    <Heart className="w-4 h-4 mr-2" />
                                    Save
                                </button>
                                <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Event ID:</strong> {event.id}
                                </p>
                                {event.totalCapacity && (
                                    <p className="text-sm text-gray-600">
                                        <strong>Seats Available:</strong> {event.availableSeats || event.totalCapacity} / {event.totalCapacity}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
