import { useState } from 'react';
import { Tag, Clock, Gift, CreditCard, ChevronRight, Check, Copy, Sparkles } from 'lucide-react';

export const OffersSection = () => {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const offers = [
        {
            title: "Early Bird Express",
            description: "Get 20% off on deluxe bus tickets booked 7 days in advance across Nepal.",
            icon: Clock,
            color: "from-purple-500 to-indigo-600",
            badge: "Popular Deal",
            badgeColor: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
            code: "EARLY20",
            discount: "20% OFF",
            validity: "Valid until end of month"
        },
        {
            title: "Himalayan Flight Dhamaka",
            description: "Flat Rs. 500 cashback on mountain flights and domestic routes to Pokhara & Lukla.",
            icon: Gift,
            color: "from-amber-500 to-orange-600",
            badge: "Festival Special",
            badgeColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
            code: "FLYNEPAL500",
            discount: "NPR 500 CASHBACK",
            validity: "On booking > NPR 4,000"
        },
        {
            title: "Digital Payment Perk",
            description: "Instant 15% discount when paying with eSewa or NIC Asia Visa cards on all bookings.",
            icon: CreditCard,
            color: "from-emerald-500 to-teal-600",
            badge: "Bank Partner",
            badgeColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
            code: "DIGITAL15",
            discount: "15% OFF",
            validity: "Up to NPR 750 max"
        },
    ];

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    return (
        <section className="bg-gray-50/50 dark:bg-black/60 py-16 border-t border-gray-200/80 dark:border-white/5 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                            <Sparkles size={14} />
                            Special Promotions
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-display">
                            Exclusive Travel Discounts
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base mt-1">
                            Use these promo codes at checkout to unlock guaranteed savings on your journey.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Tag size={16} className="text-purple-500" />
                        <span>All coupons verified today</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {offers.map((offer, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900/90 border border-gray-200/80 dark:border-white/10 p-7 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 flex flex-col justify-between"
                        >
                            {/* Decorative ambient gradient */}
                            <div className={`absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br ${offer.color} opacity-10 dark:opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`}></div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${offer.color} flex items-center justify-center text-white shadow-md`}>
                                        <offer.icon size={22} />
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${offer.badgeColor}`}>
                                        {offer.badge}
                                    </span>
                                </div>

                                <div className="mb-2">
                                    <span className="text-xs font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
                                        {offer.discount}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{offer.title}</h3>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                                    {offer.description}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-3">
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(offer.code)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/20 text-gray-800 dark:text-gray-200 text-xs font-mono font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                        title="Click to copy promo code"
                                    >
                                        <span>{offer.code}</span>
                                        {copiedCode === offer.code ? (
                                            <Check size={14} className="text-emerald-500" />
                                        ) : (
                                            <Copy size={13} className="text-gray-400 group-hover:text-purple-500" />
                                        )}
                                    </button>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{offer.validity}</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleCopy(offer.code)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                        copiedCode === offer.code
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-purple-500/20'
                                    }`}
                                >
                                    {copiedCode === offer.code ? 'Copied!' : 'Apply Code'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
