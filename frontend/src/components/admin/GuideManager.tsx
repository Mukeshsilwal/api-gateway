import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Loader2, Star, UserCheck, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from "react-hot-toast";
import guideService, { Guide } from '../../services/guideService';
import { AddGuideModal } from './AddGuideModal';
import { GuideDetailsModal } from './GuideDetailsModal';

export function GuideManager() {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [activeFilter, setActiveFilter] = useState<string>('ALL');

    // Get current user info from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const currentUserId = userData.id;
    const userRole = localStorage.getItem('userRole');

    const fetchGuides = async () => {
        try {
            setLoading(true);
            const data = await guideService.getAllGuides();
            setGuides(data);
        } catch (error) {
            console.error('Failed to fetch guides', error);
            toast.error('Failed to load guides');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuides();
    }, []);

    const filteredGuides = guides.filter(guide => {
        const matchesSearch = guide.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guide.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'ALL' || guide.verificationStatus === statusFilter;
        const matchesActive = activeFilter === 'ALL' ||
            (activeFilter === 'ACTIVE' && guide.isActive) ||
            (activeFilter === 'INACTIVE' && !guide.isActive);

        return matchesSearch && matchesStatus && matchesActive;
    });

    const handleViewDetails = (guide: Guide) => {
        setSelectedGuide(guide);
        setIsDetailsModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                        <Clock size={12} />
                        Pending
                    </span>
                );
            case 'VERIFIED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        <CheckCircle size={12} />
                        Verified
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                        <XCircle size={12} />
                        Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    const getCardBorderClass = (guide: Guide) => {
        if (guide.verificationStatus === 'PENDING') {
            return 'border-yellow-300 dark:border-yellow-700';
        }
        if (guide.verificationStatus === 'VERIFIED') {
            return 'border-green-300 dark:border-green-700';
        }
        if (guide.verificationStatus === 'REJECTED') {
            return 'border-red-300 dark:border-red-700';
        }
        return 'border-gray-200 dark:border-gray-700';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guide Manager</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage tour guides and their profiles</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                >
                    <Plus size={20} />
                    <span>Onboard New Guide</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search guides by name or specialty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="REJECTED">Rejected</option>
                    </select>

                    <select
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                        <option value="ALL">All Guides</option>
                        <option value="ACTIVE">Active Only</option>
                        <option value="INACTIVE">Inactive Only</option>
                    </select>
                </div>

                {/* Filter Summary */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Filter size={16} />
                    <span>Showing {filteredGuides.length} of {guides.length} guides</span>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
                    <p className="text-gray-500">Loading guides...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGuides.map((guide) => (
                        <div key={guide.guideId} className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${getCardBorderClass(guide)} overflow-hidden hover:shadow-lg transition-all duration-300 group`}>
                            <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                                {guide.profileImageUrl ? (
                                    <img
                                        src={guide.profileImageUrl}
                                        alt={guide.fullName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                        <UserCheck size={48} className="text-gray-300 dark:text-gray-600" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    {getStatusBadge(guide.verificationStatus || 'PENDING')}
                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-md ${guide.isActive ? 'bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-700 border border-red-500/30'
                                        }`}>
                                        {guide.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {guide.fullName}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                            {guide.licenseNumber}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{guide.rating ? guide.rating.toFixed(1) : '0.0'}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mt-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Experience:</span>
                                        <span>{guide.yearsExperience || 0} years</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {guide.specialties.slice(0, 3).map((spec, index) => (
                                            <span key={index} className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md">
                                                {spec}
                                            </span>
                                        ))}
                                        {guide.specialties.length > 3 && (
                                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                                                +{guide.specialties.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => handleViewDetails(guide)}
                                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1"
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredGuides.length === 0 && (
                <div className="text-center py-12">
                    <UserCheck size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No guides found matching your filters</p>
                </div>
            )}

            <AddGuideModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchGuides}
            />

            <GuideDetailsModal
                guide={selectedGuide}
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedGuide(null);
                }}
                onUpdate={fetchGuides}
                currentUserId={currentUserId}
                userRole={userRole || undefined}
            />
        </div>
    );
}
