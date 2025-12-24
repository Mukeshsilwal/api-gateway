import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import marketService, { CrowdZone } from '../services/marketService';
import { toast } from 'react-hot-toast';
import {
    Users,
    AlertTriangle,
    CheckCircle,
    Activity,
    TrendingUp,
    MapPin,
} from 'lucide-react';

const CrowdFlowHeatmap: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [zones, setZones] = useState<CrowdZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        if (eventId) {
            fetchHeatmap();
        }
    }, [eventId]);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            if (eventId) {
                fetchHeatmap();
            }
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, eventId]);

    const fetchHeatmap = async () => {
        try {
            const response = await marketService.getHeatmap(eventId!);
            setZones(response.data);
            setLoading(false);
        } catch (error) {
            if (loading) {
                toast.error('Failed to load crowd data');
            }
            console.error(error);
            setLoading(false);
        }
    };

    const getStatusColor = (status: 'NORMAL' | 'MODERATE' | 'CROWDED' | 'FULL') => {
        switch (status) {
            case 'NORMAL':
                return {
                    bg: 'bg-green-100 dark:bg-green-900/20',
                    border: 'border-green-300 dark:border-green-700',
                    text: 'text-green-700 dark:text-green-300',
                    icon: CheckCircle,
                };
            case 'MODERATE':
                return {
                    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
                    border: 'border-yellow-300 dark:border-yellow-700',
                    text: 'text-yellow-700 dark:text-yellow-300',
                    icon: Activity,
                };
            case 'CROWDED':
                return {
                    bg: 'bg-orange-100 dark:bg-orange-900/20',
                    border: 'border-orange-300 dark:border-orange-700',
                    text: 'text-orange-700 dark:text-orange-300',
                    icon: TrendingUp,
                };
            case 'FULL':
                return {
                    bg: 'bg-red-100 dark:bg-red-900/20',
                    border: 'border-red-300 dark:border-red-700',
                    text: 'text-red-700 dark:text-red-300',
                    icon: AlertTriangle,
                };
        }
    };

    const getOccupancyPercentage = (zone: CrowdZone) => {
        return (zone.currentCount / zone.capacity) * 100;
    };

    const getStatusLabel = (status: 'NORMAL' | 'MODERATE' | 'CROWDED' | 'FULL') => {
        switch (status) {
            case 'NORMAL':
                return 'Normal';
            case 'MODERATE':
                return 'Moderate';
            case 'CROWDED':
                return 'Crowded';
            case 'FULL':
                return 'At Capacity';
        }
    };

    const getTotalOccupancy = () => {
        const totalCapacity = zones.reduce((sum, zone) => sum + zone.capacity, 0);
        const totalCurrent = zones.reduce((sum, zone) => sum + zone.currentCount, 0);
        return totalCapacity > 0 ? (totalCurrent / totalCapacity) * 100 : 0;
    };

    const getZonesByStatus = (status: string) => {
        return zones.filter((zone) => zone.status === status).length;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Users className="w-8 h-8 text-orange-500" />
                                Crowd Flow Monitor
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Real-time venue occupancy and crowd density
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Auto-refresh (5s)
                                </span>
                            </label>
                            <button
                                onClick={fetchHeatmap}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                            >
                                Refresh Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overall Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Occupancy</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    {getTotalOccupancy().toFixed(0)}%
                                </p>
                            </div>
                            <Users className="w-12 h-12 text-orange-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Normal Zones</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                                    {getZonesByStatus('NORMAL')}
                                </p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Crowded Zones</p>
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                                    {getZonesByStatus('CROWDED')}
                                </p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-orange-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">At Capacity</p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                                    {getZonesByStatus('FULL')}
                                </p>
                            </div>
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Zone Grid */}
                {zones.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No zones configured
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Crowd monitoring zones will appear here during the event
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {zones.map((zone) => {
                            const statusInfo = getStatusColor(zone.status);
                            const StatusIcon = statusInfo.icon;
                            const occupancyPercentage = getOccupancyPercentage(zone);

                            return (
                                <div
                                    key={zone.id}
                                    className={`${statusInfo.bg} rounded-xl p-6 shadow-sm border-2 ${statusInfo.border} transition-all hover:shadow-lg`}
                                >
                                    {/* Zone Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {zone.zoneName}
                                            </h3>
                                            <div className={`flex items-center gap-1 mt-1 ${statusInfo.text}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                <span className="text-sm font-medium">
                                                    {getStatusLabel(zone.status)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {zone.currentCount}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                / {zone.capacity}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Occupancy Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                            <span>Occupancy</span>
                                            <span className="font-medium">{occupancyPercentage.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-500 ${zone.status === 'NORMAL'
                                                    ? 'bg-green-500'
                                                    : zone.status === 'MODERATE'
                                                        ? 'bg-yellow-500'
                                                        : zone.status === 'CROWDED'
                                                            ? 'bg-orange-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Last Updated */}
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Last updated: {new Date(zone.lastUpdated).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Legend */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Status Legend
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Normal</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">0-60% capacity</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                                <Activity className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Moderate</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">60-80% capacity</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Crowded</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">80-95% capacity</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">At Capacity</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">95-100% capacity</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrowdFlowHeatmap;
