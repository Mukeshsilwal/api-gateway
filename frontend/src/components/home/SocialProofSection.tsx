import React from 'react';
import { Star, TrendingUp, Users, ArrowRight } from 'lucide-react';

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
        <section className="py-20 bg-black relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-64 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row gap-12">

                    {/* Trending Routes */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-8">
                            <TrendingUp className="text-orange-500" size={24} />
                            <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
                                Trending Routes
                            </h2>
                        </div>
                        <div className="grid gap-4">
                            {trendingRoutes.map((route, index) => (
                                <div key={index} className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm">
                                            {route.type}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">{route.from} → {route.to}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Star size={12} className="fill-orange-500 text-orange-500" />
                                                    {route.rating}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                <span>Starting from NPR {route.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Operators */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-8">
                            <Star className="text-orange-500" size={24} />
                            <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
                                Top Rated Operators
                            </h2>
                        </div>
                        <div className="grid gap-4">
                            {topOperators.map((operator, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/50 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                                            {operator.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">{operator.name}</h3>
                                            <p className="text-sm text-gray-400">{operator.reviews} happy travelers</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-lg">
                                            <span className="text-green-400 font-bold">{operator.rating}</span>
                                            <Star size={12} className="fill-green-400 text-green-400" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Recently Booked Banner */}
                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-700 flex items-center justify-center text-xs text-white">
                                    {/* Placeholder avatars */}
                                    U{i}
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-white font-semibold">Recently booked by 500+ users today</p>
                            <p className="text-sm text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Live bookings happening now
                            </p>
                        </div>
                    </div>
                    <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20">
                        View All Routes
                    </button>
                </div>
            </div>
        </section>
    );
};
