import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QfxService from '../services/qfx.service';
import MainLayout from '../components/MainLayout';
import { toast } from 'react-toastify';

const QfxSeatSelection = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const [layout, setLayout] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchLayout = async () => {
            try {
                const res = await QfxService.getSeatLayout(showtimeId);
                setLayout(res.data);
            } catch (error) {
                console.error('Error fetching seat layout:', error);
                toast.error('Failed to load seat layout');
            } finally {
                setLoading(false);
            }
        };

        fetchLayout();
    }, [showtimeId]);

    const handleSeatClick = (seat) => {
        if (seat.Status === 'BOOKED') return;

        // Use SeatID if available, fallback to id or SeatNumber
        const seatId = seat.SeatID || seat.id || seat.SeatNumber;
        const isSelected = selectedSeats.some((s) => (s.SeatID || s.id || s.SeatNumber) === seatId);

        if (isSelected) {
            setSelectedSeats(selectedSeats.filter((s) => (s.SeatID || s.id || s.SeatNumber) !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const calculateTotal = () => {
        return selectedSeats.reduce((total, seat) => total + seat.Price, 0);
    };

    const handleProceed = async () => {
        if (selectedSeats.length === 0) {
            toast.warning('Please select at least one seat');
            return;
        }

        setProcessing(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                toast.error('Please login to book tickets');
                navigate('/login');
                return;
            }

            const bookingData = {
                customerId: user.id || 'CUST001', // Fallback for demo
                amount: calculateTotal(),
                metadata: {
                    showtimeId: showtimeId,
                    movieName: layout.MovieName,
                    showTime: layout.ShowTime,
                    seats: selectedSeats.map(s => s.SeatNumber).join(','),
                    customerName: user.name || 'Guest User',
                    customerEmail: user.email || 'guest@example.com',
                    customerPhone: user.phone || '9800000000'
                }
            };

            const res = await QfxService.bookTicket(bookingData);
            if (res.status === 200 || res.status === 201) {
                toast.success('Booking successful!');
                navigate('/qfx/confirmation', {
                    state: {
                        booking: res.data,
                        movieName: layout.MovieName,
                        cinemaName: layout.CinemaName,
                        showTime: layout.ShowTime,
                        seats: selectedSeats.map(s => s.SeatNumber).join(',')
                    }
                });
            }
        } catch (error) {
            console.error('Booking failed:', error);
            toast.error('Booking failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            </MainLayout>
        );
    }

    if (!layout) {
        return (
            <MainLayout>
                <div className="text-center py-12 text-gray-500">Layout not found.</div>
            </MainLayout>
        );
    }

    // Group seats by row
    const rows = {};
    // Check if layout.Seats exists and is an array
    const seats = Array.isArray(layout.Seats) ? layout.Seats : [];

    seats.forEach(seat => {
        const row = seat.SeatNumber.charAt(0);
        if (!rows[row]) rows[row] = [];
        rows[row].push(seat);
    });

    return (
        <MainLayout>
            <div className="bg-gray-900 text-white min-h-screen py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold mb-2">{layout.MovieName}</h1>
                        <p className="text-gray-400">
                            {layout.CinemaName} | {new Date(layout.ShowTime).toLocaleString()}
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Seat Map */}
                        <div className="flex-1 bg-gray-800 rounded-lg p-8 overflow-x-auto">
                            <div className="w-full h-2 bg-gray-600 rounded-full mb-12 relative">
                                <span className="absolute top-4 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm uppercase tracking-widest">Screen</span>
                            </div>

                            <div className="space-y-4 min-w-[600px]">
                                {Object.keys(rows).sort().map(rowLabel => (
                                    <div key={rowLabel} className="flex items-center justify-center gap-4">
                                        <span className="w-6 text-center font-bold text-gray-500">{rowLabel}</span>
                                        <div className="flex gap-2">
                                            {rows[rowLabel].sort((a, b) => parseInt(a.SeatNumber.slice(1)) - parseInt(b.SeatNumber.slice(1))).map(seat => {
                                                const isSelected = selectedSeats.some(s => s.id === seat.id); // Assuming id is still lowercase or check API
                                                // Let's assume SeatID or just use SeatNumber as key if ID is missing, but usually ID is there.
                                                // Checking previous mock data, it didn't show seat ID. Let's assume SeatID if available, else fallback.
                                                // Actually, let's stick to PascalCase for everything.
                                                const seatId = seat.SeatID || seat.id;
                                                const isSelectedSeat = selectedSeats.some(s => (s.SeatID || s.id) === seatId);
                                                const isBooked = seat.Status === 'BOOKED';

                                                let seatColor = 'bg-gray-600 hover:bg-gray-500'; // Available
                                                if (isBooked) seatColor = 'bg-red-900 cursor-not-allowed';
                                                if (isSelectedSeat) seatColor = 'bg-green-500 hover:bg-green-400';

                                                return (
                                                    <button
                                                        key={seatId}
                                                        disabled={isBooked}
                                                        onClick={() => handleSeatClick(seat)}
                                                        className={`w-8 h-8 rounded-t-lg text-xs flex items-center justify-center transition-colors ${seatColor}`}
                                                        title={`${seat.SeatNumber} - Rs.${seat.Price}`}
                                                    >
                                                        {seat.SeatNumber.slice(1)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 flex justify-center gap-8 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                                    <span>Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                    <span>Selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-900 rounded"></div>
                                    <span>Booked</span>
                                </div>
                            </div>
                        </div>

                        {/* Booking Summary */}
                        <div className="w-full lg:w-80 bg-gray-800 rounded-lg p-6 h-fit">
                            <h3 className="text-xl font-bold mb-6 border-b border-gray-700 pb-4">Booking Summary</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-400">
                                    <span>Seats</span>
                                    <span className="text-white font-medium">
                                        {selectedSeats.map(s => s.SeatNumber).join(', ') || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Count</span>
                                    <span className="text-white font-medium">{selectedSeats.length}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-700">
                                    <span>Total</span>
                                    <span className="text-orange-500">Rs. {calculateTotal()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleProceed}
                                disabled={processing || selectedSeats.length === 0}
                                className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                {processing ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default QfxSeatSelection;
