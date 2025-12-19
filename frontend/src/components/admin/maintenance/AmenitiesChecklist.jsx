import React from 'react';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

/**
 * AmenitiesChecklist Component
 * Reusable checklist for room amenities verification
 */
const AmenitiesChecklist = ({
    amenitiesChecked,
    onToggle,
    disabled = false
}) => {
    const amenitiesList = [
        { id: 'towels', label: 'Fresh Towels' },
        { id: 'toiletries', label: 'Toiletries Restocked' },
        { id: 'bedding', label: 'Clean Bedding' },
        { id: 'minibar', label: 'Minibar Stocked' },
        { id: 'ac', label: 'AC/Heating Working' },
        { id: 'tv', label: 'TV & Remote Working' },
        { id: 'wifi', label: 'WiFi Functional' },
        { id: 'safe', label: 'Safe Operational' }
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">
                    Amenities Check
                </label>
                <button
                    type="button"
                    onClick={() => !disabled && onToggle(!amenitiesChecked)}
                    disabled={disabled}
                    className={`
                        px-3 py-1 text-xs font-medium rounded-lg transition-colors
                        ${amenitiesChecked
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    {amenitiesChecked ? 'All Checked ✓' : 'Mark All'}
                </button>
            </div>

            <div className={`
                p-4 rounded-xl border-2 transition-all
                ${amenitiesChecked
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }
            `}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {amenitiesList.map((amenity) => (
                        <div
                            key={amenity.id}
                            className="flex items-center gap-2 text-sm"
                        >
                            <div className={`
                                w-5 h-5 rounded flex items-center justify-center border-2 transition-all
                                ${amenitiesChecked
                                    ? 'bg-green-600 border-green-600'
                                    : 'bg-white border-gray-300'
                                }
                            `}>
                                {amenitiesChecked && (
                                    <Check size={14} className="text-white" />
                                )}
                            </div>
                            <span className={amenitiesChecked ? 'text-green-900 font-medium' : 'text-gray-600'}>
                                {amenity.label}
                            </span>
                        </div>
                    ))}
                </div>

                {amenitiesChecked && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs text-green-700 flex items-center gap-1">
                            <Check size={12} />
                            All amenities verified and functional
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

AmenitiesChecklist.propTypes = {
    amenitiesChecked: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};

export default AmenitiesChecklist;
