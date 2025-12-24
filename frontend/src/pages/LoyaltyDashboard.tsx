import React, { useState, useEffect } from 'react';
import marketService, { LoyaltyProfile, PointTransaction } from '../services/marketService';
import { toast } from 'react-hot-toast';
import {
    Trophy,
    TrendingUp,
    Gift,
    Star,
    Award,
    Zap,
    Calendar,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';

const LoyaltyDashboard: React.FC = () => {
    const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoyaltyData();
    }, []);

    const fetchLoyaltyData = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('Please login to view loyalty dashboard');
            return;
        }

        try {
            setLoading(true);
            const [profileRes, historyRes] = await Promise.all([
                marketService.getLoyaltyProfile(userId),
                marketService.getLoyaltyHistory(userId),
            ]);
            setProfile(profileRes.data);
            setTransactions(historyRes.data);
        } catch (error) {
            toast.error('Failed to load loyalty data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getTierInfo = (tier: 'BRONZE' | 'SILVER' | 'GOLD') => {
        const tiers = {
            BRONZE: {
                name: 'Bronze',
                color: 'from-amber-700 to-amber-900',
                textColor: 'text-amber-700 dark:text-amber-400',
                bgColor: 'bg-amber-100 dark:bg-amber-900/20',
                borderColor: 'border-amber-300 dark:border-amber-700',
                icon: Award,
                multiplier: '1.0x',
                nextTier: 'SILVER',
                pointsNeeded: 500,
            },
            SILVER: {
                name: 'Silver',
                color: 'from-gray-400 to-gray-600',
                textColor: 'text-gray-700 dark:text-gray-300',
                bgColor: 'bg-gray-100 dark:bg-gray-700/20',
                borderColor: 'border-gray-300 dark:border-gray-600',
                icon: Star,
                multiplier: '1.1x',
                nextTier: 'GOLD',
                pointsNeeded: 2000,
            },
            GOLD: {
                name: 'Gold',
                color: 'from-yellow-400 to-yellow-600',
                textColor: 'text-yellow-700 dark:text-yellow-400',
                bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
                borderColor: 'border-yellow-300 dark:border-yellow-700',
                icon: Trophy,
                multiplier: '1.2x',
                nextTier: null,
                pointsNeeded: null,
            },
        };
        return tiers[tier];
    };

    const getProgressToNextTier = () => {
        if (!profile) return 0;
        const tierInfo = getTierInfo(profile.tierLevel);
        if (!tierInfo.pointsNeeded) return 100; // Already at max tier
        return Math.min((profile.lifetimePoints / tierInfo.pointsNeeded) * 100, 100);
    };

    const getPointsToNextTier = () => {
        if (!profile) return 0;
        const tierInfo = getTierInfo(profile.tierLevel);
        if (!tierInfo.pointsNeeded) return 0;
        return Math.max(tierInfo.pointsNeeded - profile.lifetimePoints, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        No Loyalty Profile Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Start making purchases to earn loyalty points!
                    </p>
                </div>
            </div>
        );
    }

    const tierInfo = getTierInfo(profile.tierLevel);
    const TierIcon = tierInfo.icon;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-orange-500" />
                        Loyalty Rewards
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Earn points with every purchase and unlock exclusive benefits
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Stats & Tier */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Tier Card */}
                        <div className={`bg-gradient-to-br ${tierInfo.color} rounded-xl p-6 text-white shadow-lg`}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-white/80 text-sm">Current Tier</p>
                                    <h2 className="text-3xl font-bold">{tierInfo.name}</h2>
                                </div>
                                <TierIcon className="w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/80">Points Multiplier</span>
                                    <span className="font-semibold">{tierInfo.multiplier}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/80">Lifetime Points</span>
                                    <span className="font-semibold">{profile.lifetimePoints.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Points Balance */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                    <Zap className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Available Points</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {profile.pointsBalance.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                                Redeem Points
                            </button>
                        </div>

                        {/* Progress to Next Tier */}
                        {tierInfo.nextTier && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        Next Tier: {getTierInfo(tierInfo.nextTier as any).name}
                                    </h3>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${getProgressToNextTier()}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {getPointsToNextTier().toLocaleString()} points to go
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tier Benefits */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Gift className="w-5 h-5 text-orange-500" />
                                Your Benefits
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="p-1 bg-green-100 dark:bg-green-900/20 rounded">
                                        <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {tierInfo.multiplier} Points Multiplier
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Earn more points on every purchase
                                        </p>
                                    </div>
                                </li>
                                {profile.tierLevel !== 'BRONZE' && (
                                    <li className="flex items-start gap-3">
                                        <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                                            <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Priority Support
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Get help faster with priority assistance
                                            </p>
                                        </div>
                                    </li>
                                )}
                                {profile.tierLevel === 'GOLD' && (
                                    <li className="flex items-start gap-3">
                                        <div className="p-1 bg-purple-100 dark:bg-purple-900/20 rounded">
                                            <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Exclusive Access
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Early access to tickets and special events
                                            </p>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column - Transaction History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-orange-500" />
                                    Points History
                                </h2>
                            </div>

                            <div className="p-6">
                                {transactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600 dark:text-gray-400">
                                            No transactions yet
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {transactions.map((transaction) => (
                                            <div
                                                key={transaction.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`p-2 rounded-lg ${transaction.amount > 0
                                                            ? 'bg-green-100 dark:bg-green-900/20'
                                                            : 'bg-red-100 dark:bg-red-900/20'
                                                            }`}
                                                    >
                                                        {transaction.amount > 0 ? (
                                                            <ArrowUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                        ) : (
                                                            <ArrowDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {transaction.description}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {transaction.source} •{' '}
                                                            {new Date(transaction.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p
                                                        className={`text-lg font-bold ${transaction.amount > 0
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                            }`}
                                                    >
                                                        {transaction.amount > 0 ? '+' : ''}
                                                        {transaction.amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">points</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyDashboard;
