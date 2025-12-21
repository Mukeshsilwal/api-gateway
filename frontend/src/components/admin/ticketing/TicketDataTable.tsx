import React, { useState } from 'react';
import { DataTable } from '../../DataTable';
import { Bed, Film, Bus, MoreHorizontal, AlertCircle, CheckCircle, Clock, Filter, X } from 'lucide-react';
import { Ticket } from './types';

interface TicketDataTableProps {
    data: Ticket[];
    onFilterChange?: (filters: any) => void;
}

interface TicketFilters {
    status: string[];
    priority: string[];
    domain: string[];
}

const TicketDataTable: React.FC<TicketDataTableProps> = ({ data }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<TicketFilters>({
        status: [],
        priority: [],
        domain: []
    });

    // Mock Bulk Actions
    const handleBulkAssign = (ids: (string | number)[]) => console.log('Assigning:', ids);
    const handleBulkResolve = (ids: (string | number)[]) => console.log('Resolving:', ids);

    const bulkActions = [
        { label: 'Assign Selected', onClick: handleBulkAssign },
        { label: 'Mark Resolved', onClick: handleBulkResolve }
    ];

    // Column Definitions
    const columns = [
        {
            key: 'id',
            label: 'Ticket ID',
            sortable: true,
            render: (value: any) => <span className="font-mono font-medium text-gray-900">{value}</span>
        },
        {
            key: 'subject',
            label: 'Subject',
            sortable: true,
            render: (value: string) => (
                <div className="max-w-xs truncate" title={value}>
                    <span className="font-medium text-gray-900">{value}</span>
                </div>
            )
        },
        {
            key: 'domain',
            label: 'Domain',
            sortable: true,
            render: (value: string) => {
                const config = {
                    hotel: { icon: Bed, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Hotel' },
                    cinema: { icon: Film, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Cinema' },
                    bus: { icon: Bus, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Bus' }
                }[value] || { icon: Bus, color: 'text-gray-600', bg: 'bg-gray-50', label: value };

                const Icon = config.icon;
                return (
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ${config.bg} ${config.color}`}>
                        <Icon size={14} />
                        <span className="text-xs font-medium">{config.label}</span>
                    </div>
                );
            }
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value: string) => {
                const config = {
                    open: { color: 'bg-blue-100 text-blue-700', label: 'Open' },
                    'in-progress': { color: 'bg-amber-100 text-amber-700', label: 'In Progress' },
                    resolved: { color: 'bg-green-100 text-green-700', label: 'Resolved' },
                    closed: { color: 'bg-gray-100 text-gray-700', label: 'Closed' }
                }[value] || { color: 'bg-gray-100 text-gray-700', label: value };

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
                    </span>
                );
            }
        },
        {
            key: 'priority',
            label: 'Priority',
            sortable: true,
            render: (value: string) => {
                const config = {
                    high: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                    medium: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    low: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' }
                }[value] || { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50' };

                const Icon = config.icon;
                return (
                    <div className="flex items-center gap-2">
                        <Icon size={16} className={config.color} />
                        <span className="capitalize text-sm text-gray-700">{value}</span>
                    </div>
                );
            }
        },
        {
            key: 'timeLeft',
            label: 'SLA',
            sortable: true,
            render: (value: string) => {
                const isUrgent = value.includes('m') && !value.includes('h'); // Simple check for minutes
                return (
                    <span className={`font-mono text-xs font-medium ${isUrgent ? 'text-red-600 bg-red-50 px-2 py-1 rounded' : 'text-gray-600'}`}>
                        {value}
                    </span>
                );
            }
        },
        {
            key: 'assignee',
            label: 'Assignee',
            render: (value: string) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {value.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-700">{value}</span>
                </div>
            )
        },
        {
            key: 'actions',
            label: '',
            render: () => (
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                    <MoreHorizontal size={16} />
                </button>
            )
        }
    ];

    const toggleFilter = (type: keyof TicketFilters, value: string) => {
        setFilters(prev => {
            const current = prev[type];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [type]: updated };
        });
    };

    // Filter Logic (Client-side for demo)
    const filteredData = data.filter(item => {
        if (filters.status.length && !filters.status.includes(item.status)) return false;
        if (filters.priority.length && !filters.priority.includes(item.priority)) return false;
        if (filters.domain.length && !filters.domain.includes(item.domain)) return false;
        return true;
    });

    return (
        <div className="flex gap-6 h-full">
            {/* Main Table Area */}
            <div className="flex-1 min-w-0 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">All Tickets</h2>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Filter size={16} />
                        <span className="text-sm font-medium">Filters</span>
                        {(filters.status.length + filters.priority.length + filters.domain.length) > 0 && (
                            <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {filters.status.length + filters.priority.length + filters.domain.length}
                            </span>
                        )}
                    </button>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredData}
                    selectable={true}
                    searchable={true}
                    bulkActions={bulkActions}
                    itemsPerPage={10}
                />
            </div>

            {/* Filter Sidebar */}
            {showFilters && (
                <div className="w-64 bg-white border border-gray-200 rounded-xl shadow-sm p-4 h-fit animate-in slide-in-from-right-4 fade-in duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Filters</h3>
                        <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Status Filter */}
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Status</h4>
                            <div className="space-y-2">
                                {['open', 'in-progress', 'resolved', 'closed'].map(status => (
                                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.status.includes(status)}
                                            onChange={() => toggleFilter('status', status)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700 capitalize">{status.replace('-', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Priority</h4>
                            <div className="space-y-2">
                                {['high', 'medium', 'low'].map(priority => (
                                    <label key={priority} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.priority.includes(priority)}
                                            onChange={() => toggleFilter('priority', priority)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700 capitalize">{priority}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketDataTable;
