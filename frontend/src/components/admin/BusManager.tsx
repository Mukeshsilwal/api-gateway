import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';
import { useNavigate } from 'react-router-dom';
import DataTable, { Column } from './DataTable';
import BusSeatPreview from './BusSeatPreview';
import { BusDto, RouteDto, SeatDto } from '../../types/dto';
import { Plus, RefreshCw, Bus as BusIcon, Map as MapIcon, Calendar, Clock, RotateCcw, Layout, List, Ticket } from 'lucide-react';

// Extended BusDto to handle potentially inconsistent API responses (e.g. route vs route12)
interface ExtendedBusDto extends BusDto {
    id?: number; // Ensure ID is present
    route12?: RouteDto;
    route?: RouteDto;
    // Overwrite seats to be optional or ensure it matches
    seats?: SeatDto[];
}

export const BusManager: React.FC = () => {
    const navigate = useNavigate();
    const today = new Date().toISOString().split("T")[0];

    // Tab state
    const [activeTab, setActiveTab] = useState<'list' | 'add' | 'seats'>('list');

    // Bus form state
    const [busName, setBusName] = useState("");
    const [busType, setBusType] = useState("DELUXE");
    const [busRoute, setBusRoute] = useState(""); // Route ID as string
    const [busDate, setBusDate] = useState("");
    const [allRoutes, setAllRoutes] = useState<RouteDto[]>([]);
    const [basePrice, setBasePrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [busTime, setBusTime] = useState("");
    const [totalSeats, setTotalSeats] = useState("");
    const [isCreatingBus, setIsCreatingBus] = useState(false);

    // Seat form state
    const [seatNumber, setSeatNumber] = useState("");
    const [seatBusId, setSeatBusId] = useState("");
    const [seatPrice, setSeatPrice] = useState("");
    const [isReserved, setIsReserved] = useState(false);
    const [isCreatingSeat, setIsCreatingSeat] = useState(false);
    const [allBuses, setAllBuses] = useState<ExtendedBusDto[]>([]);

    // Filter state
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'empty'>('all');
    const [dateFilter, setDateFilter] = useState('');

    // Selected bus for seat preview
    const [selectedBusForPreview, setSelectedBusForPreview] = useState<ExtendedBusDto | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [busDetailsCache, setBusDetailsCache] = useState<Map<number, ExtendedBusDto>>(new Map());

    useEffect(() => {
        getAllRoutes();
        getAllBuses();
    }, []);

    async function getAllRoutes() {
        try {
            const allroutesRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ROUTES);
            if (allroutesRes && allroutesRes.data) {
                setAllRoutes(allroutesRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch routes", error);
        }
    }

    async function getAllBuses() {
        try {
            const allBusesRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BUSES);
            if (allBusesRes && allBusesRes.data) {
                setAllBuses(allBusesRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch buses", error);
            toast.error("Failed to load buses");
        }
    }

    async function handleViewSeats(bus: ExtendedBusDto) {
        setSelectedBusForPreview(bus); // Show modal immediately with partial data

        if (!bus.id) return;

        // Check cache first
        if (busDetailsCache.has(bus.id)) {
            console.log('Using cached bus details for bus', bus.id);
            setSelectedBusForPreview(busDetailsCache.get(bus.id)!);
            return;
        }

        setIsLoadingDetails(true);
        try {
            const res = await ApiService.get(`${API_CONFIG.ENDPOINTS.BUS_COMPLETE_DETAILS}${bus.id}/complete`);
            if (res && res.data) {
                const completeData = res.data;
                setSelectedBusForPreview(completeData);
                // Cache the complete data
                setBusDetailsCache(prev => new Map(prev).set(bus.id!, completeData));
            }
        } catch (error) {
            console.error("Error fetching complete bus details:", error);
            toast.error("Failed to load latest seat availability");
        } finally {
            setIsLoadingDetails(false);
        }
    }

    async function createNewBus() {
        if (!busName || !busRoute || !busDate || !maxPrice || !basePrice || !busTime || !totalSeats) {
            toast.error("All fields are required!");
            return;
        }
        setIsCreatingBus(true);
        try {
            const payload = {
                busDto: {
                    busName,
                    busType,
                    departureDateTime: `${busDate}T${busTime}`,
                    date: busDate,
                    maxPrice: parseFloat(maxPrice),
                    basePrice: parseFloat(basePrice),
                    seats: [], // Empty list as seats are generated by number
                    routeDto: null
                },
                routeId: parseInt(busRoute),
                numberOfSeats: parseInt(totalSeats)
            };

            const busRouteRes = await ApiService.post(`${API_CONFIG.ENDPOINTS.CREATE_BUS}/${payload.routeId}/buses`, payload);

            if (busRouteRes) {
                toast.success("New Bus created!");
                setBusName("");
                setBusType("DELUXE");
                setBusRoute("");
                setBusDate("");
                setMaxPrice("");
                setBasePrice("");
                setBusTime("");
                setTotalSeats("");

                // Optimistic update
                if (busRouteRes.data) {
                    setAllBuses(prev => [...prev, busRouteRes.data]);
                } else {
                    getAllBuses();
                }

                if (busRouteRes.data && busRouteRes.data.id) {
                    setActiveTab('seats');
                    setSeatBusId(String(busRouteRes.data.id));
                    setSelectedBusForPreview(busRouteRes.data);
                } else {
                    setActiveTab('list');
                }
            }
        } catch (error: any) {
            console.error("Error creating bus:", error);
            if (error.response && error.response.status === 401) {
                toast.error("Session timeout. Login again!");
                navigate("/admin/login");
            } else {
                toast.error(error.message || "Failed to create bus");
            }
        } finally {
            setIsCreatingBus(false);
        }
    }

    async function createNewSeat() {
        if (!seatNumber || !seatBusId || !seatPrice) {
            toast.error("Seat Number, Bus ID, and Price are required!");
            return;
        }

        const seatNumTrim = String(seatNumber).trim();
        const busIdNumber = parseInt(seatBusId, 10);

        if (isNaN(busIdNumber) || !seatBusId) {
            toast.error("Please select a valid bus from the dropdown.");
            return;
        }

        const targetBus = allBuses.find((b) => String(b.id) === String(seatBusId));
        if (!targetBus) {
            toast.error("Selected bus not found. Please refresh and try again.");
            return;
        }

        const existingSeats = Array.isArray(targetBus.seats) ? targetBus.seats : [];
        const duplicate = existingSeats.some((s) => String(s.seatNumber).toLowerCase() === seatNumTrim.toLowerCase());
        if (duplicate) {
            toast.error("A seat with this number already exists for the selected bus.");
            return;
        }

        try {
            setIsCreatingSeat(true);
            const payload = {
                busId: busIdNumber,
                busName: targetBus.busName || '',
                seatNumber: seatNumTrim,
                price: parseFloat(seatPrice),
                status: isReserved ? 'BOOKED' : 'AVAILABLE',
                reserved: isReserved,
                holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min from now
            };

            const seatRes = await ApiService.post(API_CONFIG.ENDPOINTS.ADD_SEAT, payload);

            if (seatRes && (seatRes.statusCode === 200 || seatRes.statusCode === 201)) {
                toast.success("New Seat added!");
                setSeatNumber("");
                setSeatPrice("");
                setIsReserved(false);
                getAllBuses();

                // Update preview if viewing this bus
                if (selectedBusForPreview && String(selectedBusForPreview.id) === String(seatBusId)) {
                    // We need to refresh the selected bus logic.
                    // Ideally we fetch the fresh bus or push the seat to preview
                    // For now, re-fetch all buses handles the state update for `allBuses`,
                    // we can re-find it from there in next render or manually update cache
                    // Doing simple fetch optimization:
                    const updatedBus = { ...targetBus, seats: [...existingSeats, seatRes.data || payload] };
                    // Note: payload doesn't have ID, seatRes.data should have it.
                    // Fallback to refetching bus details
                    handleViewSeats(targetBus);
                }
            } else {
                // @ts-ignore
                toast.error(seatRes?.message || "Error while creating new seat. Please Retry!");
            }
        } catch (error: any) {
            console.error("Error creating seat:", error);
            toast.error("Failed to create seat");
        } finally {
            setIsCreatingSeat(false);
        }
    }

    // Filter buses
    const filteredBuses = allBuses.filter(bus => {
        if (statusFilter !== 'all') {
            const hasSeats = Array.isArray(bus.seats) && bus.seats.length > 0;
            if (statusFilter === 'active' && !hasSeats) return false;
            if (statusFilter === 'empty' && hasSeats) return false;
        }
        if (dateFilter && bus.date !== dateFilter) return false;
        return true;
    });

    // Stats
    const stats = {
        total: allBuses.length,
        active: allBuses.filter(b => Array.isArray(b.seats) && b.seats.length > 0).length,
        empty: allBuses.filter(b => !Array.isArray(b.seats) || b.seats.length === 0).length,
        totalSeats: allBuses.reduce((sum, b) => sum + (Array.isArray(b.seats) ? b.seats.length : 0), 0)
    };

    const busColumns: Column<ExtendedBusDto>[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'busName', label: 'Bus Name', sortable: true },
        {
            key: 'route',
            label: 'Route',
            sortable: false,
            render: (_, bus) => {
                const route = bus.route || bus.route12;
                return route ? (
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{route.origin || (route as any).sourceBusStop?.name}</span>
                        <MapIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{route.destination || (route as any).destinationBusStop?.name}</span>
                    </div>
                ) : <span className="text-gray-400">N/A</span>;
            }
        },
        {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (date, bus) => {
                const dateVal = date || bus.departureDateTime;
                return (
                    <span className="text-gray-700">{dateVal ? new Date(dateVal).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                );
            }
        },
        {
            key: 'departureDateTime',
            label: 'Departure',
            sortable: true,
            render: (dt) => dt ? (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-indigo-600">{new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            ) : 'N/A'
        },
        {
            key: 'seats',
            label: 'Seats',
            sortable: false,
            render: (seats, bus) => (
                <button
                    onClick={(e) => { e.stopPropagation(); handleViewSeats(bus); }}
                    className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-xs font-semibold hover:from-indigo-100 hover:to-purple-100 transition-all flex items-center gap-2"
                >
                    <Layout className="w-4 h-4" />
                    {Array.isArray(seats) ? seats.length : 0} seats
                </button>
            )
        },
        {
            key: 'basePrice',
            label: 'Price Range',
            sortable: true,
            render: (price, bus) => (
                <div className="text-sm">
                    <span className="text-emerald-600 font-semibold">Rs. {price}</span>
                    <span className="text-gray-400 mx-1">-</span>
                    <span className="text-purple-600 font-semibold">Rs. {bus.maxPrice}</span>
                </div>
            )
        }
    ];

    const tabList = [
        { id: 'list', label: 'All Buses', icon: List },
        { id: 'add', label: 'Add Bus', icon: Plus },
        { id: 'seats', label: 'Manage Seats', icon: Layout }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Bus Management
                    </h2>
                    <p className="text-gray-600 mt-1">Manage your fleet of buses and seats</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => getAllBuses()}
                        className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <BusIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-sm text-gray-500">Total Buses</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                            <p className="text-sm text-gray-500">With Seats</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Layout className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.empty}</p>
                            <p className="text-sm text-gray-500">No Seats</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <Layout className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalSeats}</p>
                            <p className="text-sm text-gray-500">Total Seats</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="border-b border-gray-100">
                    <nav className="flex -mb-px">
                        {tabList.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 sm:flex-none px-6 py-4 flex items-center justify-center gap-2 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* List Tab */}
                    {activeTab === 'list' && (
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {(['all', 'active', 'empty'] as const).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === status
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {status === 'all' && `All (${stats.total})`}
                                            {status === 'active' && `With Seats (${stats.active})`}
                                            {status === 'empty' && `No Seats (${stats.empty})`}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {dateFilter && (
                                        <button
                                            onClick={() => setDateFilter('')}
                                            className="p-2 text-gray-400 hover:text-gray-600"
                                        >
                                            <RotateCcw className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Data Table */}
                            <DataTable
                                columns={busColumns}
                                data={filteredBuses}
                                itemsPerPage={10}
                                searchable={true}
                                exportable={true}
                                expandable={true}
                                renderExpandedRow={(bus) => (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Bus Details & Seats</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Route: <span className="font-medium text-gray-900">{bus.route?.origin || (bus.route as any)?.sourceBusStop?.name} → {bus.route?.destination || (bus.route as any)?.destinationBusStop?.name}</span></p>
                                                <p className="text-sm text-gray-600">Type: <span className="font-medium text-gray-900">{bus.busType}</span></p>
                                            </div>
                                            <div>
                                                {/* Preview of seats directly in row */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-600">Capacity: {bus.numberOfSeats}</span>
                                                    <button
                                                        className="text-xs text-indigo-600 underline"
                                                        onClick={() => handleViewSeats(bus)}
                                                    >
                                                        View Seat Layout
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    )}

                    {/* Add Bus Tab */}
                    {activeTab === 'add' && (
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Plus className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Create New Bus</h3>
                                <p className="text-gray-500 mt-1">Add a scheduled bus for a selected route</p>
                            </div>

                            {allRoutes.length > 0 ? (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bus Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Deluxe Express"
                                            value={busName}
                                            onChange={(e) => setBusName(e.target.value)}
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bus Type</label>
                                        <select
                                            value={busType}
                                            onChange={(e) => setBusType(e.target.value)}
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                        >
                                            {['SEMI_DELUXE', 'VIP', 'DELUXE', 'STANDARD'].map((type) => (
                                                <option key={type} value={type}>
                                                    {type.replace('_', ' ')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                                        <select
                                            value={busRoute}
                                            onChange={(e) => setBusRoute(e.target.value)}
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                        >
                                            <option value="">Select Route</option>
                                            {allRoutes.map((route) => (
                                                <option key={route.id} value={route.id}>
                                                    {route.origin || (route as any).sourceBusStop.name} → {route.destination || (route as any).destinationBusStop.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                            <input
                                                type="date"
                                                value={busDate}
                                                onChange={(e) => setBusDate(e.target.value)}
                                                min={today}
                                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                            <input
                                                type="time"
                                                value={busTime}
                                                onChange={(e) => setBusTime(e.target.value)}
                                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (Rs)</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 1000"
                                                value={basePrice}
                                                onChange={(e) => setBasePrice(e.target.value)}
                                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (Rs)</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 1500"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Seats</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 40"
                                            value={totalSeats}
                                            onChange={(e) => setTotalSeats(e.target.value)}
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <button
                                        onClick={createNewBus}
                                        disabled={isCreatingBus}
                                        className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] ${isCreatingBus ? 'opacity-80 cursor-not-allowed' : ''}`}
                                    >
                                        {isCreatingBus ? 'Creating Bus...' : 'Create Bus'}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                    <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">No routes available</p>
                                    <p className="text-gray-400 text-sm mt-1">Create a route first to add buses</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Manage Seats Tab */}
                    {activeTab === 'seats' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Add Seat Form */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 rounded-2xl border border-gray-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                        <Plus className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Add Seat</h3>
                                        <p className="text-sm text-gray-500">Add seats to a bus</p>
                                    </div>
                                </div>

                                {allBuses.length > 0 ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Bus</label>
                                            <select
                                                value={seatBusId}
                                                onChange={(e) => {
                                                    const selectedValue = e.target.value;
                                                    setSeatBusId(selectedValue);
                                                    const bus = allBuses.find(b => String(b.id) === String(selectedValue));
                                                    setSelectedBusForPreview(bus || null);
                                                }}
                                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                            >
                                                <option value="">Select Bus</option>
                                                {allBuses.map((bus) => {
                                                    const route = bus.route || bus.route12;
                                                    const routeName = route ? `${route.origin || (route as any).sourceBusStop?.name} → ${route.destination || (route as any).destinationBusStop?.name}` : '';
                                                    const displayName = bus.busName || routeName || `Bus #${bus.id}`;
                                                    const dateVal = bus.date || bus.departureDateTime;
                                                    const dateStr = dateVal ? new Date(dateVal).toLocaleDateString() : '';

                                                    return (
                                                        <option key={bus.id} value={String(bus.id)}>
                                                            {displayName} {dateStr ? `(${dateStr})` : ''} - {Array.isArray(bus.seats) ? bus.seats.length : 0} seats
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Seat Number</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. A1, B2"
                                                value={seatNumber}
                                                onChange={(e) => setSeatNumber(e.target.value)}
                                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs)</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 1200"
                                                value={seatPrice}
                                                onChange={(e) => setSeatPrice(e.target.value)}
                                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <input
                                                type="checkbox"
                                                id="reserved"
                                                checked={isReserved}
                                                onChange={(e) => setIsReserved(e.target.checked)}
                                                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <label htmlFor="reserved" className="text-sm font-medium text-gray-700 cursor-pointer">
                                                Mark as Reserved (Booked)
                                            </label>
                                        </div>

                                        <button
                                            onClick={createNewSeat}
                                            disabled={isCreatingSeat || !seatBusId}
                                            className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl ${isCreatingSeat || !seatBusId ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                                        >
                                            {isCreatingSeat ? 'Adding Seat...' : 'Add Seat'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500">No buses available. Create a bus first.</p>
                                    </div>
                                )}
                            </div>

                            {/* Seat Preview */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Seat Layout Preview</h3>
                                    {selectedBusForPreview && (() => {
                                        const bus = selectedBusForPreview;
                                        const route = bus.route || bus.route12;
                                        const routeName = route ? `${route.origin || (route as any).sourceBusStop?.name} → ${route.destination || (route as any).destinationBusStop?.name}` : '';
                                        const displayName = bus.busName || routeName || `Bus #${bus.id}`;
                                        return (
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                                {displayName}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <BusSeatPreview
                                    seats={selectedBusForPreview?.seats || []}
                                    showLegend={true}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Seat Preview Modal */}
            {selectedBusForPreview && activeTab === 'list' && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedBusForPreview(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {(() => {
                                        const bus = selectedBusForPreview;
                                        const route = bus.route || bus.route12;
                                        const routeName = route ? `${route.origin || (route as any).sourceBusStop?.name} → ${route.destination || (route as any).destinationBusStop?.name}` : '';
                                        return bus.busName || routeName || `Bus #${bus.id}`;
                                    })()}
                                </h3>
                                <p className="text-sm text-gray-500">{selectedBusForPreview.date}</p>
                            </div>
                            <button
                                onClick={() => setSelectedBusForPreview(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <RotateCcw className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6">
                            {isLoadingDetails ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                    <p className="text-gray-500">Loading seat details...</p>
                                </div>
                            ) : (
                                <BusSeatPreview
                                    seats={selectedBusForPreview.seats || []}
                                    showLegend={true}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
