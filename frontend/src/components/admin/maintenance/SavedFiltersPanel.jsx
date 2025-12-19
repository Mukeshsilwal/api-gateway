import React from 'react';
import PropTypes from 'prop-types';
import { Save, Star, X } from 'lucide-react';

/**
 * SavedFiltersPanel Component
 * P0 Feature: Saved filter presets with URL persistence
 * Reduces filter application from 3 clicks to 1 click
 */
const SavedFiltersPanel = ({
    currentFilters,
    onApplyFilter,
    onSaveFilter,
    onDeleteFilter
}) => {
    const [savedFilters, setSavedFilters] = React.useState([]);
    const [showSaveDialog, setShowSaveDialog] = React.useState(false);
    const [filterName, setFilterName] = React.useState('');

    // Load saved filters from localStorage on mount
    React.useEffect(() => {
        const saved = localStorage.getItem('maintenance_saved_filters');
        if (saved) {
            try {
                setSavedFilters(JSON.parse(saved));
            } catch (error) {
                console.error('Failed to parse saved filters:', error);
            }
        }
    }, []);

    // Default filter presets
    const defaultFilters = [
        {
            id: 'my-active',
            name: 'My Active Tickets',
            filters: {
                assignedToMe: true,
                status: ['PENDING', 'IN_PROGRESS']
            },
            isDefault: true
        },
        {
            id: 'high-priority-overdue',
            name: 'High Priority Overdue',
            filters: {
                priority: 'HIGH',
                overdue: true
            },
            isDefault: true
        },
        {
            id: 'unassigned',
            name: 'Unassigned',
            filters: {
                assignedStaff: null
            },
            isDefault: true
        },
        {
            id: 'this-week',
            name: 'This Week',
            filters: {
                createdDateRange: 'last-7-days'
            },
            isDefault: true
        }
    ];

    const allFilters = [...defaultFilters, ...savedFilters];

    const handleSaveFilter = () => {
        if (!filterName.trim()) {
            return;
        }

        const newFilter = {
            id: `custom-${Date.now()}`,
            name: filterName,
            filters: currentFilters,
            isDefault: false,
            createdAt: new Date().toISOString()
        };

        const updated = [...savedFilters, newFilter];
        setSavedFilters(updated);
        localStorage.setItem('maintenance_saved_filters', JSON.stringify(updated));

        if (onSaveFilter) {
            onSaveFilter(newFilter);
        }

        setFilterName('');
        setShowSaveDialog(false);
    };

    const handleDeleteFilter = (filterId) => {
        const updated = savedFilters.filter(f => f.id !== filterId);
        setSavedFilters(updated);
        localStorage.setItem('maintenance_saved_filters', JSON.stringify(updated));

        if (onDeleteFilter) {
            onDeleteFilter(filterId);
        }
    };

    const hasActiveFilters = Object.keys(currentFilters).length > 0;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Star size={18} className="text-amber-500" />
                    Saved Filters
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={() => setShowSaveDialog(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                        <Save size={14} />
                        Save Current
                    </button>
                )}
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter Name
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            placeholder="e.g., My Custom Filter"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSaveFilter();
                                } else if (e.key === 'Escape') {
                                    setShowSaveDialog(false);
                                }
                            }}
                        />
                        <button
                            onClick={handleSaveFilter}
                            disabled={!filterName.trim()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setShowSaveDialog(false)}
                            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Filter List */}
            <div className="space-y-2">
                {allFilters.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        No saved filters yet
                    </p>
                ) : (
                    allFilters.map((filter) => (
                        <div
                            key={filter.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                            <button
                                onClick={() => onApplyFilter(filter.filters)}
                                className="flex-1 text-left text-sm font-medium text-gray-700 hover:text-indigo-600"
                            >
                                {filter.name}
                                {filter.isDefault && (
                                    <span className="ml-2 text-xs text-gray-500">(Default)</span>
                                )}
                            </button>
                            {!filter.isDefault && (
                                <button
                                    onClick={() => handleDeleteFilter(filter.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                                    title="Delete filter"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

SavedFiltersPanel.propTypes = {
    currentFilters: PropTypes.object.isRequired,
    onApplyFilter: PropTypes.func.isRequired,
    onSaveFilter: PropTypes.func,
    onDeleteFilter: PropTypes.func
};

export default SavedFiltersPanel;
