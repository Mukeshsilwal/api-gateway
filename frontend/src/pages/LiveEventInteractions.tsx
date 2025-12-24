import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import marketService, { LivePoll, Product } from '../services/marketService';
import { toast } from 'react-hot-toast';
import {
    MessageSquare,
    ShoppingBag,
    TrendingUp,
    Check,
    Clock,
    DollarSign,
    Plus,
    Minus,
    ShoppingCart,
} from 'lucide-react';

interface CartItem {
    product: Product;
    quantity: number;
}

const LiveEventInteractions: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [activeTab, setActiveTab] = useState<'polls' | 'food'>('polls');
    const [polls, setPolls] = useState<LivePoll[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [seatLocation, setSeatLocation] = useState('');

    useEffect(() => {
        if (eventId) {
            fetchData();
        }
    }, [eventId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pollsRes, productsRes] = await Promise.all([
                marketService.getPolls(eventId!),
                marketService.getMenu(eventId!),
            ]);
            setPolls(pollsRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            toast.error('Failed to load event data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (pollId: number, option: string) => {
        try {
            await marketService.vote({ pollId, selectedOption: option });
            toast.success('Vote recorded!');
            // Refresh polls to get updated counts
            const pollsRes = await marketService.getPolls(eventId!);
            setPolls(pollsRes.data);
        } catch (error) {
            toast.error('Failed to record vote');
            console.error(error);
        }
    };

    const addToCart = (product: Product) => {
        const existingItem = cart.find((item) => item.product.id === product.id);
        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
        toast.success(`Added ${product.name} to cart`);
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.product.id === productId
                        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const getCartTotal = () => {
        return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    };

    const handleCheckout = async () => {
        if (!seatLocation.trim()) {
            toast.error('Please enter your seat location');
            return;
        }

        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('Please login to place an order');
            return;
        }

        try {
            // Place orders for each item in cart
            for (const item of cart) {
                for (let i = 0; i < item.quantity; i++) {
                    await marketService.orderProduct({
                        userId: Number(userId),
                        productId: item.product.id,
                        seatLocation: seatLocation,
                    });
                }
            }
            toast.success('Order placed successfully! It will be delivered to your seat.');
            setCart([]);
            setSeatLocation('');
        } catch (error) {
            toast.error('Failed to place order');
            console.error(error);
        }
    };

    const getTotalVotes = (poll: LivePoll) => {
        return Object.values(poll.voteCounts).reduce((sum, count) => sum + count, 0);
    };

    const getVotePercentage = (poll: LivePoll, option: string) => {
        const total = getTotalVotes(poll);
        if (total === 0) return 0;
        return ((poll.voteCounts[option] || 0) / total) * 100;
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Live Event Experience
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Participate in polls and order food & beverages
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('polls')}
                            className={`px-6 py-4 font-medium border-b-2 transition-colors ${activeTab === 'polls'
                                ? 'border-orange-500 text-orange-500'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Live Polls
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('food')}
                            className={`px-6 py-4 font-medium border-b-2 transition-colors ${activeTab === 'food'
                                ? 'border-orange-500 text-orange-500'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Food & Beverages
                                {cart.length > 0 && (
                                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                                        {cart.length}
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Polls Tab */}
                {activeTab === 'polls' && (
                    <div className="space-y-6">
                        {polls.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No active polls
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Check back during the event for live polls
                                </p>
                            </div>
                        ) : (
                            polls.map((poll) => (
                                <div
                                    key={poll.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                                >
                                    {/* Poll Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                {poll.question}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="w-4 h-4" />
                                                    {getTotalVotes(poll)} votes
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    {poll.status === 'ACTIVE' ? (
                                                        <>
                                                            <Clock className="w-4 h-4 text-green-500" />
                                                            <span className="text-green-600 dark:text-green-400">
                                                                Active
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="w-4 h-4 text-gray-500" />
                                                            <span>Closed</span>
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Poll Options */}
                                    <div className="space-y-3">
                                        {poll.options.map((option) => {
                                            const percentage = getVotePercentage(poll, option);
                                            const voteCount = poll.voteCounts[option] || 0;

                                            return (
                                                <button
                                                    key={option}
                                                    onClick={() => handleVote(poll.id, option)}
                                                    disabled={poll.status !== 'ACTIVE'}
                                                    className="w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {option}
                                                        </span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {voteCount} votes ({percentage.toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Food & Beverages Tab */}
                {activeTab === 'food' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Menu */}
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Menu
                            </h2>
                            {products.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        No products available
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Menu items will be available during the event
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {product.type === 'F_AND_B' ? 'Food & Beverage' : 'Merchandise'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                        ${product.price.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addToCart(product)}
                                                disabled={!product.available}
                                                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add to Cart
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cart */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <ShoppingCart className="w-6 h-6 text-orange-500" />
                                    Your Order
                                </h2>

                                {cart.length === 0 ? (
                                    <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                                        Your cart is empty
                                    </p>
                                ) : (
                                    <>
                                        <div className="space-y-3 mb-4">
                                            {cart.map((item) => (
                                                <div
                                                    key={item.product.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {item.product.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            ${item.product.price.toFixed(2)} each
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, -1)}
                                                            className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, 1)}
                                                            className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                                            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                                                <span>Total</span>
                                                <span>${getCartTotal().toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Seat Location
                                            </label>
                                            <input
                                                type="text"
                                                value={seatLocation}
                                                onChange={(e) => setSeatLocation(e.target.value)}
                                                placeholder="e.g., Section A, Row 5, Seat 12"
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>

                                        <button
                                            onClick={handleCheckout}
                                            className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2"
                                        >
                                            <DollarSign className="w-5 h-5" />
                                            Place Order
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveEventInteractions;
