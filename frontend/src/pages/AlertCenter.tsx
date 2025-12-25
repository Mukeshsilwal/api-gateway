import React, { useEffect, useState } from 'react';
import { getActiveAlerts, type Alert } from '../services/alertService';
import { AlertTriangle, X, MapPin, Clock } from 'lucide-react';

const AlertCenter: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('ALL');

    useEffect(() => {
        loadAlerts();
        // Refresh alerts every 5 minutes
        const interval = setInterval(loadAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const data = await getActiveAlerts();
            setAlerts(data);
        } catch (err) {
            console.error('Failed to load alerts:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredAlerts = alerts.filter((alert) => {
        if (filter === 'ALL') return true;
        return alert.severity === filter;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
                return 'bg-red-100 border-red-500 text-red-900 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200';
            case 'HIGH':
                return 'bg-orange-100 border-orange-500 text-orange-900 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-200';
            case 'MEDIUM':
                return 'bg-yellow-100 border-yellow-500 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200';
            case 'LOW':
                return 'bg-blue-100 border-blue-500 text-blue-900 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200';
            default:
                return 'bg-gray-100 border-gray-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200';
        }
    };

    const getAlertIcon = (type: string) => {
        return <AlertTriangle className="w-5 h-5" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alert Center</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Stay informed about weather, delays, and emergencies
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-full font-semibold">
                                {alerts.length} Active
                            </span>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mt-6">
                        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => (
                            <button
                                key={severity}
                                onClick={() => setFilter(severity)}
                                className={`px-4 py-2 rounded-lg font-semibold transition ${filter === severity
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {severity}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alerts List */}
            <div className="container mx-auto px-4 py-8">
                {filteredAlerts.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No alerts at this time</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            We'll notify you when there are important updates
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAlerts.map((alert) => (
                            <div
                                key={alert.alertId}
                                className={`border-l-4 rounded-lg p-6 ${getSeverityColor(alert.severity)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="mt-1">{getAlertIcon(alert.alertType)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold">{alert.title}</h3>
                                                <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-semibold">
                                                    {alert.alertType}
                                                </span>
                                                <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-semibold">
                                                    {alert.severity}
                                                </span>
                                            </div>
                                            <p className="text-sm mb-4">{alert.description}</p>

                                            <div className="flex flex-wrap gap-4 text-sm">
                                                {alert.affectedRegion && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>Region: {alert.affectedRegion}</span>
                                                    </div>
                                                )}
                                                {alert.validFrom && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>Valid from: {new Date(alert.validFrom).toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {alert.validUntil && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>Until: {new Date(alert.validUntil).toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {alert.affectedRoutes && alert.affectedRoutes.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-sm font-semibold mb-1">Affected Routes:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {alert.affectedRoutes.map((route, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs"
                                                            >
                                                                {route}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertCenter;
