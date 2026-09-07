import React, { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';
import { useNavigate } from 'react-router-dom';
import DataTable, { Column } from './DataTable';
import { RouteDto } from '../../types/dto';
import { MapPin, Navigation, Plus, RefreshCw, Map } from 'lucide-react';

// Define interfaces matching actual usage in RouteManager.jsx
// referencing: route.sourceBusStop?.name
interface BusStopDto {
    id: number;
    name: string;
    routeCount?: number;
    routes?: RouteDto[]; // Or connected routes
    connectedRoutes?: any[];
}

interface ExtendedRouteDto extends RouteDto {
    sourceBusStop?: BusStopDto;
    destinationBusStop?: BusStopDto;
    sourceStopId?: number;
    destinationStopId?: number;
}

export const RouteManager: React.FC = () => {
    const navigate = useNavigate();

    // Tab state
    const [activeTab, setActiveTab] = useState<'routes' | 'stops' | 'add'>('routes');

    // Form state
    const [busStop, setBusStop] = useState("");
    const [busStops, setBusStops] = useState<BusStopDto[]>([]);
    const [routes, setRoutes] = useState<ExtendedRouteDto[]>([]);
    const [isCreatingStop, setIsCreatingStop] = useState(false);
    const [routeCityOne, setRouteCityOne] = useState("");
    const [routeCityTwo, setRouteCityTwo] = useState("");
    const [isCreatingRoute, setIsCreatingRoute] = useState(false);

    useEffect(() => {
        getBusStops();
        getRoutes();
    }, []);

    async function getBusStops() {
        try {
            const busStopRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_BUS_STOPS);
            if (busStopRes && Array.isArray(busStopRes.data)) {
                // Map the nested structure to flat structure for DataTable
                // usage in jsx: item.busStop, item.routeCount, item.routes
                const busStopsData: BusStopDto[] = busStopRes.data.map((item: any) => ({
                    ...item.busStop,
                    // valid routes are those in 'routes' array or routeCount
                    routeCount: item.routeCount,
                    connectedRoutes: item.routes || []
                }));
                setBusStops(busStopsData);
            }
        } catch (error) {
            console.error("Error fetching bus stops:", error);
            // Fallback to empty array on error to prevent UI crash
            setBusStops([]);
        }
    }

    async function getRoutes() {
        try {
            const routesRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ROUTES);
            if (routesRes) {
                const routesData = await routesRes.data;
                setRoutes(routesData || []);
            }
        } catch (error) {
            console.error("Error fetching routes:", error);
        }
    }

    async function createBusStop() {
        if (!busStop) {
            toast.error("Bus Stop name cannot be empty!");
            return;
        }
        setIsCreatingStop(true);
        try {
            const res = await ApiService.post(API_CONFIG.ENDPOINTS.CREATE_BUS_STOP, {
                name: busStop,
            });

            if (res) {
                toast.success("Bus Stop created!");
                setBusStop("");
                getBusStops();
            } else {
                // @ts-ignore
                if (res && res.status === 401) {
                    toast.error("Session timeout. Login again!");
                    navigate("/admin/login");
                } else {
                    const err = res ? await (res as any).json().catch(() => ({})) : {};
                    toast.error(err.message || "Error while creating Bus Stop. Please Retry!");
                }
            }
        } catch (error) {
            console.error("Error creating bus stop:", error);
            toast.error("Failed to create bus stop");
        } finally {
            setIsCreatingStop(false);
        }
    }

    async function createRoute() {
        if (!routeCityOne || !routeCityTwo) {
            toast.error("Fill both the routes!");
            return;
        }
        if (routeCityOne === routeCityTwo) {
            toast.error("Source and destination cannot be the same!");
            return;
        }
        setIsCreatingRoute(true);
        try {
            const source = busStops.find((city) => city.name === routeCityOne);
            const dest = busStops.find((city) => city.name === routeCityTwo);
            if (!source || !dest) throw new Error("Selected cities are invalid");

            const requestBody = {
                routeDto: {
                    id: 0,
                    sourceBusStop: {
                        id: source.id,
                        name: source.name
                    },
                    destinationBusStop: {
                        id: dest.id,
                        name: dest.name
                    }
                },
                sourceStopId: source.id,
                destinationStopId: dest.id
            };

            const res = await ApiService.post(
                API_CONFIG.ENDPOINTS.ADMIN_CREATE_ROUTE,
                requestBody
            );

            if (res) {
                toast.success("New Route created!");
                setRouteCityOne("");
                setRouteCityTwo("");
                getRoutes();
            } else {
                // @ts-ignore
                if (res && res.status === 401) {
                    toast.error("Session timeout. Login again!");
                    navigate("/admin/login");
                } else {
                    const err = res ? await (res as any).json().catch(() => ({})) : {};
                    toast.error(err.message || "Error while creating new route. Please Retry!");
                }
            }
        } catch (error: any) {
            console.error("Error creating route:", error);
            toast.error(error.message || "Failed to create route");
        } finally {
            setIsCreatingRoute(false);
        }
    }

    const busStopColumns: Column<BusStopDto>[] = [
        { key: 'id', label: 'ID', sortable: true },
        {
            key: 'name',
            label: 'Bus Stop Name',
            sortable: true,
            render: (name) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-800">{String(name)}</span>
                </div>
            )
        },
        {
            key: 'connectedRoutes', // Using a key that exists in data, though render ignores it effectively
            label: 'Connected Routes',
            sortable: false,
            render: (_, stop) => {
                // Use backend provided count if available, otherwise fallback to filtering (though backend data is preferred)
                const count = stop.routeCount !== undefined ? stop.routeCount : (stop.connectedRoutes?.length || 0);
                return (
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${count > 0
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20'
                            : 'bg-gray-100 text-gray-500'
                            }`}>
                            {count} routes
                        </span>
                    </div>
                );
            }
        }
    ];

    const routeColumns: Column<ExtendedRouteDto>[] = [
        { key: 'id', label: 'ID', sortable: true },
        {
            key: 'routePath' as any, // Virtual key for rendering
            label: 'Route Path',
            sortable: false,
            render: (_, route) => (
                <div className="flex items-center gap-3 py-2">
                    {/* Source */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2 rounded-xl border border-emerald-100">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-emerald-700">{route.sourceBusStop?.name || route.origin || 'N/A'}</span>
                    </div>

                    {/* Connection */}
                    <div className="flex items-center gap-1">
                        <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-300 to-indigo-300"></div>
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Navigation className="w-4 h-4 text-white" />
                        </div>
                        <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-300 to-red-300"></div>
                    </div>

                    {/* Destination */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-purple-50 px-3 py-2 rounded-xl border border-red-100">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-semibold text-red-700">{route.destinationBusStop?.name || route.destination || 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'active' as any,
            label: 'Status',
            sortable: false,
            render: () => (
                <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-500/20">
                    Active
                </span>
            )
        }
    ];

    const tabList = [
        { id: 'routes', label: 'All Routes', icon: Navigation },
        { id: 'stops', label: 'Bus Stops', icon: MapPin },
        { id: 'add', label: 'Create New', icon: Plus }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Route Management
                    </h2>
                    <p className="text-gray-600 dark:text-slate-400 mt-1">Manage bus stops and routes</p>
                </div>
                <button
                    onClick={() => {
                        getBusStops();
                        getRoutes();
                    }}
                    className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-gray-600 dark:text-slate-300"
                    title="Refresh"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Navigation className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{routes.length}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Total Routes</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{busStops.length}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Bus Stops</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Map className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{routes.length}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Active Routes</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {busStops.filter(s => routes.some(r => r.sourceBusStop?.id === s.id || r.destinationBusStop?.id === s.id)).length}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Connected Stops</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 dark:border-slate-800">
                    <nav className="flex -mb-px">
                        {tabList.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 sm:flex-none px-6 py-4 flex items-center justify-center gap-2 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                                    ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/30'
                                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Routes Tab */}
                    {activeTab === 'routes' && (
                        <div className="space-y-4">
                            {routes.length > 0 ? (
                                <DataTable
                                    columns={routeColumns}
                                    data={routes}
                                    itemsPerPage={10}
                                    searchable={true}
                                    exportable={true}
                                />
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Navigation className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No routes yet</h3>
                                    <p className="text-gray-500 mb-4">Create your first route to get started</p>
                                    <button
                                        onClick={() => setActiveTab('add')}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Create Route
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bus Stops Tab */}
                    {activeTab === 'stops' && (
                        <div className="space-y-4">
                            {busStops.length > 0 ? (
                                <DataTable
                                    columns={busStopColumns}
                                    data={busStops}
                                    itemsPerPage={10}
                                    searchable={true}
                                    exportable={true}
                                />
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MapPin className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No bus stops yet</h3>
                                    <p className="text-gray-500 mb-4">Add bus stops to create routes</p>
                                    <button
                                        onClick={() => setActiveTab('add')}
                                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Add Bus Stop
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create New Tab */}
                    {activeTab === 'add' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Create New Bus Stop */}
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-slate-800/80 dark:to-slate-800/40 p-6 rounded-2xl border border-emerald-100 dark:border-slate-700">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Bus Stop</h3>
                                        <p className="text-sm text-gray-600 dark:text-slate-400">Add a new city or location</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Stop Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Kathmandu, Pokhara"
                                            value={busStop}
                                            onChange={(e) => setBusStop(e.target.value)}
                                            className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        onClick={createBusStop}
                                        disabled={isCreatingStop || !busStop}
                                        className={`w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-4 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl ${isCreatingStop || !busStop ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'
                                            }`}
                                    >
                                        {isCreatingStop ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Creating...
                                            </span>
                                        ) : 'Create Bus Stop'}
                                    </button>
                                </div>
                            </div>

                            {/* Create New Route */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800/80 dark:to-slate-800/40 p-6 rounded-2xl border border-indigo-100 dark:border-slate-700">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <Navigation className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Route</h3>
                                        <p className="text-sm text-gray-600 dark:text-slate-400">Connect two bus stops</p>
                                    </div>
                                </div>

                                {busStops.length >= 2 ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">From (Source)</label>
                                            <select
                                                value={routeCityOne}
                                                onChange={(e) => setRouteCityOne(e.target.value)}
                                                className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            >
                                                <option value="" className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">Select Source</option>
                                                {busStops.map((city) => (
                                                    <option key={city.id} value={city.name} disabled={city.name === routeCityTwo} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full border-2 border-indigo-200 dark:border-slate-700 flex items-center justify-center">
                                                <Navigation className="w-5 h-5 text-indigo-500 rotate-90" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">To (Destination)</label>
                                            <select
                                                value={routeCityTwo}
                                                onChange={(e) => setRouteCityTwo(e.target.value)}
                                                className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            >
                                                <option value="" className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">Select Destination</option>
                                                {busStops.map((city) => (
                                                    <option key={city.id} value={city.name} disabled={city.name === routeCityOne} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Route Preview */}
                                        {routeCityOne && routeCityTwo && (
                                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-indigo-100 dark:border-slate-700 mt-4">
                                                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Route Preview</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-lg font-medium text-sm">{routeCityOne}</span>
                                                    <Navigation className="w-5 h-5 text-indigo-500 rotate-90" />
                                                    <span className="px-3 py-1 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded-lg font-medium text-sm">{routeCityTwo}</span>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={createRoute}
                                            disabled={isCreatingRoute || !routeCityOne || !routeCityTwo}
                                            className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl ${isCreatingRoute || !routeCityOne || !routeCityTwo ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'
                                                }`}
                                        >
                                            {isCreatingRoute ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Creating...
                                                </span>
                                            ) : 'Create Route'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                                        <MapPin className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-slate-400 font-medium">Need at least 2 bus stops</p>
                                        <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">Add more bus stops first</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
