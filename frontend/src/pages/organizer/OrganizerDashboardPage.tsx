import React from 'react';
import { useOrganizerDashboard } from '../../hooks/useEvents';
import EventCard from '../../components/cards/EventCard';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    TrendingUp,
    DollarSign,
    Ticket,
    Calendar,
    BarChart3,
    Users,
    Bell
} from 'lucide-react';

interface OrganizerDashboardPageProps {
    organizerId: number;
}

/**
 * Organizer Dashboard Page
 * Main dashboard for event organizers
 */
const OrganizerDashboardPage: React.FC<OrganizerDashboardPageProps> = ({ organizerId }) => {
    const navigate = useNavigate();
    const { data: dashboard, isLoading } = useOrganizerDashboard(organizerId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Failed to load dashboard</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: 'Total Revenue',
            value: `NPR ${dashboard.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-green-500',
            change: '+12.5%',
        },
        {
            title: 'Tickets Sold',
            value: dashboard.totalTicketsSold.toLocaleString(),
            icon: Ticket,
            color: 'bg-blue-500',
            change: '+8.2%',
        },
        {
            title: 'Active Events',
            value: dashboard.upcomingEvents.length,
            icon: Calendar,
            color: 'bg-purple-500',
            change: '+3',
        },
        {
            title: 'Total Events',
            value: dashboard.organizer.totalEvents,
            icon: TrendingUp,
            color: 'bg-orange-500',
            change: 'All time',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                Welcome back, {dashboard.organizer.organizationName}!
                            </h1>
                            <p className="text-blue-100">
                                Manage your events and track performance
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/organizer/events/create')}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                            <Plus size={20} />
                            Create Event
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                        <Icon className="text-white" size={24} />
                                    </div>
                                    <span className="text-sm font-semibold text-green-600">
                                        {stat.change}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-600">{stat.title}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Upcoming Events */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Calendar size={24} className="text-blue-600" />
                                    Upcoming Events
                                </h2>
                                <button
                                    onClick={() => navigate('/organizer/events')}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                                >
                                    View All
                                </button>
                            </div>

                            {dashboard.upcomingEvents.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">No upcoming events</p>
                                    <button
                                        onClick={() => navigate('/organizer/events/create')}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Create Your First Event
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {dashboard.upcomingEvents.slice(0, 4).map((event) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            onViewDetails={(id) => navigate(`/organizer/events/${id}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Bookings */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Users size={24} className="text-purple-600" />
                                Recent Bookings
                            </h2>

                            <div className="space-y-3">
                                {dashboard.recentBookings.slice(0, 5).map((booking) => (
                                    <div
                                        key={booking.bookingReference}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">
                                                {booking.attendeeName}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {booking.eventName} • {booking.ticketType}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {new Date(booking.bookedAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900">
                                                NPR {booking.amount.toLocaleString()}
                                            </div>
                                            <span
                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${booking.status === 'PAID'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate('/organizer/events/create')}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Plus size={20} />
                                    <span className="font-semibold">Create Event</span>
                                </button>
                                <button
                                    onClick={() => navigate('/organizer/analytics')}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                                >
                                    <BarChart3 size={20} />
                                    <span className="font-semibold">View Analytics</span>
                                </button>
                                <button
                                    onClick={() => navigate('/organizer/profile')}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Users size={20} />
                                    <span className="font-semibold">Edit Profile</span>
                                </button>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Bell size={20} />
                                Notifications
                            </h3>
                            <div className="space-y-3">
                                {dashboard.notifications.slice(0, 5).map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'
                                            }`}
                                    >
                                        <div className="font-semibold text-sm text-gray-900">
                                            {notification.title}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {notification.message}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Draft Events */}
                        {dashboard.draftEvents.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Draft Events</h3>
                                <div className="space-y-2">
                                    {dashboard.draftEvents.map((event) => (
                                        <button
                                            key={event.id}
                                            onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                                            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="font-semibold text-sm text-gray-900">
                                                {event.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Continue editing
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboardPage;
