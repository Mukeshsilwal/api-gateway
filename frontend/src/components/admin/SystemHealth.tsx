import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Cpu } from 'lucide-react';

interface MetricStatus {
    status: 'healthy' | 'degraded' | 'down';
    [key: string]: any;
}

interface SystemMetrics {
    api: MetricStatus & { latency: string; uptime: string };
    database: MetricStatus & { connections: number; latency: string };
    cache: MetricStatus & { hitRate: string; memory: string };
    workers: MetricStatus & { active: number; failed: number };
}

const SystemHealth: React.FC = () => {
    const [health, setHealth] = useState<SystemMetrics>({
        api: { status: 'healthy', latency: '45ms', uptime: '99.9%' },
        database: { status: 'healthy', connections: 12, latency: '12ms' },
        cache: { status: 'healthy', hitRate: '94%', memory: '45%' },
        workers: { status: 'degraded', active: 3, failed: 1 }
    });

    const [errorRate, setErrorRate] = useState<number[]>([2, 3, 1, 0, 5, 2, 1, 0, 1, 2, 1, 0]);

    // Mock live updates
    useEffect(() => {
        const interval = setInterval(() => {
            setErrorRate(prev => [...prev.slice(1), Math.floor(Math.random() * 5)]);
            setHealth(prev => ({
                ...prev,
                api: { ...prev.api, latency: `${30 + Math.floor(Math.random() * 30)}ms` }
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const StatusBadge: React.FC<{ status: 'healthy' | 'degraded' | 'down' }> = ({ status }) => {
        const colors = {
            healthy: 'bg-emerald-100 text-emerald-800',
            degraded: 'bg-amber-100 text-amber-800',
            down: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${colors[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="text-indigo-600" />
                    System Health
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Live Monitoring
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* API Status */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Server size={18} />
                            API Gateway
                        </div>
                        <StatusBadge status={health.api.status} />
                    </div>
                    <div className="flex justify-between text-sm mt-3">
                        <span className="text-gray-500">Latency</span>
                        <span className="font-mono font-medium">{health.api.latency}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Uptime</span>
                        <span className="font-mono font-medium">{health.api.uptime}</span>
                    </div>
                </div>

                {/* Database Status */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Database size={18} />
                            Database
                        </div>
                        <StatusBadge status={health.database.status} />
                    </div>
                    <div className="flex justify-between text-sm mt-3">
                        <span className="text-gray-500">Connections</span>
                        <span className="font-mono font-medium">{health.database.connections}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Latency</span>
                        <span className="font-mono font-medium">{health.database.latency}</span>
                    </div>
                </div>

                {/* Cache Status */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Cpu size={18} />
                            Redis Cache
                        </div>
                        <StatusBadge status={health.cache.status} />
                    </div>
                    <div className="flex justify-between text-sm mt-3">
                        <span className="text-gray-500">Hit Rate</span>
                        <span className="font-mono font-medium">{health.cache.hitRate}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Memory</span>
                        <span className="font-mono font-medium">{health.cache.memory}</span>
                    </div>
                </div>

                {/* Workers Status */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Activity size={18} />
                            Bg Workers
                        </div>
                        <StatusBadge status={health.workers.status} />
                    </div>
                    <div className="flex justify-between text-sm mt-3">
                        <span className="text-gray-500">Active Jobs</span>
                        <span className="font-mono font-medium">{health.workers.active}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Failed Jobs</span>
                        <span className="font-mono font-medium text-red-600">{health.workers.failed}</span>
                    </div>
                </div>
            </div>

            {/* Error Rate Sparkline */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">Error Rate (Last 1 hour)</h4>
                    <span className="text-xs text-gray-500">Updates every 3s</span>
                </div>
                <div className="h-16 flex items-end gap-1">
                    {errorRate.map((val, idx) => (
                        <div
                            key={idx}
                            className={`flex-1 rounded-t-sm transition-all duration-300 ${val > 3 ? 'bg-red-400' : 'bg-indigo-200'}`}
                            style={{ height: `${Math.max(10, val * 15)}%` }}
                            title={`${val} errors`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SystemHealth;
