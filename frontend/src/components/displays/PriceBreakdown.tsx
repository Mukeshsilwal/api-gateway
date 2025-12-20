import React from 'react';
import { PricingResponseDto } from '../../types/dto';
import { Receipt, Tag, Percent } from 'lucide-react';

interface PriceBreakdownProps {
    pricing: PricingResponseDto;
    nights?: number;
}

/**
 * Price Breakdown Component
 * Displays detailed pricing using PricingResponseDto
 */
const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ pricing, nights = 1 }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <Receipt className="text-blue-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900">Price Breakdown</h3>
            </div>

            {/* Breakdown Items */}
            <div className="space-y-3">
                {/* Base Price */}
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-sm text-gray-700">Base Price</div>
                        {nights > 1 && (
                            <div className="text-xs text-gray-500">
                                NPR {pricing.breakdown.basePrice.toLocaleString()} × {nights} nights
                            </div>
                        )}
                    </div>
                    <div className="font-semibold text-gray-900">
                        NPR {(pricing.breakdown.basePrice * nights).toLocaleString()}
                    </div>
                </div>

                {/* Meal Cost */}
                {pricing.breakdown.mealCost > 0 && (
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-sm text-gray-700">Meal Plan</div>
                            <div className="text-xs text-gray-500 capitalize">
                                {pricing.mealPlan.replace('_', ' ').toLowerCase()}
                            </div>
                        </div>
                        <div className="font-semibold text-gray-900">
                            NPR {pricing.breakdown.mealCost.toLocaleString()}
                        </div>
                    </div>
                )}

                {/* Service Fee */}
                {pricing.breakdown.serviceFee > 0 && (
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">Service Fee</div>
                        <div className="font-semibold text-gray-900">
                            NPR {pricing.breakdown.serviceFee.toLocaleString()}
                        </div>
                    </div>
                )}

                {/* Taxes */}
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">Taxes & Fees</div>
                    <div className="font-semibold text-gray-900">
                        NPR {pricing.breakdown.taxes.toLocaleString()}
                    </div>
                </div>

                {/* Discounts */}
                {pricing.discounts && pricing.discounts.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        {pricing.discounts.map((discount, idx) => (
                            <div key={idx} className="flex justify-between items-center text-green-600">
                                <div className="flex items-center gap-2">
                                    <Tag size={16} />
                                    <div>
                                        <div className="text-sm font-medium">{discount.code}</div>
                                        <div className="text-xs">
                                            {discount.type === 'PERCENTAGE' ? `${discount.amount}% off` : 'Fixed discount'}
                                        </div>
                                    </div>
                                </div>
                                <div className="font-semibold">
                                    - NPR {discount.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Total */}
            <div className="pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-gray-900">Total Amount</div>
                    <div className="text-2xl font-bold text-blue-600">
                        NPR {pricing.totalPrice.toLocaleString()}
                    </div>
                </div>
                <div className="text-xs text-gray-500 text-right mt-1">
                    Inclusive of all taxes
                </div>
            </div>

            {/* Rent Type Badge */}
            <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-100">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {pricing.rentType.replace('_', ' ')}
                </span>
            </div>
        </div>
    );
};

export default PriceBreakdown;
