import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Loader2, UserPlus, AlertCircle, Wrench } from 'lucide-react';
import MaintenanceStatusSelector from './MaintenanceStatusSelector';
import AmenitiesChecklist from './AmenitiesChecklist';
import StaffAssignerModal from './StaffAssignerModal';
import roomMaintenanceService from '../../../services/roomMaintenance.service';

interface RoomMaintenanceData {
    id: string | number;
    roomNumber?: string;
    roomType?: string;
    cleaningStatus?: string;
    amenitiesChecked?: boolean;
    maintenanceRequired?: boolean;
    notes?: string;
    [key: string]: any;
}

interface RoomMaintenancePanelProps {
    room: RoomMaintenanceData;
    onUpdate?: (updatedRoom: RoomMaintenanceData) => void;
    onClose?: () => void;
}

interface FormData {
    cleaningStatus: string;
    amenitiesChecked: boolean;
    maintenanceRequired: boolean;
    notes: string;
}

interface FormErrors {
    cleaningStatus?: string;
}

/**
 * RoomMaintenancePanel Component
 * Main panel for managing room maintenance status
 */
const RoomMaintenancePanel: React.FC<RoomMaintenancePanelProps> = ({
    room,
    onUpdate,
    onClose
}) => {
    const [formData, setFormData] = useState<FormData>({
        cleaningStatus: room?.cleaningStatus || 'NOT_CLEANED',
        amenitiesChecked: room?.amenitiesChecked || false,
        maintenanceRequired: room?.maintenanceRequired || false,
        notes: room?.notes || ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.cleaningStatus) {
            newErrors.cleaningStatus = 'Cleaning status is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors before saving');
            return;
        }

        setIsSaving(true);

        try {
            const result = await roomMaintenanceService.updateRoomMaintenance(
                room.id,
                formData
            );

            toast.success('Room maintenance status updated successfully!', {
                icon: '✅'
            });

            if (onUpdate) {
                onUpdate(result);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update maintenance status');
        } finally {
            setIsSaving(false);
        }
    };

    const handleStaffAssigned = (staffData: any) => {
        toast(`Staff assigned: ${staffData.name || 'Unknown'}`, {
            icon: '👤'
        });

        if (onUpdate) {
            onUpdate({ ...room, assignedStaff: staffData });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Wrench size={24} />
                            Room Maintenance
                        </h2>
                        <p className="text-indigo-100 text-sm mt-1">
                            Room {room?.roomNumber || room?.id} • {room?.roomType || 'Standard'}
                        </p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Cleaning Status */}
                <MaintenanceStatusSelector
                    value={formData.cleaningStatus}
                    onChange={(value) => setFormData({ ...formData, cleaningStatus: value })}
                    disabled={isSaving}
                    error={errors.cleaningStatus}
                />

                {/* Amenities Checklist */}
                <AmenitiesChecklist
                    amenitiesChecked={formData.amenitiesChecked}
                    onToggle={(checked) => setFormData({ ...formData, amenitiesChecked: checked })}
                    disabled={isSaving}
                />

                {/* Maintenance Required */}
                <div className="space-y-2">
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={formData.maintenanceRequired}
                            onChange={(e) => setFormData({ ...formData, maintenanceRequired: e.target.checked })}
                            disabled={isSaving}
                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={18} className="text-red-600" />
                                <span className="font-semibold text-gray-900">Maintenance Required</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Check if this room needs technical maintenance or repairs
                            </p>
                        </div>
                    </label>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Notes (Optional)
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        disabled={isSaving}
                        rows={4}
                        placeholder="Add any additional notes or observations..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">
                        {formData.notes.length}/500 characters
                    </p>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                    onClick={() => setIsStaffModalOpen(true)}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <UserPlus size={18} />
                    Assign Staff
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                    {isSaving ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Staff Assigner Modal */}
            <StaffAssignerModal
                isOpen={isStaffModalOpen}
                onClose={() => setIsStaffModalOpen(false)}
                roomId={room?.id}
                roomNumber={room?.roomNumber}
                onSuccess={handleStaffAssigned}
            />
        </div>
    );
};

export default RoomMaintenancePanel;
