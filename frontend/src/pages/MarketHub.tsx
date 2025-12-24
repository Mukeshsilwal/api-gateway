import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Ticket,
    Package,
    Star,
    TrendingUp,
    Users,
    MessageSquare,
    ShoppingBag,
    DollarSign,
    ArrowRight,
} from 'lucide-react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    route: string;
    color: string;
    badge?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
    title,
    description,
    icon,
    route,
    color,
    badge,
}) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(route)}
            className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:border-${color}-500 dark:hover:border-${color}-500 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1`}
        >
            {badge && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                    {badge}
                </span>
            )}

            <div className={`w-14 h-14 bg-${color}-100 dark:bg-${color}-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <div className={`text-${color}-600 dark:text-${color}-400`}>
                    {icon}
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {description}
            </p>

            <div className="flex items-center text-orange-500 font-medium text-sm group-hover:gap-2 transition-all">
                <span>Explore</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );
};

const MarketHub: React.FC = () => {
    const navigate = useNavigate();

    const features: FeatureCardProps[] = [
        {
            title: 'Resale Marketplace',
            description: 'Buy and sell verified tickets safely. Get the best deals from other attendees.',
            icon: <Ticket className="w-7 h-7" />,
            route: '/market/resale/1',
            color: 'blue',
            badge: 'Popular',
        },
        {
            title: 'Bundle Packages',
            description: 'Save big with event bundles. Get tickets, hotels, and transport in one package.',
            icon: <Package className="w-7 h-7" />,
            route: '/market/bundles',
            color: 'purple',
        },
        {
            title: 'Loyalty Rewards',
            description: 'Earn points on every purchase. Unlock exclusive benefits and tier rewards.',
            icon: <Star className="w-7 h-7" />,
            route: '/market/loyalty',
            color: 'yellow',
        },
        {
            title: 'Dynamic Pricing',
            description: 'See real-time pricing based on demand. Plan your purchase at the right time.',
            icon: <TrendingUp className="w-7 h-7" />,
            route: '/events/1/pricing',
            color: 'green',
        },
        {
            title: 'Crowd Monitor',
            description: 'Check venue capacity in real-time. Avoid crowded areas and plan your visit.',
            icon: <Users className="w-7 h-7" />,
            route: '/events/1/crowd',
            color: 'red',
        },
        {
            title: 'Live Interactions',
            description: 'Vote on polls and order F&B to your seat. Engage with the event in real-time.',
            icon: <MessageSquare className="w-7 h-7" />,
            route: '/events/1/live',
            color: 'indigo',
            badge: 'New',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                            <ShoppingBag className="w-5 h-5" />
                            <span className="font-semibold">Market Services</span>
                        </div>

                        <h1 className="text-5xl font-bold mb-4">
                            Your Event Marketplace
                        </h1>
                        <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-8">
                            Discover amazing features to enhance your event experience. From resale tickets to live interactions, we've got you covered.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/market/resale/create')}
                                className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors shadow-lg flex items-center gap-2"
                            >
                                <Ticket className="w-5 h-5" />
                                Sell Your Ticket
                            </button>
                            <button
                                onClick={() => navigate('/market/bundles')}
                                className="px-8 py-4 bg-orange-700 text-white rounded-xl font-semibold hover:bg-orange-800 transition-colors border-2 border-white/20 flex items-center gap-2"
                            >
                                <Package className="w-5 h-5" />
                                Browse Bundles
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Explore Our Features
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Everything you need for an amazing event experience, all in one place
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>

                {/* Stats Section */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-2">10K+</div>
                            <div className="text-orange-100">Active Listings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-2">50K+</div>
                            <div className="text-orange-100">Happy Customers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-2">$2M+</div>
                            <div className="text-orange-100">Transactions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-2">98%</div>
                            <div className="text-orange-100">Satisfaction Rate</div>
                        </div>
                    </div>
                </div>

                {/* How It Works */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
                        How It Works
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">1</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Browse Features
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Explore our marketplace features and find what you need
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">2</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Make Your Choice
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Select tickets, bundles, or use our interactive features
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">3</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Enjoy the Event
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Have an amazing experience with our seamless services
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketHub;
