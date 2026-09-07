import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bus,
    Hotel,
    Plane,
    ArrowRightLeft,
    Search,
    MapPin,
    Shield,
    Clock,
    Users,
    Star,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Compass,
    Radio,
    Ticket,
    Calendar,
    PhoneCall,
    MessageSquareQuote
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeaturedEventsSection from '../components/events/FeaturedEventsSection';
import { SocialProofSection } from '../components/home/SocialProofSection';
import { OffersSection } from '../components/home/OffersSection';
import { PopularDestinations } from '../components/home/PopularDestinations';

export function Homepage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'bus' | 'hotel' | 'flight'>('bus');
    const [tripType, setTripType] = useState<'oneway' | 'round'>('oneway');
    const [bookingData, setBookingData] = useState({
        from: '',
        to: '',
        date: new Date().toISOString().split('T')[0],
        returnDate: '',
        city: '',
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: '',
        guests: '1',
        rooms: '1',
    });

    const popularBusRoutes = [
        { label: 'KTM ⇄ Pokhara', from: 'kathmandu', to: 'pokhara' },
        { label: 'KTM ⇄ Chitwan', from: 'kathmandu', to: 'chitwan' },
        { label: 'Pokhara ⇄ Lumbini', from: 'pokhara', to: 'lumbini' },
        { label: 'KTM ⇄ Biratnagar', from: 'kathmandu', to: 'biratnagar' },
        { label: 'KTM ⇄ Janakpur', from: 'kathmandu', to: 'janakpur' },
    ];

    const quickDateOptions = [
        {
            label: 'Today',
            getDate: () => new Date().toISOString().split('T')[0]
        },
        {
            label: 'Tomorrow',
            getDate: () => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                return d.toISOString().split('T')[0];
            }
        },
        {
            label: '+2 Days',
            getDate: () => {
                const d = new Date();
                d.setDate(d.getDate() + 2);
                return d.toISOString().split('T')[0];
            }
        },
    ];

    const handleSelectRoute = (from: string, to: string) => {
        setBookingData(prev => ({ ...prev, from, to }));
    };

    const handleSelectDate = (dateStr: string) => {
        setBookingData(prev => ({ ...prev, date: dateStr }));
    };

    const handleSwapLocations = () => {
        setBookingData(prev => ({
            ...prev,
            from: prev.to,
            to: prev.from
        }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === 'bus' || activeTab === 'flight') {
            if (!bookingData.from || !bookingData.to || !bookingData.date) {
                alert('Please select origin, destination, and departure date');
                return;
            }
        } else if (activeTab === 'hotel') {
            if (!bookingData.city || !bookingData.checkIn) {
                alert('Please select city and check-in date');
                return;
            }
        }

        if (activeTab === 'bus') {
            navigate('/buslist', {
                state: {
                    source: bookingData.from,
                    destination: bookingData.to,
                    date: bookingData.date
                }
            });
        } else if (activeTab === 'hotel') {
            navigate(`/hotels?city=${bookingData.city}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut || ''}&guests=${bookingData.guests}&rooms=${bookingData.rooms}`);
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

    const features = [
        {
            icon: Radio,
            title: "Live GPS Fleet Radar",
            description: "Real-time highway tracking & live ETA updates along Prithvi & Tribhuvan corridors.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: Ticket,
            title: "Interactive Seat Lock",
            description: "Pick your exact window or sofa seat with real-time seat locks and 0 double-bookings.",
            color: "from-purple-500 to-indigo-600"
        },
        {
            icon: Shield,
            title: "Direct Local Checkout",
            description: "Instant verification via eSewa, Khalti, ConnectIPS and Visa with 100% refund security.",
            color: "from-emerald-500 to-teal-600"
        },
        {
            icon: Compass,
            title: "Paperless QR Boarding",
            description: "Instant digital pass sent to SMS and email. Scan directly at departure counters.",
            color: "from-orange-500 to-amber-600"
        }
    ];

    const testimonials = [
        {
            name: "Prabhat Shrestha",
            location: "Kathmandu to Pokhara",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop",
            rating: 5,
            comment: "Booked a deluxe sofa seat to Pokhara in under 2 minutes. The live tracking showed exact bus location near Mugling. Smooth and hassle-free!"
        },
        {
            name: "Elena Rostova",
            location: "Annapurna Trekker",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop",
            rating: 5,
            comment: "As an international traveler, paying directly with card and getting instant QR tickets on my phone made my Nepal vacation extraordinarily easy."
        },
        {
            name: "Anil Thapa",
            location: "Kathmandu to Chitwan",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop",
            rating: 5,
            comment: "Customer support helped me reschedule when my flight got delayed. Instant response on WhatsApp and verified refund. Highly recommended platform!"
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
                {/* Dynamic Background Image with subtle atmospheric gradient */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2671&auto=format&fit=crop"
                        alt="Himalayan Valley"
                        className="w-full h-full object-cover opacity-15 dark:opacity-20 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white/80 to-blue-50/40 dark:from-black dark:via-black/95 dark:to-purple-950/20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                </div>

                {/* Ambient Glows */}
                <div className="absolute top-16 right-0 w-[550px] h-[550px] bg-purple-500/15 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-brand-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left Hero Banner */}
                        <div className="lg:col-span-6 space-y-7">
                            {/* Live Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/90 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs tracking-wide border border-purple-200/80 dark:border-purple-500/20 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span>🇳🇵 Nepal's #1 Smart Travel Platform</span>
                                <span className="text-purple-400 dark:text-purple-500">•</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Live Booking</span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] font-display text-gray-900 dark:text-white tracking-tight">
                                Experience Nepal. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-orange-500 dark:from-purple-400 dark:via-indigo-400 dark:to-brand-orange-400">
                                    Journey In Comfort.
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                                Seamlessly reserve express deluxe buses, boutique stays, mountain flights, and premier events across Nepal with real-time seat lock.
                            </p>

                            {/* Quick Action Badges */}
                            <div className="flex flex-wrap gap-3 pt-1">
                                <button
                                    onClick={() => navigate('/buslist')}
                                    className="px-6 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:shadow-xl hover:shadow-purple-500/15 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Bus size={18} />
                                    <span>Explore Buses</span>
                                    <ArrowRight size={16} />
                                </button>
                                <button
                                    onClick={() => navigate('/hotels')}
                                    className="px-6 py-3.5 bg-white/80 dark:bg-white/5 backdrop-blur-md text-gray-800 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Hotel size={18} />
                                    <span>Hotels & Stays</span>
                                </button>
                                <button
                                    onClick={() => navigate('/events')}
                                    className="px-6 py-3.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-bold rounded-2xl border border-purple-200/60 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Sparkles size={18} />
                                    <span>Events</span>
                                </button>
                            </div>

                            {/* Trust Indicator Stack */}
                            <div className="pt-4 flex items-center gap-4 border-t border-gray-200/60 dark:border-white/10">
                                <div className="flex -space-x-2.5">
                                    <img className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop" alt="User" />
                                    <img className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop" alt="User" />
                                    <img className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&auto=format&fit=crop" alt="User" />
                                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-brand-orange-500 text-white font-black text-xs flex items-center justify-center">
                                        4.9★
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className="fill-current" />
                                        ))}
                                    </div>
                                    <p className="mt-0.5 font-medium">Over <strong className="text-gray-900 dark:text-white">45,000+</strong> verified bookings completed</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Glassmorphic Booking Widget */}
                        <div className="lg:col-span-6 relative">
                            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 relative z-20">
                                
                                {/* Top Tabs */}
                                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('bus')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                                            activeTab === 'bus'
                                                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <Bus size={18} />
                                        <span>Bus</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('hotel')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                                            activeTab === 'hotel'
                                                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <Hotel size={18} />
                                        <span>Hotel</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('flight')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                                            activeTab === 'flight'
                                                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <Plane size={18} />
                                        <span>Flight</span>
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSearch} className="space-y-4">
                                    {activeTab === 'bus' && (
                                        <>
                                            {/* Quick Popular Route Chips */}
                                            <div>
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                                                    Quick Select Route
                                                </span>
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {popularBusRoutes.map((rt, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleSelectRoute(rt.from, rt.to)}
                                                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                                                bookingData.from === rt.from && bookingData.to === rt.to
                                                                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                                                            }`}
                                                        >
                                                            {rt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Origin & Destination with Swap */}
                                            <div className="space-y-3 relative">
                                                <div className="relative">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block mb-1">
                                                        Leaving From
                                                    </label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={18} />
                                                        <select
                                                            value={bookingData.from}
                                                            onChange={(e) => handleInputChange('from', e.target.value)}
                                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold text-sm appearance-none"
                                                        >
                                                            <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Origin City</option>
                                                            <option value="kathmandu" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Kathmandu (Kalanki / Gongabu)</option>
                                                            <option value="pokhara" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pokhara (Tourist Bus Park)</option>
                                                            <option value="chitwan" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Chitwan (Sauraha)</option>
                                                            <option value="biratnagar" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Biratnagar</option>
                                                            <option value="lumbini" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lumbini (Bhairahawa)</option>
                                                            <option value="janakpur" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Janakpur</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Swap Button */}
                                                <div className="flex justify-center -my-2 relative z-10">
                                                    <button
                                                        type="button"
                                                        onClick={handleSwapLocations}
                                                        className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 hover:rotate-180 transition-all duration-300 hover:scale-110"
                                                        title="Swap departure and destination"
                                                    >
                                                        <ArrowRightLeft size={16} />
                                                    </button>
                                                </div>

                                                <div className="relative">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block mb-1">
                                                        Going To
                                                    </label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange-500" size={18} />
                                                        <select
                                                            value={bookingData.to}
                                                            onChange={(e) => handleInputChange('to', e.target.value)}
                                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold text-sm appearance-none"
                                                        >
                                                            <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Destination City</option>
                                                            <option value="pokhara" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pokhara (Lakeside)</option>
                                                            <option value="kathmandu" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Kathmandu (Capital)</option>
                                                            <option value="chitwan" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Chitwan (National Park)</option>
                                                            <option value="lumbini" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lumbini (Peace Garden)</option>
                                                            <option value="biratnagar" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Biratnagar</option>
                                                            <option value="janakpur" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Janakpur</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Date Selection with Quick Chips */}
                                            <div className="space-y-2 pt-1">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                                                        Departure Date
                                                    </label>
                                                    <div className="flex gap-1.5">
                                                        {quickDateOptions.map((opt, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => handleSelectDate(opt.getDate())}
                                                                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-colors ${
                                                                    bookingData.date === opt.getDate()
                                                                        ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                                                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                                                }`}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type="date"
                                                        value={bookingData.date}
                                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'hotel' && (
                                        <>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                                                    City or Region
                                                </label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={18} />
                                                    <select
                                                        value={bookingData.city}
                                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold text-sm appearance-none"
                                                    >
                                                        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Where are you staying?</option>
                                                        <option value="pokhara" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pokhara (Lakeside & Dam)</option>
                                                        <option value="kathmandu" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Kathmandu (Thamel & Durbar)</option>
                                                        <option value="chitwan" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Chitwan (Sauraha)</option>
                                                        <option value="nagarkot" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Nagarkot (Himalayan Ridge)</option>
                                                        <option value="lumbini" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lumbini (Monastery Zone)</option>
                                                        <option value="bandipur" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Bandipur (Heritage Hilltop)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block mb-1">Check-in</label>
                                                    <input
                                                        type="date"
                                                        value={bookingData.checkIn}
                                                        onChange={(e) => handleInputChange('checkIn', e.target.value)}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-purple-500 outline-none font-semibold text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block mb-1">Check-out</label>
                                                    <input
                                                        type="date"
                                                        value={bookingData.checkOut}
                                                        onChange={(e) => handleInputChange('checkOut', e.target.value)}
                                                        min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                                                        className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-purple-500 outline-none font-semibold text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block mb-1">Guests</label>
                                                    <select
                                                        value={bookingData.guests}
                                                        onChange={(e) => handleInputChange('guests', e.target.value)}
                                                        className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-semibold text-xs"
                                                    >
                                                        {[1, 2, 3, 4, 5, 6].map(num => (
                                                            <option key={num} value={num} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{num} Guest{num > 1 ? 's' : ''}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block mb-1">Rooms</label>
                                                    <select
                                                        value={bookingData.rooms}
                                                        onChange={(e) => handleInputChange('rooms', e.target.value)}
                                                        className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-semibold text-xs"
                                                    >
                                                        {[1, 2, 3, 4].map(num => (
                                                            <option key={num} value={num} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{num} Room{num > 1 ? 's' : ''}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'flight' && (
                                        <>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block mb-1">From Airport</label>
                                                    <select
                                                        value={bookingData.from}
                                                        onChange={(e) => handleInputChange('from', e.target.value)}
                                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-semibold text-sm"
                                                    >
                                                        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Departure Airport</option>
                                                        <option value="kathmandu" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Kathmandu (TIA Domestic)</option>
                                                        <option value="pokhara" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pokhara International (PIA)</option>
                                                        <option value="biratnagar" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Biratnagar Airport</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block mb-1">To Airport</label>
                                                    <select
                                                        value={bookingData.to}
                                                        onChange={(e) => handleInputChange('to', e.target.value)}
                                                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-semibold text-sm"
                                                    >
                                                        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Destination Airport</option>
                                                        <option value="pokhara" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pokhara International (PIA)</option>
                                                        <option value="kathmandu" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Kathmandu (TIA Domestic)</option>
                                                        <option value="lukla" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lukla (Everest Base Gate)</option>
                                                        <option value="bharatpur" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Bharatpur (Chitwan)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 block mb-1">Flight Date</label>
                                                    <input
                                                        type="date"
                                                        value={bookingData.date}
                                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-semibold text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Submit Search Button */}
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-gradient-to-r from-brand-orange-500 via-purple-600 to-indigo-600 hover:from-brand-orange-600 hover:to-indigo-700 text-white font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 mt-5"
                                    >
                                        <Search size={20} strokeWidth={2.5} />
                                        <span>
                                            Search {activeTab === 'bus' ? 'Available Buses' : activeTab === 'hotel' ? 'Hotels & Resorts' : 'Domestic Flights'}
                                        </span>
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Quick Stats Strip */}
            <section className="border-y border-gray-200/80 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-md">
                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                                <Bus size={22} />
                            </div>
                            <div>
                                <p className="text-xl font-extrabold text-gray-900 dark:text-white">150+ Daily</p>
                                <p className="text-xs text-gray-500 font-medium">Intercity Express Routes</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-brand-orange-100 dark:bg-brand-orange-950/40 text-brand-orange-600 dark:text-brand-orange-400 flex items-center justify-center font-bold">
                                <Hotel size={22} />
                            </div>
                            <div>
                                <p className="text-xl font-extrabold text-gray-900 dark:text-white">350+ Stays</p>
                                <p className="text-xs text-gray-500 font-medium">Verified Hotels & Resorts</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                <Shield size={22} />
                            </div>
                            <div>
                                <p className="text-xl font-extrabold text-gray-900 dark:text-white">99.8% Safety</p>
                                <p className="text-xs text-gray-500 font-medium">Inspected Tourist Fleets</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                <Users size={22} />
                            </div>
                            <div>
                                <p className="text-xl font-extrabold text-gray-900 dark:text-white">45,000+</p>
                                <p className="text-xs text-gray-500 font-medium">Travelers Every Season</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose TicketKatum (4-Pillars Grid) */}
            <section className="py-20 bg-slate-50/70 dark:bg-slate-950 transition-colors duration-300">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
                            <Sparkles size={14} />
                            Platform Advantage
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
                            Built Specifically For Nepal Travel
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-base mt-2">
                            Engineered to make bus, flight, and hotel booking across the Himalayan terrain transparent, comfortable, and reliable.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 shadow-sm dark:shadow-xl dark:shadow-black/20 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 shadow-md`}>
                                        <feature.icon size={26} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-display">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>

                                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                                    <CheckCircle2 size={15} />
                                    <span>Guaranteed Service</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Destinations */}
            <div id="popular-destinations">
                <PopularDestinations />
            </div>

            {/* Trending Routes & Operators */}
            <SocialProofSection />

            {/* Exclusive Offers & Discounts */}
            <OffersSection />

            {/* Featured Events Section */}
            <section className="bg-white dark:bg-slate-950 py-20 transition-colors duration-300 border-t border-slate-200/80 dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <Sparkles size={14} />
                                Live Culture & Entertainment
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white font-display">
                                Upcoming Concerts & Events
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base mt-1">
                                Secure verified tickets to Nepal's biggest festivals, live musical tours, and summits.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/events')}
                            className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold text-slate-900 dark:text-white"
                        >
                            <span>View All Events</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
                <FeaturedEventsSection />
            </section>

            {/* Real Traveler Testimonials */}
            <section className="py-20 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                            <MessageSquareQuote size={14} />
                            Traveler Stories
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white font-display">
                            Loved by Commuters & Explorers
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                            Real reviews from travelers who explored Nepal with TicketKatum.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, idx) => (
                            <div
                                key={idx}
                                className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-xl dark:shadow-black/20 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-1 text-amber-500 mb-4">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <Star key={i} size={16} className="fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic mb-6">
                                        "{t.comment}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        className="w-11 h-11 rounded-full object-cover border border-purple-200 dark:border-purple-800"
                                    />
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</h4>
                                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{t.location}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Assistance Banner */}
            <section className="py-14 bg-gradient-to-r from-purple-700 via-indigo-700 to-brand-orange-600 text-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div>
                        <span className="text-xs uppercase tracking-widest font-extrabold text-brand-orange-200 mb-1 block">
                            Himalayan Travel Concierge
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black font-display">
                            Need Assistance Planning Your Trip in Nepal?
                        </h2>
                        <p className="text-purple-100 text-sm mt-1 max-w-xl">
                            Our 24/7 localized support team assists with live road conditions, bus schedules, flight transfers, and customized group packages.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/buslist')}
                            className="px-6 py-3.5 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2"
                        >
                            <Compass size={16} />
                            <span>Browse All Routes</span>
                        </button>
                        <a
                            href="tel:+97714445555"
                            className="px-6 py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2"
                        >
                            <PhoneCall size={16} />
                            <span>Call Support (24/7)</span>
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Homepage;
