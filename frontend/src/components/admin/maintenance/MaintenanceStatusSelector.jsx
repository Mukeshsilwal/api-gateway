import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

/**
 * MaintenanceStatusSelector Component
 * Reusable dropdown for selecting room cleaning status
 */
const MaintenanceStatusSelector = ({
    value,
    onChange,
    disabled = false,
    error = null
}) => {
    const statuses = [
        {
            value: 'CLEANED',
            label: 'Cleaned',
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        {
            value: 'IN_PROGRESS',
            label: 'In Progress',
            icon: Clock,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200'
        },
        {
            value: 'NOT_CLEANED',
            label: 'Not Cleaned',
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
        }
    ];

    const selectedStatus = statuses.find(s => s.value === value);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
                Cleaning Status <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {statuses.map((status) => {
                    const Icon = status.icon;
                    const isSelected = value === status.value;

                    return (
                        <button
                            key={status.value}
                            type="button"
                            onClick={() => !disabled && onChange(status.value)}
                            disabled={disabled}
                            className={`
                                relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                                ${isSelected
                                    ? `${status.bgColor} ${status.borderColor} ${status.color} shadow-md`
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
                            `}
                        >
                            <Icon size={20} className={isSelected ? status.color : 'text-gray-400'} />
                            <span className="font-medium text-sm">{status.label}</span>

                            {isSelected && (
                                <div className="absolute top-2 right-2">
                                    <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-')}`}></div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {error && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <XCircle size={14} />
                    {error}
                </p>
            )}
        </div>
    );
};

MaintenanceStatusSelector.propTypes = {
    value: PropTypes.oneOf(['CLEANED', 'IN_PROGRESS', 'NOT_CLEANED']),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    error: PropTypes.string
};

export default MaintenanceStatusSelector;
