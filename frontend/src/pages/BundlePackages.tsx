import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import marketService, { Bundle } from '../services/marketService';
import { toast } from 'react-hot-toast';
import {
    Package,
    Ticket,
    Hotel,
    Bus,
    TrendingDown,
    ShoppingCart,
    Sparkles,
} from 'lucide-react';

const BundlePackages: React.FC = () => {
    const navigate = useNavigate();
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBundles();
    }, []);

    const fetchBundles = async () => {
        try {
            setLoading(true);
            const response = await marketService.getBundles();
            setBundles(response.data);
        } catch (error) {
            toast.error('Failed to load bundle packages');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getItemIcon = (type: 'HOTEL' | 'BUS' | 'EVENT') => {
        switch (type) {
            case 'HOTEL':
                return Hotel;
            case 'BUS':
                return Bus;
            case 'EVENT':
                return Ticket;
            default:
                return Package;
        }
    };

    const getItemTypeLabel = (type: 'HOTEL' | 'BUS' | 'EVENT') => {
        switch (type) {
            case 'HOTEL':
                return 'Hotel Stay';
            case 'BUS':
                return 'Bus Ticket';
            case 'EVENT':
                return 'Event Ticket';
            default:
                return 'Item';
        }
    };

    const calculateOriginalPrice = (bundle: Bundle): number => {
        if (!bundle.discountPercentage) return bundle.totalPrice;
        return bundle.totalPrice / (1 - bundle.discountPercentage / 100);
    };

    const calculateSavings = (bundle: Bundle): number => {
        return calculateOriginalPrice(bundle) - bundle.totalPrice;
    };

    const handleBookBundle = (bundleId: number) => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('Please login to book a bundle');
            navigate('/login');
            return;
        }
        navigate(`/market/bundles/${bundleId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Package className="w-8 h-8 text-orange-500" />
                                Bundle Packages
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Save more with our exclusive package deals
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-orange-500" />
                            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                Save up to 20% with bundles
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {bundles.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No bundles available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Check back later for exclusive package deals
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bundles.map((bundle) => {
                            const savings = calculateSavings(bundle);
                            const originalPrice = calculateOriginalPrice(bundle);

                            return (
                                <div
                                    key={bundle.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                                >
                                    {/* Bundle Header */}
                                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-bold">{bundle.name}</h3>
                                            {bundle.discountPercentage > 0 && (
                                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                                                    Save {bundle.discountPercentage}%
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white/90 text-sm">{bundle.description}</p>
                                    </div>

                                    {/* Bundle Items */}
                                    <div className="p-6">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Package Includes:
                                        </h4>
                                        <div className="space-y-3 mb-6">
                                            {bundle.items.map((item, index) => {
                                                const ItemIcon = getItemIcon(item.itemType);
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                                    >
                                                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                                            <ItemIcon className="w-5 h-5 text-orange-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {getItemTypeLabel(item.itemType)}
                                                            </p>
                                                            {item.quantity > 1 && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Quantity: {item.quantity}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Pricing */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                                            {bundle.discountPercentage > 0 && (
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Regular Price
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                                        ${originalPrice.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Bundle Price
                                                </span>
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    ${bundle.totalPrice.toFixed(2)}
                                                </span>
                                            </div>
                                            {savings > 0 && (
                                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                    <TrendingDown className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        You save ${savings.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Book Button */}
                                        <button
                                            onClick={() => handleBookBundle(bundle.id)}
                                            className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            Book Bundle
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Benefits Section */}
                {bundles.length > 0 && (
                    <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                            Why Choose Bundle Packages?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="inline-flex p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
                                    <TrendingDown className="w-8 h-8 text-orange-500" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Save Money
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Get the best value with discounted package pricing
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                                    <Sparkles className="w-8 h-8 text-blue-500" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Convenience
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Book everything you need in one simple transaction
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex p-4 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                                    <Package className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Curated Experiences
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Carefully selected combinations for the best experience
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BundlePackages;
