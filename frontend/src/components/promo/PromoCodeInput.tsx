import { useState } from 'react';
import { Tag, Percent, DollarSign, Calendar, Users, Check, X } from 'lucide-react';
import apiService from '../../services/api.service';

interface PromoCodeInputProps {
    eventId: number;
    totalAmount: number;
    onApply: (discount: number, promoCode: string) => void;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ eventId, totalAmount, onApply }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [applied, setApplied] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleApply = async () => {
        if (!code.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await apiService.post(`/api/bff/v1/promo-codes/validate`, {
                eventId,
                code: code.toUpperCase(),
                amount: totalAmount
            });

            const result = response.data.data || response.data;
            setDiscount(result.discountAmount);
            setApplied(true);
            onApply(result.discountAmount, code.toUpperCase());
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid promo code');
            setApplied(false);
            setDiscount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setCode('');
        setApplied(false);
        setDiscount(0);
        setError(null);
        onApply(0, '');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
                <Tag className="text-indigo-600" size={20} />
                <h3 className="font-semibold text-gray-900 dark:text-white">Promo Code</h3>
            </div>

            {!applied ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white uppercase"
                        disabled={loading}
                    />
                    <button
                        onClick={handleApply}
                        disabled={loading || !code.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Validating...' : 'Apply'}
                    </button>
                </div>
            ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Check className="text-green-600" size={20} />
                            <div>
                                <p className="font-semibold text-green-900 dark:text-green-100">{code}</p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Discount: NPR {discount.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="text-green-600 hover:text-green-700 p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
            )}
        </div>
    );
};

export default PromoCodeInput;
