import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const QfxBookingConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { booking, movieName, cinemaName, showTime, seats } = location.state || {};

    if (!booking) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-screen">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Booking Found</h2>
                    <button
                        onClick={() => navigate('/qfx/movies')}
                        className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                        Browse Movies
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-green-500 px-6 py-4 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-2">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
                        <p className="text-green-100 text-sm mt-1">Your tickets have been booked successfully.</p>
                    </div>

                    <div className="px-6 py-8">
                        <div className="mb-6 text-center">
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Booking ID</p>
                            <p className="text-3xl font-mono font-bold text-gray-800">
                                {booking.providerBookingId || booking.ProviderBookingId || booking.id}
                            </p>
                        </div>

                        <div className="space-y-4 border-t border-b border-gray-100 py-6">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Movie</span>
                                <span className="font-medium text-gray-900">{movieName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Cinema</span>
                                <span className="font-medium text-gray-900">{cinemaName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Date & Time</span>
                                <span className="font-medium text-gray-900">
                                    {new Date(showTime).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Seats</span>
                                <span className="font-medium text-gray-900">{seats}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount Paid</span>
                                <span className="font-bold text-orange-600">
                                    Rs. {booking.amount || booking.Amount}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button
                                onClick={() => window.print()}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none"
                            >
                                Print Ticket
                            </button>
                            <button
                                onClick={() => navigate('/qfx/movies')}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                Book Another Movie
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default QfxBookingConfirmation;
