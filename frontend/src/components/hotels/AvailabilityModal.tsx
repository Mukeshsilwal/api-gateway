import React, { useState } from 'react';
import hotelsApi from '../../api/hotelsApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export function AvailabilityModal({ isOpen, onClose, hotel }) {
    const navigate = useNavigate();
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [rooms, setRooms] = useState(1);
    const [guests, setGuests] = useState(2);
    const [loading, setLoading] = useState(false);
    const [availability, setAvailability] = useState(null);

    if (!isOpen || !hotel) return null;

    const handleCheckAvailability = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAvailability(null);

        try {
            const response = await hotelsApi.checkAvailability(hotel.hotelId, {
                checkInDate: checkIn,
                checkOutDate: checkOut,
                numberOfRooms: rooms,
                numberOfGuests: guests
            });
            setAvailability(response);
        } catch (error) {
            console.error('Availability check failed', error);
            toast.error(error.response?.data?.message || 'Failed to check availability');
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = (roomType) => {
        // Navigate to booking page with pre-filled data
        navigate('/hotel-booking', {
            state: {
                hotel,
                bookingDetails: {
                    checkIn,
                    checkOut,
                    rooms,
                    guests,
                    selectedRoomType: roomType
                }
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                    Check Availability - {hotel.hotelName}
                                </h3>
                                <div className="mt-4">
                                    <form onSubmit={handleCheckAvailability} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Check-in</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={checkIn}
                                                    onChange={(e) => setCheckIn(e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Check-out</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={checkOut}
                                                    onChange={(e) => setCheckOut(e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Rooms</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    required
                                                    value={rooms}
                                                    onChange={(e) => setRooms(parseInt(e.target.value))}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Guests</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    required
                                                    value={guests}
                                                    onChange={(e) => setGuests(parseInt(e.target.value))}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                                        >
                                            {loading ? 'Checking...' : 'Check Availability'}
                                        </button>
                                    </form>
                                </div>

                                {/* Availability Results */}
                                {availability && (
                                    <div className="mt-6 border-t pt-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Available Rooms</h4>
                                        {availability.availableRooms && availability.availableRooms.length > 0 ? (
                                            <div className="space-y-3">
                                                {availability.availableRooms.map((room) => (
                                                    <div key={room.roomTypeId} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{room.roomTypeName}</p>
                                                            <p className="text-sm text-gray-500">Rs. {room.price} / night</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleBookNow(room)}
                                                            className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
                                                        >
                                                            Book Now
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-red-500 text-sm">No rooms available for selected dates.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
