import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Hotel, Plane, ArrowRightLeft, Search, MapPin, Shield, Clock, Users, Star, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeaturedEventsSection from '../components/events/FeaturedEventsSection';
import { SocialProofSection } from '../components/home/SocialProofSection';
import { OffersSection } from '../components/home/OffersSection';
import { PopularDestinations } from '../components/home/PopularDestinations';

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
            navigate('/buslist', {
                state: {
                    source: bookingData.from,
                    destination: bookingData.to,
                    date: bookingData.date
                }
            });
        } else if (activeTab === 'hotel') {
            navigate(`/hotels?city=${bookingData.city}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&guests=${bookingData.guests}&rooms=${bookingData.rooms}`);
        } else if (activeTab === 'flight') {
            navigate('/plane-list', {
                state: {
                    source: bookingData.from,
                    destination: bookingData.to,
                    date: bookingData.date
                }
            });
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setBookingData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Navbar />

            {/* Hero Section with Parallax Effect */}
            <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2671&auto=format&fit=crop"
                        alt="Nepal Landscape"
                        className="w-full h-full object-cover opacity-10 dark:opacity-20 scale-110 animate-pulse-slow"
                    />
                    {/* Light Mode: Softer gradient to prevent glare */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white/70 to-purple-50/30 dark:from-black dark:via-black/90 dark:to-purple-900/20 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
                </div>

                {/* Animated Orbs */}
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-float opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-float opacity-60" style={{ animationDelay: '2s' }}></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Left Content */}
                        <div className="lg:col-span-7 space-y-8 animate-slide-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 font-medium text-sm border border-purple-200 dark:border-purple-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                </span>
                                #1 Booking Platform in Nepal
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] font-display text-gray-900 dark:text-white">
                                Discover Nepal <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400">
                                    Travel Smarter
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                                Seamlessly book buses, hotels, flights & events. Experience the journey of a lifetime with TicketKatum.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <button
                                    onClick={() => navigate('/events')}
                                    className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                                >
                                    Explore Events
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => document.getElementById('popular-destinations')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-8 py-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm text-gray-900 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-300"
                                >
                                    View Destinations
                                </button>
                            </div>
                        </div>

                        {/* Right Booking Widget */}
                        <div className="lg:col-span-5 relative">
                            {/* Main Widget Card */}
                            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl dark:shadow-purple-900/10 rounded-3xl p-6 md:p-8 animate-fade-in border border-white/20 dark:border-white/10 relative z-20">
                                {/* Tabs */}
                                <div className="grid grid-cols-3 gap-2 mb-8 bg-gray-100 dark:bg-black/40 p-1.5 rounded-2xl">
                                    <button
                                        onClick={() => setActiveTab('bus')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'bus'
                                            ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <Bus size={18} />
                                        <span>Bus</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('hotel')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'hotel'
                                            ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <Hotel size={18} />
                                        <span>Hotel</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('flight')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'flight'
                                            ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <Plane size={18} />
                                        <span>Flight</span>
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSearch} className="space-y-5">
                                    {activeTab === 'hotel' ? (
                                        // Hotel Form Fields
                                        <>
                                            {/* City/Location */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                                                    Location
                                                </label>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                                                    <select
                                                        value={bookingData.city}
                                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none font-semibold appearance-none"
                                                    >
                                                        <option value="" className="text-gray-500">Where are you going?</option>
                                                        <option value="kathmandu">Kathmandu</option>
                                                        <option value="pokhara">Pokhara</option>
                                                        <option value="chitwan">Chitwan</option>
                                                        <option value="biratnagar">Biratnagar</option>
                                                        <option value="lumbini">Lumbini</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Stay Dates */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Check-in</label>
                                                    <input
                                                        type="date"
                                                        value={bookingData.checkIn}
                                                        onChange={(e) => handleInputChange('checkIn', e.target.value)}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Check-out</label>
                                                    <input
                                                        type="date"
                                                        value={bookingData.checkOut}
                                                        onChange={(e) => handleInputChange('checkOut', e.target.value)}
                                                        min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold text-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Guests & Rooms */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Guests</label>
                                                    <select
                                                        value={bookingData.guests}
                                                        onChange={(e) => handleInputChange('guests', e.target.value)}
                                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold"
                                                    >
                                                        {[1, 2, 3, 4, 5, 6].map(num => (
                                                            <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Rooms</label>
                                                    <select
                                                        value={bookingData.rooms}
                                                        onChange={(e) => handleInputChange('rooms', e.target.value)}
                                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold"
                                                    >
                                                        {[1, 2, 3, 4].map(num => (
                                                            <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* From Field */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">From</label>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                                                    <select
                                                        value={bookingData.from}
                                                        onChange={(e) => handleInputChange('from', e.target.value)}
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none font-semibold appearance-none"
                                                    >
                                                        <option value="">Select Origin</option>
                                                        <option value="kathmandu">Kathmandu</option>
                                                        <option value="pokhara">Pokhara</option>
                                                        <option value="chitwan">Chitwan</option>
                                                        <option value="biratnagar">Biratnagar</option>
                                                        <option value="lumbini">Lumbini</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Swap Button (Absolute Positioned) */}
                                            <div className="absolute left-1/2 -translate-x-1/2 mt-[-24px] z-10 hidden md:block">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const temp = bookingData.from;
                                                        setBookingData(prev => ({ ...prev, from: prev.to, to: temp }));
                                                    }}
                                                    className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-purple-500 hover:rotate-180 transition-all duration-300 hover:scale-110"
                                                >
                                                    <ArrowRightLeft size={18} />
                                                </button>
                                            </div>

                                            {/* To Field */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">To</label>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                                                    <select
                                                        value={bookingData.to}
                                                        onChange={(e) => handleInputChange('to', e.target.value)}
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none font-semibold appearance-none"
                                                    >
                                                        <option value="">Select Destination</option>
                                                        <option value="pokhara">Pokhara</option>
                                                        <option value="kathmandu">Kathmandu</option>
                                                        <option value="chitwan">Chitwan</option>
                                                        <option value="biratnagar">Biratnagar</option>
                                                        <option value="lumbini">Lumbini</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Date Field */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Date</label>
                                                <input
                                                    type="date"
                                                    value={bookingData.date}
                                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Search Button */}
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 text-white font-bold text-lg rounded-2xl hover:shadow-xl hover:shadow-brand-orange-500/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                                    >
                                        <Search size={22} strokeWidth={2.5} />
                                        <span>Search {activeTab === 'bus' ? 'Buses' : activeTab === 'hotel' ? 'Hotels' : 'Flights'}</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted By Strip */}
            <section className="border-y border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-wrap items-center justify-center md:justify-between gap-8 opacity-70">
                        <div className="flex items-center gap-3">
                            <Shield className="text-purple-500" size={24} />
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Secure Payments</p>
                                <p className="text-xs text-gray-500">Bank-level encryption</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="text-brand-orange-500" size={24} />
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Instant Booking</p>
                                <p className="text-xs text-gray-500">Confirmed in seconds</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Users className="text-blue-500" size={24} />
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">1M+ Users</p>
                                <p className="text-xs text-gray-500">Trusted everyday</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Star className="text-yellow-500" size={24} />
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">4.8/5 Rating</p>
                                <p className="text-xs text-gray-500">Based on 50k reviews</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Destinations */}
            <div id="popular-destinations">
                <PopularDestinations />
            </div>

            {/* Social Proof (Trending Routes) */}
            <SocialProofSection />

            {/* Offers Section */}
            <OffersSection />

            {/* Featured Events Section */}
            <section className="bg-white dark:bg-black py-20 transition-colors duration-300 border-t border-gray-100 dark:border-white/5">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-display mb-4">
                                Upcoming Events
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">
                                Don't miss out on the hottest concerts and festivals.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/events')}
                            className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10 transition-all font-semibold text-gray-900 dark:text-white"
                        >
                            View All Events
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
                <FeaturedEventsSection />
            </section>

            <Footer />
        </div >
    );
}

export default Homepage;

