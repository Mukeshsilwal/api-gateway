/**
 * User Dashboard Page
 * Features responsive light/dark mode, robust data fallbacks,
 * active sessions overview, and booking summaries.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '@/hooks/auth/useAuth';
import { useBookings } from '@/hooks/booking/useBooking';
import authService from '../services/authService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
    Ticket,
    Calendar,
    CreditCard,
    ShieldCheck,
    Bus,
    Bed,
    AlertCircle,
    Clock,
    Laptop,
    CheckCircle2,
    ArrowUpRight,
    Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'bookings'>('overview');

    // Resolve user data safely from authService or localStorage
    const currentUser = authService.getCurrentUser() as any;
    let localUserData: any = null;
    try {
        const raw = localStorage.getItem('userData') || localStorage.getItem('user');
        localUserData = raw ? JSON.parse(raw) : null;
    } catch {
        localUserData = null;
    }

    const email = currentUser?.email || localUserData?.email || '';
    const userId = Number(currentUser?.id || localUserData?.id || 0);

    // Fetch dashboard data using React Query
    const { data: dashboard, isLoading, isError, error, refetch } = useDashboard(email, userId);

    // Fetch user bookings
    const { data: rawBookings } = useBookings(userId);

    // Defensive data mappings
    const userProfile = dashboard?.userProfile || dashboard?.user || localUserData || currentUser || {};
    const fullName = userProfile?.fullName
        || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim()
        || userProfile?.email
        || 'Traveler';

    const bookingSummary = dashboard?.bookingSummary || {
        totalBookings: dashboard?.statistics?.totalBookings ?? 0,
        activeBookings: dashboard?.statistics?.upcomingBookings ?? 0,
        completedBookings: dashboard?.statistics?.completedBookings ?? 0,
        cancelledBookings: dashboard?.statistics?.cancelledBookings ?? 0,
    };

    const stats = dashboard?.statistics || {};
    const totalSpent = stats.totalSpent ?? 0;
    const loyaltyPoints = stats.loyaltyPoints ?? 0;

    const sessions = dashboard?.activeSessions || [];
    const recentBookingsList = (rawBookings && rawBookings.length > 0)
        ? rawBookings
        : (dashboard?.recentBookings && dashboard.recentBookings.length > 0)
            ? dashboard.recentBookings
            : [];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <Navbar />

            <main className="flex-grow pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Welcome Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {userProfile?.role || 'Member'}
                                </span>
                                {userProfile?.enabled !== false && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Verified
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Welcome back, {fullName}!
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Manage your itineraries, bookings, and active sessions in one place.
                            </p>
                        </div>

                        {/* Quick Booking CTAs */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                                to="/buslist"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition shadow-sm"
                            >
                                <Bus className="w-4 h-4" />
                                Book Bus
                            </Link>
                            <Link
                                to="/hotels"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                            >
                                <Bed className="w-4 h-4" />
                                Hotels
                            </Link>
                            <Link
                                to="/events"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                            >
                                <Ticket className="w-4 h-4" />
                                Events
                            </Link>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="h-28 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {isError && (
                        <div className="p-6 mb-8 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-amber-900 dark:text-amber-200">Unable to load live dashboard statistics</h4>
                                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                                        {(error as any)?.message || "A network or authentication error occurred while syncing your data."}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => refetch()}
                                className="px-4 py-2 text-sm font-medium rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition flex-shrink-0"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition hover:border-purple-300 dark:hover:border-purple-800">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Bookings</span>
                                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <Ticket className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {bookingSummary.totalBookings ?? 0}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">all time</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition hover:border-emerald-300 dark:hover:border-emerald-800">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Upcoming Trips</span>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <Calendar className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {bookingSummary.activeBookings ?? 0}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">active</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition hover:border-blue-300 dark:hover:border-blue-800">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</span>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                                    {bookingSummary.completedBookings ?? 0}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">journeys</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition hover:border-amber-300 dark:hover:border-amber-800">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Spent</span>
                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                                    Rs. {Number(totalSpent).toLocaleString()}
                                </span>
                                {loyaltyPoints > 0 && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        ({loyaltyPoints} pts)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${activeTab === 'overview'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            Recent Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab('sessions')}
                            className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${activeTab === 'sessions'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            Active Sessions ({sessions.length})
                        </button>
                    </div>

                    {/* Tab Content: Bookings */}
                    {activeTab === 'overview' && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Recent Itineraries
                                </h3>
                                <Link
                                    to="/my-bookings"
                                    className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                                >
                                    View all <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {recentBookingsList.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {recentBookingsList.slice(0, 5).map((booking: any, idx: number) => {
                                        const title = booking.bookingType || booking.hotelName || booking.busName || 'Booking';
                                        const refId = booking.id || booking.bookingReference || booking.bookingId || `#${idx + 1}`;
                                        const status = (booking.status || 'CONFIRMED').toUpperCase();
                                        const amount = booking.totalAmount || booking.amount || 0;
                                        const currency = booking.currency || 'NPR';
                                        const dateVal = booking.bookingDate || booking.createdAt || booking.departureDateTime;

                                        return (
                                            <div key={refId || idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                                                        <Ticket className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                                                            {title}
                                                        </h4>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                            <span>Ref: {refId}</span>
                                                            {dateVal && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {new Date(dateVal).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                                                        {currency} {Number(amount).toLocaleString()}
                                                    </div>
                                                    <span
                                                        className={`inline-block px-2 py-0.5 mt-1 rounded text-[11px] font-semibold ${status === 'CONFIRMED'
                                                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                                            : status === 'PENDING'
                                                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                                                : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                                                            }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                                        <Ticket className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-base font-semibold text-slate-900 dark:text-white">No bookings yet</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                                        You haven't booked any bus, hotel, or event tickets yet. Explore destinations across Nepal today!
                                    </p>
                                    <Link
                                        to="/buslist"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition"
                                    >
                                        Explore Bus Trips
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content: Active Sessions */}
                    {activeTab === 'sessions' && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                                Active Browser & Mobile Sessions
                            </h3>

                            {sessions.length > 0 ? (
                                <div className="space-y-3">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.sessionId}
                                            className={`p-4 rounded-2xl border transition ${session.current
                                                ? 'border-purple-500/80 bg-purple-50/50 dark:bg-purple-950/20'
                                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                                                }`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        <Laptop className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                                                {session.ipAddress || 'Unknown IP'}
                                                            </span>
                                                            {session.current && (
                                                                <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-full">
                                                                    Current Session
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg truncate">
                                                            {session.userAgent || 'Web Browser'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">
                                                    {session.lastActivity && (
                                                        <span>Active: {new Date(session.lastActivity).toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
                                    No active secondary sessions detected. Your current device is connected securely.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
