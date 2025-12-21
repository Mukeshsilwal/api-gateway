import { HotelDto, AvailableRoomDto } from './dto';

export interface StaffDto {
    id: number;
    fullName: string;
    name?: string; // Fallback or alias
    staffType: 'HOUSEKEEPING' | 'MAINTENANCE' | 'MANAGEMENT' | 'RECEPTION';
    role?: string; // Fallback or alias
    phone: string;
    hotelId: number;
    status: 'ACTIVE' | 'INACTIVE';
    notes?: string;
    workload?: number;
}

export interface AmenitiesStatus {
    [key: string]: boolean;
}

export interface MaintenanceRecordDto {
    id?: number;
    roomId: number;
    roomStatus: 'Available' | 'Occupied' | 'Needs Cleaning' | 'Under Maintenance' | 'Blocked';
    cleaningStatus: 'Pending' | 'In Progress' | 'Completed';
    maintenanceStatus: 'None' | 'Pending' | 'In Progress' | 'Completed';
    amenitiesStatus: AmenitiesStatus;
    suggestions: string[];
    assignedStaff: string | null;
    lastUpdated?: string;
}

export interface RoomMetadata extends AvailableRoomDto {
    status?: string; // e.g. 'Available', 'Occupied'
    cleaningStatus?: string;
    amenitiesStatus?: AmenitiesStatus;
    maintenanceStatus?: string;
    assignedStaff?: string;
}
