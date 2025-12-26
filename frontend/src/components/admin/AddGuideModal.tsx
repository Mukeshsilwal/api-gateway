import React, { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import toast from "react-hot-toast";
import guideService, { CreateGuideRequest } from '../../services/guideService';
import ImageUpload from '../common/ImageUpload';

interface AddGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddGuideModal({ isOpen, onClose, onSuccess }: AddGuideModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateGuideRequest>({
        userId: 0, // Should be selected or auto-generated, for now 0 or hidden
        fullName: '',
        licenseNumber: '',
        yearsExperience: 0,
        bio: '',
        profileImageUrl: '',
        specialties: [],
        languages: []
    });

    const [specialtiesInput, setSpecialtiesInput] = useState('');
    const [languagesInput, setLanguagesInput] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Process inputs
            const specialties = specialtiesInput.split(',').map(s => s.trim()).filter(s => s);
            const languages = languagesInput.split(',').map(l => l.trim()).filter(l => l);

            if (!formData.fullName || !formData.licenseNumber) {
                toast.error("Please fill in required fields");
                setLoading(false);
                return;
            }

            // In a real app, we might select a USER first to link the guide profile to.
            // For this implementation, let's assume we create a guide profile and maybe link a placeholder User ID if backend requires it.
            // The GuideDTO has @NotNull on userId. We might need to select a user from a dropdown or input an ID.
            // Let's add a User ID input for now for admin control.

            await guideService.createGuide({
                ...formData,
                specialties,
                languages
            });

            toast.success('Guide registered successfully');
            setLoading(false);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to create guide', error);

            // Extract error message from backend response if available
            const errorMessage = error?.message || 'Failed to create guide profile';
            toast.error(errorMessage);

            // Ensure loading is stopped on error
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Register New Guide</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User ID - Temporary for Admin */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Linked User ID</label>
                            <input
                                type="number"
                                required
                                value={formData.userId || ''}
                                onChange={e => setFormData({ ...formData, userId: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Existing User ID"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">License Number *</label>
                            <input
                                type="text"
                                required
                                value={formData.licenseNumber}
                                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="LIC-12345"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience (Years)</label>
                            <input
                                type="number"
                                value={formData.yearsExperience || ''}
                                onChange={e => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Image</label>
                            <ImageUpload
                                value={formData.profileImageUrl}
                                onChange={(url: string | null) => setFormData({ ...formData, profileImageUrl: url || '' })}
                                label=""
                                description="Upload guide profile photo (JPG, PNG, WEBP up to 10MB)"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Tell us about the guide..."
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Specialties (comma separated)</label>
                            <input
                                type="text"
                                value={specialtiesInput}
                                onChange={e => setSpecialtiesInput(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Hiking, History, Food Tours"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Languages (comma separated)</label>
                            <input
                                type="text"
                                value={languagesInput}
                                onChange={e => setLanguagesInput(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="English, Nepali, Hindi"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    Create Guide
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
