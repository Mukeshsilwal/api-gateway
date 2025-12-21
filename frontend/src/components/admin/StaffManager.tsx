import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { X, UserPlus, Users, Loader2 } from 'lucide-react';
import staffService from '../../services/staff.service';
import { HotelDto } from '../../types/dto';
import { StaffDto } from '../../types/hotel';

interface StaffManagerProps {
    isOpen: boolean;
    onClose: () => void;
    hotel: HotelDto | null;
}

interface NewStaffForm {
    fullName: string;
    staffType: 'HOUSEKEEPING' | 'MAINTENANCE';
    phone: string;
    notes: string;
}

export const StaffManager: React.FC<StaffManagerProps> = ({ isOpen, onClose, hotel }) => {
    const [staff, setStaff] = useState<StaffDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddingStaff, setIsAddingStaff] = useState(false);
    const [newStaff, setNewStaff] = useState<NewStaffForm>({
        fullName: '',
        staffType: 'HOUSEKEEPING',
        phone: '',
        notes: ''
    });

    const fetchStaff = useCallback(async () => {
        if (!hotel?.id) return;

        try {
            setLoading(true);
            const staffList = await staffService.getStaffByHotel(hotel.id);
            setStaff(staffList);
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast.error('Failed to load staff');
        } finally {
            setLoading(false);
        }
    }, [hotel?.id]);

    useEffect(() => {
        if (isOpen && hotel) {
            fetchStaff();
        }
    }, [isOpen, hotel, fetchStaff]);

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newStaff.fullName.trim()) {
            toast.error('Staff name is required');
            return;
        }

        if (!hotel?.id) {
            toast.error('Hotel ID is missing');
            return;
        }

        try {
            setIsAddingStaff(true);
            await staffService.createStaff({
                ...newStaff,
                hotelId: hotel.id
            });
            toast.success('Staff member added successfully!');
            setNewStaff({ fullName: '', staffType: 'HOUSEKEEPING', phone: '', notes: '' });
            await fetchStaff();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add staff member');
        } finally {
            setIsAddingStaff(false);
        }
    };

    const handleToggleStatus = async (staffId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        try {
            await staffService.updateStaffStatus(staffId, newStatus);
            toast.success(`Staff status updated to ${newStatus}`);
            await fetchStaff();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update staff status');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Users size={28} />
                            Staff Management - {hotel?.name}
                        </h2>
                        <p className="text-white/80 text-sm mt-1">
                            {hotel?.city} • {staff.length} staff member{staff.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Add Staff Form */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <input
                            type="text"
                            placeholder="Full Name *"
                            value={newStaff.fullName}
                            onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        />
                        <select
                            value={newStaff.staffType}
                            onChange={(e) => setNewStaff({ ...newStaff, staffType: e.target.value as 'HOUSEKEEPING' | 'MAINTENANCE' })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="HOUSEKEEPING">Housekeeping</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                        <input
                            type="tel"
                            placeholder="Phone"
                            value={newStaff.phone}
                            onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <input
                            type="text"
                            placeholder="Notes"
                            value={newStaff.notes}
                            onChange={(e) => setNewStaff({ ...newStaff, notes: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            disabled={isAddingStaff}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isAddingStaff ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Add Staff
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Staff List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={32} className="animate-spin text-purple-600" />
                        </div>
                    ) : staff.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Users size={48} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Staff Yet</h3>
                            <p className="text-gray-500 mb-6">Start by adding your first staff member</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {staff.map((member) => (
                                <div
                                    key={member.id}
                                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                                <span className="text-purple-600 font-bold text-lg">
                                                    {(member.fullName || member.name || 'S').charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{member.fullName || member.name}</h4>
                                                {(member.staffType || member.role) && (
                                                    <p className="text-sm text-gray-600">
                                                        {member.staffType === 'HOUSEKEEPING' ? '🧹 Housekeeping' :
                                                            member.staffType === 'MAINTENANCE' ? '🔧 Maintenance' :
                                                                member.role}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleStatus(member.id, member.status)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${member.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {member.status}
                                        </button>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {member.phone && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span>{member.phone}</span>
                                            </div>
                                        )}
                                        {member.notes && (
                                            <div className="flex items-start gap-2 text-gray-600">
                                                <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                </svg>
                                                <span className="text-xs">{member.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
