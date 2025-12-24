import { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock, RefreshCw, QrCode } from 'lucide-react';
import QRScanner from './QRScanner';
import apiClient from '../../services/api.client';

interface CheckInManagerProps {
    eventId: number;
    eventName: string;
}

interface CheckInStats {
    totalTickets: number;
    checkedIn: number;
    pending: number;
    checkInRate: number;
}

export const CheckInManager: React.FC<CheckInManagerProps> = ({ eventId, eventName }) => {
    const [stats, setStats] = useState<CheckInStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/api/bff/v1/events/${eventId}/check-in/stats`);
            setStats(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching check-in stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [eventId]);

    const handleCheckInSuccess = () => {
        // Refresh stats after successful check-in
        fetchStats();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Check-In Management</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{eventName}</p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTickets}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                                <CheckCircle className="text-green-600" size={24} />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Checked In</span>
                        </div>
                        <div className="text-3xl font-bold text-green-600">{stats.checkedIn}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                <Clock className="text-purple-600" size={24} />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                        </div>
                        <div className="text-3xl font-bold text-purple-600">{stats.pending}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                <CheckCircle className="text-purple-600" size={24} />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Check-In Rate</span>
                        </div>
                        <div className="text-3xl font-bold text-purple-600">{stats.checkInRate.toFixed(1)}%</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${stats.checkInRate}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Scanner Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <QrCode className="text-indigo-600" size={24} />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">QR Code Scanner</h3>
                    </div>
                    <button
                        onClick={() => setShowScanner(!showScanner)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        {showScanner ? 'Hide Scanner' : 'Show Scanner'}
                    </button>
                </div>

                {showScanner && (
                    <QRScanner eventId={eventId} onSuccess={handleCheckInSuccess} />
                )}
            </div>

            {/* Manual Check-In Section (Future Enhancement) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Manual Check-In</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manual check-in by ticket ID coming soon...
                </p>
            </div>
        </div>
    );
};

export default CheckInManager;
