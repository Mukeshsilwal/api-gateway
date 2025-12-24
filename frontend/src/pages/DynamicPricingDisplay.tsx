import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import marketService, { PriceCalculation } from '../services/marketService';
import { toast } from 'react-hot-toast';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Zap,
    Clock,
    Users,
    AlertCircle,
    Info,
} from 'lucide-react';

interface PriceHistory {
    timestamp: Date;
    price: number;
    isSurge: boolean;
}

const DynamicPricingDisplay: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [basePrice, setBasePrice] = useState<string>('100');
    const [calculation, setCalculation] = useState<PriceCalculation | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        if (eventId && basePrice) {
            calculatePrice();
        }
    }, [eventId]);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            if (eventId && basePrice) {
                calculatePrice();
            }
        }, 10000); // Refresh every 10 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, eventId, basePrice]);

    const calculatePrice = async () => {
        if (!basePrice || parseFloat(basePrice) <= 0) {
            toast.error('Please enter a valid base price');
            return;
        }

        try {
            setLoading(true);
            const response = await marketService.calculatePrice(
                eventId!,
                parseFloat(basePrice)
            );
            setCalculation(response.data);

            // Add to price history
            setPriceHistory((prev) => [
                ...prev.slice(-9), // Keep last 9 entries
                {
                    timestamp: new Date(),
                    price: response.data.currentPrice,
                    isSurge: response.data.isSurge,
                },
            ]);
        } catch (error) {
            toast.error('Failed to calculate price');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getPriceChange = () => {
        if (!calculation) return 0;
        return calculation.currentPrice - calculation.originalPrice;
    };

    const getPriceChangePercentage = () => {
        if (!calculation) return 0;
        const change = getPriceChange();
        return (change / calculation.originalPrice) * 100;
    };

    const getMultiplier = () => {
        if (!calculation) return 1;
        return calculation.currentPrice / calculation.originalPrice;
    };

    const getMaxPrice = () => {
        if (!priceHistory.length) return 0;
        return Math.max(...priceHistory.map((h) => h.price));
    };

    const getMinPrice = () => {
        if (!priceHistory.length) return 0;
        return Math.min(...priceHistory.map((h) => h.price));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-orange-500" />
                                Dynamic Pricing
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Real-time demand-based pricing calculator
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Auto-refresh (10s)
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Calculator */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Price Input */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Calculate Price
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Base Price
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={basePrice}
                                            onChange={(e) => setBasePrice(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={calculatePrice}
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            Calculate Price
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-3 mb-4">
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                    How Dynamic Pricing Works
                                </h3>
                            </div>
                            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">•</span>
                                    <span>Prices increase with high demand</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">•</span>
                                    <span>Scarcity affects pricing (low availability = higher price)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">•</span>
                                    <span>Time-based multipliers apply closer to event</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">•</span>
                                    <span>Maximum 2x multiplier cap</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column - Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {calculation ? (
                            <>
                                {/* Current Price Card */}
                                <div className={`rounded-xl p-8 shadow-lg ${calculation.isSurge
                                    ? 'bg-gradient-to-br from-orange-500 to-red-500'
                                    : 'bg-gradient-to-br from-green-500 to-blue-500'
                                    } text-white`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-white/80 text-sm mb-1">Current Price</p>
                                            <p className="text-5xl font-bold">
                                                ${calculation.currentPrice.toFixed(2)}
                                            </p>
                                        </div>
                                        {calculation.isSurge && (
                                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                                <Zap className="w-5 h-5" />
                                                <span className="font-semibold">Surge Pricing</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                                        <div>
                                            <p className="text-white/80 text-sm">Base Price</p>
                                            <p className="text-xl font-semibold">
                                                ${calculation.originalPrice.toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-white/80 text-sm">Change</p>
                                            <p className={`text-xl font-semibold flex items-center gap-1`}>
                                                {getPriceChange() >= 0 ? (
                                                    <TrendingUp className="w-5 h-5" />
                                                ) : (
                                                    <TrendingDown className="w-5 h-5" />
                                                )}
                                                ${Math.abs(getPriceChange()).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-white/80 text-sm">Multiplier</p>
                                            <p className="text-xl font-semibold">
                                                {getMultiplier().toFixed(2)}x
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Factors */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Pricing Factors
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                                    <Users className="w-5 h-5 text-orange-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        Demand Level
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Based on current bookings
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${calculation.isSurge
                                                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                }`}>
                                                {calculation.isSurge ? 'High' : 'Normal'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                                    <Clock className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        Time Factor
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Hours until event
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                                Active
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                                    <TrendingUp className="w-5 h-5 text-purple-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        Scarcity Multiplier
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Based on availability
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                                                {getMultiplier().toFixed(2)}x
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price History */}
                                {priceHistory.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            Price History
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                <span>High: ${getMaxPrice().toFixed(2)}</span>
                                                <span>Low: ${getMinPrice().toFixed(2)}</span>
                                            </div>
                                            <div className="space-y-2">
                                                {priceHistory.slice().reverse().map((entry, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                                    >
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {entry.timestamp.toLocaleTimeString()}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-medium ${entry.isSurge
                                                                ? 'text-orange-600 dark:text-orange-400'
                                                                : 'text-green-600 dark:text-green-400'
                                                                }`}>
                                                                ${entry.price.toFixed(2)}
                                                            </span>
                                                            {entry.isSurge && (
                                                                <Zap className="w-4 h-4 text-orange-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No Price Calculated
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Enter a base price and click "Calculate Price" to see dynamic pricing
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicPricingDisplay;
