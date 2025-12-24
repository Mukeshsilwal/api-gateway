import { useLocation, useNavigate } from 'react-router-dom';
import NavigationBar from '../components/Navbar';
import Footer from '../components/Footer';

interface BookingData {
    confirmationNumber?: string;
    bookingId?: string;
    hotelName: string;
    roomType: string;
    numberOfRooms: number;
    checkInDate: string;
    checkOutDate: string;
    status: string;
    currency: string;
    totalAmount: number;
    [key: string]: any;
}

const HotelBookingConfirmation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingData } = location.state || {};

    if (!bookingData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <NavigationBar />
                <main className="flex-grow pt-24 pb-12 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Booking Found</h2>
                        <button
                            onClick={() => navigate('/hotels')}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Back to Hotels
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Extract data from the nested structure if present, or use direct properties
    const data: BookingData = bookingData.data || bookingData;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        {/* Success Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-10 text-center text-white">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                            <p className="text-green-50 opacity-90 text-lg">Your hotel reservation has been successfully placed.</p>
                        </div>

                        {/* Receipt Body */}
                        <div className="p-8 md:p-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Confirmation Number</p>
                                    <p className="text-2xl font-mono font-bold text-gray-900">{data.confirmationNumber || 'N/A'}</p>
                                </div>
                                <div className="mt-4 md:mt-0 text-right">
                                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Booking ID</p>
                                    <p className="text-lg font-medium text-gray-700">{data.bookingId || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="text-gray-900 font-bold text-lg mb-4">Hotel Details</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Hotel Name</p>
                                            <p className="font-semibold text-gray-900">{data.hotelName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Room Type</p>
                                            <p className="font-medium text-gray-900 capitalize">{data.roomType}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Rooms</p>
                                            <p className="font-medium text-gray-900">{data.numberOfRooms}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-bold text-lg mb-4">Stay Dates</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Check-in</p>
                                            <p className="font-semibold text-gray-900">{data.checkInDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Check-out</p>
                                            <p className="font-semibold text-gray-900">{data.checkOutDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {data.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="text-2xl font-bold text-indigo-600">
                                        {data.currency} {data.totalAmount?.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 text-right">Includes all taxes and fees</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => window.print()}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print Receipt
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default HotelBookingConfirmation;
