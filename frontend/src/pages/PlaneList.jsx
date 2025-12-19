import React, { useState, useEffect, useMemo } from "react";
import NavigationBar from "../components/Navbar";
import Footer from "../components/Footer";
import PlaneDetail from "../components/PlaneDetail";

const PlaneList = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        maxPrice: "",
        airline: "",
    });

    useEffect(() => {
        // Simulate fetching flights based on search criteria
        const searchDetails = JSON.parse(localStorage.getItem("planeSearchDetails"));

        // Mock Data Generation
        const generateMockFlights = () => {
            const mockFlights = [];
            const airlines = ["Nepal Airlines", "Buddha Air", "Yeti Airlines", "Shree Airlines"];

            for (let i = 0; i < 10; i++) {
                const departureTime = new Date();
                departureTime.setHours(8 + i, 0, 0, 0); // Staggered times
                const arrivalTime = new Date(departureTime);
                arrivalTime.setMinutes(arrivalTime.getMinutes() + 45 + Math.random() * 30); // 45-75 min flight

                mockFlights.push({
                    id: `flight-${i}`,
                    airline: airlines[Math.floor(Math.random() * airlines.length)],
                    flightNumber: `NA-${100 + i}`,
                    source: searchDetails?.source || "Kathmandu",
                    destination: searchDetails?.destination || "Pokhara",
                    departureDateTime: departureTime.toISOString(),
                    arrivalDateTime: arrivalTime.toISOString(),
                    basePrice: 3000 + Math.floor(Math.random() * 5000),
                    classType: "Economy",
                    seats: Array.from({ length: 60 }, (_, idx) => ({
                        seatNumber: `${Math.floor(idx / 6) + 1}${String.fromCharCode(65 + (idx % 6))}`,
                        reserved: Math.random() > 0.7,
                        price: 3000 + Math.floor(Math.random() * 1000)
                    })),
                });
            }
            return mockFlights;
        };

        setTimeout(() => {
            setFlights(generateMockFlights());
            setLoading(false);
        }, 1000);
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredFlights = useMemo(() => {
        return flights.filter(flight => {
            const priceOk = filters.maxPrice === "" || flight.basePrice <= Number(filters.maxPrice);
            const airlineOk = filters.airline === "" || flight.airline === filters.airline;
            return priceOk && airlineOk;
        });
    }, [flights, filters]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                                <button
                                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                                    onClick={() => setFilters({ maxPrice: "", airline: "" })}
                                >
                                    Reset
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rs.</span>
                                        <input
                                            type="number"
                                            name="maxPrice"
                                            min={0}
                                            placeholder="e.g. 5000"
                                            value={filters.maxPrice}
                                            onChange={handleFilterChange}
                                            className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Airline</label>
                                    <select
                                        name="airline"
                                        value={filters.airline}
                                        onChange={handleFilterChange}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        <option value="">All Airlines</option>
                                        <option value="Nepal Airlines">Nepal Airlines</option>
                                        <option value="Buddha Air">Buddha Air</option>
                                        <option value="Yeti Airlines">Yeti Airlines</option>
                                        <option value="Shree Airlines">Shree Airlines</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <p className="text-sm text-slate-500 text-center">
                                    Found {filteredFlights.length} flights
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Flight List */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900">Available Flights</h2>
                            <div className="text-sm text-slate-500">
                                Showing {filteredFlights.length} results
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-xl h-48 animate-pulse shadow-sm border border-slate-200"></div>
                                ))}
                            </div>
                        ) : filteredFlights.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                                <h3 className="text-lg font-medium text-slate-900 mb-2">No flights found</h3>
                                <p className="text-slate-500">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredFlights.map((flight) => (
                                    <PlaneDetail flight={flight} key={flight.id} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PlaneList;
