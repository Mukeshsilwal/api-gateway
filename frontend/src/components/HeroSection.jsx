import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Hotel, Plane, Search, Loader, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import hotelsApi from '../api/hotelsApi';
import analytics from '../services/analytics';
import Button from './ui/Button';
import Card from './ui/Card';
import BusSearchComponent from './BusSearchComponent';

const HeroSection = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bus');
    const [isLoading, setIsLoading] = useState(false);
    const [cities, setCities] = useState([]);

    // Hotel search state
    const [hotelSearch, setHotelSearch] = useState({
        city: '',
        checkIn: '',
        checkOut: '',
        guests: 1
    });

    // Flight search state
    const [flightSearch, setFlightSearch] = useState({
        from: '',
        to: '',
        date: '',
        passengers: 1,
        flightClass: 'Economy'
    });

    const today = new Date().toISOString().split('T')[0];

    // Fetch cities for hotel search
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const citiesData = await hotelsApi.getCities();
                setCities(citiesData || []);
            } catch (error) {
                console.error('[HeroSection] Failed to fetch cities:', error);
                setCities([]);
            }
        };
        fetchCities();
    }, []);

    const airports = [
        'Kathmandu (TIA)', 'Pokhara', 'Biratnagar', 'Bhairahawa',
        'Nepalgunj', 'Janakpur', 'Simara', 'Tumlingtar'
    ];

    const tabs = [
        { id: 'bus', label: 'Bus', icon: Bus },
        { id: 'hotel', label: 'Hotel', icon: Hotel },
        { id: 'plane', label: 'Flight', icon: Plane },
    ];

    const handleSwap = () => {
        if (activeTab === 'bus') {
            setBusSearch(prev => ({
                ...prev,
                source: prev.destination,
                destination: prev.source
            }));
        } else if (activeTab === 'plane') {
            setFlightSearch(prev => ({
                ...prev,
                from: prev.to,
                to: prev.from
            }));
        }
    };

    // Handle Bus Search
    const handleBusSearch = async (searchParams) => {
        // Track Bus Search
        analytics.trackEvent('search', {
            type: 'bus',
            ...searchParams
        });

        // Store in localStorage for persistence
        localStorage.setItem('searchDetails', JSON.stringify(searchParams));

        // Navigate to bus list
        navigate('/buslist', { state: searchParams });
    };

    // Handle Hotel Search
    const handleHotelSearch = async (e) => {
        e.preventDefault();
        if (!hotelSearch.city || !hotelSearch.checkIn || !hotelSearch.checkOut) {
            toast.error('Please fill all hotel search fields');
            return;
        }
        if (hotelSearch.checkIn >= hotelSearch.checkOut) {
            toast.error('Check-out date must be after check-in date');
            return;
        }

        setIsLoading(true);
        // Track Hotel Search
        analytics.trackEvent('search', {
            type: 'hotel',
            city: hotelSearch.city,
            check_in: hotelSearch.checkIn,
            check_out: hotelSearch.checkOut,
            guests: hotelSearch.guests
        });

        try {
            navigate('/hotels', {
                state: {
                    city: hotelSearch.city,
                    checkInDate: hotelSearch.checkIn,
                    checkOutDate: hotelSearch.checkOut,
                    guests: hotelSearch.guests
                }
            });
        } catch (error) {
            console.error('Hotel search error:', error);
            toast.error('Failed to search hotels. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Flight Search
    const handleFlightSearch = async (e) => {
        e.preventDefault();
        if (!flightSearch.from || !flightSearch.to || !flightSearch.date) {
            toast.error('Please fill all flight search fields');
            return;
        }
        if (flightSearch.from === flightSearch.to) {
            toast.error('Departure and arrival airports cannot be the same');
            return;
        }

        setIsLoading(true);
        // Track Flight Search
        analytics.trackEvent('search', {
            type: 'flight',
            from: flightSearch.from,
            to: flightSearch.to,
            date: flightSearch.date,
            passengers: flightSearch.passengers,
            class: flightSearch.flightClass
        });

        try {
            localStorage.setItem('planeSearchDetails', JSON.stringify({
                source: flightSearch.from,
                destination: flightSearch.to,
                date: flightSearch.date,
                passengers: flightSearch.passengers,
                flightClass: flightSearch.flightClass
            }));

            navigate('/plane-list', {
                state: {
                    source: flightSearch.from,
                    destination: flightSearch.to,
                    date: flightSearch.date,
                    passengers: flightSearch.passengers,
                    flightClass: flightSearch.flightClass
                }
            });
        } catch (error) {
            console.error('Flight search error:', error);
            toast.error('Failed to search flights. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getSearchHandler = () => {
        switch (activeTab) {
            case 'hotel': return handleHotelSearch;
            case 'plane': return handleFlightSearch;
            default: return (e) => e.preventDefault();
        }
    };

    return (
        <div className="relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-purple-900 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-12 py-20">
                {/* Left Content */}
                <div className="flex-1 text-center lg:text-left text-white space-y-6">
                    <h1 className="text-4xl lg:text-6xl font-display font-bold leading-tight animate-slide-up">
                        Explore Nepal <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                            With Comfort
                        </span>
                    </h1>
                    <p className="text-lg text-blue-100 max-w-xl mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        Book bus tickets, flights, and hotels—seamlessly. Experience the beauty of Nepal with our premium travel partners.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="rounded-full"
                            onClick={() => document.getElementById('search-widget').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Start Booking
                        </Button>
                    </div>
                </div>

                {/* Right Search Widget */}
                <div id="search-widget" className="w-full max-w-md animate-scale-in" style={{ animationDelay: '0.3s' }}>
                    <Card className="border-0 shadow-premium-lg bg-white/95 backdrop-blur-sm">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-100">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all
                                        ${activeTab === tab.id
                                            ? 'text-primary border-b-2 border-primary bg-primary-50/50'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                                    `}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Form */}
                        {/* Search Forms */}
                        <div className="p-6">
                            {activeTab === 'bus' && (
                                <BusSearchComponent
                                    onSearch={handleBusSearch}
                                    variant="compact"
                                />
                            )}

                            {activeTab === 'hotel' && (
                                <form onSubmit={handleHotelSearch} className="space-y-4">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <select
                                            value={hotelSearch.city}
                                            onChange={(e) => setHotelSearch({ ...hotelSearch, city: e.target.value })}
                                            className="input-field w-full focus-glow"
                                            required
                                        >
                                            <option value="">Select city</option>
                                            {cities.map((city) => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                                            <input
                                                type="date"
                                                value={hotelSearch.checkIn}
                                                onChange={(e) => setHotelSearch({ ...hotelSearch, checkIn: e.target.value })}
                                                min={today}
                                                className="input-field w-full focus-glow"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                                            <input
                                                type="date"
                                                value={hotelSearch.checkOut}
                                                onChange={(e) => setHotelSearch({ ...hotelSearch, checkOut: e.target.value })}
                                                min={hotelSearch.checkIn || today}
                                                className="input-field w-full focus-glow"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                                        <select
                                            value={hotelSearch.guests}
                                            onChange={(e) => setHotelSearch({ ...hotelSearch, guests: parseInt(e.target.value) })}
                                            className="input-field w-full focus-glow"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full group"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader className="mr-2 animate-spin" size={20} />
                                                    Searching...
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                                                    Search Hotels
                                                </>
                                            )}
                                        </Button>

                                        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                                            <ShieldCheck size={14} className="text-green-600" />
                                            <span>Secure payment • Powered by eSewa</span>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'plane' && (
                                <form onSubmit={handleFlightSearch} className="space-y-4">

                                    <div className="relative">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">From Airport</label>
                                                <select
                                                    value={flightSearch.from}
                                                    onChange={(e) => setFlightSearch({ ...flightSearch, from: e.target.value })}
                                                    className="input-field w-full focus-glow"
                                                    required
                                                >
                                                    <option value="">Select departure airport</option>
                                                    {airports.map((airport) => (
                                                        <option key={airport} value={airport}>{airport}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">To Airport</label>
                                                <select
                                                    value={flightSearch.to}
                                                    onChange={(e) => setFlightSearch({ ...flightSearch, to: e.target.value })}
                                                    className="input-field w-full focus-glow"
                                                    required
                                                >
                                                    <option value="">Select arrival airport</option>
                                                    {airports.map((airport) => (
                                                        <option key={airport} value={airport}>{airport}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Swap Button */}
                                        <button
                                            type="button"
                                            onClick={handleSwap}
                                            className="absolute right-4 top-[38%] -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm z-10"
                                            title="Swap Locations"
                                        >
                                            <ArrowRightLeft size={16} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={flightSearch.date}
                                                onChange={(e) => setFlightSearch({ ...flightSearch, date: e.target.value })}
                                                min={today}
                                                className="input-field w-full focus-glow"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                                            <select
                                                value={flightSearch.passengers}
                                                onChange={(e) => setFlightSearch({ ...flightSearch, passengers: parseInt(e.target.value) })}
                                                className="input-field w-full focus-glow"
                                            >
                                                {[1, 2, 3, 4, 5, 6].map(num => (
                                                    <option key={num} value={num}>{num}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                        <select
                                            value={flightSearch.flightClass}
                                            onChange={(e) => setFlightSearch({ ...flightSearch, flightClass: e.target.value })}
                                            className="input-field w-full focus-glow"
                                        >
                                            <option>Economy</option>
                                            <option>Business</option>
                                            <option>First Class</option>
                                        </select>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full group"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader className="mr-2 animate-spin" size={20} />
                                                    Searching...
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                                                    Search Flights
                                                </>
                                            )}
                                        </Button>

                                        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                                            <ShieldCheck size={14} className="text-green-600" />
                                            <span>Secure payment • Powered by eSewa</span>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
