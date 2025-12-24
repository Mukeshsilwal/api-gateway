import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import marketService, { CreateListingRequest } from '../services/marketService';
import { toast } from 'react-hot-toast';
import {
    Ticket,
    DollarSign,
    Calendar,
    AlertCircle,
    ArrowLeft,
    TrendingUp,
    Shield
} from 'lucide-react';

interface UserTicket {
    id: number;
    eventId: number;
    eventName: string;
    eventDate: string;
    seatNumber: string;
    purchasePrice: number;
    isEligibleForResale: boolean;
}

const CreateResaleListing: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
    const [resalePrice, setResalePrice] = useState<string>('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    useEffect(() => {
        fetchUserTickets();
    }, []);

    const fetchUserTickets = async () => {
        // In a real app, fetch user's tickets from booking service
        // For now, we'll use mock data structure
        // TODO: Integrate with actual booking service API
        const mockTickets: UserTicket[] = [
            {
                id: 1,
                eventId: 1,
                eventName: 'Summer Music Festival 2024',
                eventDate: '2024-08-15',
                seatNumber: 'A-12',
                purchasePrice: 100,
                isEligibleForResale: true,
            },
            {
                id: 2,
                eventId: 2,
                eventName: 'Tech Conference 2024',
                eventDate: '2024-09-20',
                seatNumber: 'B-45',
                purchasePrice: 150,
                isEligibleForResale: true,
            },
        ];
        setUserTickets(mockTickets);
    };

    const calculateCommission = (price: number): number => {
        return price * 0.05; // 5% commission
    };

    const calculatePayout = (price: number): number => {
        return price - calculateCommission(price);
    };

    const getMaxPrice = (): number => {
        if (!selectedTicket) return 0;
        return selectedTicket.purchasePrice * 1.1; // 110% of face value
    };

    const getSuggestedPrice = (): number => {
        if (!selectedTicket) return 0;
        return selectedTicket.purchasePrice * 0.95; // 95% of face value
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTicket) {
            toast.error('Please select a ticket');
            return;
        }

        if (!resalePrice || parseFloat(resalePrice) <= 0) {
            toast.error('Please enter a valid price');
            return;
        }

        const price = parseFloat(resalePrice);
        const maxPrice = getMaxPrice();

        if (price > maxPrice) {
            toast.error(`Price cannot exceed $${maxPrice.toFixed(2)} (110% of face value)`);
            return;
        }

        if (!agreedToTerms) {
            toast.error('Please agree to the terms and conditions');
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('Please login to create a listing');
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const request: CreateListingRequest = {
                originalTicketId: selectedTicket.id,
                sellerUserId: Number(userId),
                eventId: selectedTicket.eventId,
                resalePrice: price,
            };

            await marketService.createListing(request);
            toast.success('Listing created successfully!');
            navigate(`/market/resale/${selectedTicket.eventId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create listing');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const priceNum = parseFloat(resalePrice) || 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Ticket className="w-8 h-8 text-purple-500" />
                        Sell Your Ticket
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        List your ticket on the resale marketplace
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Select Ticket */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            1. Select Ticket
                        </h2>

                        {userTickets.length === 0 ? (
                            <div className="text-center py-8">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    You don't have any tickets available for resale
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {userTickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedTicket?.id === ticket.id
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {ticket.eventName}
                                                </h3>
                                                <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <p className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(ticket.eventDate).toLocaleDateString()}
                                                    </p>
                                                    <p>Seat: {ticket.seatNumber}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Face Value
                                                </p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    ${ticket.purchasePrice.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Set Price */}
                    {selectedTicket && (
                        <>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    2. Set Your Price
                                </h2>

                                <div className="space-y-4">
                                    {/* Price Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Resale Price
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={getMaxPrice()}
                                                value={resalePrice}
                                                onChange={(e) => setResalePrice(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            Maximum allowed: ${getMaxPrice().toFixed(2)} (110% of face value)
                                        </p>
                                    </div>

                                    {/* Suggested Price */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-blue-900 dark:text-blue-100">
                                                    Suggested Price: ${getSuggestedPrice().toFixed(2)}
                                                </p>
                                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                    Based on current market demand and similar listings
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    {priceNum > 0 && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Listing Price
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    ${priceNum.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Service Fee (5%)
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    -${calculateCommission(priceNum).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    You'll Receive
                                                </span>
                                                <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                                                    ${calculatePayout(priceNum).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Terms & Submit */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    3. Review & Confirm
                                </h2>

                                {/* Buyer Protection */}
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-green-900 dark:text-green-100">
                                                Buyer Protection Included
                                            </p>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                All transactions are secure and verified. Buyers are protected against fraud.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms Checkbox */}
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="mt-1 w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        I agree to the{' '}
                                        <a href="/terms" className="text-purple-500 hover:underline">
                                            Terms of Service
                                        </a>{' '}
                                        and understand that my ticket will be locked until sold or the listing expires.
                                    </span>
                                </label>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !selectedTicket || !resalePrice || !agreedToTerms}
                                    className="w-full mt-6 px-6 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Creating Listing...
                                        </>
                                    ) : (
                                        <>
                                            <Ticket className="w-5 h-5" />
                                            Create Listing
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreateResaleListing;
