import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Hotel, Plane, ArrowRightLeft, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeaturedEventsSection from '../components/events/FeaturedEventsSection';
import { SocialProofSection } from '../components/home/SocialProofSection';
import { OffersSection } from '../components/home/OffersSection';

/**
 * Modern Homepage with Dark Theme and Integrated Booking Widget
 * Matches the design with hero section and tab-based booking interface
 */
export function Homepage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'bus' | 'hotel' | 'flight'>('bus'); // bus, hotel, flight
    const [bookingData, setBookingData] = useState({
        // Bus/Flight fields
        from: '',
        to: '',
        date: '',
        // Hotel fields
        city: '',
        checkIn: '',
        checkOut: '',
        guests: '1',
        rooms: '1',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === 'bus' || activeTab === 'flight') {
            if (!bookingData.from || !bookingData.to || !bookingData.date) {
                alert('Please fill in all fields');
                return;
            }
        } else if (activeTab === 'hotel') {
            if (!bookingData.city || !bookingData.checkIn || !bookingData.checkOut) {
                alert('Please fill in all fields');
                return;
            }
        }

        // Navigate based on active tab
        if (activeTab === 'bus') {
            navigate(`/bus-search?from=${bookingData.from}&to=${bookingData.to}&date=${bookingData.date}`);
        } else if (activeTab === 'hotel') {
            navigate(`/hotels?city=${bookingData.city}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&guests=${bookingData.guests}&rooms=${bookingData.rooms}`);
        } else if (activeTab === 'flight') {
            navigate(`/flights?from=${bookingData.from}&to=${bookingData.to}&date=${bookingData.date}`);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setBookingData(prev => ({ ...prev, [field]: value }));
    };

    const handleSwap = () => {
        setBookingData(prev => ({
            ...prev,
            from: prev.to,
            to: prev.from
        }));
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            {/* Hero Section with Booking Widget */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-background">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl opacity-50 dark:opacity-100"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50 dark:opacity-100"></div>
                </div>

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-gray-900 dark:text-white space-y-8 animate-slide-up">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight font-display">
                                Book smarter. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                                    Travel easier.
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl border-l-4 border-orange-500 pl-6">
                                Bus, hotel, flight & event bookings — all in one trusted platform.
                            </p>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => navigate('/events')}
                                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 transform hover:-translate-y-1 transition-all duration-300"
                                >
                                    Explore Events
                                </button>
                                <button
                                    onClick={() => navigate('/hotels')}
                                    className="px-8 py-4 bg-white dark:bg-white/10 backdrop-blur-sm text-gray-700 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300 shadow-sm dark:shadow-none"
                                >
                                    Browse Hotels
                                </button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex items-center gap-8 pt-8 border-t border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="text-orange-500">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-bold">4.8+</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Rating</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-orange-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-bold">Secure</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Payments</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-orange-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-bold">1M+</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Users</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Booking Widget */}
                        <div className="relative">
                            {/* Main Widget Card */}
                            <div className="glass shadow-xl dark:glass-dark rounded-3xl p-8 animate-fade-in relative z-20">
                                {/* Tabs */}
                                <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-black/40 p-2 rounded-2xl dark:backdrop-blur-sm">
                                    <button
                                        onClick={() => setActiveTab('bus')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'bus'
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:text-white dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <Bus size={20} />
                                        <span>Bus</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('hotel')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'hotel'
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:text-white dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <Hotel size={20} />
                                        <span>Hotel</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('flight')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'flight'
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:text-white dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <Plane size={20} />
                                        <span>Flight</span>
                                    </button>
                                </div>
                                {/* Form */}
                                <form onSubmit={handleSearch} className="space-y-6">
                                    {activeTab === 'hotel' ? (
                                        // Hotel Form Fields
                                        <>
                                            {/* City/Location */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    City / Location
                                                </label>
                                                <div className="relative group">
                                                    <select
                                                        value={bookingData.city}
                                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-white/10 rounded-xl focus:border-orange-500 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium cursor-pointer hover:border-orange-500/30 dark:hover:border-white/20"
                                                        style={{
                                                            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23fb923c\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'right 1rem center',
                                                            backgroundSize: '1.5rem',
                                                            appearance: 'none'
                                                        }}
                                                    >
                                                        <option value="" className="text-gray-500">Select city</option>
                                                        <option value="kathmandu" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Kathmandu</option>
                                                        <option value="pokhara" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Pokhara</option>
                                                        <option value="chitwan" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Chitwan</option>
                                                        <option value="biratnagar" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Biratnagar</option>
                                                        <option value="lumbini" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Lumbini</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Check-in Date */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Check-in Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={bookingData.checkIn}
                                                    onChange={(e) => handleInputChange('checkIn', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-white/10 rounded-xl focus:border-orange-500 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium cursor-pointer hover:border-orange-500/30 dark:hover:border-white/20 [color-scheme:light] dark:[color-scheme:dark]"
                                                />
                                            </div>

                                            {/* Check-out Date */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                    Check-out Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={bookingData.checkOut}
                                                    onChange={(e) => handleInputChange('checkOut', e.target.value)}
                                                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                                                    className="w-full px-4 py-4 bg-white/5 text-white border-2 border-white/10 rounded-xl focus:border-orange-500 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium cursor-pointer hover:border-white/20 [color-scheme:dark]"
                                                />
                                            </div>

                                            {/* Guests & Rooms */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        Guests
                                                    </label>
                                                    <div className="relative group">
                                                        <select
                                                            value={bookingData.guests}
                                                            onChange={(e) => handleInputChange('guests', e.target.value)}
                                                            className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-white/10 rounded-xl focus:border-orange-500 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium cursor-pointer hover:border-orange-500/30 dark:hover:border-white/20 appearance-none"
                                                            style={{
                                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23fb923c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'right 1rem center',
                                                                backgroundSize: '1.5rem'
                                                            }}
                                                        >
                                                            {[1, 2, 3, 4, 5, 6].map(num => (
                                                                <option key={num} value={num} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">{num} Guest{num > 1 ? 's' : ''}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        Rooms
                                                    </label>
                                                    <div className="relative group">
                                                        <select
                                                            value={bookingData.rooms}
                                                            onChange={(e) => handleInputChange('rooms', e.target.value)}
                                                            className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-white/10 rounded-xl focus:border-orange-500 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium cursor-pointer hover:border-orange-500/30 dark:hover:border-white/20 appearance-none"
                                                            style={{
                                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23fb923c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'right 1rem center',
                                                                backgroundSize: '1.5rem'
                                                            }}
                                                        >
                                                            {[1, 2, 3, 4].map(num => (
                                                                <option key={num} value={num} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">{num} Room{num > 1 ? 's' : ''}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* From Field */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    From
                                                </label>
                                                <div className="relative group">
                                                    <select
                                                        value={bookingData.from}
                                                        onChange={(e) => handleInputChange('from', e.target.value)}
                                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-white/10 rounded-xl focus:border-orange-500 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium cursor-pointer hover:border-orange-500/30 dark:hover:border-white/20 appearance-none"
                                                        style={{
                                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23fb923c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'right 1rem center',
                                                            backgroundSize: '1.5rem'
                                                        }}
                                                    >
                                                        <option value="" className="text-gray-500">Select City</option>
                                                        <option value="kathmandu" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Kathmandu</option>
                                                        <option value="pokhara" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Pokhara</option>
                                                        <option value="chitwan" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Chitwan</option>
                                                        <option value="biratnagar" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Biratnagar</option>
                                                        <option value="lumbini" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Lumbini</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Swap Button */}
                                            <div className="flex justify-center -my-3 relative z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const temp = bookingData.from;
                                                        setBookingData(prev => ({ ...prev, from: prev.to, to: temp }));
                                                    }}
                                                    className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-700 text-orange-500 hover:rotate-180 transition-all duration-300 hover:shadow-orange-500/20"
                                                >
                                                    <ArrowRightLeft size={20} />
                                                </button>
                                            </div>

                                            {/* To Field */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    To
                                                </label>
                                                <div className="relative group">
                                                    <select
                                                        value={bookingData.to}
                                                        onChange={(e) => handleInputChange('to', e.target.value)}
                                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-white/10 rounded-xl focus:border-orange-500 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium cursor-pointer hover:border-orange-500/30 dark:hover:border-white/20 appearance-none"
                                                        style={{
                                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23fb923c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'right 1rem center',
                                                            backgroundSize: '1.5rem'
                                                        }}
                                                    >
                                                        <option value="" className="text-gray-500">Select City</option>
                                                        <option value="pokhara" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Pokhara</option>
                                                        <option value="kathmandu" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Kathmandu</option>
                                                        <option value="chitwan" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Chitwan</option>
                                                        <option value="biratnagar" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Biratnagar</option>
                                                        <option value="lumbini" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Lumbini</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Travel Date */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Travel Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={bookingData.date}
                                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-white/10 rounded-xl focus:border-orange-500 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium cursor-pointer hover:border-orange-500/30 dark:hover:border-white/20 [color-scheme:light] dark:[color-scheme:dark]"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Search Button & Status */}
                                    <div className="space-y-4">
                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:shadow-orange-500/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 sticky bottom-4 z-50 md:static"
                                        >
                                            <Search size={22} strokeWidth={2.5} />
                                            <span>Search {activeTab === 'bus' ? 'Buses' : activeTab === 'hotel' ? 'Hotels' : 'Flights'}</span>
                                        </button>

                                        <div className="flex items-center justify-between text-xs font-medium px-2">
                                            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                                <span className="animate-pulse">🔥</span> Popular routes today
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Starting from <span className="text-gray-900 dark:text-white font-bold">NPR 800</span>
                                            </span>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <SocialProofSection />

            {/* Offers Section */}
            <OffersSection />

            {/* Featured Events Section */}
            <section className="bg-white dark:bg-black py-20 transition-colors duration-300">
                <FeaturedEventsSection />
            </section>

            {/* Why Choose Us Section */}
            <section className="bg-muted/30 py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Why <span className="text-primary">Choose Us</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Experience the best booking platform with unmatched features and service
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon="shield"
                            title="Secure Payments"
                            description="Your transactions are protected with bank-level security"
                        />
                        <FeatureCard
                            icon="clock"
                            title="Instant Booking"
                            description="Book tickets in seconds with our streamlined process"
                        />
                        <FeatureCard
                            icon="support"
                            title="24/7 Support"
                            description="Our team is always ready to assist you anytime"
                        />
                        <FeatureCard
                            icon="price"
                            title="Best Prices"
                            description="Competitive pricing with exclusive deals and offers"
                        />
                    </div>
                </div>
            </section >

            <Footer />
        </div >
    );
}

// Feature Card Component
interface FeatureCardProps {
    icon: 'shield' | 'clock' | 'support' | 'price';
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    const icons = {
        shield: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        clock: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        support: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        price: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div className="p-8 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
                {icons[icon]}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
};

export default Homepage;
