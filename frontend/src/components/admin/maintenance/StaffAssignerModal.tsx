import React, { useState } from 'react';
import { X, UserPlus, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import roomMaintenanceService from '../../../services/roomMaintenance.service';

interface StaffAssignerModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: string | number;
    roomNumber?: string;
    onSuccess?: (result: any) => void;
}

interface StaffTypeOption {
    type: 'HOUSEKEEPING' | 'MAINTENANCE';
    label: string;
    description: string;
    icon: string;
    color: 'indigo' | 'amber';
}

/**
 * StaffAssignerModal Component
 * Modal for assigning housekeeping or maintenance staff to a room
 */
const StaffAssignerModal: React.FC<StaffAssignerModalProps> = ({
    isOpen,
    onClose,
    roomId,
    roomNumber,
    onSuccess
}) => {
    const [selectedStaffType, setSelectedStaffType] = useState<string | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);

    const staffTypes: StaffTypeOption[] = [
        {
            type: 'HOUSEKEEPING',
            label: 'Housekeeping',
            description: 'For cleaning and room preparation',
            icon: '🧹',
            color: 'indigo'
        },
        {
            type: 'MAINTENANCE',
            label: 'Maintenance',
            description: 'For repairs and technical issues',
            icon: '🔧',
            color: 'amber'
        }
    ];

    const handleAssign = async () => {
        if (!selectedStaffType) {
            toast.error('Please select a staff type');
            return;
        }

        setIsAssigning(true);

        try {
            const result = await roomMaintenanceService.assignStaff(roomId, selectedStaffType);

            toast.success(
                `${selectedStaffType === 'HOUSEKEEPING' ? 'Housekeeping' : 'Maintenance'} staff assigned successfully!`,
                { icon: '✅' }
            );

            if (onSuccess) {
                onSuccess(result);
            }

            // Reset and close
            setSelectedStaffType(null);
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign staff');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleClose = () => {
        if (!isAssigning) {
            setSelectedStaffType(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <UserPlus size={24} className="text-indigo-600" />
                            Assign Staff
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Room {roomNumber || roomId}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isAssigning}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">
                        Select the type of staff to assign to this room:
                    </p>

                    <div className="space-y-3">
                        {staffTypes.map((staff) => {
                            const isSelected = selectedStaffType === staff.type;
                            const colorClasses = {
                                indigo: {
                                    border: 'border-indigo-500',
                                    bg: 'bg-indigo-50',
                                    text: 'text-indigo-700',
                                    ring: 'ring-indigo-500'
                                },
                                amber: {
                                    border: 'border-amber-500',
                                    bg: 'bg-amber-50',
                                    text: 'text-amber-700',
                                    ring: 'ring-amber-500'
                                }
                            }[staff.color];

                            return (
                                <button
                                    key={staff.type}
                                    type="button"
                                    onClick={() => setSelectedStaffType(staff.type)}
                                    disabled={isAssigning}
                                    className={`
                                        w-full p-4 rounded-xl border-2 text-left transition-all
                                        ${isSelected
                                            ? `${colorClasses.border} ${colorClasses.bg} ring-2 ${colorClasses.ring} ring-opacity-20`
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                                        ${isAssigning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{staff.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`font-semibold ${isSelected ? colorClasses.text : 'text-gray-900'}`}>
                                                    {staff.label}
                                                </h3>
                                                {isSelected && (
                                                    <CheckCircle size={18} className={colorClasses.text} />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {staff.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={handleClose}
                        disabled={isAssigning}
                        className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedStaffType || isAssigning}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isAssigning ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Assign Staff
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffAssignerModal;
