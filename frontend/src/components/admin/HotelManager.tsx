import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { DataTable } from './DataTable';
import { RoomManagerModal } from './RoomManagerModal';
import { StaffManager } from './StaffManager';
import { EditHotelModal } from './EditHotelModal';
import hotelService from '../../services/hotel.service';
import { HotelDto, AvailableRoomDto } from '../../types/dto';
import { Column } from './DataTable';

export const HotelManager: React.FC = () => {
    const navigate = useNavigate();
    const [hotels, setHotels] = useState<HotelDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedHotel, setSelectedHotel] = useState<HotelDto | null>(null);
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const response = await hotelService.getAllHotels();
            // Handle varied response structures
            const filteredHotels = (Array.isArray(response) ? response : (response as any).data || []);
            setHotels(filteredHotels);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching hotels:', err);
            setError('Failed to load hotels. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHotel = async (hotelId: number) => {
        if (!window.confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
            return;
        }

        try {
            await hotelService.deleteHotel(hotelId);
            toast.success('Hotel deleted successfully');
            fetchHotels();
        } catch (err: any) {
            console.error('Error deleting hotel:', err);
            toast.error(err.message || 'Failed to delete hotel');
        }
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const hotelColumns: Column<HotelDto>[] = [
        { key: 'id', label: 'ID', sortable: true },
        {
            key: 'name',
            label: 'Hotel Name',
            sortable: true,
            render: (name: string) => <span className="font-medium text-slate-900 dark:text-slate-100">{name}</span>
        },
        { key: 'city', label: 'City', sortable: true },
        {
            key: 'rating',
            label: 'Rating',
            sortable: true,
            render: (rating: number) => (
                <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-700 dark:text-slate-200">{rating}</span>
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
            )
        },
        {
            // Note: 'rooms' is not strictly on HotelDto in dto.ts but it often comes back from API.
            // We might need to extend HotelDto or assume it's there if the backend returns it.
            // Checking dto.ts, HotelDto doesn't have 'rooms' property openly defined, but response might have it.
            // Safe access using (hotel as any).rooms or extending local interface.
            key: 'roomsCount', // Unique key for rooms column
            label: 'Rooms',
            sortable: true,
            render: (_: any, hotel: HotelDto) => {
                const rooms = (hotel as any).rooms;
                return Array.isArray(rooms) ? rooms.length : (typeof rooms === 'number' ? rooms : 'N/A');
            }
        },
        {
            key: 'priceRange', // Unique key for price range column
            label: 'Price Range',
            sortable: false,
            render: (_: any, hotel: HotelDto) => {
                const rooms = (hotel as any).rooms as AvailableRoomDto[];
                if (rooms && Array.isArray(rooms) && rooms.length > 0) {
                    const prices = rooms.map(r => Number(r.basePrice));
                    return `Rs. ${Math.min(...prices)} - ${Math.max(...prices)}`;
                }
                return 'N/A';
            }
        },
        {
            key: 'actions', // Unique key for actions column
            label: 'Actions',
            sortable: false,
            render: (_: any, hotel: HotelDto) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setSelectedHotel(hotel);
                            setIsEditModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium text-sm flex items-center gap-1 border border-blue-200/50 dark:border-blue-800/40"
                        title="Edit hotel details"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>

                    <button
                        onClick={() => {
                            setSelectedHotel(hotel);
                            setIsRoomModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-300 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors font-medium text-sm flex items-center gap-1 border border-teal-200/50 dark:border-teal-800/40"
                        title="View all rooms"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Rooms
                    </button>

                    <button
                        onClick={() => {
                            setSelectedHotel(hotel);
                            setIsStaffModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors font-medium text-sm flex items-center gap-1 border border-purple-200/50 dark:border-purple-800/40"
                        title="Manage hotel staff"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Staff
                    </button>
                    <button
                        onClick={() => handleDeleteHotel(hotel.id)}
                        className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium text-sm flex items-center gap-1 border border-red-200/50 dark:border-red-800/40"
                        title="Delete hotel"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                </div>
            )
        }
    ];

    if (loading && !hotels.length) {
        return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Loading hotels...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                        Hotel Management
                    </h2>
                    <p className="text-gray-600 dark:text-slate-400 mt-1">Manage hotels and room inventory</p>
                </div>
                <button
                    onClick={() => navigate('/add-hotel')}
                    className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Hotel
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            {/* Hotel List */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Registered Hotels</h3>
                <DataTable
                    columns={hotelColumns}
                    data={hotels}
                    itemsPerPage={10}
                    searchable={true}
                    exportable={true}
                />
            </div>

            {selectedHotel && (
                <>
                    <EditHotelModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setSelectedHotel(null);
                        }}
                        hotel={selectedHotel}
                        onHotelUpdated={fetchHotels}
                    />

                    <RoomManagerModal
                        isOpen={isRoomModalOpen}
                        onClose={() => {
                            setIsRoomModalOpen(false);
                            setSelectedHotel(null);
                        }}
                        hotel={selectedHotel}
                    />

                    <StaffManager
                        isOpen={isStaffModalOpen}
                        onClose={() => {
                            setIsStaffModalOpen(false);
                            setSelectedHotel(null);
                        }}
                        hotel={selectedHotel}
                    />
                </>
            )}
        </div>
    );
};
