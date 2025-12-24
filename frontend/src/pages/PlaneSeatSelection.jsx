import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/Navbar";
import Footer from "../components/Footer";
import { SeatIcon } from "../components/SeatIcon";
import { toast } from "react-toastify";
import paymentService from "../services/payment.service";

const PlaneSeatSelection = () => {
    const navigate = useNavigate();

    // Initialize state with localStorage data (lazy initialization)
    const [selectedFlight, setSelectedFlight] = useState(() => {
        try {
            const storedData = JSON.parse(localStorage.getItem("planeListDetails"));
            return storedData?.selectedFlight || null;
        } catch (error) {
            console.error("Error parsing localStorage:", error);
            return null;
        }
    });

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [passengerDetails, setPassengerDetails] = useState({
        name: "",
        email: "",
        contact: ""
    });
    const [paymentMethod, setPaymentMethod] = useState("esewa");
    const [isProcessing, setIsProcessing] = useState(false);

    // Separate effect only for navigation
    useEffect(() => {
        if (!selectedFlight) {
            navigate("/plane-list");
        }
    }, [selectedFlight, navigate]);

    const handleSeatClick = (seat) => {
        if (seat.reserved) return;

        setSelectedSeats(prev => {
            if (prev.find(s => s.seatNumber === seat.seatNumber)) {
                return prev.filter(s => s.seatNumber !== seat.seatNumber);
            } else {
                return [...prev, seat];
            }
        });
    };

    const totalCost = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    const handleBooking = async () => {
        if (selectedSeats.length === 0) {
            toast.error("Please select at least one seat.");
            return;
        }
        if (!passengerDetails.name || !passengerDetails.email || !passengerDetails.contact) {
            toast.error("Please fill in all passenger details.");
            return;
        }

        setIsProcessing(true);

        try {
            const tid = `FL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const bookingData = {
                flightId: selectedFlight.id,
                flightNumber: selectedFlight.flightNumber,
                airline: selectedFlight.airline,
                source: selectedFlight.source,
                destination: selectedFlight.destination,
                departureDateTime: selectedFlight.departureDateTime,
                seatNumbers: selectedSeats.map(s => s.seatNumber),
                bookingId: tid,
                seats: selectedSeats,
                passenger: passengerDetails,
                totalCost,
                date: new Date().toISOString()
            };

            // Update the localStorage that the confirmation page reads
            const storedData = JSON.parse(localStorage.getItem("planeListDetails")) || {};
            localStorage.setItem("planeListDetails", JSON.stringify({
                ...storedData,
                ...bookingData // Merge booking data into it
            }));

            const paymentContext = {
                totalAmount: totalCost,
                transactionId: tid,
                productIdentity: tid,
                productName: `Flight ${selectedFlight.flightNumber}`,
                customerInfo: {
                    name: passengerDetails.name,
                    email: passengerDetails.email,
                    phone: passengerDetails.contact
                }
            };

            await paymentService.processPayment(paymentMethod, paymentContext);

        } catch (error) {
            console.error("Flight booking failed:", error);
            toast.error(error.message || "Failed to initiate booking.");
            setIsProcessing(false);
        }
    };

    if (!selectedFlight) return null;

    // Group seats into rows for 3-3 layout
    const rows = [];
    const seats = selectedFlight.seats || [];
    for (let i = 0; i < seats.length; i += 6) {
        rows.push(seats.slice(i, i + 6));
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Select Your Seats</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Seat Map */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                            <div className="flex justify-center mb-8">
                                <div className="w-full max-w-md bg-slate-100 rounded-t-full p-8 pb-4 border-x-4 border-t-4 border-slate-300 relative">
                                    {/* Cockpit area visual */}
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-slate-200 rounded-full opacity-50"></div>

                                    <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between px-8 text-xs font-bold text-slate-400 mb-2">
                                            <div className="flex gap-4"><span>A</span><span>B</span><span>C</span></div>
                                            <div className="flex gap-4"><span>D</span><span>E</span><span>F</span></div>
                                        </div>

                                        {rows.map((row, rowIndex) => (
                                            <div key={rowIndex} className="flex justify-between items-center gap-8">
                                                <div className="flex gap-2">
                                                    {row.slice(0, 3).map(seat => (
                                                        <SeatIcon
                                                            key={seat.seatNumber}
                                                            status={seat.reserved ? 'booked' : selectedSeats.find(s => s.seatNumber === seat.seatNumber) ? 'selected' : 'available'}
                                                            seatNumber={seat.seatNumber}
                                                            className="w-10 h-10 cursor-pointer hover:scale-110 transition-transform"
                                                            onClick={() => handleSeatClick(seat)}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="text-xs text-slate-300 font-mono">{rowIndex + 1}</div>
                                                <div className="flex gap-2">
                                                    {row.slice(3, 6).map(seat => (
                                                        <SeatIcon
                                                            key={seat.seatNumber}
                                                            status={seat.reserved ? 'booked' : selectedSeats.find(s => s.seatNumber === seat.seatNumber) ? 'selected' : 'available'}
                                                            seatNumber={seat.seatNumber}
                                                            className="w-10 h-10 cursor-pointer hover:scale-110 transition-transform"
                                                            onClick={() => handleSeatClick(seat)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-6 mt-8 text-sm border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-2">
                                    <SeatIcon status="available" className="w-5 h-5" />
                                    <span className="text-slate-600">Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <SeatIcon status="booked" className="w-5 h-5" />
                                    <span className="text-slate-600">Booked</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <SeatIcon status="selected" className="w-5 h-5" />
                                    <span className="text-slate-600">Selected</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & Form */}
                    <div className="lg:w-96 flex-shrink-0 space-y-6">
                        {/* Flight Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Flight Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Airline</span>
                                    <span className="font-medium text-slate-900">{selectedFlight.airline}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Flight No</span>
                                    <span className="font-medium text-slate-900">{selectedFlight.flightNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Route</span>
                                    <span className="font-medium text-slate-900">{selectedFlight.source} - {selectedFlight.destination}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Date</span>
                                    <span className="font-medium text-slate-900">{new Date(selectedFlight.departureDateTime).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Passenger Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={passengerDetails.name}
                                        onChange={(e) => setPassengerDetails({ ...passengerDetails, name: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={passengerDetails.email}
                                        onChange={(e) => setPassengerDetails({ ...passengerDetails, email: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={passengerDetails.contact}
                                        onChange={(e) => setPassengerDetails({ ...passengerDetails, contact: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                        placeholder="+977 9800000000"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Method</h3>
                            <div className="space-y-3">
                                <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="esewa"
                                        checked={paymentMethod === 'esewa'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="ml-3 font-medium text-slate-700">eSewa</span>
                                </label>
                                <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="khalti"
                                        checked={paymentMethod === 'khalti'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="ml-3 font-medium text-slate-700">Khalti</span>
                                </label>
                                <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="imepay"
                                        checked={paymentMethod === 'imepay'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="ml-3 font-medium text-slate-700">IME Pay</span>
                                </label>
                            </div>
                        </div>

                        {/* Price & Checkout */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-600">Selected Seats ({selectedSeats.length})</span>
                                <span className="font-bold text-slate-900">{selectedSeats.map(s => s.seatNumber).join(", ")}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold text-slate-900 mb-6 pt-4 border-t border-slate-100">
                                <span>Total Amount</span>
                                <span className="text-sky-600">NPR {totalCost}</span>
                            </div>
                            <button
                                onClick={handleBooking}
                                disabled={selectedSeats.length === 0 || isProcessing}
                                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    `Pay with ${paymentMethod === 'esewa' ? 'eSewa' : paymentMethod === 'khalti' ? 'Khalti' : 'IME Pay'}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PlaneSeatSelection;
