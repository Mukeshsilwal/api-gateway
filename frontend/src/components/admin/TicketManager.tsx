import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';
import { DataTable } from './DataTable';

interface Booking {
    id: string | number;
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
    source?: string;
    from?: string;
    destination?: string;
    to?: string;
    date?: string;
    totalPrice?: number;
    price?: number;
    amount?: number;
    status: string;
    ticketNo?: string;
    seats?: string | string[];
    seatNumber?: string;
    userId?: string | number;
    [key: string]: any;
}

interface TicketManagerDateRange {
    start: string;
    end: string;
}

interface BookingStats {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    revenue: number;
}

export const TicketManager: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateRange, setDateRange] = useState<TicketManagerDateRange>({ start: '', end: '' });
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    async function fetchBookings() {
        setIsLoading(true);
        try {
            const res = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BOOKINGS);
            if (res) {
                // Handle different response structures gracefully
                const data = (res as any).data || res;
                const list = Array.isArray(data) ? data : (data.bookings || data.data || []);
                setBookings(list);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to fetch bookings");
        } finally {
            setIsLoading(false);
        }
    }

    async function deleteTicket(ticketId: string | number) {
        if (!window.confirm("Are you sure you want to delete this ticket?")) return;

        try {
            const res = await ApiService.delete(`${API_CONFIG.ENDPOINTS.DELETE_TICKET}/${ticketId}`);
            if (res) {
                toast.success("Ticket deleted successfully");
                fetchBookings();
                setSelectedBooking(null);
            } else {
                toast.error("Failed to delete ticket");
            }
        } catch (error) {
            console.error("Error deleting ticket:", error);
            toast.error("Failed to delete ticket");
        }
    }

    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
        if (filterStatus !== 'all' && booking.status !== filterStatus) {
            return false;
        }
        if (dateRange.start && booking.date) {
            const bookingDate = new Date(booking.date);
            const startDate = new Date(dateRange.start);
            if (bookingDate < startDate) return false;
        }
        if (dateRange.end && booking.date) {
            const bookingDate = new Date(booking.date);
            const endDate = new Date(dateRange.end);
            if (bookingDate > endDate) return false;
        }
        return true;
    });

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { bg: string; text: string; icon: string; label: string }> = {
            'CONFIRMED': {
                bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
                text: 'text-white',
                icon: '✓',
                label: 'Confirmed'
            },
            'CANCELLED': {
                bg: 'bg-gradient-to-r from-red-500 to-rose-600',
                text: 'text-white',
                icon: '✕',
                label: 'Cancelled'
            },
            'PENDING': {
                bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
                text: 'text-white',
                icon: '⏱',
                label: 'Pending'
            }
        };
        return configs[status] || configs.PENDING;
    };

    const ticketColumns = [
        {
            key: 'id',
            label: 'Booking ID',
            sortable: true,
            render: (id: string | number) => (
                <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-semibold">
                    #{id?.toString().slice(-6) || 'N/A'}
                </span>
            )
        },
        {
            key: 'fullName',
            label: 'Passenger',
            sortable: true,
            render: (name: string, booking: Booking) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {(name || booking.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{name || booking.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{booking.email || booking.phone || 'N/A'}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'route',
            label: 'Route',
            sortable: false,
            render: (_: any, booking: Booking) => (
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">{booking.source || booking.from || '-'}</span>
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="font-medium text-gray-700">{booking.destination || booking.to || '-'}</span>
                </div>
            )
        },
        {
            key: 'date',
            label: 'Travel Date',
            sortable: true,
            render: (date: string) => date ? (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="font-medium">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
            ) : 'N/A'
        },
        {
            key: 'totalPrice',
            label: 'Amount',
            sortable: true,
            render: (price: number, booking: Booking) => (
                <span className="font-bold text-emerald-600 text-lg">
                    Rs. {(price || booking.price || booking.amount || 0).toLocaleString()}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (status: string) => {
                const config = getStatusConfig(status);
                return (
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${config.bg} ${config.text} shadow-lg`}>
                        {config.icon} {config.label}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_: any, booking: Booking) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => deleteTicket(booking.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Ticket"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )
        }
    ];

    // Calculate statistics
    const stats: BookingStats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
        revenue: bookings.filter(b => b.status === 'CONFIRMED').reduce((sum, b) => sum + (b.totalPrice || b.price || b.amount || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Ticket Bookings
                    </h2>
                    <p className="text-gray-600 mt-1">Manage and track all ticket bookings</p>
                </div>
                <button
                    onClick={fetchBookings}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-sm text-gray-500">Total</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
                            <p className="text-sm text-gray-500">Confirmed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                            <p className="text-sm text-gray-500">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                            <p className="text-sm text-gray-500">Cancelled</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600">Rs. {stats.revenue.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Revenue</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'all', label: 'All', count: stats.total },
                                { value: 'CONFIRMED', label: 'Confirmed', count: stats.confirmed },
                                { value: 'PENDING', label: 'Pending', count: stats.pending },
                                { value: 'CANCELLED', label: 'Cancelled', count: stats.cancelled }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setFilterStatus(option.value)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === option.value
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {option.label} ({option.count})
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        {(dateRange.start || dateRange.end) && (
                            <button
                                onClick={() => setDateRange({ start: '', end: '' })}
                                className="p-2.5 text-gray-400 hover:text-gray-600 mt-7"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500 mt-4 font-medium">Loading bookings...</p>
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <DataTable
                        columns={ticketColumns}
                        data={filteredBookings}
                        itemsPerPage={15}
                        searchable={true}
                        exportable={true}
                    />
                ) : (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-500">Bookings will appear here once users purchase tickets.</p>
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                                <p className="text-sm text-gray-500 mt-1">#{selectedBooking.id?.toString().slice(-6)}</p>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Status Badge */}
                            <div className="flex justify-center">
                                {(() => {
                                    const config = getStatusConfig(selectedBooking.status);
                                    return (
                                        <span className={`px-6 py-2 rounded-full text-sm font-bold ${config.bg} ${config.text} shadow-lg`}>
                                            {config.icon} {config.label}
                                        </span>
                                    );
                                })()}
                            </div>

                            {/* Passenger Info */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-gray-500 mb-3">Passenger Information</h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                        {(selectedBooking.fullName || selectedBooking.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{selectedBooking.fullName || selectedBooking.name || 'Unknown'}</p>
                                        <p className="text-sm text-gray-500">{selectedBooking.email || 'No email'}</p>
                                        <p className="text-sm text-gray-500">{selectedBooking.phone || 'No phone'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Journey Info */}
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-gray-500 mb-3">Journey Details</h4>
                                <div className="flex items-center justify-between">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">From</p>
                                        <p className="font-bold text-gray-900">{selectedBooking.source || selectedBooking.from || '-'}</p>
                                    </div>
                                    <div className="flex-1 px-4">
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                            <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-300 via-indigo-300 to-red-300"></div>
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">To</p>
                                        <p className="font-bold text-gray-900">{selectedBooking.destination || selectedBooking.to || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">Travel Date</p>
                                    <p className="font-bold text-gray-900">
                                        {selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">Ticket Number</p>
                                    <p className="font-bold text-gray-900 font-mono">{selectedBooking.ticketNo || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">Seat(s)</p>
                                    <p className="font-bold text-gray-900">{selectedBooking.seats || selectedBooking.seatNumber || 'N/A'}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-4">
                                    <p className="text-xs text-emerald-600 mb-1">Total Amount</p>
                                    <p className="font-bold text-emerald-700 text-xl">Rs. {(selectedBooking.totalPrice || selectedBooking.price || selectedBooking.amount || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => deleteTicket(selectedBooking.id)}
                                className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                                Delete Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
