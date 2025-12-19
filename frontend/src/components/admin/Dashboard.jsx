import React, { useState } from 'react';
import { useAdminSummary } from '../../hooks/useAdminSummary';
import { useLiveBusTracking } from '../../hooks/useLiveBusTracking';
import {
    LayoutDashboard,
    Bus,
    Ticket,
    Users,
    TrendingUp,
    MapPin,
    AlertCircle,
    Activity,
    CreditCard,
    Film,
    Building2,
    Route
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Skeleton Component
const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export function Dashboard() {
    const [timeRange, setTimeRange] = useState('30d');

    // Fetch Data
    const { data: summary, isLoading, isError, error, refetch } = useAdminSummary(timeRange);
    const { status: liveStatus, isPolling } = useLiveBusTracking();

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Dashboard Unavailable</h3>
                <p className="text-red-600 dark:text-red-300 mb-6 text-center max-w-md">
                    {error?.message || "Failed to load dashboard data. Please check your connection."}
                </p>
                <button
                    onClick={() => refetch()}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const { totals, liveTracking, revenueSeries, recentActivity, systemHealth } = summary || {};

    // Stats Configuration
    const stats = [
        {
            title: "Total Revenue",
            value: isLoading ? "Loading..." : `Rs. ${totals?.revenueNPR?.toLocaleString() ?? 0}`,
            icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
            trend: "+12.5%",
            color: "emerald",
            bg: "bg-emerald-50",
            border: "border-emerald-100"
        },
        {
            title: "Active Buses",
            value: isLoading ? "..." : liveTracking?.activeBuses ?? 0,
            icon: <Bus className="w-6 h-6 text-blue-600" />,
            trend: liveStatus === 'connected' ? 'Live GPS' : 'GPS Offline',
            color: "blue",
            bg: "bg-blue-50",
            border: "border-blue-100"
        },
        {
            title: "Total Bookings",
            value: isLoading ? "..." : totals?.bookings?.toLocaleString() ?? 0,
            icon: <Ticket className="w-6 h-6 text-purple-600" />,
            trend: "+5.2%",
            color: "purple",
            bg: "bg-purple-50",
            border: "border-purple-100"
        },
        {
            title: "Active Trips",
            value: isLoading ? "..." : totals?.activeTripsToday ?? 0,
            icon: <Route className="w-6 h-6 text-amber-600" />,
            trend: "Today",
            color: "amber",
            bg: "bg-amber-50",
            border: "border-amber-100"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        Dashboard Overview
                        {isPolling && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-200">
                                Polling Mode
                            </span>
                        )}
                        {!isLoading && systemHealth?.status !== 'ok' && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full border border-red-200">
                                System Degraded
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Here's what's happening with your transport network today.
                    </p>
                </div>

                <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                    {['7d', '30d', '90d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${timeRange === range
                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            {range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className={`bg-white dark:bg-gray-800 p-6 rounded-2xl border ${stat.border || 'border-gray-100'} dark:border-gray-700 shadow-sm`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} dark:bg-gray-700/50`}>
                                {stat.icon}
                            </div>
                            {isLoading ? (
                                <Skeleton className="w-16 h-6" />
                            ) : (
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-700 text-${stat.color}-600`}>
                                    {stat.trend}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.title}</p>
                            {isLoading ? (
                                <Skeleton className="w-24 h-8 mt-1" />
                            ) : (
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stat.value}
                                </h3>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts & Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Analytics</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Net Income</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        {isLoading ? (
                            <Skeleton className="w-full h-full rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueSeries}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        dy={10}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickFormatter={(val) => `Rs ${(val / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amountNPR"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="w-3/4 h-4 mb-2" />
                                        <Skeleton className="w-1/2 h-3" />
                                    </div>
                                </div>
                            ))
                        ) : recentActivity?.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No recent activity</div>
                        ) : (
                            recentActivity?.map((activity) => (
                                <div key={activity.id} className="flex gap-4 group">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300
                                        ${activity.type === 'booking' ? 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-100' :
                                            activity.type === 'bus' ? 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100' :
                                                activity.type === 'ticket' ? 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100' :
                                                    'bg-gray-50 text-gray-600 border-gray-100'}
                                    `}>
                                        {activity.type === 'booking' && <CreditCard className="w-5 h-5" />}
                                        {activity.type === 'bus' && <Bus className="w-5 h-5" />}
                                        {activity.type === 'ticket' && <Ticket className="w-5 h-5" />}
                                        {activity.type === 'route' && <Route className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                            {activity.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {new Date(activity.ts).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Ensure default export if used elsewhere
export default Dashboard;
