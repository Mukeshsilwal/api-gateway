import React, { useState, useEffect } from 'react';
import { DataTable } from './DataTable';
import { Activity, Search, Filter, Download, Calendar } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState('7d');

    // Mock Data
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const mockLogs = Array.from({ length: 50 }, (_, i) => ({
                id: `log_${i}`,
                action: ['Create', 'Update', 'Delete', 'Login', 'Export'][Math.floor(Math.random() * 5)],
                module: ['User', 'Bus', 'Route', 'Ticket', 'Settings'][Math.floor(Math.random() * 5)],
                user: ['Admin User', 'John Doe', 'System'][Math.floor(Math.random() * 3)],
                details: 'Changed status from active to inactive',
                ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
                timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleString(),
                changes: {
                    before: { status: 'active', role: 'user' },
                    after: { status: 'inactive', role: 'admin' }
                }
            }));
            setLogs(mockLogs);
            setLoading(false);
        }, 800);
    }, [dateRange]);

    const columns = [
        {
            key: 'timestamp',
            label: 'Timestamp',
            sortable: true,
            render: (value) => <span className="text-xs text-gray-500 font-mono">{value}</span>
        },
        {
            key: 'user',
            label: 'User',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {value.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                </div>
            )
        },
        {
            key: 'action',
            label: 'Action',
            render: (value) => {
                const colors = {
                    Create: 'bg-green-100 text-green-800',
                    Update: 'bg-blue-100 text-blue-800',
                    Delete: 'bg-red-100 text-red-800',
                    Login: 'bg-purple-100 text-purple-800',
                    Export: 'bg-gray-100 text-gray-800'
                };
                return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[value] || 'bg-gray-100'}`}>
                        {value}
                    </span>
                );
            }
        },
        {
            key: 'module',
            label: 'Module',
            render: (value) => <span className="text-sm text-gray-600">{value}</span>
        },
        {
            key: 'details',
            label: 'Details',
            render: (value) => <span className="text-sm text-gray-500 truncate max-w-xs block" title={value}>{value}</span>
        },
        {
            key: 'ip',
            label: 'IP Address',
            render: (value) => <span className="text-xs text-gray-400 font-mono">{value}</span>
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="text-indigo-600" />
                        Audit Logs
                    </h1>
                    <p className="text-gray-500">Track all system activities and security events.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    {['24h', '7d', '30d', 'All'].map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${dateRange === range
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Total Events (7d)</div>
                    <div className="text-2xl font-bold text-gray-900">1,248</div>
                    <div className="text-xs text-green-600 flex items-center mt-1">
                        <span className="bg-green-100 px-1 rounded mr-1">↑ 12%</span> vs last week
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Critical Actions</div>
                    <div className="text-2xl font-bold text-gray-900">15</div>
                    <div className="text-xs text-gray-400 mt-1">Deletions & Config changes</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Active Users</div>
                    <div className="text-2xl font-bold text-gray-900">8</div>
                    <div className="text-xs text-gray-400 mt-1">Performed actions today</div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={logs}
                loading={loading}
                searchable={true}
                exportable={true}
                itemsPerPage={15}
                expandable={true}
                renderExpandedRow={(row) => (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Activity size={16} className="text-indigo-500" />
                            Change Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Before</span>
                                <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm font-mono text-red-800">
                                    {row.changes?.before ? (
                                        <pre className="whitespace-pre-wrap">{JSON.stringify(row.changes.before, null, 2)}</pre>
                                    ) : (
                                        <span className="text-gray-400 italic">No previous value</span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">After</span>
                                <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm font-mono text-green-800">
                                    {row.changes?.after ? (
                                        <pre className="whitespace-pre-wrap">{JSON.stringify(row.changes.after, null, 2)}</pre>
                                    ) : (
                                        <span className="text-gray-400 italic">No new value</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default AuditLogs;
