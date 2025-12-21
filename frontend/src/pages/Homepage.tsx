import React, { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Hotel, Plane, ArrowRightLeft, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeaturedEventsSection from '../components/events/FeaturedEventsSection';

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
        <div className="min-h-screen bg-black">
            <Navbar />

            {/* Hero Section with Booking Widget */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-white space-y-8">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                                Book Your Next{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 animate-pulse-slow">
                                    Adventure
                                </span>{' '}
                                Today
                            </h1>

                            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl border-l-4 border-orange-500 pl-6">
                                Bus tickets, hotel rooms, event passes, and flights — all at your
                                fingertips with unbeatable prices and seamless booking.
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
                                    className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300"
                                >
                                    Browse Hotels
                                </button>
                            </div>
                        </div>

                        {/* Right Booking Widget */}
                        <div className="relative">
                            {/* Main Widget Card */}
                            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50">
                                {/* Tabs */}
                                <div className="flex gap-2 mb-8 bg-gray-900/50 p-2 rounded-2xl">
                                    <button
                                        onClick={() => setActiveTab('bus')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'bus'
                                            ? 'bg-orange-500 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        <Bus size={20} />
                                        <span>Bus</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('hotel')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'hotel'
                                            ? 'bg-orange-500 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        <Hotel size={20} />
                                        <span>Hotel</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('flight')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'flight'
                                            ? 'bg-orange-500 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
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
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                    City / Location
                                                </label>
                                                <select
                                                    value={bookingData.city}
                                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                                    className="w-full px-4 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none font-medium cursor-pointer"
                                                    style={{
                                                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23F97316\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'right 1rem center',
                                                        backgroundSize: '1.5rem',
                                                        appearance: 'none'
                                                    }}
                                                >
                                                    <option value="" className="text-gray-500">Select city</option>
                                                    <option value="kathmandu" className="text-gray-900">Kathmandu</option>
                                                    <option value="pokhara" className="text-gray-900">Pokhara</option>
                                                    <option value="chitwan" className="text-gray-900">Chitwan</option>
                                                    <option value="biratnagar" className="text-gray-900">Biratnagar</option>
                                                    <option value="lumbini" className="text-gray-900">Lumbini</option>
                                                </select>
                                            </div>

                                            {/* Check-in Date */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                    Check-in Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={bookingData.checkIn}
                                                    onChange={(e) => handleInputChange('checkIn', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-4 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none font-medium cursor-pointer"
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
                                                    className="w-full px-4 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none font-medium cursor-pointer"
                                                />
                                            </div>

                                            {/* Guests & Rooms */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                        Guests
                                                    </label>
                                                    <select
                                                        value={bookingData.guests}
                                                        onChange={(e) => handleInputChange('guests', e.target.value)}
                                                        className="w-full px-4 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none font-medium cursor-pointer"
                                                        style={{
                                                            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23F97316\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'right 1rem center',
                                                            backgroundSize: '1.5rem',
                                                            appearance: 'none'
                                                        }}
                                                    >
                                                        {[1, 2, 3, 4, 5, 6].map(num => (
                                                            <option key={num} value={num} className="text-gray-900">{num} Guest{num > 1 ? 's' : ''}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                        Rooms
                                                    </label>
                                                    <select
                                                        value={bookingData.rooms}
                                                        onChange={(e) => handleInputChange('rooms', e.target.value)}
                                                        className="w-full px-4 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none font-medium cursor-pointer"
                                                        style={{
                                                            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23F97316\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'right 1rem center',
                                                            backgroundSize: '1.5rem',
                                                            appearance: 'none'
                                                        }}
                                                    >
                                                        {[1, 2, 3, 4].map(num => (
                                                            <option key={num} value={num} className="text-gray-900">{num} Room{num > 1 ? 's' : ''}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        // Bus/Flight Form Fields
                                        <>
                                            {/* From Field */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                    From
                                                </label>
                                                <select
                                                    value={bookingData.from}
                                                    onChange={(e) => handleInputChange('from', e.target.value)}
                                                    className="w-full px-4 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none font-medium cursor-pointer"
                                                    style={{
                                                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23F97316\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'right 1rem center',
                                                        backgroundSize: '1.5rem',
                                                        appearance: 'none'
                                                    }}
                                                >
                                                    <option value="" className="text-gray-500">Select source city</option>
                                                    <option value="kathmandu" className="text-gray-900">Kathmandu</option>
                                                    <option value="pokhara" className="text-gray-900">Pokhara</option>
                                                    <option value="chitwan" className="text-gray-900">Chitwan</option>
                                                    <option value="biratnagar" className="text-gray-900">Biratnagar</option>
                                                    <option value="janakpur" className="text-gray-900">Janakpur</option>
                                                </select>
                                            </div>

                                            {/* Swap Button */}
                                            <div className="flex justify-center -my-3 relative z-10">
                                                <button
                                                    type="button"
                                                    onClick={handleSwap}
                                                    className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transform hover:rotate-180 transition-all duration-300 shadow-lg"
                                                >
                                                    <ArrowRightLeft size={20} />
                                                </button>
                                            </div>

                                            {/* To Field */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                    To
                                                </label>
                                                <select
                                                    value={bookingData.to}
                                                    onChange={(e) => handleInputChange('to', e.target.value)}
                                                    className="w-full px-4 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none font-medium cursor-pointer"
                                                    style={{
                                                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23F97316\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'right 1rem center',
                                                        backgroundSize: '1.5rem',
                                                        appearance: 'none'
                                                    }}
                                                >
                                                    <option value="" className="text-gray-500">Select destination city</option>
                                                    <option value="kathmandu" className="text-gray-900">Kathmandu</option>
                                                    <option value="pokhara" className="text-gray-900">Pokhara</option>
                                                    <option value="chitwan" className="text-gray-900">Chitwan</option>
                                                    <option value="biratnagar" className="text-gray-900">Biratnagar</option>
                                                    <option value="janakpur" className="text-gray-900">Janakpur</option>
                                                </select>
                                            </div>

                                            {/* Travel Date */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                    Travel Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={bookingData.date}
                                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-4 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none font-medium cursor-pointer"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Search Button */}
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <Search size={20} />
                                        <span>Search {activeTab === 'bus' ? 'Buses' : activeTab === 'hotel' ? 'Hotels' : 'Flights'}</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Events Section */}
            <section className="bg-gradient-to-b from-black to-gray-900 py-20">
                <FeaturedEventsSection />
            </section>

            {/* Why Choose Us Section */}
            <section className="bg-gray-900 py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Why <span className="text-orange-500">Choose Us</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
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
            </section>

            <Footer />
        </div>
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
        <div className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-orange-500/50 hover:bg-gray-800 transition-all duration-300 group">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                {icons[icon]}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
    );
};

export default Homepage;
