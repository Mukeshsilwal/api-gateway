import React, { useEffect, useState } from 'react';
import guideService, { type Guide } from '../../services/guideService';
import { User, Star, BadgeCheck, Award, MapPin } from 'lucide-react';

interface GuideSelectionProps {
    onSelect: (guide: Guide) => void;
    selectedGuideId?: number;
}

const GuideSelection: React.FC<GuideSelectionProps> = ({ onSelect, selectedGuideId }) => {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGuides();
    }, []);

    const loadGuides = async () => {
        try {
            const data = await guideService.getAllGuides();
            // Filter to show only VERIFIED and ACTIVE guides
            const availableGuides = data.filter(
                guide => guide.verificationStatus === 'VERIFIED' && guide.isActive
            );
            setGuides(availableGuides);
        } catch (err) {
            console.error('Failed to load guides', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4">Loading available guides...</p>
            </div>
        );
    }

    if (guides.length === 0) {
        return (
            <div className="p-12 text-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Verified Guides Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    There are currently no verified guides available for assignment.
                    Please check back later or contact support for assistance.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {guides.length} verified guide{guides.length !== 1 ? 's' : ''} available
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide) => (
                    <div
                        key={guide.guideId}
                        onClick={() => onSelect(guide)}
                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all hover:shadow-lg ${selectedGuideId === guide.guideId
                            ? 'border-orange-500 ring-2 ring-orange-500 ring-opacity-50 shadow-md'
                            : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                            }`}
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="relative">
                                <img
                                    src={guide.profileImageUrl || `https://ui-avatars.com/api/?name=${guide.fullName}&background=f97316&color=fff`}
                                    alt={guide.fullName}
                                    className="w-16 h-16 rounded-full object-cover bg-gray-100 ring-2 ring-gray-200 dark:ring-gray-700"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                                    <BadgeCheck className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                    {guide.fullName}
                                </h3>
                                <div className="flex items-center gap-1 text-sm text-yellow-500 mt-1">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="font-semibold">{guide.rating ? guide.rating.toFixed(1) : '0.0'}</span>
                                    <span className="text-gray-400 text-xs">({guide.reviewCount || 0})</span>
                                </div>
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <Award className="w-4 h-4 text-orange-500" />
                            <span className="font-medium">{guide.yearsExperience || 0} years experience</span>
                        </div>

                        {/* Bio */}
                        {guide.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                {guide.bio}
                            </p>
                        )}

                        {/* Specialties */}
                        {guide.specialties && guide.specialties.length > 0 && (
                            <div className="mb-3">
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    <MapPin className="w-3 h-3" />
                                    <span className="font-medium">Specialties</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {guide.specialties.slice(0, 3).map((spec, index) => (
                                        <span
                                            key={index}
                                            className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md font-medium"
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                    {guide.specialties.length > 3 && (
                                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
                                            +{guide.specialties.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Languages */}
                        {guide.languages && guide.languages.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {guide.languages.slice(0, 2).map((lang) => (
                                    <span
                                        key={lang}
                                        className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full"
                                    >
                                        {lang}
                                    </span>
                                ))}
                                {guide.languages.length > 2 && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                        +{guide.languages.length - 2}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Selected Indicator */}
                        {selectedGuideId === guide.guideId && (
                            <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
                                    <BadgeCheck className="w-4 h-4" />
                                    <span>Selected for your trip</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GuideSelection;
