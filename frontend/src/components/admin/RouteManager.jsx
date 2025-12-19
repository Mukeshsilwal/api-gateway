import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { DataTable } from './DataTable';

export function RouteManager() {
    const navigate = useNavigate();

    // Tab state
    const [activeTab, setActiveTab] = useState('routes');

    // Form state
    const [busStop, setBusStop] = useState("");
    const [busStops, setBusStops] = useState([]);
    const [routes, setRoutes] = useState([]);
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
                const busStopsData = busStopRes.data.map(item => ({
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
                if (res && res.status === 401) {
                    toast.error("Session timeout. Login again!");
                    navigate("/admin/login");
                } else {
                    const err = res ? await res.json().catch(() => ({})) : {};
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
                if (res && res.status === 401) {
                    toast.error("Session timeout. Login again!");
                    navigate("/admin/login");
                } else {
                    const err = res ? await res.json().catch(() => ({})) : {};
                    toast.error(err.message || "Error while creating new route. Please Retry!");
                }
            }
        } catch (error) {
            console.error("Error creating route:", error);
            toast.error(error.message || "Failed to create route");
        } finally {
            setIsCreatingRoute(false);
        }
    }

    const busStopColumns = [
        { key: 'id', label: 'ID', sortable: true },
        {
            key: 'name',
            label: 'Bus Stop Name',
            sortable: true,
            render: (name) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <span className="font-semibold text-gray-800">{name}</span>
                </div>
            )
        },
        {
            key: 'routes',
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

    const routeColumns = [
        { key: 'id', label: 'ID', sortable: true },
        {
            key: 'visual',
            label: 'Route Path',
            sortable: false,
            render: (_, route) => (
                <div className="flex items-center gap-3 py-2">
                    {/* Source */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2 rounded-xl border border-emerald-100">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-emerald-700">{route.sourceBusStop?.name || 'N/A'}</span>
                    </div>

                    {/* Connection */}
                    <div className="flex items-center gap-1">
                        <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-300 to-indigo-300"></div>
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </div>
                        <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-300 to-red-300"></div>
                    </div>

                    {/* Destination */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-orange-50 px-3 py-2 rounded-xl border border-red-100">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-semibold text-red-700">{route.destinationBusStop?.name || 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            render: () => (
                <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-500/20">
                    Active
                </span>
            )
        }
    ];

    const tabs = [
        {
            id: 'routes', label: 'All Routes', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            )
        },
        {
            id: 'stops', label: 'Bus Stops', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            id: 'add', label: 'Create New', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Route Management
                    </h2>
                    <p className="text-gray-600 mt-1">Manage bus stops and routes</p>
                </div>
                <button
                    onClick={() => {
                        getBusStops();
                        getRoutes();
                    }}
                    className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                    title="Refresh"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
                            <p className="text-sm text-gray-500">Total Routes</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{busStops.length}</p>
                            <p className="text-sm text-gray-500">Bus Stops</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
                            <p className="text-sm text-gray-500">Active Routes</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {busStops.filter(s => routes.some(r => r.sourceBusStop?.id === s.id || r.destinationBusStop?.id === s.id)).length}
                            </p>
                            <p className="text-sm text-gray-500">Connected Stops</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="border-b border-gray-100">
                    <nav className="flex -mb-px">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 sm:flex-none px-6 py-4 flex items-center justify-center gap-2 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.icon}
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
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
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
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
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
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Add Bus Stop</h3>
                                        <p className="text-sm text-gray-600">Add a new city or location</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Stop Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Kathmandu, Pokhara"
                                            value={busStop}
                                            onChange={(e) => setBusStop(e.target.value)}
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
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
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Create Route</h3>
                                        <p className="text-sm text-gray-600">Connect two bus stops</p>
                                    </div>
                                </div>

                                {busStops.length >= 2 ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">From (Source)</label>
                                            <select
                                                value={routeCityOne}
                                                onChange={(e) => setRouteCityOne(e.target.value)}
                                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                            >
                                                <option value="">Select Source</option>
                                                {busStops.map((city) => (
                                                    <option key={city.id} value={city.name} disabled={city.name === routeCityTwo}>
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <div className="w-10 h-10 bg-white rounded-full border-2 border-indigo-200 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">To (Destination)</label>
                                            <select
                                                value={routeCityTwo}
                                                onChange={(e) => setRouteCityTwo(e.target.value)}
                                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                            >
                                                <option value="">Select Destination</option>
                                                {busStops.map((city) => (
                                                    <option key={city.id} value={city.name} disabled={city.name === routeCityOne}>
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Route Preview */}
                                        {routeCityOne && routeCityTwo && (
                                            <div className="bg-white p-4 rounded-xl border border-indigo-100 mt-4">
                                                <p className="text-xs text-gray-500 mb-2">Route Preview</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-medium text-sm">{routeCityOne}</span>
                                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-medium text-sm">{routeCityTwo}</span>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={createRoute}
                                            disabled={isCreatingRoute || !routeCityOne || !routeCityTwo}
                                            className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl ${isCreatingRoute || !routeCityOne || !routeCityTwo ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'
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
                                    <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <p className="text-gray-500 font-medium">Need at least 2 bus stops</p>
                                        <p className="text-gray-400 text-sm mt-1">Add more bus stops first</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
