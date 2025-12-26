import { useState } from "react";
import { completeMarketPurchase } from "../api/market";
import { PaymentProvider } from "../types/common";
import { MarketPurchaseRequest, MarketPurchaseResponse } from "../types/market";
import { useAsync } from "../hooks/useAsync";
import PaymentProviderSelector from "../components/PaymentProviderSelector";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";

const MarketPurchasePage: React.FC = () => {
    const { loading, error, execute } = useAsync<MarketPurchaseResponse>();

    const [formData, setFormData] = useState<Omit<MarketPurchaseRequest, "paymentProvider">>({
        itemId: "",
        quantity: 1,
        buyerName: "",
        buyerEmail: "",
        buyerPhone: "",
    });

    const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("ESEWA");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const requestData: MarketPurchaseRequest = {
                ...formData,
                paymentProvider,
            };

            const response = await execute(completeMarketPurchase(requestData));

            if (response && response.paymentData.data.payment_url) {
                window.location.href = response.paymentData.data.payment_url;
            }
        } catch (err) {
            console.error("Purchase failed:", err);
        }
    };

    if (loading) {
        return <Loader fullScreen message="Processing your purchase..." />;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Complete Purchase</h1>

            <ErrorBanner message={error?.message || ""} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Buyer Details</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="buyerName"
                            value={formData.buyerName}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="buyerEmail"
                            value={formData.buyerEmail}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="tel"
                            name="buyerPhone"
                            value={formData.buyerPhone}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                            min="1"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <PaymentProviderSelector
                    selectedProvider={paymentProvider}
                    onSelect={setPaymentProvider}
                />

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium text-lg"
                >
                    Buy Now
                </button>
            </form>
        </div>
    );
};

export default MarketPurchasePage;
