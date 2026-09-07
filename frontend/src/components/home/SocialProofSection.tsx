import { useNavigate } from 'react-router-dom';
import { TrendingUp, Star, ArrowRight, ShieldCheck, Wifi, Wind, Zap, CheckCircle2 } from 'lucide-react';

export const SocialProofSection = () => {
    const navigate = useNavigate();

    const trendingRoutes = [
        {
            from: 'Kathmandu',
            to: 'Pokhara',
            price: '850',
            rating: '4.9',
            time: '6h 30m',
            frequency: 'Every 20 mins',
            busType: 'Deluxe AC / Sofa Seater'
        },
        {
            from: 'Kathmandu',
            to: 'Chitwan (Sauraha)',
            price: '950',
            rating: '4.8',
            time: '5h 00m',
            frequency: 'Hourly',
            busType: 'Tourist Express AC'
        },
        {
            from: 'Pokhara',
            to: 'Lumbini',
            price: '1,200',
            rating: '4.9',
            time: '6h 00m',
            frequency: 'Morning Express',
            busType: 'VIP Sofa Coach'
        },
        {
            from: 'Kathmandu',
            to: 'Biratnagar',
            price: '1,450',
            rating: '4.7',
            time: '11h 00m',
            frequency: 'Night & Day',
            busType: 'Air Suspension Sleeper'
        },
    ];

    const topOperators = [
        {
            name: 'Baba Adventure Tours',
            rating: '4.9',
            reviews: '2,400+ reviews',
            specialty: 'Pokhara & Mustang Luxury Fleet',
            amenities: ['Free WiFi', 'AC', 'USB Charging', 'Water']
        },
        {
            name: 'Greenline Travels',
            rating: '4.8',
            reviews: '3,800+ reviews',
            specialty: 'Heritage Golden Triangle Routes',
            amenities: ['Buffet Lunch', 'AC', 'Reclining Seats']
        },
        {
            name: 'Swift Holidays',
            rating: '4.8',
            reviews: '1,650+ reviews',
            specialty: 'High-Speed Express Shuttles',
            amenities: ['GPS Tracking', 'AC', 'USB Charging']
        },
    ];

    const handleRouteClick = (from: string, to: string) => {
        navigate('/buslist', {
            state: {
                source: from.toLowerCase(),
                destination: to.toLowerCase().split(' ')[0],
                date: new Date().toISOString().split('T')[0]
            }
        });
    };

    return (
        <section className="py-20 bg-gray-50/60 dark:bg-gray-900/60 relative overflow-hidden transition-colors duration-300">
            {/* Background Ambient Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50 dark:opacity-100"></div>
                <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-50 dark:opacity-100"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Trending Routes (Col 7) */}
                    <div className="lg:col-span-7">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-display">
                                    Trending Bus Routes
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Most booked intercity departures today</p>
                            </div>
                        </div>

                        <div className="space-y-3.5">
                            {trendingRoutes.map((route, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleRouteClick(route.from, route.to)}
                                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/10 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer gap-4"
                                >
                                    <div className="flex items-start sm:items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-white/5 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 flex-shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                    {route.from}
                                                </h3>
                                                <span className="text-gray-400">→</span>
                                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                    {route.to}
                                                </h3>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1 text-amber-500 font-bold">
                                                    <Star size={13} className="fill-amber-400" />
                                                    {route.rating}
                                                </span>
                                                <span>•</span>
                                                <span>{route.time}</span>
                                                <span>•</span>
                                                <span className="text-gray-400">{route.busType}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-white/5">
                                        <div className="text-left sm:text-right">
                                            <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Seats from</span>
                                            <span className="text-lg font-bold text-brand-orange-500">NPR {route.price}</span>
                                        </div>
                                        <div className="w-9 h-9 rounded-full bg-gray-50 dark:bg-white/5 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center text-gray-400 transition-all group-hover:translate-x-1">
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Operators (Col 5) */}
                    <div className="lg:col-span-5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-display">
                                    Verified Operators
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Inspected fleet with certified safety records</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {topOperators.map((operator, index) => (
                                <div
                                    key={index}
                                    className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/10 hover:border-blue-500/30 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-sm">
                                                {operator.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{operator.name}</h3>
                                                    <CheckCircle2 size={16} className="text-blue-500" />
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{operator.specialty}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 bg-green-500/10 dark:bg-green-500/20 px-2.5 py-1 rounded-full text-green-700 dark:text-green-400 font-bold text-xs">
                                            <Star size={12} className="fill-current" />
                                            {operator.rating}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-white/5">
                                        {operator.amenities.map((amenity, i) => (
                                            <span
                                                key={i}
                                                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-[11px] font-medium"
                                            >
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Live Social Proof Banner */}
                <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-purple-950 text-white border border-gray-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10">
                        <div className="flex -space-x-3">
                            <img
                                className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                                alt="Traveler"
                            />
                            <img
                                className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop"
                                alt="Traveler"
                            />
                            <img
                                className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop"
                                alt="Traveler"
                            />
                            <div className="w-12 h-12 rounded-full border-2 border-white bg-brand-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                45k+
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Live Travel Pulse</span>
                            </div>
                            <h4 className="text-lg font-bold">Trusted by Over 45,000 Adventurers & Commuters</h4>
                            <p className="text-sm text-gray-300">Live seat bookings happening right now across 120+ Nepal routes.</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/buslist')}
                        className="px-7 py-3.5 bg-white text-gray-900 hover:bg-brand-orange-500 hover:text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 flex-shrink-0 z-10"
                    >
                        <span>Find Your Route</span>
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
};
export default SocialProofSection;
