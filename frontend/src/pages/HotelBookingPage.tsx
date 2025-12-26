import { useState } from "react";
import { completeHotelBooking } from "../api/hotel";
import { PaymentProvider } from "../types/common";
import { HotelBookingRequest, HotelBookingResponse } from "../types/hotel";
import { useAsync } from "../hooks/useAsync";
import PaymentProviderSelector from "../components/PaymentProviderSelector";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";

const HotelBookingPage: React.FC = () => {
    const { loading, error, execute } = useAsync<HotelBookingResponse>();

    const [formData, setFormData] = useState<Omit<HotelBookingRequest, "paymentProvider">>({
        hotelId: "",
        roomId: "",
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        guestName: "",
        guestEmail: "",
        guestPhone: "",
    });

    const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("ESEWA");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const requestData: HotelBookingRequest = {
                ...formData,
                paymentProvider,
            };

            const response = await execute(completeHotelBooking(requestData));

            if (response && response.paymentData.data.payment_url) {
                window.location.href = response.paymentData.data.payment_url;
            }
        } catch (err) {
            console.error("Booking failed:", err);
        }
    };

    if (loading) {
        return <Loader fullScreen message="Securing your room..." />;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Hotel Booking</h1>

            <ErrorBanner message={error?.message || ""} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Guest Details</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Guest Name</label>
                        <input
                            type="text"
                            name="guestName"
                            value={formData.guestName}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="guestEmail"
                            value={formData.guestEmail}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="tel"
                            name="guestPhone"
                            value={formData.guestPhone}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <PaymentProviderSelector
                    selectedProvider={paymentProvider}
                    onSelect={setPaymentProvider}
                />

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium text-lg"
                >
                    Book Room
                </button>
            </form>
        </div>
    );
};

export default HotelBookingPage;
