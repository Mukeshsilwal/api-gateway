import React, { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import { Wrench, Search, Filter, RefreshCw, Plus } from 'lucide-react';
import { DataTable } from '../DataTable';
import RoomMaintenancePanel from './RoomMaintenancePanel';
import QuickStatusDropdown from './QuickStatusDropdown';
import SavedFiltersPanel from './SavedFiltersPanel';
import StaffAssignerModal from './StaffAssignerModal';
import hotelService from '../../../services/hotel.service';
import roomMaintenanceService from '../../../services/roomMaintenance.service';
import { useFilterPersistence, useDebounce } from '../../../hooks/useAccessibility';

interface Room {
    id: string | number;
    roomNumber: string;
    roomType: string;
    cleaningStatus: string;
    amenitiesChecked: boolean;
    maintenanceRequired: boolean;
    hotelName?: string;
    hotelId?: string | number;
    assignedStaff?: any;
    [key: string]: any;
}

interface Hotel {
    id: number | string;
    hotelCode: string;
    name: string;
    [key: string]: any;
}

interface FilterConfig {
    hotelId: string;
    cleaningStatus: string;
    maintenanceRequired: string;
    search: string;
}

/**
 * Enhanced RoomMaintenancePage Component
 * Implements P0 UX improvements:
 * - Quick status change dropdown (2 clicks vs 4)
 * - Saved filters with URL persistence
 * - ACTIVE staff filtering
 * - Keyboard navigation support
 * - FAB for quick add
 */
const EnhancedRoomMaintenancePage: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [showCreatePanel, setShowCreatePanel] = useState(false);
    const [assignModalRoom, setAssignModalRoom] = useState<Room | null>(null);

    // P0: URL-persisted filters
    const [filters, setFilters] = useFilterPersistence({
        hotelId: '',
        cleaningStatus: '',
        maintenanceRequired: '',
        search: ''
    });

    // P0: Debounced search
    const debouncedSearch = useDebounce(filters.search, 300);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const hotelsData = await hotelService.getAllHotels();
            setHotels(hotelsData);

            const allRooms: Room[] = [];
            for (const hotel of hotelsData) {
                try {
                    const hotelRooms: any = await hotelService.getRoomsByHotel(hotel.hotelCode || hotel.id);
                    const roomsData: Room[] = hotelRooms.data || hotelRooms || [];

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

    // P0: Quick status change handler
    const handleQuickStatusChange = async (roomId: string | number, newStatus: string) => {
        try {
            await roomMaintenanceService.updateRoomMaintenance(roomId, {
                status: newStatus
            });

            // Optimistic update
            setRooms(prevRooms =>
                prevRooms.map(room =>
                    room.id === roomId ? { ...room, cleaningStatus: newStatus } : room
                )
            );

            toast.success('Status updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
            // Revert on error
            fetchData();
        }
    };

    const handleRoomUpdate = (updatedRoom: Room) => {
        setRooms(prevRooms =>
            prevRooms.map(room =>
                room.id === updatedRoom.id ? { ...room, ...updatedRoom } : room
            )
        );
        setSelectedRoom(null);
        setShowCreatePanel(false);
    };

    // P0: Apply saved filter
    const handleApplyFilter = (filterConfig: any) => {
        setFilters({ ...filters, ...filterConfig });
    };

    // Filter rooms based on all filters including search
    const filteredRooms = rooms.filter(room => {
        if (filters.hotelId && String(room.hotelId) !== filters.hotelId) return false;
        if (filters.cleaningStatus && room.cleaningStatus !== filters.cleaningStatus) return false;
        if (filters.maintenanceRequired !== '' && room.maintenanceRequired !== (filters.maintenanceRequired === 'true')) return false;

        // P0: Debounced search
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            const matchesSearch =
                room.roomNumber?.toLowerCase().includes(searchLower) ||
                room.hotelName?.toLowerCase().includes(searchLower) ||
                room.roomType?.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
        }

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
            label: 'Status',
            sortable: true,
            render: (value: any, row: Room) => (
                <QuickStatusDropdown
                    currentStatus={value || 'NOT_CLEANED'}
                    onStatusChange={(newStatus) => handleQuickStatusChange(row.id, newStatus)}
                />
            )
        },
        {
            key: 'amenitiesChecked',
            label: 'Amenities',
            render: (value: any) => (
                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${value ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {value ? '✓ Checked' : 'Not Checked'}
                </span>
            )
        },
        {
            key: 'maintenanceRequired',
            label: 'Maintenance',
            render: (value: any) => (
                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${value ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {value ? '⚠️ Required' : 'OK'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, room: Room) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedRoom(room)}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <Wrench size={14} />
                        Manage
                    </button>
                    <button
                        onClick={() => setAssignModalRoom(room)}
                        className="px-3 py-1.5 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium"
                    >
                        Assign
                    </button>
                </div>
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

            {/* Filters Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Standard Filters */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={18} className="text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    placeholder="Room, hotel, type..."
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel</label>
                            <select
                                value={filters.hotelId}
                                onChange={(e) => setFilters({ ...filters, hotelId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filters.cleaningStatus}
                                onChange={(e) => setFilters({ ...filters, cleaningStatus: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="">All Statuses</option>
                                <option value="CLEANED">Cleaned</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="NOT_CLEANED">Not Cleaned</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance</label>
                            <select
                                value={filters.maintenanceRequired}
                                onChange={(e) => setFilters({ ...filters, maintenanceRequired: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="">All</option>
                                <option value="true">Required</option>
                                <option value="false">Not Required</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* P0: Saved Filters Panel */}
                <SavedFiltersPanel
                    currentFilters={filters}
                    onApplyFilter={handleApplyFilter}
                />
            </div>

            {/* Rooms Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <DataTable
                    columns={columns}
                    data={filteredRooms}
                    loading={loading}
                    searchable={false}
                    itemsPerPage={15}
                />
            </div>

            {/* P0: FAB for Quick Add */}
            <button
                onClick={() => setShowCreatePanel(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 flex items-center justify-center z-40"
                title="Create Maintenance"
            >
                <Plus size={24} />
            </button>

            {/* Maintenance Panel Modal */}
            {(selectedRoom || showCreatePanel) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl animate-in zoom-in-95 duration-200">
                        <RoomMaintenancePanel
                            room={selectedRoom || { id: -1 } as Room} // Placeholder for creating new if needed, assuming -1 or similar
                            onUpdate={handleRoomUpdate}
                            onClose={() => {
                                setSelectedRoom(null);
                                setShowCreatePanel(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Staff Assigner Modal */}
            {assignModalRoom && (
                <StaffAssignerModal
                    isOpen={true}
                    onClose={() => setAssignModalRoom(null)}
                    roomId={assignModalRoom.id}
                    roomNumber={assignModalRoom.roomNumber}
                    onSuccess={() => {
                        fetchData();
                        setAssignModalRoom(null);
                    }}
                />
            )}
        </div>
    );
};

export default EnhancedRoomMaintenancePage;
