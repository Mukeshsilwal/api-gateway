import React, { useState } from 'react';
import { X, MapPin, Clock, AlignLeft, Flag } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddCheckpointModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (checkpointData: any) => Promise<void>;
    journeys: any[]; // We need journeys to attach the checkpoint to
}

export default function AddCheckpointModal({ isOpen, onClose, onAdd, journeys }: AddCheckpointModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        locationName: '',
        scheduledTime: '',
        checkpointType: 'ACTIVITY',
        notes: '',
        journeyId: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.journeyId) {
            // If no journey selected, try to auto-select the first one or error
            if (journeys.length > 0) {
                formData.journeyId = journeys[0].journeyId;
            } else {
                toast.error("No journey available to add this activity to. Please initialize a trip day first.");
                return;
            }
        }

        if (!formData.locationName || !formData.scheduledTime) {
            toast.error("Location and Time are required");
            return;
        }

        try {
            setLoading(true);
            await onAdd({
                ...formData,
                journeyId: Number(formData.journeyId)
            });
            onClose();
            // Reset form
            setFormData({
                locationName: '',
                scheduledTime: '',
                checkpointType: 'ACTIVITY',
                notes: '',
                journeyId: ''
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Timeline Activity</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Journey Selection (if multiple) */}
                    {journeys.length > 1 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Add to Day/Journey
                            </label>
                            <select
                                value={formData.journeyId}
                                onChange={(e) => setFormData({ ...formData, journeyId: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-colors"
                            >
                                <option value="">Select a journey/day...</option>
                                {journeys.map((j: any) => (
                                    <option key={j.journeyId} value={j.journeyId}>
                                        {j.title || `Day ${j.dayNumber} - ${j.type}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Activity Type
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['ACTIVITY', 'TRANSIT', 'DEPARTURE'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, checkpointType: type })}
                                    className={`text-sm py-2 px-3 rounded-lg border transition ${formData.checkpointType === type
                                            ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-300'
                                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {type.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Location Name
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.locationName}
                                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                                placeholder="e.g., Durbar Square, Lunch Spot"
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Time
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="datetime-local"
                                value={formData.scheduledTime}
                                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes (Optional)
                        </label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add specific details..."
                                rows={3}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Flag className="w-4 h-4" /> Add Activity
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
