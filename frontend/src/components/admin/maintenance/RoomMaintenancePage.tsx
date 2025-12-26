import React, { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import { Wrench, Search, Filter, RefreshCw } from 'lucide-react';
import { DataTable } from '../DataTable';
import RoomMaintenancePanel from './RoomMaintenancePanel';
import hotelService from '../../../services/hotel.service';

interface Room {
    id: string | number;
    roomNumber: string;
    roomType: string;
    cleaningStatus: string;
    amenitiesChecked: boolean;
    maintenanceRequired: boolean;
    hotelName?: string;
    hotelId?: string | number;
    [key: string]: any;
}

interface Hotel {
    id: number | string;
    hotelCode: string;
    name: string;
    [key: string]: any;
}

/**
 * RoomMaintenancePage Component
 * Full page for managing room maintenance across all hotels
 */
const RoomMaintenancePage: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [filters, setFilters] = useState({
        hotelId: '',
        cleaningStatus: '',
        maintenanceRequired: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all hotels
            const hotelsData = await hotelService.getAllHotels();
            setHotels(hotelsData);

            // Fetch rooms from all hotels
            const allRooms: Room[] = [];
            for (const hotel of hotelsData) {
                try {
                    const hotelRooms: any = await hotelService.getRoomsByHotel(hotel.hotelCode || hotel.id);
                    const roomsData: Room[] = hotelRooms.data || hotelRooms || [];

                    // Add hotel info to each room
                    const roomsWithHotel = (Array.isArray(roomsData) ? roomsData : []).map(room => ({
                        ...room,
                        hotelName: hotel.name,
                        hotelId: hotel.hotelCode || hotel.id
                    }));

                    allRooms.push(...roomsWithHotel);
                } catch (error) {
                    console.warn(`Failed to fetch rooms for hotel ${hotel.name}:`, error);
                }
            }

            setRooms(allRooms);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load rooms data');
        } finally {
            setLoading(false);
        }
    };

    const handleRoomUpdate = (updatedRoom: Room) => {
        setRooms(prevRooms =>
            prevRooms.map(room =>
                room.id === updatedRoom.id ? { ...room, ...updatedRoom } : room
            )
        );
        setSelectedRoom(null);
    };

    // Filter rooms based on selected filters
    const filteredRooms = rooms.filter(room => {
        if (filters.hotelId && String(room.hotelId) !== filters.hotelId) return false;
        if (filters.cleaningStatus && room.cleaningStatus !== filters.cleaningStatus) return false;
        if (filters.maintenanceRequired !== '' && room.maintenanceRequired !== (filters.maintenanceRequired === 'true')) return false;
        return true;
    });

    const columns = [
        {
            key: 'roomNumber',
            label: 'Room #',
            sortable: true,
            render: (value: any) => (
                <span className="font-mono font-bold text-gray-900">{value || 'N/A'}</span>
            )
        },
        {
            key: 'hotelName',
            label: 'Hotel',
            sortable: true,
            render: (value: any) => (
                <span className="font-medium text-gray-700">{value}</span>
            )
        },
        {
            key: 'roomType',
            label: 'Type',
            sortable: true
        },
        {
            key: 'cleaningStatus',
            label: 'Cleaning Status',
            sortable: true,
            render: (value: string) => {
                const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                    'CLEANED': { bg: 'bg-green-100', text: 'text-green-700', label: 'Cleaned' },
                    'IN_PROGRESS': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'In Progress' },
                    'NOT_CLEANED': { bg: 'bg-red-100', text: 'text-red-700', label: 'Not Cleaned' }
                };
                const config = statusConfig[value] || statusConfig['NOT_CLEANED'];

                return (
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                        {config.label}
                    </span>
                );
            }
        },
        {
            key: 'amenitiesChecked',
            label: 'Amenities',
            render: (value: boolean) => (
                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${value ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {value ? '✓ Checked' : 'Not Checked'}
                </span>
            )
        },
        {
            key: 'maintenanceRequired',
            label: 'Maintenance',
            render: (value: boolean) => (
                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${value ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {value ? '⚠️ Required' : 'OK'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, room: Room) => (
                <button
                    onClick={() => setSelectedRoom(room)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-1"
                >
                    <Wrench size={14} />
                    Manage
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Room Maintenance Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage cleaning status, amenities, and staff assignments
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={18} className="text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hotel</label>
                        <select
                            value={filters.hotelId}
                            onChange={(e) => setFilters({ ...filters, hotelId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">All Hotels</option>
                            {hotels.map(hotel => (
                                <option key={hotel.id} value={hotel.hotelCode || hotel.id}>
                                    {hotel.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cleaning Status</label>
                        <select
                            value={filters.cleaningStatus}
                            onChange={(e) => setFilters({ ...filters, cleaningStatus: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="CLEANED">Cleaned</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="NOT_CLEANED">Not Cleaned</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Required</label>
                        <select
                            value={filters.maintenanceRequired}
                            onChange={(e) => setFilters({ ...filters, maintenanceRequired: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">All</option>
                            <option value="true">Required</option>
                            <option value="false">Not Required</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Rooms Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <DataTable
                    columns={columns}
                    data={filteredRooms}
                    loading={loading}
                    searchable={true}
                    itemsPerPage={15}
                />
            </div>

            {/* Maintenance Panel Modal */}
            {selectedRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl animate-in zoom-in-95 duration-200">
                        <RoomMaintenancePanel
                            room={selectedRoom}
                            onUpdate={handleRoomUpdate}
                            onClose={() => setSelectedRoom(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomMaintenancePage;
