import React, { useState, useEffect } from 'react';
import { Search, Calendar, Bell, ChevronDown, LayoutGrid, Bed, Film, Bus, Ticket, Clock, AlertTriangle, Users } from 'lucide-react';
import KPIWidget from './KPIWidget';
import TicketDataTable from './TicketDataTable';
import SLAComplianceChart from './SLAComplianceChart';
import EscalationAlerts from './EscalationAlerts';
import ApiService from '../../../services/api.service';
import API_CONFIG from '../../../config/api';

// Fallback Mock Data
const RECENT_TICKETS = [
    { id: 'MOCK-101', subject: 'Payment failed for booking #1234', domain: 'bus', status: 'open', priority: 'high', assignee: 'System', timeLeft: '2h', createdAt: new Date().toISOString() },
    { id: 'MOCK-102', subject: 'Refund request for cancelled trip', domain: 'bus', status: 'in-progress', priority: 'medium', assignee: 'Sarah', timeLeft: '1d', createdAt: new Date().toISOString() },
    { id: 'MOCK-103', subject: 'Hotel booking confirmation not received', domain: 'hotel', status: 'open', priority: 'high', assignee: 'Mike', timeLeft: '4h', createdAt: new Date().toISOString() },
    { id: 'MOCK-104', subject: 'Cinema seat selection issue', domain: 'cinema', status: 'resolved', priority: 'low', assignee: 'Bot', timeLeft: '-', createdAt: new Date().toISOString() },
];

const TICKETING_STATS = {
    all: { totalTickets: 1250, totalTrend: 12, slaCompliance: 94, slaTrend: 2, escalationRate: 5, escalationTrend: -1, activeAgents: 8, totalAgents: 12 },
    hotel: { totalTickets: 450, totalTrend: 8, slaCompliance: 96, slaTrend: 1, escalationRate: 3, escalationTrend: -2, activeAgents: 3, totalAgents: 5 },
    cinema: { totalTickets: 300, totalTrend: 5, slaCompliance: 98, slaTrend: 0, escalationRate: 1, escalationTrend: 0, activeAgents: 2, totalAgents: 3 },
    bus: { totalTickets: 500, totalTrend: 15, slaCompliance: 91, slaTrend: 3, escalationRate: 8, escalationTrend: 1, activeAgents: 3, totalAgents: 4 }
};

const DOMAINS = [
    { id: 'all', name: 'All Domains', icon: LayoutGrid },
    { id: 'hotel', name: 'Hotel Booking', icon: Bed },
    { id: 'cinema', name: 'Cinema Ticketing', icon: Film },
    { id: 'bus', name: 'Bus Reservations', icon: Bus },
];

const TicketingDashboard = () => {
    const [selectedDomain, setSelectedDomain] = useState(DOMAINS[0]);
    const [isDomainOpen, setIsDomainOpen] = useState(false);
    const [realTickets, setRealTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Bus Bookings
            const busPromise = ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BOOKINGS)
                .catch(err => { console.warn('Bus fetch failed', err); return []; });

            // 2. Fetch Hotel Bookings (Attempting generic booking endpoint)
            const hotelPromise = ApiService.get(API_CONFIG.ENDPOINTS.BOOK_HOTEL)
                .catch(err => { console.warn('Hotel fetch failed', err); return []; });

            const [busRes, hotelRes] = await Promise.all([busPromise, hotelPromise]);

            // Process Bus Data
            const busData = busRes?.data || busRes || [];
            const busList = Array.isArray(busData) ? busData : (busData.bookings || busData.data || []);

            const mappedBusTickets = busList.map(booking => ({
                id: `BUS-${booking.id}`,
                subject: `Bus: ${booking.source || 'Unknown'} to ${booking.destination || 'Unknown'}`,
                domain: 'bus',
                status: mapStatus(booking.status),
                priority: calculatePriority(booking.date),
                assignee: 'System',
                timeLeft: calculateTimeLeft(booking.date),
                createdAt: booking.createdAt || new Date().toISOString()
            }));

            // Process Hotel Data
            const hotelData = hotelRes?.data || hotelRes || [];
            const hotelList = Array.isArray(hotelData) ? hotelData : (hotelData.bookings || hotelData.data || []);

            const mappedHotelTickets = hotelList.map(booking => ({
                id: booking.bookingId || `HTL-${booking.id}`,
                subject: `Hotel: ${booking.hotelName || 'Unknown Hotel'} (${booking.roomType || 'Room'})`,
                domain: 'hotel',
                status: mapStatus(booking.status || 'CONFIRMED'),
                priority: calculatePriority(booking.checkInDate),
                assignee: 'System',
                timeLeft: calculateTimeLeft(booking.checkInDate),
                createdAt: booking.createdAt || new Date().toISOString()
            }));

            // Combine Real Data
            let allTickets = [...mappedBusTickets, ...mappedHotelTickets];

            // If no real data, fallback to mock data
            if (allTickets.length === 0) {
                allTickets = RECENT_TICKETS;
            } else {
                // Add mock Cinema data since we don't have an API for it yet
                const cinemaMock = RECENT_TICKETS.filter(t => t.domain === 'cinema');
                allTickets = [...allTickets, ...cinemaMock];
            }

            setRealTickets(allTickets);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setRealTickets(RECENT_TICKETS);
        } finally {
            setLoading(false);
        }
    };

    const mapStatus = (status) => {
        switch (status?.toUpperCase()) {
            case 'CONFIRMED': return 'resolved';
            case 'PENDING': return 'open';
            case 'CANCELLED': return 'closed';
            default: return 'in-progress';
        }
    };

    const calculatePriority = (date) => {
        if (!date) return 'low';
        const travelDate = new Date(date);
        const now = new Date();
        const diffHours = (travelDate - now) / (1000 * 60 * 60);

        if (diffHours < 24) return 'high';
        if (diffHours < 72) return 'medium';
        return 'low';
    };

    const calculateTimeLeft = (date) => {
        if (!date) return '-';
        const travelDate = new Date(date);
        const now = new Date();
        const diffMs = travelDate - now;

        if (diffMs < 0) return 'Overdue';

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    // Get stats for current domain
    const stats = TICKETING_STATS[selectedDomain.id] || TICKETING_STATS.all;

    // Filter tickets
    const recentTickets = selectedDomain.id === 'all'
        ? realTickets
        : realTickets.filter(t => t.domain === selectedDomain.id);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Global Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    {/* Domain Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDomainOpen(!isDomainOpen)}
                            className="flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all min-w-[200px]"
                        >
                            <div className={`p-1.5 rounded-lg ${selectedDomain.id === 'all' ? 'bg-indigo-100 text-indigo-600' :
                                selectedDomain.id === 'hotel' ? 'bg-rose-100 text-rose-600' :
                                    selectedDomain.id === 'cinema' ? 'bg-purple-100 text-purple-600' :
                                        'bg-emerald-100 text-emerald-600'
                                }`}>
                                <selectedDomain.icon size={18} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-xs text-gray-500 font-medium">Current Domain</p>
                                <p className="text-sm font-bold text-gray-900">{selectedDomain.name}</p>
                            </div>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDomainOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDomainOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 space-y-1">
                                    {DOMAINS.map((domain) => (
                                        <button
                                            key={domain.id}
                                            onClick={() => {
                                                setSelectedDomain(domain);
                                                setIsDomainOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${selectedDomain.id === domain.id
                                                ? 'bg-gray-50'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`p-1.5 rounded-lg ${domain.id === 'all' ? 'bg-indigo-100 text-indigo-600' :
                                                domain.id === 'hotel' ? 'bg-rose-100 text-rose-600' :
                                                    domain.id === 'cinema' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                <domain.icon size={16} />
                                            </div>
                                            <span className={`text-sm font-medium ${selectedDomain.id === domain.id ? 'text-gray-900' : 'text-gray-600'
                                                }`}>
                                                {domain.name}
                                            </span>
                                            {selectedDomain.id === domain.id && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Global Search */}
                    <div className="relative hidden md:block w-96">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tickets, users, or booking IDs... (Ctrl+K)"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <kbd className="px-1.5 py-0.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded">Ctrl</kbd>
                            <kbd className="px-1.5 py-0.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded">K</kbd>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Date Range Picker Placeholder */}
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                        <Calendar size={16} />
                        <span>Last 7 Days</span>
                        <ChevronDown size={14} className="text-gray-400" />
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="h-8 w-px bg-gray-200 mx-2"></div>

                    {/* User Profile (Mock) */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            AD
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-sm font-bold text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-500">Support Lead</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Welcome / Context */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Support Overview</h1>
                        <p className="text-gray-500 mt-1">
                            Viewing data for <span className="font-semibold text-gray-900">{selectedDomain.name}</span>
                        </p>
                    </div>

                    {/* KPI Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPIWidget
                            label="Total Tickets"
                            value={stats.totalTickets.toLocaleString()}
                            trend={stats.totalTrend}
                            trendLabel="vs last week"
                            icon={Ticket}
                            color="indigo"
                        />
                        <KPIWidget
                            label="SLA Compliance"
                            value={`${stats.slaCompliance}%`}
                            trend={stats.slaTrend}
                            trendLabel="vs target"
                            icon={Clock}
                            color="emerald"
                        />
                        <KPIWidget
                            label="Escalation Rate"
                            value={`${stats.escalationRate}%`}
                            trend={stats.escalationTrend}
                            trendLabel="vs last week"
                            icon={AlertTriangle}
                            color="amber"
                        />
                        <KPIWidget
                            label="Active Agents"
                            value={`${stats.activeAgents}/${stats.totalAgents}`}
                            trend={0}
                            trendLabel="Online now"
                            icon={Users}
                            color="purple"
                        />
                    </div>

                    {/* Observability Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                            <SLAComplianceChart />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                            <EscalationAlerts tickets={recentTickets} />
                        </div>
                    </div>

                    {/* Ticket Data Table */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                        <TicketDataTable data={recentTickets} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TicketingDashboard;
