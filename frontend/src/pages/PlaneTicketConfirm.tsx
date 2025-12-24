import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavigationBar from "../components/Navbar";
import Footer from "../components/Footer";
import ApiService from "../services/api.service";
import API_CONFIG from "../config/api";
import { toast } from "react-toastify";
import paymentService from "../services/payment.service";

interface Flight {
    airline: string;
    flightNumber: string;
    classType?: string;
    departureDateTime: string;
    source: string;
    arrivalDateTime: string;
    destination: string;
}

interface Passenger {
    name: string;
    email: string;
}

interface Seat {
    seatNumber: string;
}

interface BookingData {
    bookingId?: string;
    date?: string;
    selectedFlight?: Flight;
    passenger?: Passenger;
    seats?: Seat[];
    totalCost?: number;
}

const PlaneTicketConfirm: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your payment...');

    // Initialize state with localStorage data
    const [bookingData] = useState<BookingData | null>(() => {
        try {
            const storedData = localStorage.getItem("planeListDetails");
            return storedData ? JSON.parse(storedData) : null;
        } catch (error) {
            console.error("Error parsing localStorage:", error);
            return null;
        }
    });

    useEffect(() => {
        const verifyPayment = async () => {
            const esewaData = searchParams.get("data");
            const khaltiPidx = searchParams.get("pidx");
            const imeRefId = searchParams.get("RefId");

            // If no payment params, check if we have booking data directly (e.g. dev mode or direct navigation)
            if (!esewaData && !khaltiPidx && !imeRefId) {
                if (bookingData && bookingData.selectedFlight) {
                    setStatus('success');
                    setMessage('Booking Confirmed');
                } else {
                    navigate("/plane-list");
                }
                return;
            }

            try {
                let provider = '';
                let transactionId = '';
                let providerToken = '';

                if (esewaData) {
                    provider = 'esewa';
                    try {
                        const decoded = JSON.parse(atob(esewaData));
                        transactionId = decoded.transaction_uuid;
                        providerToken = esewaData;
                    } catch (e) {
                        throw new Error("Invalid eSewa payment data");
                    }
                } else if (khaltiPidx) {
                    provider = 'khalti';
                    transactionId = khaltiPidx;

                    // For Khalti, we might need to verify using paymentService.verifyKhaltiPayment
                    // because it handles the specific payload structure expected by backend
                    const callbackParams = {
                        pidx: khaltiPidx,
                        transaction_id: searchParams.get('transaction_id'),
                        tidx: searchParams.get('tidx'),
                        amount: searchParams.get('amount'),
                        mobile: searchParams.get('mobile'),
                        purchase_order_id: searchParams.get('purchase_order_id'),
                        purchase_order_name: searchParams.get('purchase_order_name'),
                        status: searchParams.get('status')
                    };

                    const verifyResult = await paymentService.verifyKhaltiPayment(callbackParams) as { success: boolean, error?: string };
                    if (verifyResult.success) {
                        setStatus('success');
                        setMessage('Payment verified successfully!');
                        toast.success('Payment verified!');
                        return;
                    } else {
                        throw new Error(verifyResult.error || 'Khalti verification failed');
                    }
                } else if (imeRefId) {
                    provider = 'imepay';
                    transactionId = imeRefId;
                    providerToken = searchParams.get("TokenId") || imeRefId;
                }

                // For eSewa and IME Pay (and potentially Khalti if we didn't use the service above)
                if (provider !== 'khalti') {
                    const response = await ApiService.post(`${API_CONFIG.ENDPOINTS.PAYMENT_VERIFY}/${provider}`, {
                        transactionId: transactionId,
                        providerToken: providerToken
                    });

                    if (response) {
                        setStatus('success');
                        setMessage('Payment verified successfully!');
                        toast.success('Payment verified!');
                    } else {
                        throw new Error('Payment verification failed');
                    }
                }

            } catch (error: any) {
                console.error("Payment verification error:", error);
                setStatus('error');
                setMessage(error.message || "Payment verification failed.");
                toast.error(error.message || "Payment verification failed.");
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    if (!bookingData) return null;

    if (status === 'verifying') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <NavigationBar />
                <main className="flex-grow pt-24 pb-12 px-4 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-slate-900">{message}</h2>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <NavigationBar />
                <main className="flex-grow pt-24 pb-12 px-4 flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-red-100">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
                        <p className="text-slate-600 mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/plane-list')}
                            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Back to Flights
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Success View
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
                <div className="bg-white rounded-2xl shadow-lg shadow-orange-500/10 overflow-hidden border border-border">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold font-display">Booking Confirmed!</h1>
                        <p className="text-orange-50 mt-2">Your flight ticket has been successfully booked.</p>
                    </div>

                    {/* Ticket Body */}
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-100">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Booking ID</p>
                                <p className="text-xl font-mono font-bold text-slate-900">{bookingData.bookingId || 'FL-123456'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500 mb-1">Date</p>
                                <p className="font-medium text-slate-900">{bookingData.date ? new Date(bookingData.date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Flight Info */}
                        {bookingData.selectedFlight && (
                            <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{bookingData.selectedFlight.airline}</h3>
                                            <p className="text-xs text-slate-500">{bookingData.selectedFlight.flightNumber}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-slate-900">{bookingData.selectedFlight.classType || 'Economy'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {bookingData.selectedFlight.departureDateTime ? new Date(bookingData.selectedFlight.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                        </p>
                                        <p className="text-sm text-slate-500">{bookingData.selectedFlight.source}</p>
                                    </div>
                                    <div className="flex-1 px-8 flex flex-col items-center">
                                        <div className="w-full h-px bg-slate-300 relative top-3"></div>
                                        <svg className="w-5 h-5 text-slate-400 relative z-10 bg-slate-50 px-1 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-slate-900">
                                            {bookingData.selectedFlight.arrivalDateTime ? new Date(bookingData.selectedFlight.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                        </p>
                                        <p className="text-sm text-slate-500">{bookingData.selectedFlight.destination}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Passenger & Seat Info */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Passenger</p>
                                <p className="font-medium text-slate-900">{bookingData.passenger?.name || 'Guest'}</p>
                                <p className="text-xs text-slate-500">{bookingData.passenger?.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500 mb-1">Seats</p>
                                <p className="font-medium text-slate-900">{bookingData.seats ? bookingData.seats.map((s) => s.seatNumber).join(", ") : 'None'}</p>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                            <span className="text-slate-600">Total Paid</span>
                            <span className="text-2xl font-bold text-sky-600">NPR {bookingData.totalCost || 0}</span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-stone-50 px-8 py-6 border-t border-border flex justify-center gap-4">
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Print Ticket
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 shadow-md transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PlaneTicketConfirm;
