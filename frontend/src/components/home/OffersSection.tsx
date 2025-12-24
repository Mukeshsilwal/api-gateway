import { Tag, Clock, Gift, CreditCard, ChevronRight } from 'lucide-react';

export const OffersSection = () => {
    const offers = [
        {
            title: "Early Bird Special",
            description: "Get 20% off on bus tickets booked 7 days in advance",
            icon: Clock,
            color: "from-purple-500 to-red-500",
            code: "EARLY20"
        },
        {
            title: "Festival Dhamaka",
            description: "Flat Rs. 500 cashback on flight bookings this Dashain",
            icon: Gift,
            color: "from-purple-500 to-indigo-500",
            code: "DASHAIN500"
        },
        {
            title: "Bank Partner Offer",
            description: "15% discount for NIC Asia card holders",
            icon: CreditCard,
            color: "from-blue-500 to-cyan-500",
            code: "NIC15"
        },
    ];

    return (
        <section className="bg-white dark:bg-black py-12 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Tag className="text-purple-500" size={24} />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
                            Exclusive Offers
                        </h2>
                    </div>
                    <button className="text-purple-600 dark:text-purple-500 font-semibold hover:text-purple-500 dark:hover:text-purple-400 flex items-center gap-1 transition-colors">
                        View All <ChevronRight size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {offers.map((offer, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-6 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none">
                            {/* Gradient Background */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${offer.color} opacity-5 dark:opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500`}></div>

                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${offer.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                                    <offer.icon size={24} />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{offer.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 h-10">{offer.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="px-3 py-1 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 border-dashed text-gray-700 dark:text-gray-300 text-xs font-mono tracking-wider">
                                        {offer.code}
                                    </div>
                                    <button className="text-sm font-semibold text-gray-900 dark:text-white hover:text-purple-500 transition-colors">
                                        Claim now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
