import { useEffect, useState } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, Users, DollarSign, Eye, CheckCircle, Calendar,
    MapPin, Ticket, RefreshCw
} from 'lucide-react';
import apiClient from '../../config/apiConfig';

interface EventAnalytics {
    eventId: number;
    eventName: string;
    totalViews: number;
    totalBookings: number;
    totalTicketsSold: number;
    totalTicketsAvailable: number;
    totalRevenue: number;
    platformFees: number;
    netRevenue: number;
    conversionRate: number;
    averageTicketsPerBooking: number;
    averageOrderValue: number;
    ticketTypeStats: TicketTypeStats[];
    dailyStats: DailyStats[];
    bookingsByCity: Record<string, number>;
    bookingsByCountry: Record<string, number>;
    trafficSources: Record<string, number>;
    totalCheckIns: number;
    pendingCheckIns: number;
    checkInRate: number;
}

interface TicketTypeStats {
    ticketTypeId: number;
    ticketTypeName: string;
    price: number;
    totalQuantity: number;
    soldQuantity: number;
    remainingQuantity: number;
    revenue: number;
    sellThroughRate: number;
}

interface DailyStats {
    date: string;
    views: number;
    bookings: number;
    ticketsSold: number;
    revenue: number;
}

interface AnalyticsDashboardProps {
    eventId: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ eventId }) => {
    const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get(`/api/bff/v1/events/${eventId}/analytics`);
            setAnalytics(response.data.data || response.data);
        } catch (err: any) {
            console.error('Error fetching analytics:', err);
            setError(err.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [eventId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                <p className="text-red-800 dark:text-red-300">{error || 'No analytics data available'}</p>
                <button
                    onClick={fetchAnalytics}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Transform data for charts
    const ticketTypeChartData = analytics.ticketTypeStats.map(t => ({
        name: t.ticketTypeName,
        sold: t.soldQuantity,
        remaining: t.remainingQuantity
    }));

    const revenueByTicketType = analytics.ticketTypeStats.map(t => ({
        name: t.ticketTypeName,
        revenue: t.revenue
    }));

    const cityData = Object.entries(analytics.bookingsByCity).map(([city, count]) => ({
        name: city,
        value: count
    }));

    const trafficSourceData = Object.entries(analytics.trafficSources).map(([source, count]) => ({
        name: source,
        value: count
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Analytics</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{analytics.eventName}</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={<Eye className="text-blue-600" />}
                    label="Total Views"
                    value={analytics.totalViews.toLocaleString()}
                    trend={`${analytics.conversionRate.toFixed(1)}% conversion`}
                    bgColor="bg-blue-50 dark:bg-blue-900/20"
                />
                <MetricCard
                    icon={<Users className="text-purple-600" />}
                    label="Bookings"
                    value={analytics.totalBookings.toLocaleString()}
                    trend={`${analytics.averageTicketsPerBooking.toFixed(1)} tickets/booking`}
                    bgColor="bg-purple-50 dark:bg-purple-900/20"
                />
                <MetricCard
                    icon={<Ticket className="text-green-600" />}
                    label="Tickets Sold"
                    value={`${analytics.totalTicketsSold}/${analytics.totalTicketsAvailable}`}
                    trend={`${((analytics.totalTicketsSold / analytics.totalTicketsAvailable) * 100).toFixed(1)}% sold`}
                    bgColor="bg-green-50 dark:bg-green-900/20"
                />
                <MetricCard
                    icon={<DollarSign className="text-purple-600" />}
                    label="Revenue"
                    value={`NPR ${analytics.totalRevenue.toLocaleString()}`}
                    trend={`NPR ${analytics.averageOrderValue.toFixed(0)} avg order`}
                    bgColor="bg-purple-50 dark:bg-purple-900/20"
                />
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Breakdown</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Gross Revenue</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                NPR {analytics.totalRevenue.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Platform Fees (5%)</span>
                            <span className="font-semibold text-red-600">
                                - NPR {analytics.platformFees.toLocaleString()}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <span className="font-semibold text-gray-900 dark:text-white">Net Revenue</span>
                            <span className="font-bold text-green-600 text-lg">
                                NPR {analytics.netRevenue.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Check-In Status</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Checked In</span>
                            <span className="font-semibold text-green-600">
                                {analytics.totalCheckIns.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Pending</span>
                            <span className="font-semibold text-purple-600">
                                {analytics.pendingCheckIns.toLocaleString()}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-gray-900 dark:text-white">Check-In Rate</span>
                                <span className="font-bold text-indigo-600">{analytics.checkInRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all"
                                    style={{ width: `${analytics.checkInRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Traffic Sources</h3>
                    <div className="space-y-2">
                        {trafficSourceData.map((source, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">{source.name}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{source.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Revenue Trend */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Revenue</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.dailyStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Ticket Sales by Type */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ticket Sales by Type</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ticketTypeChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="sold" fill="#10b981" name="Sold" />
                            <Bar dataKey="remaining" fill="#f59e0b" name="Remaining" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Bookings by City */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bookings by City</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={cityData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {cityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue by Ticket Type */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue by Ticket Type</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueByTicketType}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue (NPR)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Ticket Type Details Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Type Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Ticket Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Sold / Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Sell-Through
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Revenue
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {analytics.ticketTypeStats.map((ticket) => (
                                <tr key={ticket.ticketTypeId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {ticket.ticketTypeName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        NPR {ticket.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {ticket.soldQuantity} / {ticket.totalQuantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${ticket.sellThroughRate >= 75 ? 'bg-green-600' :
                                                        ticket.sellThroughRate >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                                                        }`}
                                                    style={{ width: `${ticket.sellThroughRate}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {ticket.sellThroughRate.toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                        NPR {ticket.revenue.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Metric Card Component
interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    trend: string;
    bgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, trend, bgColor }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${bgColor}`}>
                    {icon}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{trend}</div>
        </div>
    );
};

export default AnalyticsDashboard;
