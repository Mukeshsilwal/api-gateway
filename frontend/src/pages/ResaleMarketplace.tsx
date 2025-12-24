import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import marketService, { ResaleListing } from '../services/marketService';
import { toast } from 'react-hot-toast';
import {
    Ticket,
    Filter,
    TrendingUp,
    Clock,
    DollarSign,
    ShoppingCart,
    AlertCircle
} from 'lucide-react';

const ResaleMarketplace: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    const [listings, setListings] = useState<ResaleListing[]>([]);
    const [filteredListings, setFilteredListings] = useState<ResaleListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');

    useEffect(() => {
        if (eventId) {
            fetchListings();
        }
    }, [eventId]);

    useEffect(() => {
        applyFilters();
    }, [listings, priceRange, sortBy]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const response = await marketService.getResaleListings(Number(eventId));
            setListings(response.data);
        } catch (error) {
            toast.error('Failed to load resale listings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...listings];

        // Price filter
        filtered = filtered.filter(
            (listing) =>
                listing.resalePrice >= priceRange[0] &&
                listing.resalePrice <= priceRange[1]
        );

        // Sort
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.resalePrice - b.resalePrice);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.resalePrice - a.resalePrice);
                break;
            case 'newest':
                filtered.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                break;
        }

        setFilteredListings(filtered);
    };

    const handleBuyListing = async (listingId: number) => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('Please login to purchase tickets');
            navigate('/login');
            return;
        }

        try {
            await marketService.buyListing(listingId.toString(), {
                buyerUserId: Number(userId),
            });
            toast.success('Ticket purchased successfully!');
            fetchListings(); // Refresh listings
        } catch (error) {
            toast.error('Failed to purchase ticket');
            console.error(error);
        }
    };

    const calculateSavings = (listing: ResaleListing) => {
        const savings = listing.faceValue - listing.resalePrice;
        const percentage = ((savings / listing.faceValue) * 100).toFixed(0);
        return { amount: savings, percentage };
    };

    const getTimeRemaining = (expiresAt: string) => {
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        const diff = expiry - now;

        if (diff < 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d remaining`;
        return `${hours}h remaining`;
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
                                <Ticket className="w-8 h-8 text-orange-500" />
                                Ticket Resale Marketplace
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Buy verified tickets from other attendees
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/market/resale/create')}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                        >
                            Sell Your Ticket
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-6">
                                <Filter className="w-5 h-5 text-orange-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Filters
                                </h2>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Price Range
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        value={priceRange[1]}
                                        onChange={(e) =>
                                            setPriceRange([priceRange[0], Number(e.target.value)])
                                        }
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>${priceRange[0]}</span>
                                        <span>${priceRange[1]}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(e.target.value as typeof sortBy)
                                    }
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>
                            </div>

                            {/* Stats */}
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <p className="mb-2">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {filteredListings.length}
                                        </span>{' '}
                                        tickets available
                                    </p>
                                    <p>
                                        Average price:{' '}
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            $
                                            {filteredListings.length > 0
                                                ? (
                                                    filteredListings.reduce(
                                                        (sum, l) => sum + l.resalePrice,
                                                        0
                                                    ) / filteredListings.length
                                                ).toFixed(2)
                                                : '0.00'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="lg:col-span-3">
                        {filteredListings.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No tickets available
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Try adjusting your filters or check back later
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredListings.map((listing) => {
                                    const savings = calculateSavings(listing);
                                    const timeRemaining = getTimeRemaining(listing.expiresAt);

                                    return (
                                        <div
                                            key={listing.id}
                                            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="p-6">
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            Ticket #{listing.originalTicketId}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Listed {new Date(listing.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {savings.amount > 0 && (
                                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm font-medium rounded-full">
                                                            Save {savings.percentage}%
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Pricing */}
                                                <div className="mb-4">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                                            ${listing.resalePrice.toFixed(2)}
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                                            ${listing.faceValue.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        + ${listing.commissionFee.toFixed(2)} service fee
                                                    </p>
                                                </div>

                                                {/* Info */}
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{timeRemaining}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>Verified seller</span>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <button
                                                    onClick={() => handleBuyListing(listing.id)}
                                                    className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    <ShoppingCart className="w-5 h-5" />
                                                    Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResaleMarketplace;
