import React from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Check } from 'lucide-react';

/**
 * QuickStatusDropdown Component
 * P0 Feature: Quick status change without opening full form
 * Reduces clicks from 4 to 2
 */
const QuickStatusDropdown = ({
    currentStatus,
    onStatusChange,
    disabled = false,
    allowedTransitions = null
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    const statuses = [
        { value: 'PENDING', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
        { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
        { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-700' }
    ];

    // Default allowed transitions if not provided
    const defaultTransitions = {
        'PENDING': ['IN_PROGRESS', 'COMPLETED'],
        'IN_PROGRESS': ['COMPLETED', 'PENDING'],
        'COMPLETED': [] // Terminal state
    };

    const transitions = allowedTransitions || defaultTransitions;
    const availableStatuses = statuses.filter(s =>
        s.value === currentStatus || transitions[currentStatus]?.includes(s.value)
    );

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleStatusSelect = (status) => {
        if (status !== currentStatus && !disabled) {
            onStatusChange(status);
            setIsOpen(false);
        }
    };

    const currentStatusConfig = statuses.find(s => s.value === currentStatus);

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                    transition-all
                    ${currentStatusConfig?.color || 'bg-gray-100 text-gray-700'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
                `}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span>{currentStatusConfig?.label || currentStatus}</span>
                {!disabled && availableStatuses.length > 1 && (
                    <ChevronDown
                        size={14}
                        className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                )}
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    {availableStatuses.map((status) => {
                        const isSelected = status.value === currentStatus;
                        const isDisabled = isSelected;

                        return (
                            <button
                                key={status.value}
                                type="button"
                                onClick={() => handleStatusSelect(status.value)}
                                disabled={isDisabled}
                                className={`
                                    w-full flex items-center justify-between px-4 py-2 text-sm
                                    transition-colors
                                    ${isSelected
                                        ? 'bg-gray-50 font-semibold'
                                        : 'hover:bg-gray-50'
                                    }
                                    ${isDisabled ? 'cursor-default' : 'cursor-pointer'}
                                `}
                            >
                                <span className={`flex items-center gap-2 ${status.color.split(' ')[1]}`}>
                                    <div className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]}`}></div>
                                    {status.label}
                                </span>
                                {isSelected && (
                                    <Check size={16} className="text-indigo-600" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

QuickStatusDropdown.propTypes = {
    currentStatus: PropTypes.oneOf(['PENDING', 'IN_PROGRESS', 'COMPLETED']).isRequired,
    onStatusChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    allowedTransitions: PropTypes.object
};

export default QuickStatusDropdown;
