import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, Users, DollarSign, Calendar, Activity,
    ArrowUpRight, ArrowDownRight, RefreshCw, ShoppingBag, LucideIcon
} from 'lucide-react';
import marketService from '../services/marketService';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

interface SalesData {
    time: string;
    amount: number;
}

interface TicketTypeData {
    name: string;
    sold: number;
    total: number;
    revenue: number;
}

interface DashboardData {
    eventName: string;
    totalRevenue: number;
    ticketsSold: number;
    totalCapacity: number;
    recentSales: SalesData[];
    ticketTypes: TicketTypeData[];
}

interface KpiCardProps {
    title: string;
    value: string;
    subValue?: string;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color: 'indigo' | 'emerald' | 'blue' | 'amber';
}

function KpiCard({ title, value, subValue, icon: Icon, trend, trendUp, color }: KpiCardProps) {
    const colorClasses = {
        indigo: "bg-indigo-50 text-indigo-600",
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        amber: "bg-amber-50 text-amber-600",
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.indigo}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {subValue && <span className="text-sm text-gray-400">{subValue}</span>}
                </div>
            </div>
        </div>
    );
}

export default function MarketDashboard() {
    const { eventId } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Default to event ID 1 if not provided for demo purposes
            const id = eventId || 1;
            const dashboardData = await marketService.getLiveDashboard(id);
            setData(dashboardData);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            // Fallback mock data for demo if API fails or is not ready
            setData({
                eventName: "Summer Music Festival 2025",
                totalRevenue: 125000,
                ticketsSold: 1250,
                totalCapacity: 5000,
                recentSales: [
                    { time: '10:00', amount: 1200 },
                    { time: '11:00', amount: 2100 },
                    { time: '12:00', amount: 800 },
                    { time: '13:00', amount: 1600 },
                    { time: '14:00', amount: 3200 },
                    { time: '15:00', amount: 2800 },
                ],
                ticketTypes: [
                    { name: 'VIP', sold: 150, total: 200, revenue: 45000 },
                    { name: 'General', sold: 800, total: 3000, revenue: 64000 },
                    { name: 'Early Bird', sold: 300, total: 300, revenue: 16000 },
                ]
            });
            // Only set error if we really want to block the UI, otherwise use mock
            // setError('Failed to load live data'); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [eventId]);

    if (loading && !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
                    <Activity size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Unavailable</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    // Colors for charts
    const chartColor = "#6366f1"; // Indigo 500

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <NavigationBar />

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                            <Activity size={18} />
                            <span className="text-sm font-semibold uppercase tracking-wider">Live Monitor</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{data.eventName}</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchDashboardData}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                            <Calendar size={16} />
                            Manage Event
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KpiCard
                        title="Total Revenue"
                        value={`$${data.totalRevenue.toLocaleString()}`}
                        icon={DollarSign}
                        trend="+12.5%"
                        trendUp={true}
                        color="indigo"
                    />
                    <KpiCard
                        title="Tickets Sold"
                        value={data.ticketsSold.toLocaleString()}
                        subValue={`/ ${data.totalCapacity.toLocaleString()}`}
                        icon={ShoppingBag}
                        trend="+5.2%"
                        trendUp={true}
                        color="emerald"
                    />
                    <KpiCard
                        title="Attendance"
                        value={`${Math.round((data.ticketsSold / data.totalCapacity) * 100)}%`}
                        icon={Users}
                        trend="+2.1%"
                        trendUp={true}
                        color="blue"
                    />
                    <KpiCard
                        title="Live Viewers"
                        value="142" // This would eventually come from data too
                        icon={Activity}
                        trend="-4.3%"
                        trendUp={false}
                        color="amber"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Sales Trend */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-indigo-500" />
                            Sales Trend (Today)
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.recentSales}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke={chartColor} strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Ticket Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Ticket Types</h3>
                        <div className="space-y-6">
                            {data.ticketTypes.map((type, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{type.name}</span>
                                        <span className="text-gray-500">{type.sold} / {type.total}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 group-hover:bg-indigo-500"
                                            style={{ width: `${(type.sold / type.total) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 text-right">
                                        ${type.revenue.toLocaleString()} revenue
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-medium text-gray-600 transition flex flex-col items-center gap-2">
                                    <DollarSign size={18} />
                                    Price Rules
                                </button>
                                <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-medium text-gray-600 transition flex flex-col items-center gap-2">
                                    <Users size={18} />
                                    Guest List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
