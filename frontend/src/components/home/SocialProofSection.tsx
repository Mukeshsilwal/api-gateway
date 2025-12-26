import { TrendingUp, Star, ArrowRight } from 'lucide-react';

export const SocialProofSection = () => {
    const trendingRoutes = [
        { from: 'Kathmandu', to: 'Pokhara', price: '800', rating: '4.8', type: 'Bus' },
        { from: 'Kathmandu', to: 'Chitwan', price: '900', rating: '4.7', type: 'Bus' },
        { from: 'Pokhara', to: 'Lumbini', price: '1200', rating: '4.9', type: 'Bus' },
    ];

    const topOperators = [
        { name: 'Baba Adventure', rating: '4.9', reviews: '1.2k' },
        { name: 'Greenline', rating: '4.8', reviews: '2k+' },
        { name: 'Swift Travel', rating: '4.7', reviews: '850' },
    ];

    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors duration-300">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50 dark:opacity-100"></div>
                <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-50 dark:opacity-100"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16">

                    {/* Trending Routes */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-display">
                                    Trending Routes
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">Most frequent journeys today</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {trendingRoutes.map((route, index) => (
                                <div key={index} className="group flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                                            {route.type === 'Bus' && (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {route.from}
                                                <span className="text-gray-400">→</span>
                                                {route.to}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1 text-amber-500 font-medium">
                                                    <Star size={14} className="fill-current" />
                                                    {route.rating}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                                <span>From <span className="font-bold text-brand-orange-500">NPR {route.price}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:border-purple-500 group-hover:text-purple-500 transition-all transform group-hover:translate-x-1">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Operators */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Star size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-display">
                                    Top Rated Operators
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">Travel with the best in class</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {topOperators.map((operator, index) => (
                                <div key={index} className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl border border-blue-100 dark:border-blue-500/20">
                                            {operator.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{operator.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{operator.reviews} happy travelers</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 bg-green-500/10 dark:bg-green-500/20 px-3 py-1.5 rounded-full border border-green-500/20">
                                            <span className="text-green-700 dark:text-green-400 font-bold">{operator.rating}</span>
                                            <Star size={14} className="fill-green-600 dark:fill-green-400 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Recently Booked Banner */}
                <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white/10 dark:to-white/5 border border-gray-800 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/30 transition-all duration-700"></div>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="flex -space-x-5">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-gray-900 dark:border-black bg-gray-700 dark:bg-gray-800 flex items-center justify-center text-sm text-white font-bold ring-2 ring-white/10">
                                    U{i}
                                </div>
                            ))}
                            <div className="w-12 h-12 rounded-full border-4 border-gray-900 dark:border-black bg-brand-orange-500 flex items-center justify-center text-sm text-white font-bold ring-2 ring-white/10">
                                +500
                            </div>
                        </div>
                        <div>
                            <p className="text-white text-lg font-bold mb-1">Join 1M+ Travelers</p>
                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Live bookings happening now
                            </p>
                        </div>
                    </div>
                    <button className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 relative z-10 flex items-center gap-2">
                        View All Routes
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
};
