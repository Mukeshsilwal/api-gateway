import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Bus, ChevronLeft, ChevronRight, Filter, Plus, MoreVertical } from 'lucide-react';
import { toast } from 'react-toastify';

const TripScheduler = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'day', 'week'
    const [draggedTrip, setDraggedTrip] = useState(null);

    // Mock Data
    const [buses] = useState([
        { id: 1, number: 'BA 2 KHA 1234', type: 'Luxury Sofa', capacity: 28 },
        { id: 2, number: 'BA 3 KHA 5678', type: 'VIP Deluxe', capacity: 35 },
        { id: 3, number: 'BA 1 KHA 9012', type: 'Tourist AC', capacity: 40 },
        { id: 4, number: 'BA 4 KHA 3456', type: 'Super Deluxe', capacity: 30 },
    ]);

    const [unassignedTrips, setUnassignedTrips] = useState([
        { id: 101, route: 'Kathmandu - Pokhara', duration: '7h', price: 1200, type: 'Morning' },
        { id: 102, route: 'Kathmandu - Chitwan', duration: '6h', price: 1000, type: 'Day' },
        { id: 103, route: 'Pokhara - Kathmandu', duration: '7h', price: 1200, type: 'Night' },
        { id: 104, route: 'Kathmandu - Lumbini', duration: '9h', price: 1500, type: 'Night' },
    ]);

    const [scheduledTrips, setScheduledTrips] = useState([
        { id: 201, busId: 1, tripId: 101, date: '2024-05-20', startTime: '07:00', route: 'Kathmandu - Pokhara', status: 'scheduled' },
        { id: 202, busId: 2, tripId: 103, date: '2024-05-21', startTime: '19:00', route: 'Pokhara - Kathmandu', status: 'completed' },
    ]);

    // Helper functions
    const getDaysInView = () => {
        const days = [];
        const start = new Date(currentDate);
        if (viewMode === 'week') {
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
            start.setDate(diff);
        }

        const count = viewMode === 'week' ? 7 : 1;
        for (let i = 0; i < count; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const days = getDaysInView();

    const [selectedTrip, setSelectedTrip] = useState(null);

    const handleTripSelect = (trip) => {
        if (selectedTrip?.id === trip.id) {
            setSelectedTrip(null);
        } else {
            setSelectedTrip(trip);
            toast.info(`Selected ${trip.route}. Click a calendar slot to assign.`);
        }
    };

    const handleSlotClick = (busId, date) => {
        if (!selectedTrip) return;

        const dateStr = date.toISOString().split('T')[0];
        const isOccupied = scheduledTrips.some(t => t.busId === busId && t.date === dateStr);

        if (isOccupied) {
            toast.error('Slot already occupied!');
            return;
        }

        const newSchedule = {
            id: Date.now(),
            busId,
            tripId: selectedTrip.id,
            date: dateStr,
            startTime: '08:00',
            route: selectedTrip.route,
            status: 'scheduled'
        };

        setScheduledTrips([...scheduledTrips, newSchedule]);
        setUnassignedTrips(unassignedTrips.filter(t => t.id !== selectedTrip.id));
        setSelectedTrip(null);
        toast.success('Trip scheduled successfully!');
    };

    const handleDragStart = (e, trip) => {
        setDraggedTrip(trip);
        e.dataTransfer.setData('tripId', trip.id);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e, busId, date) => {
        e.preventDefault();
        if (!draggedTrip) return;

        const dateStr = date.toISOString().split('T')[0];
        const isOccupied = scheduledTrips.some(t => t.busId === busId && t.date === dateStr);

        if (isOccupied) {
            toast.error('Slot already occupied!');
            return;
        }

        const newSchedule = {
            id: Date.now(),
            busId,
            tripId: draggedTrip.id,
            date: dateStr,
            startTime: '08:00',
            route: draggedTrip.route,
            status: 'scheduled'
        };

        setScheduledTrips([...scheduledTrips, newSchedule]);
        setUnassignedTrips(unassignedTrips.filter(t => t.id !== draggedTrip.id));
        setDraggedTrip(null);
        toast.success('Trip scheduled successfully!');
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6">
            {/* Sidebar - Unassigned Trips */}
            <div className="w-full lg:w-80 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden shrink-0">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Clock size={18} className="text-indigo-600" />
                        Unassigned Trips
                    </h3>
                    <div className="mt-2 relative">
                        <input
                            type="text"
                            placeholder="Search routes..."
                            aria-label="Search unassigned trips"
                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3" role="list" aria-label="Unassigned trips list">
                    {unassignedTrips.map(trip => (
                        <div
                            key={trip.id}
                            role="button"
                            tabIndex={0}
                            aria-pressed={selectedTrip?.id === trip.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, trip)}
                            onClick={() => handleTripSelect(trip)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleTripSelect(trip);
                                }
                            }}
                            className={`p-3 bg-white border rounded-lg shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all group outline-none focus:ring-2 focus:ring-indigo-500 ${selectedTrip?.id === trip.id
                                ? 'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                    {trip.type}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                    {trip.duration}
                                </span>
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">{trip.route}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {trip.price} NPR
                                </span>
                            </div>
                        </div>
                    ))}
                    {unassignedTrips.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            No unassigned trips
                        </div>
                    )}
                </div>
            </div>

            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Calendar size={20} className="text-indigo-600" />
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => {
                                    const d = new Date(currentDate);
                                    d.setDate(d.getDate() - 7);
                                    setCurrentDate(d);
                                }}
                                aria-label="Previous week"
                                className="p-1 hover:bg-white rounded shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-3 py-1 text-xs font-medium hover:bg-white rounded shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => {
                                    const d = new Date(currentDate);
                                    d.setDate(d.getDate() + 7);
                                    setCurrentDate(d);
                                }}
                                aria-label="Next week"
                                className="p-1 hover:bg-white rounded shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <Plus size={16} />
                            New Trip
                        </button>
                    </div>
                </div>

                {/* Scheduler Grid */}
                <div className="flex-1 overflow-auto" role="grid" aria-label="Trip schedule grid">
                    <div className="min-w-[800px]">
                        {/* Header Row */}
                        <div className="flex border-b border-gray-200" role="row">
                            <div className="w-48 p-3 bg-gray-50 border-r border-gray-200 font-semibold text-gray-600 text-sm sticky left-0 z-10" role="columnheader">
                                Bus / Driver
                            </div>
                            {days.map(day => (
                                <div key={day.toString()} className={`flex-1 p-3 text-center border-r border-gray-100 min-w-[120px] ${day.toDateString() === new Date().toDateString() ? 'bg-indigo-50' : 'bg-gray-50'}`} role="columnheader">
                                    <div className="text-xs text-gray-500 uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                    <div className={`text-sm font-bold ${day.toDateString() === new Date().toDateString() ? 'text-indigo-600' : 'text-gray-900'}`}>
                                        {day.getDate()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bus Rows */}
                        {buses.map(bus => (
                            <div key={bus.id} className="flex border-b border-gray-100 hover:bg-gray-50/50 transition-colors" role="row">
                                {/* Bus Info Column */}
                                <div className="w-48 p-3 border-r border-gray-200 bg-white sticky left-0 z-10 flex flex-col justify-center group" role="rowheader">
                                    <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                        <Bus size={14} className="text-gray-400" />
                                        {bus.number}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5 ml-5">{bus.type} • {bus.capacity} seats</div>
                                </div>

                                {/* Days Columns */}
                                {days.map(day => {
                                    const dateStr = day.toISOString().split('T')[0];
                                    const trip = scheduledTrips.find(t => t.busId === bus.id && t.date === dateStr);
                                    const isToday = day.toDateString() === new Date().toDateString();

                                    return (
                                        <div
                                            key={day.toString()}
                                            role="gridcell"
                                            tabIndex={!trip ? 0 : -1}
                                            aria-label={trip ? `Trip scheduled: ${trip.route}` : `Empty slot for ${bus.number} on ${dateStr}`}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, bus.id, day)}
                                            onClick={() => handleSlotClick(bus.id, day)}
                                            onKeyDown={(e) => {
                                                if (!trip && (e.key === 'Enter' || e.key === ' ')) {
                                                    e.preventDefault();
                                                    handleSlotClick(bus.id, day);
                                                }
                                            }}
                                            className={`flex-1 p-2 border-r border-gray-100 min-w-[120px] min-h-[100px] transition-colors outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${!trip ? 'hover:bg-indigo-50/30 cursor-pointer' : ''} ${selectedTrip && !trip ? 'bg-indigo-50/20' : ''}`}
                                        >
                                            {trip ? (
                                                <div
                                                    tabIndex={0}
                                                    className={`h-full p-2 rounded-lg border text-xs relative group cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${trip.status === 'completed' ? 'bg-gray-100 border-gray-200 text-gray-600' :
                                                        trip.status === 'in-progress' ? 'bg-green-50 border-green-200 text-green-700' :
                                                            'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                        }`}
                                                >
                                                    <div className="font-bold mb-1">{trip.startTime}</div>
                                                    <div className="font-medium truncate" title={trip.route}>{trip.route}</div>

                                                    {/* Hover Actions */}
                                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                                                        <button
                                                            className="p-1 hover:bg-white/50 rounded focus:outline-none focus:bg-white/50"
                                                            aria-label="Trip options"
                                                        >
                                                            <MoreVertical size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`h-full w-full flex items-center justify-center text-gray-300 border-2 border-dashed border-transparent rounded-lg transition-all ${selectedTrip ? 'border-indigo-200 opacity-100' : 'opacity-0 hover:opacity-100 hover:border-indigo-200'}`}>
                                                    <Plus size={20} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripScheduler;
