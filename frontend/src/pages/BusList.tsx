import { useContext, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import BusDetail from "../components/busDetail";
import Navbar from "../components/Navbar";
import BusListContext from "../context/busdetails";
import Footer from "../components/Footer";
import busService from "../services/busService";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { Filter, X, Search } from "lucide-react";

interface SearchParams {
    source: string;
    destination: string;
    date: string;
}

interface FilterState {
    maxPrice: string;
    busType: string;
}

const BusList = () => {
    const { setBusList } = useContext(BusListContext);
    const location = useLocation();

    // State for infinite scroll
    const [buses, setBuses] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Search params from navigation or local storage
    const searchParams = useMemo<SearchParams | null>(() => {
        if (location.state?.source && location.state?.destination && location.state?.date) {
            return {
                source: location.state.source,
                destination: location.state.destination,
                date: location.state.date
            };
        }

        try {
            const stored = localStorage.getItem("searchDetails");
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error("Failed to parse stored search details", e);
        }

        return null;
    }, [location.state]);

    const [filters, setFilters] = useState<FilterState>({
        maxPrice: "",
        busType: "",
    });

    // Observer for infinite scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastBusElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreBuses();
            }
        });
        if (node) observer.current.observe(node);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, hasMore]);

    const loadMoreBuses = useCallback(async (isInitial = false) => {
        if (loading || (!isInitial && !hasMore)) return;

        if (!searchParams) {
            setLoading(false);
            setInitialLoadComplete(true);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const currentCursor = isInitial ? null : cursor;
            const response = await busService.searchBuses({
                ...searchParams,
                cursor: currentCursor,
                pageSize: 10,
                // Add server-side filters
                maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
                busType: filters.busType || undefined
            });

            const responseData = response.data || response;
            const fetchedBuses = responseData.buses || [];

            setBuses(prev => {
                const newBuses = isInitial ? fetchedBuses : [...prev, ...fetchedBuses];
                return newBuses;
            });

            setCursor(responseData.nextCursor);
            setHasMore(responseData.hasMore);
        } catch (err: any) {
            setError(err.message || "Failed to load buses");
        } finally {
            setLoading(false);
            setInitialLoadComplete(true);
        }
    }, [loading, hasMore, cursor, searchParams, filters]);

    // Sync buses to context whenever they change
    useEffect(() => {
        setBusList(buses);
    }, [buses, setBusList]);

    // Initial load and filter changes
    useEffect(() => {
        setBuses([]);
        setCursor(null);
        setHasMore(true);
        setInitialLoadComplete(false);
        loadMoreBuses(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, filters]); // Re-fetch when filters change

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const getStartingFare = (bus: any) => {
        if (!bus || !Array.isArray(bus.seats) || bus.seats.length === 0) return 0;
        return Math.min(...bus.seats.map((s: any) => Number(s.price) || 0));
    };

    // No client-side filtering needed - all done server-side
    const filteredBuses = buses;

    if (!initialLoadComplete && loading && buses.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <LoadingSpinner size="lg" text="Finding the best buses for you..." />
                </main>
                <Footer />
            </div>
        );
    }

    if (error && buses.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
                <Navbar />
                <main className="flex-grow flex items-center justify-center p-4">
                    <Card className="max-w-md w-full text-center p-8 border-red-200 dark:border-red-900/50">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800/40">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                        <Button onClick={() => window.location.reload()}>Try Again</Button>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden mb-4">
                    <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setShowMobileFilters(true)}
                    >
                        <span className="flex items-center gap-2">
                            <Filter size={18} /> Filters
                        </span>
                        <span className="bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            {filteredBuses.length} results
                        </span>
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar (Desktop) */}
                    <aside className={`
            fixed inset-0 z-40 bg-white dark:bg-slate-900 lg:bg-transparent lg:dark:bg-transparent lg:static lg:z-auto lg:w-72 lg:block
            transform transition-transform duration-300 ease-in-out
            ${showMobileFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
                        <div className="h-full lg:h-auto overflow-y-auto lg:overflow-visible p-6 lg:p-0">
                            <div className="lg:hidden flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h3>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <X size={24} />
                                </button>
                            </div>

                            <Card className="sticky top-24">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Filter size={20} className="text-purple-600 dark:text-purple-400" /> Filters
                                    </h3>
                                    <button
                                        className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
                                        onClick={() => setFilters({ maxPrice: "", busType: "" })}
                                    >
                                        Reset
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div>
                                        <Input
                                            label="Max Price"
                                            type="number"
                                            name="maxPrice"
                                            min={0}
                                            placeholder="e.g. 2000"
                                            value={filters.maxPrice}
                                            onChange={handleFilterChange}
                                            icon={() => <span className="text-slate-400 dark:text-slate-500 text-sm font-bold">Rs.</span>}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Bus Type</label>
                                        <select
                                            name="busType"
                                            value={filters.busType}
                                            onChange={handleFilterChange}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 py-2.5 px-4 text-sm transition-all"
                                        >
                                            <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Types</option>
                                            <option value="Deluxe" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Deluxe</option>
                                            <option value="Luxury" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Luxury</option>
                                            <option value="Standard" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Standard</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/40 rounded-b-2xl border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center font-medium">
                                        Showing {filteredBuses.length} buses
                                    </p>
                                    <Button
                                        className="w-full mt-4 lg:hidden"
                                        onClick={() => setShowMobileFilters(false)}
                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </aside>

                    {/* Bus List */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Available Buses</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {searchParams?.source} to {searchParams?.destination} • {searchParams?.date}
                                </p>
                            </div>
                        </div>

                        {filteredBuses.length === 0 && !loading ? (
                            <Card className="p-12 text-center border-dashed border-2 border-slate-300 dark:border-slate-700 shadow-none bg-transparent">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
                                    <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No buses found</h3>
                                <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search for a different date.</p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {filteredBuses.map((bus, index) => {
                                    if (index === filteredBuses.length - 1) {
                                        return (
                                            <div ref={lastBusElementRef} key={bus.id || bus._id || index}>
                                                <BusDetail bus={bus} />
                                            </div>
                                        );
                                    } else {
                                        return <BusDetail bus={bus} key={bus.id || bus._id || index} />;
                                    }
                                })}
                            </div>
                        )}

                        {/* Loading more indicator */}
                        {loading && buses.length > 0 && (
                            <div className="py-8 flex justify-center">
                                <LoadingSpinner size="md" />
                            </div>
                        )}

                        {!hasMore && buses.length > 0 && (
                            <div className="py-8 text-center">
                                <span className="inline-block px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full font-semibold border border-slate-200/80 dark:border-slate-700">
                                    End of list
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
export default BusList;
