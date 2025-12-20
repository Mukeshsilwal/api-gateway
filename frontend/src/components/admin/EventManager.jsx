import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    Plus,
    MoreVertical,
    TrendingUp,
    AlertCircle,
    Edit,
    Trash2
} from 'lucide-react';
import eventService from '../../services/eventService';

/**
 * Event Manager Component
 * Comprehensive event management for admin panel
 */
export function EventManager() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch events on component mount and when filters change
    useEffect(() => {
        fetchEvents();
    }, [statusFilter, categoryFilter, searchQuery]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);

            const filters = {};
            if (statusFilter !== 'ALL') filters.status = statusFilter;
            if (categoryFilter !== 'ALL') filters.category = categoryFilter;
            if (searchQuery) filters.search = searchQuery;

            const response = await eventService.getAllEventsAdmin(filters);

            // Handle Response wrapper
            const eventsData = response.data || [];
            setEvents(Array.isArray(eventsData) ? eventsData : []);
        } catch (err) {
            console.error('Failed to fetch events:', err);
            setError(err.message || 'Failed to load events');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (eventId) => {
        if (!confirm('Are you sure you want to approve and publish this event?')) return;

        try {
            setActionLoading(true);
            await eventService.approveEvent(eventId);
            await fetchEvents();
            alert('Event approved and published successfully!');
        } catch (err) {
            console.error('Failed to approve event:', err);
            alert('Failed to approve event: ' + (err.message || 'Unknown error'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        try {
            setActionLoading(true);
            await eventService.rejectEvent(selectedEvent.id, rejectReason);
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedEvent(null);
            await fetchEvents();
            alert('Event rejected successfully!');
        } catch (err) {
            console.error('Failed to reject event:', err);
            alert('Failed to reject event: ' + (err.message || 'Unknown error'));
        } finally {
            setActionLoading(false);
        }
    };

    const openRejectModal = (event) => {
        setSelectedEvent(event);
        setShowRejectModal(true);
    };

    const viewEventDetails = async (event) => {
        setSelectedEvent(event);
        setShowDetailsModal(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            DRAFT: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: Clock },
            PENDING_REVIEW: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: AlertCircle },
            PUBLISHED: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
            CANCELLED: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle },
            COMPLETED: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: CheckCircle }
        };

        const config = statusConfig[status] || statusConfig.DRAFT;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon size={12} />
                {status?.replace('_', ' ')}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Manager</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Manage and approve events from organizers
                    </p>
                </div>
                <button
                    onClick={() => navigate('/add-event')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    Create Event
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white appearance-none"
                        >
                            <option value="ALL">All Status</option>
                            <option value="DRAFT">Draft</option>
                            <option value="PENDING_REVIEW">Pending Review</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white appearance-none"
                        >
                            <option value="ALL">All Categories</option>
                            <option value="MUSIC">Music</option>
                            <option value="SPORTS">Sports</option>
                            <option value="CONFERENCE">Conference</option>
                            <option value="WORKSHOP">Workshop</option>
                            <option value="FESTIVAL">Festival</option>
                            <option value="EXHIBITION">Exhibition</option>
                            <option value="THEATER">Theater</option>
                            <option value="COMEDY">Comedy</option>
                            <option value="NETWORKING">Networking</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                    <AlertCircle className="mx-auto mb-2 text-red-600 dark:text-red-400" size={24} />
                    <p className="text-red-800 dark:text-red-300">{error}</p>
                    <button
                        onClick={fetchEvents}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : events.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
                    <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No events found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                            ? 'Try adjusting your filters'
                            : 'No events have been created yet'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onApprove={handleApprove}
                            onReject={openRejectModal}
                            onViewDetails={viewEventDetails}
                            getStatusBadge={getStatusBadge}
                            formatDate={formatDate}
                            formatCurrency={formatCurrency}
                            actionLoading={actionLoading}
                        />
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <RejectModal
                    event={selectedEvent}
                    rejectReason={rejectReason}
                    setRejectReason={setRejectReason}
                    onConfirm={handleReject}
                    onClose={() => {
                        setShowRejectModal(false);
                        setRejectReason('');
                        setSelectedEvent(null);
                    }}
                    loading={actionLoading}
                />
            )}

            {/* Event Details Modal */}
            {showDetailsModal && selectedEvent && (
                <EventDetailsModal
                    event={selectedEvent}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedEvent(null);
                    }}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    getStatusBadge={getStatusBadge}
                />
            )}
        </div>
    );
}

// Event Card Component
function EventCard({ event, onApprove, onReject, onViewDetails, getStatusBadge, formatDate, formatCurrency, actionLoading }) {
    const basicInfo = event.basicInfo || {};
    const ticketing = event.ticketing || {};
    const venue = basicInfo.venue || {};

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            {/* Event Image */}
            <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                {basicInfo.coverImage ? (
                    <img
                        src={basicInfo.coverImage}
                        alt={basicInfo.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <Calendar className="text-white opacity-50" size={64} />
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    {getStatusBadge(event.status)}
                </div>
            </div>

            {/* Event Details */}
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                        {basicInfo.name || 'Untitled Event'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        by {event.organizerName || 'Unknown Organizer'}
                    </p>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={16} />
                        <span>{formatDate(basicInfo.startDateTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin size={16} />
                        <span className="line-clamp-1">
                            {basicInfo.type === 'ONLINE' ? 'Online Event' : venue.name || 'TBA'}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                            <Users size={14} />
                        </div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mt-1">
                            {event.ticketsSold || 0}/{event.totalTickets || 0}
                        </p>
                        <p className="text-xs text-gray-500">Tickets</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                            <DollarSign size={14} />
                        </div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mt-1">
                            {formatCurrency(event.revenue)}
                        </p>
                        <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                            <Eye size={14} />
                        </div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mt-1">
                            {event.views || 0}
                        </p>
                        <p className="text-xs text-gray-500">Views</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                    {event.status === 'PENDING_REVIEW' && (
                        <>
                            <button
                                onClick={() => onApprove(event.id)}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                <CheckCircle size={16} />
                                Approve
                            </button>
                            <button
                                onClick={() => onReject(event)}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                <XCircle size={16} />
                                Reject
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => onViewDetails(event)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Eye size={16} />
                        Details
                    </button>
                </div>
            </div>
        </div>
    );
}

EventCard.propTypes = {
    event: PropTypes.object.isRequired,
    onApprove: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
    onViewDetails: PropTypes.func.isRequired,
    getStatusBadge: PropTypes.func.isRequired,
    formatDate: PropTypes.func.isRequired,
    formatCurrency: PropTypes.func.isRequired,
    actionLoading: PropTypes.bool.isRequired
};

// Reject Modal Component
function RejectModal({ event, rejectReason, setRejectReason, onConfirm, onClose, loading }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Reject Event
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Are you sure you want to reject "{event?.basicInfo?.name || 'this event'}"?
                </p>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rejection Reason *
                    </label>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Please provide a reason for rejection..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white resize-none"
                        rows={4}
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading || !rejectReason.trim()}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Rejecting...' : 'Reject Event'}
                    </button>
                </div>
            </div>
        </div>
    );
}

RejectModal.propTypes = {
    event: PropTypes.object,
    rejectReason: PropTypes.string.isRequired,
    setRejectReason: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
};

// Event Details Modal Component
function EventDetailsModal({ event, onClose, formatDate, formatCurrency, getStatusBadge }) {
    const basicInfo = event.basicInfo || {};
    const ticketing = event.ticketing || {};
    const venue = basicInfo.venue || {};

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Event Details
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Basic Info */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Basic Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Event Name</p>
                                <p className="font-medium text-gray-900 dark:text-white">{basicInfo.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                <div className="mt-1">{getStatusBadge(event.status)}</div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                                <p className="font-medium text-gray-900 dark:text-white">{basicInfo.category}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                                <p className="font-medium text-gray-900 dark:text-white">{basicInfo.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(basicInfo.startDateTime)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(basicInfo.endDateTime)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Venue */}
                    {basicInfo.type !== 'ONLINE' && venue.name && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Venue
                            </h4>
                            <p className="font-medium text-gray-900 dark:text-white">{venue.name}</p>
                            {venue.address && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {venue.address.street}, {venue.address.city}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Ticket Types */}
                    {ticketing.ticketTypes && ticketing.ticketTypes.length > 0 && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Ticket Types
                            </h4>
                            <div className="space-y-2">
                                {ticketing.ticketTypes.map((ticket, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{ticket.name}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {ticket.quantitySold || 0} / {ticket.quantity} sold
                                            </p>
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(ticket.price)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Statistics */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Statistics
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-600 dark:text-blue-400">Total Tickets</p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                                    {event.totalTickets || 0}
                                </p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm text-green-600 dark:text-green-400">Tickets Sold</p>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                                    {event.ticketsSold || 0}
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-sm text-purple-600 dark:text-purple-400">Revenue</p>
                                <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                                    {formatCurrency(event.revenue)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

EventDetailsModal.propTypes = {
    event: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    formatDate: PropTypes.func.isRequired,
    formatCurrency: PropTypes.func.isRequired,
    getStatusBadge: PropTypes.func.isRequired
};
