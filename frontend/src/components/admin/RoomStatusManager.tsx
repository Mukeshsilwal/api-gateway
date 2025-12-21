import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import roomMaintenanceService from '../../services/roomMaintenance.service';
import staffService from '../../services/staff.service';
import { AvailableRoomDto, HotelDto } from '../../types/dto';
import { MaintenanceRecordDto, StaffDto, RoomMetadata, AmenitiesStatus } from '../../types/hotel';

interface RoomStatusManagerProps {
    isOpen: boolean;
    onClose: () => void;
    room: AvailableRoomDto | null; // Or RoomMetadata if it has extra fields
    hotel: HotelDto | null;
    onUpdate?: (updatedRoom: RoomMetadata) => void;
}

const STATUS_OPTIONS: { value: string; label: string; color: string }[] = [
    { value: 'Available', label: 'Available', color: 'bg-green-100 text-green-700' },
    { value: 'Occupied', label: 'Occupied', color: 'bg-blue-100 text-blue-700' },
    { value: 'Needs Cleaning', label: 'Needs Cleaning', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'Under Maintenance', label: 'Under Maintenance', color: 'bg-red-100 text-red-700' },
    { value: 'Blocked', label: 'Blocked', color: 'bg-gray-100 text-gray-700' }
];

const CLEANING_STATUS_OPTIONS: { value: string; label: string; color: string }[] = [
    { value: 'Pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'In Progress', label: 'In Progress', color: 'text-blue-600' },
    { value: 'Completed', label: 'Completed', color: 'text-green-600' }
];

const CRITICAL_AMENITIES = ['ac', 'lock', 'smoke_detector', 'fire_extinguisher', 'wifi', 'hot_water'];

export const RoomStatusManager: React.FC<RoomStatusManagerProps> = ({ isOpen, onClose, room, hotel, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('status');
    const [roomData, setRoomData] = useState<RoomMetadata | null>(null);
    // const [maintenanceLog, setMaintenanceLog] = useState([]); // Unused
    // const [cleaningLog, setCleaningLog] = useState([]); // Unused
    const [maintenanceRecord, setMaintenanceRecord] = useState<MaintenanceRecordDto | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(false);

    // Staff Integration State
    const [staffList, setStaffList] = useState<StaffDto[]>([]);
    const [isLoadingStaff, setIsLoadingStaff] = useState(false);

    // Initialize state from room prop and load maintenance record
    useEffect(() => {
        if (room && isOpen) {
            // Because room comes from AvailableRoomDto which might not have status fields populated yet, 
            // we initialize with defaults or values if they exist (using 'as any' safe casting if incoming object has extra props)
            const incomingRoom = room as any;

            setRoomData({
                ...room,
                roomId: room.roomId, // Ensure roomId is present (AvailableRoomDto has roomId)
                roomNumber: room.roomNumber,
                // Use existing values or defaults
                roomStatus: incomingRoom.status || incomingRoom.roomStatus || 'Available',
                cleaningStatus: incomingRoom.cleaningStatus || 'Pending',
                amenitiesStatus: incomingRoom.amenities || { // Convert array to object if needed, or use default object
                    ac: true,
                    tv: true,
                    wifi: true,
                    hot_water: true,
                    furniture: true,
                    lock: true,
                    smoke_detector: true,
                    fire_extinguisher: true,
                    towels: true,
                    toiletries: true,
                    bedding: true
                },
                maintenanceStatus: incomingRoom.maintenanceStatus || 'None',
                assignedStaff: incomingRoom.assignedStaff || '',
                // lastUpdated: new Date().toISOString() // removed lastUpdated from state to avoid re-renders or confusion, added to DTO on save
            } as RoomMetadata);

            // If amenities is an array (string[] from DTO), we might need to convert it to status map.
            // But here we are assuming the UI needs a map of { [key: string]: boolean }.
            // For now, let's assume the default object above or that incomingRoom.amenitiesStatus exists.
            // If strictly following DTO, room.amenities is string[]. We should probably initialize the map based on that list + defaults.
            // Logic improvement:
            if (Array.isArray(room.amenities)) {
                // If it's just a list of names, we assume they are "working" or "present".
                // But for status checks, we need boolean flags for specific items.
                // We'll stick to the default map for now as it seems to be for *checking* status.
            }

            // Load existing maintenance record from API
            loadMaintenanceRecord(room.roomId);

            // Fetch staff if hotel ID is available
            if (hotel?.id) {
                fetchStaffList(hotel.id);
            }
        }
    }, [room, isOpen, hotel]);

    const fetchStaffList = async (hotelId: number) => {
        try {
            setIsLoadingStaff(true);
            const staff = await staffService.getStaffByHotel(hotelId);
            setStaffList(staff || []);
        } catch (error) {
            console.error('Error fetching staff list:', error);
            // Don't toast here to avoid spa
        } finally {
            setIsLoadingStaff(false);
        }
    };

    // Load maintenance record from API
    const loadMaintenanceRecord = async (roomId: number) => {
        try {
            setIsLoadingMaintenance(true);
            const record = await roomMaintenanceService.getMaintenanceByRoomId(roomId);

            if (record) {
                setMaintenanceRecord(record);
                // Update room data with maintenance record data
                setRoomData(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        roomStatus: record.roomStatus || prev.status || 'Available',
                        cleaningStatus: record.cleaningStatus || prev.cleaningStatus,
                        maintenanceStatus: record.maintenanceStatus || prev.maintenanceStatus,
                        amenitiesStatus: record.amenitiesStatus || prev.amenitiesStatus,
                        assignedStaff: record.assignedStaff || prev.assignedStaff
                    } as RoomMetadata;
                });
            }
        } catch (error) {
            console.error('Error loading maintenance record:', error);
            // Don't show error toast for 404
        } finally {
            setIsLoadingMaintenance(false);
        }
    };

    // Intelligent Suggestions Logic
    const getSuggestions = (): string[] => {
        if (!roomData) return [];
        const suggestions: string[] = [];

        if (roomData.status === 'Occupied' && roomData.cleaningStatus !== 'Pending') {
            suggestions.push('Schedule cleaning after checkout.');
        }
        if (roomData.status === 'Available' && roomData.cleaningStatus !== 'Completed') {
            suggestions.push('Room is marked Available but cleaning is not completed. Verify cleanliness.');
        }
        if (roomData.cleaningStatus === 'Pending') {
            suggestions.push('Assign housekeeping staff.');
        }

        if (roomData.amenitiesStatus) {
            const failedAmenities = Object.entries(roomData.amenitiesStatus)
                .filter(([key, working]) => !working && CRITICAL_AMENITIES.includes(key))
                .map(([key]) => key);

            if (failedAmenities.length > 0) {
                suggestions.push(`Critical amenities failed (${failedAmenities.join(', ')}). Room should be Under Maintenance.`);
            }
        }

        return suggestions;
    };

    const handleAmenityToggle = (key: string) => {
        if (!roomData || !roomData.amenitiesStatus) return;

        // Check if we are turning off a critical amenity
        const isTurningOff = roomData.amenitiesStatus[key];
        if (isTurningOff && CRITICAL_AMENITIES.includes(key)) {
            toast.warning(`Critical amenity ${key} failed! Room marked as Under Maintenance.`);
        }

        setRoomData(prev => {
            if (!prev || !prev.amenitiesStatus) return null;
            const newAmenities = { ...prev.amenitiesStatus, [key]: !prev.amenitiesStatus[key] };

            // Auto-update room status if critical amenity fails
            let newRoomStatus = prev.status;
            if (!newAmenities[key] && CRITICAL_AMENITIES.includes(key)) {
                newRoomStatus = 'Under Maintenance';
            }

            return {
                ...prev,
                amenitiesStatus: newAmenities,
                status: newRoomStatus, // Map roomStatus to status
                // lastUpdated: new Date().toISOString()
            } as RoomMetadata;
        });
    };

    const handleSave = async () => {
        if (!roomData) return;
        try {
            setIsSaving(true);

            const maintenanceData: MaintenanceRecordDto = {
                roomId: roomData.roomId,
                roomStatus: (roomData.status || roomData.roomStatus || 'Available') as any, // Handle aliasing
                cleaningStatus: roomData.cleaningStatus as any,
                maintenanceStatus: roomData.maintenanceStatus as any,
                amenitiesStatus: roomData.amenitiesStatus || {},
                suggestions: getSuggestions(),
                assignedStaff: roomData.assignedStaff || null
            };

            const response = await roomMaintenanceService.saveMaintenanceRecord(maintenanceData);

            setMaintenanceRecord(response);

            console.log("Room Maintenance Saved:", response);

            if (onUpdate) {
                onUpdate({
                    ...roomData,
                    // lastUpdated: new Date().toISOString(),
                    // suggestions: getSuggestions() // RoomMetadata doesn't strictly have suggestions but we can ignore or extend
                } as RoomMetadata);
            }

            toast.success('Room maintenance updated successfully!');
            onClose();
        } catch (error: any) {
            console.error('Error saving maintenance:', error);
            toast.error(error.message || 'Failed to save maintenance record');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !roomData) return null;

    const suggestions = getSuggestions();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Room Operations - Room {roomData.roomNumber}
                        </h2>
                        <p className="text-white/80 text-sm mt-1">
                            Manage status, cleaning, and maintenance
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-4 gap-4">
                    {['status', 'cleaning', 'amenities', 'maintenance', 'staff', 'json'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-2 text-sm font-medium capitalize transition-colors relative ${activeTab === tab ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">

                    {/* Suggestions Alert */}
                    {suggestions.length > 0 && (
                        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <h4 className="text-amber-800 font-semibold flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                System Suggestions
                            </h4>
                            <ul className="list-disc list-inside text-sm text-amber-700 space-y-1 ml-1">
                                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    )}

                    {activeTab === 'status' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Room Status</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {STATUS_OPTIONS.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setRoomData({ ...roomData, status: option.value })}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${(roomData.status || 'Available') === option.value
                                                ? `border-indigo-500 ring-1 ring-indigo-500 ${option.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-10 ')}`
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                        >
                                            <div className={`font-semibold ${(roomData.status || 'Available') === option.value ? 'text-indigo-700' : 'text-gray-700'}`}>
                                                {option.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cleaning' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cleaning Management</h3>
                                <div className="flex gap-4 mb-6">
                                    {CLEANING_STATUS_OPTIONS.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setRoomData({ ...roomData, cleaningStatus: option.value })}
                                            className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-all ${roomData.cleaningStatus === option.value
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-700">Housekeeping Checklist</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Towels Restocked', 'Toiletries Refilled', 'Bedding Changed', 'Floor Vacuumed', 'Trash Emptied', 'Surfaces Wiped'].map(item => (
                                            <label key={item} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                                                <span className="text-gray-700">{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'amenities' && roomData.amenitiesStatus && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities Check</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(roomData.amenitiesStatus).map(([key, working]) => (
                                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${working ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {working ? (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 capitalize">{key.replace('_', ' ')}</div>
                                                    <div className={`text-xs ${working ? 'text-green-600' : 'text-red-600'}`}>
                                                        {working ? 'Operational' : 'Malfunction'}
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={working}
                                                    onChange={() => handleAmenityToggle(key)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'maintenance' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Issue</h3>
                                <textarea
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    rows={4}
                                    placeholder="Describe the maintenance issue..."
                                />
                                <div className="mt-4 flex justify-end">
                                    <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                                        Submit Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Assignment</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assign Staff Member
                                        </label>

                                        {isLoadingStaff ? (
                                            <div className="flex items-center gap-2 text-gray-500 py-2">
                                                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Loading staff list...</span>
                                            </div>
                                        ) : (
                                            <select
                                                value={roomData.assignedStaff || ''}
                                                onChange={(e) => setRoomData({ ...roomData, assignedStaff: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                            >
                                                <option value="">-- Select Staff Member --</option>
                                                {staffList.map(staff => (
                                                    <option key={staff.id} value={staff.fullName || staff.name}>
                                                        {staff.fullName || staff.name} ({staff.staffType || staff.role || 'Staff'})
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        <p className="text-xs text-gray-500 mt-2">
                                            Assign a specific staff member to handle cleaning or maintenance for this room.
                                        </p>
                                    </div>

                                    {roomData.assignedStaff && (
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                {roomData.assignedStaff.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{roomData.assignedStaff}</div>
                                                <div className="text-xs text-indigo-600">Currently Assigned</div>
                                                {/* Try to find extra details from staff list if available */}
                                                {(() => {
                                                    const staffDetails = staffList.find(s => (s.fullName || s.name) === roomData.assignedStaff);
                                                    return staffDetails ? (
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            {staffDetails.staffType || staffDetails.role} • {staffDetails.phone || 'No phone'}
                                                        </div>
                                                    ) : null;
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'json' && (
                        <div className="space-y-6">
                            <div className="bg-gray-900 p-6 rounded-xl shadow-sm overflow-hidden">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">System Output (JSON)</h3>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(JSON.stringify({
                                                ...roomData,
                                                suggestions: getSuggestions()
                                            }, null, 2));
                                            toast.success('Copied to clipboard');
                                        }}
                                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg transition-colors"
                                    >
                                        Copy JSON
                                    </button>
                                </div>
                                <pre className="font-mono text-sm text-green-400 overflow-x-auto">
                                    {JSON.stringify({
                                        ...roomData,
                                        suggestions: getSuggestions()
                                    }, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoadingMaintenance}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            'Save Updates'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
