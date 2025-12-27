import { useState } from "react";
import { completeBusBooking } from "../api/bus";
import { PaymentProvider } from "../types/common";
import { BusBookingRequest, BusBookingResponse } from "../types/bus";
import { useAsync } from "../hooks/useAsync";
import PaymentProviderSelector from "../components/PaymentProviderSelector";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";

import { useSearchParams } from "react-router-dom";

const BusBookingPage: React.FC = () => {
    const { loading, error, execute } = useAsync<BusBookingResponse>();
    const [searchParams] = useSearchParams();
    const tripIdParam = searchParams.get("tripId") || "";

    // State for form fields
    const [formData, setFormData] = useState<Omit<BusBookingRequest, "paymentProvider">>({
        tripId: tripIdParam,
        seatIds: [],   // To be populated from selection
        passengerName: "",
        passengerEmail: "",
        passengerPhone: "",
    });

    const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("ESEWA");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const requestData: BusBookingRequest = {
                ...formData,
                paymentProvider,
            };

            const response = await execute(completeBusBooking(requestData));

            if (response && response.paymentData.data.payment_url) {
                window.location.href = response.paymentData.data.payment_url;
            }
        } catch (err) {
            console.error("Booking failed:", err);
        }
    };

    if (loading) {
        return <Loader fullScreen message="Processing your bus booking..." />;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Complete Bus Booking</h1>

            <ErrorBanner message={error?.message || ""} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Passenger Details</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="passengerName"
                            value={formData.passengerName}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="passengerEmail"
                            value={formData.passengerEmail}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="tel"
                            name="passengerPhone"
                            value={formData.passengerPhone}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <PaymentProviderSelector
                    selectedProvider={paymentProvider}
                    onSelect={setPaymentProvider}
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-lg"
                >
                    Confirm & Pay
                </button>
            </form>
        </div>
    );
};

export default BusBookingPage;
