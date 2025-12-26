import { useState } from 'react';
import { X, Star, CheckCircle, XCircle, Clock, User, Award, Globe, MapPin, Calendar, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { Guide } from '../../services/guideService';
import guideService from '../../services/guideService';

interface GuideDetailsModalProps {
    guide: Guide | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    currentUserId?: number;
    userRole?: string;
}

export function GuideDetailsModal({ guide, isOpen, onClose, onUpdate, currentUserId, userRole }: GuideDetailsModalProps) {
    const [loading, setLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    if (!isOpen || !guide) return null;

    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const isPending = guide.verificationStatus === 'PENDING';
    const isVerified = guide.verificationStatus === 'VERIFIED';
    const isRejected = guide.verificationStatus === 'REJECTED';

    const handleVerify = async () => {
        if (!currentUserId) {
            toast.error('User ID not found');
            return;
        }

        setLoading(true);
        try {
            await guideService.verifyGuide(guide.guideId, currentUserId);
            toast.success('Guide verified successfully');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Failed to verify guide', error);
            toast.error(error?.message || 'Failed to verify guide');
        }
        setLoading(false);
    };

    const handleReject = async () => {
        if (!currentUserId) {
            toast.error('User ID not found');
            return;
        }

        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setLoading(true);
        try {
            await guideService.rejectGuide(guide.guideId, rejectionReason, currentUserId);
            toast.success('Guide rejected');
            setShowRejectModal(false);
            setRejectionReason('');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Failed to reject guide', error);
            toast.error(error?.message || 'Failed to reject guide');
        }
        setLoading(false);
    };

    const handleActivate = async () => {
        setLoading(true);
        try {
            await guideService.activateGuide(guide.guideId);
            toast.success('Guide activated successfully');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Failed to activate guide', error);
            toast.error(error?.message || 'Failed to activate guide');
        }
        setLoading(false);
    };

    const handleDeactivate = async () => {
        setLoading(true);
        try {
            await guideService.deactivateGuide(guide.guideId);
            toast.success('Guide deactivated successfully');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Failed to deactivate guide', error);
            toast.error(error?.message || 'Failed to deactivate guide');
        }
        setLoading(false);
    };

    const getStatusBadge = () => {
        if (isPending) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700">
                    <Clock size={16} />
                    Pending Approval
                </span>
            );
        }
        if (isVerified) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700">
                    <CheckCircle size={16} />
                    Verified
                </span>
            );
        }
        if (isRejected) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700">
                    <XCircle size={16} />
                    Rejected
                </span>
            );
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guide Details</h2>
                            {getStatusBadge()}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Profile Section */}
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Profile Image */}
                            <div className="flex-shrink-0">
                                {guide.profileImageUrl ? (
                                    <img
                                        src={guide.profileImageUrl}
                                        alt={guide.fullName}
                                        className="w-32 h-32 rounded-xl object-cover border-4 border-gray-200 dark:border-gray-700"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                                        <User size={48} className="text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{guide.fullName}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mt-1">{guide.licenseNumber}</p>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                                        <Star size={18} className="text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold text-yellow-700 dark:text-yellow-400">{guide.rating ? guide.rating.toFixed(1) : '0.0'}</span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">({guide.reviewCount || 0} reviews)</span>
                                    </div>

                                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                                        <Award size={18} className="text-blue-600 dark:text-blue-400" />
                                        <span className="font-semibold text-blue-700 dark:text-blue-300">{guide.yearsExperience || 0} years experience</span>
                                    </div>

                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${guide.isActive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        <Shield size={18} className={guide.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500'} />
                                        <span className={`font-semibold ${guide.isActive ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {guide.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        {guide.bio && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">About</h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{guide.bio}</p>
                            </div>
                        )}

                        {/* Specialties */}
                        {guide.specialties && guide.specialties.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <MapPin size={18} className="text-indigo-600 dark:text-indigo-400" />
                                    Specialties
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {guide.specialties.map((specialty, index) => (
                                        <span key={index} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium">
                                            {specialty}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Languages */}
                        {guide.languages && guide.languages.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Globe size={18} className="text-purple-600 dark:text-purple-400" />
                                    Languages
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {guide.languages.map((language, index) => (
                                        <span key={index} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium">
                                            {language}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Verification Info */}
                        {guide.verifiedAt && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                                    <Calendar size={18} />
                                    Verification Information
                                </h4>
                                <p className="text-blue-700 dark:text-blue-300 text-sm">
                                    Verified on: {new Date(guide.verifiedAt).toLocaleDateString()} at {new Date(guide.verifiedAt).toLocaleTimeString()}
                                </p>
                            </div>
                        )}

                        {/* Rejection Reason */}
                        {isRejected && guide.rejectionReason && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                                <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
                                    <XCircle size={18} />
                                    Rejection Reason
                                </h4>
                                <p className="text-red-700 dark:text-red-300">{guide.rejectionReason}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {isSuperAdmin && (
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex flex-wrap gap-3 justify-end">
                                {isPending && (
                                    <>
                                        <button
                                            onClick={handleVerify}
                                            disabled={loading}
                                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <CheckCircle size={18} />
                                            Approve Guide
                                        </button>
                                        <button
                                            onClick={() => setShowRejectModal(true)}
                                            disabled={loading}
                                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <XCircle size={18} />
                                            Reject Guide
                                        </button>
                                    </>
                                )}

                                {isVerified && (
                                    <>
                                        {guide.isActive ? (
                                            <button
                                                onClick={handleDeactivate}
                                                disabled={loading}
                                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <XCircle size={18} />
                                                Deactivate
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleActivate}
                                                disabled={loading}
                                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <CheckCircle size={18} />
                                                Activate
                                            </button>
                                        )}
                                    </>
                                )}

                                {isRejected && (
                                    <button
                                        onClick={handleVerify}
                                        disabled={loading}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle size={18} />
                                        Re-approve Guide
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reject Guide</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-700 dark:text-gray-300">Please provide a reason for rejecting this guide profile:</p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                rows={4}
                                placeholder="Enter rejection reason..."
                            />
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                }}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={loading || !rejectionReason.trim()}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Reject Guide
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
