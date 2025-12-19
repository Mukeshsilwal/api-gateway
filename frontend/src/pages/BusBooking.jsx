import React, { useMemo } from 'react';
import SeatLayout from '../components/SeatLayout';
import SeatLegend from '../components/SeatLegend';
import useSeatSelection from '../hooks/useSeatSelection';
import { useNavigate } from 'react-router-dom';

const BusBooking = () => {
    const navigate = useNavigate();

    // Mock Data Generation
    const mockSeats = useMemo(() => {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const seats = [];

        rows.forEach(row => {
            // 2x2 Layout: 1, 2 (aisle) 3, 4
            [1, 2, 3, 4].forEach(num => {
                const id = `${row}${num}`;
                let status = 'available';
                let type = 'standard';
                let price = 1200;

                // Randomly assign status
                if (Math.random() < 0.2) status = 'booked';
                else if (Math.random() < 0.05) status = 'ladies';

                // Last row sleeper
                if (row === 'J') {
                    type = 'sleeper';
                    price = 1500;
                }

                seats.push({ id, status, type, price });
            });
        });
        return seats;
    }, []);

    const { selectedSeats, totalPrice, toggleSeat } = useSeatSelection(mockSeats, 6);

    const handleProceed = () => {
        if (selectedSeats.length === 0) return;
        // Navigate to checkout or payment
        console.log('Proceeding with seats:', selectedSeats);
        // navigate('/checkout', { state: { selectedSeats, totalPrice } });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900">Select Your Seats</h1>
                    <p className="text-gray-500 mt-2">Kathmandu to Pokhara • Luxury Sofa Bus</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Column: Seat Map */}
                    <div className="w-full lg:w-2/3 space-y-6">
                        <SeatLegend />
                        <SeatLayout
                            seats={mockSeats}
                            layoutType="2x2"
                            selectedSeats={selectedSeats}
                            onToggleSeat={toggleSeat}
                        />
                    </div>

                    {/* Right Column: Checkout Summary (Sticky) */}
                    <div className="w-full lg:w-1/3 lg:sticky lg:top-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h2>

                            {selectedSeats.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        {selectedSeats.map(seat => (
                                            <div key={seat.id} className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-gray-700">Seat {seat.id}</span>
                                                <span className="text-gray-500">Rs. {seat.price}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="h-px bg-gray-200 my-4"></div>

                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total Amount</span>
                                        <span className="text-indigo-600">Rs. {totalPrice}</span>
                                    </div>

                                    <button
                                        onClick={handleProceed}
                                        className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                                    >
                                        Proceed to Payment
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <p>Please select seats to proceed</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusBooking;
