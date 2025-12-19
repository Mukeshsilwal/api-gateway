import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import hotelService from '../../services/hotel.service';
import { AddRoomModal } from './AddRoomModal';
import { RoomStatusManager } from './RoomStatusManager';

const ROOM_TYPE_COLORS = {
    'Standard': 'from-blue-500 to-blue-600',
    'Deluxe': 'from-purple-500 to-purple-600',
    'Suite': 'from-amber-500 to-amber-600',
    'Presidential': 'from-rose-500 to-rose-600',
    'Executive': 'from-indigo-500 to-indigo-600'
};

export function RoomManagerModal({ isOpen, onClose, hotel }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [deletingRoomId, setDeletingRoomId] = useState(null);
    const [selectedRoomForOps, setSelectedRoomForOps] = useState(null);

    const fetchRooms = useCallback(async () => {
        if (!hotel?.hotelCode) return;

        try {
            setLoading(true);
            const response = await hotelService.getRoomsByHotel(hotel.hotelCode);
            const rawRooms = response.data || response || [];

            // Deduplicate rooms by ID to handle backend join duplicates
            const uniqueRooms = Array.from(
                new Map((Array.isArray(rawRooms) ? rawRooms : []).map(room => [room.id, room])).values()
            );

            setRooms(uniqueRooms);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            toast.error('Failed to load rooms');
            setRooms([]);
        } finally {
            setLoading(false);
        }
    }, [hotel?.hotelCode]);

    useEffect(() => {
        if (isOpen && hotel) {
            fetchRooms();
        }
    }, [isOpen, hotel, fetchRooms]);

    const handleAddRoom = async (roomData) => {
        try {
            await hotelService.addRoom(hotel.hotelCode, roomData);
            toast.success('Room added successfully!');
            await fetchRooms();
            setIsAddRoomModalOpen(false);
        } catch (error) {
            console.error('Error adding room:', error);
            toast.error(error.message || 'Failed to add room');
            throw error;
        }
    };

    const handleEditRoom = async (roomData) => {
        try {
            await hotelService.updateRoom(editingRoom.id, roomData);
            toast.success('Room updated successfully!');
            await fetchRooms();
            setEditingRoom(null);
        } catch (error) {
            console.error('Error updating room:', error);
            toast.error(error.message || 'Failed to update room');
            throw error;
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingRoomId(roomId);
            await hotelService.deleteRoom(roomId);
            toast.success('Room deleted successfully!');
            await fetchRooms();
        } catch (error) {
            console.error('Error deleting room:', error);
            toast.error(error.message || 'Failed to delete room');
        } finally {
            setDeletingRoomId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Room Management - {hotel?.name}
                            </h2>
                            <p className="text-white/80 text-sm mt-1">
                                {hotel?.city} • {rooms.length} room{rooms.length !== 1 ? 's' : ''} • Manage operations & maintenance
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Actions Bar */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <button
                            onClick={() => setIsAddRoomModalOpen(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Room
                        </button>
                    </div>

                    {/* Rooms Grid */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                                ))}
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rooms Yet</h3>
                                <p className="text-gray-500 mb-6">Start by adding your first room to this hotel</p>
                                <button
                                    onClick={() => setIsAddRoomModalOpen(true)}
                                    className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                                >
                                    Add Your First Room
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rooms.map(room => (
                                    <div
                                        key={room.id}
                                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        {/* Room Header */}
                                        <div className={`bg-gradient-to-r ${ROOM_TYPE_COLORS[room.roomType || room.type] || 'from-gray-500 to-gray-600'} p-4`}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="text-white/80 text-xs font-semibold mb-1">Room {room.roomNumber}</div>
                                                    <div className="text-white text-lg font-bold">{room.roomType || room.type}</div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${room.active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {room.active ? 'Active' : 'Inactive'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Room Details */}
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 text-sm">Base Price</span>
                                                <span className="text-2xl font-bold text-teal-600">Rs. {room.basePrice?.toLocaleString()}</span>
                                            </div>

                                            {room.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>
                                            )}

                                            {room.amenities && room.amenities.length > 0 && (
                                                <div>
                                                    <div className="text-xs font-semibold text-gray-500 mb-2">Amenities</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {room.amenities.slice(0, 4).map(amenity => (
                                                            <span
                                                                key={amenity}
                                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                                                            >
                                                                {amenity}
                                                            </span>
                                                        ))}
                                                        {room.amenities.length > 4 && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                                                                +{room.amenities.length - 4}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                                                <button
                                                    onClick={() => setSelectedRoomForOps(room)}
                                                    className="w-full px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm flex items-center justify-center gap-1.5"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    Manage Operations
                                                </button>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setEditingRoom(room)}
                                                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center justify-center gap-1.5"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoom(room.id)}
                                                        disabled={deletingRoomId === room.id}
                                                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {deletingRoomId === room.id ? (
                                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Delete
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Room Modal */}
            <AddRoomModal
                isOpen={isAddRoomModalOpen || editingRoom !== null}
                onClose={() => {
                    setIsAddRoomModalOpen(false);
                    setEditingRoom(null);
                }}
                onSave={editingRoom ? handleEditRoom : handleAddRoom}
                editingRoom={editingRoom}
                existingRooms={rooms}
            />

            <RoomStatusManager
                isOpen={!!selectedRoomForOps}
                onClose={() => setSelectedRoomForOps(null)}
                room={selectedRoomForOps}
                hotel={hotel}
                onUpdate={(updatedData) => {
                    console.log('Room updated:', updatedData);
                    // Here you would typically update the local state or refetch
                    fetchRooms();
                }}
            />
        </>
    );
}

RoomManagerModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    hotel: PropTypes.object
};
