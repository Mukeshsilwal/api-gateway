import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/Navbar";
import Footer from "../components/Footer";
import { SeatIcon } from "../components/SeatIcon";
import { toast } from "react-toastify";
import paymentService from "../services/payment.service";

interface Seat {
    seatNumber: string;
    reserved: boolean;
    price: number;
}

interface Flight {
    id: string;
    flightNumber: string;
    airline: string;
    source: string;
    destination: string;
    departureDateTime: string;
    seats: Seat[];
}

interface PassengerDetails {
    name: string;
    email: string;
    contact: string;
}

const PlaneSeatSelection = () => {
    const navigate = useNavigate();

    // Initialize state with localStorage data (lazy initialization)
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(() => {
        try {
            const storedData = localStorage.getItem("planeListDetails");
            const parsedData = storedData ? JSON.parse(storedData) : null;
            return parsedData?.selectedFlight || null;
        } catch (error) {
            console.error("Error parsing localStorage:", error);
            return null;
        }
    });

    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [passengerDetails, setPassengerDetails] = useState<PassengerDetails>({
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

    const handleSeatClick = (seat: Seat) => {
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

        if (!selectedFlight) return;

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
            const storedDataStr = localStorage.getItem("planeListDetails");
            const storedData = storedDataStr ? JSON.parse(storedDataStr) : {};
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

            await paymentService.processPayment(paymentMethod as any, paymentContext);

        } catch (error: any) {
            console.error("Flight booking failed:", error);
            toast.error(error.message || "Failed to initiate booking.");
            setIsProcessing(false);
        }
    };

    if (!selectedFlight) return null;

    // Group seats into rows for 3-3 layout
    const rows: Seat[][] = [];
    const seats = selectedFlight.seats || [];
    for (let i = 0; i < seats.length; i += 6) {
        rows.push(seats.slice(i, i + 6));
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <h1 className="text-3xl font-bold text-foreground mb-8">Select Your Seats</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Seat Map */}
                    <div className="flex-1">
                        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
                            <div className="flex justify-center mb-8">
                                <div className="w-full max-w-md bg-muted rounded-t-full p-8 pb-4 border-x-4 border-t-4 border-muted-foreground/20 relative">
                                    {/* Cockpit area visual */}
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-muted-foreground/20 rounded-full opacity-50"></div>

                                    <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between px-8 text-xs font-bold text-muted-foreground mb-2">
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
                                                <div className="text-xs text-muted-foreground font-mono">{rowIndex + 1}</div>
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

                            <div className="flex justify-center gap-6 mt-8 text-sm border-t border-border pt-6">
                                <div className="flex items-center gap-2">
                                    <SeatIcon status="available" className="w-5 h-5" />
                                    <span className="text-muted-foreground">Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <SeatIcon status="booked" className="w-5 h-5" />
                                    <span className="text-muted-foreground">Booked</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <SeatIcon status="selected" className="w-5 h-5" />
                                    <span className="text-muted-foreground">Selected</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & Form */}
                    <div className="lg:w-96 flex-shrink-0 space-y-6">
                        {/* Flight Summary */}
                        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                            <h3 className="text-lg font-bold text-foreground mb-4">Flight Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Airline</span>
                                    <span className="font-medium text-foreground">{selectedFlight.airline}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Flight No</span>
                                    <span className="font-medium text-foreground">{selectedFlight.flightNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Route</span>
                                    <span className="font-medium text-foreground">{selectedFlight.source} - {selectedFlight.destination}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date</span>
                                    <span className="font-medium text-foreground">{new Date(selectedFlight.departureDateTime).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Form */}
                        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                            <h3 className="text-lg font-bold text-foreground mb-4">Passenger Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={passengerDetails.name}
                                        onChange={(e) => setPassengerDetails({ ...passengerDetails, name: e.target.value })}
                                        className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={passengerDetails.email}
                                        onChange={(e) => setPassengerDetails({ ...passengerDetails, email: e.target.value })}
                                        className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={passengerDetails.contact}
                                        onChange={(e) => setPassengerDetails({ ...passengerDetails, contact: e.target.value })}
                                        className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                                        placeholder="+977 9800000000"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                            <h3 className="text-lg font-bold text-foreground mb-4">Payment Method</h3>
                            <div className="space-y-3">
                                <label className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="esewa"
                                        checked={paymentMethod === 'esewa'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="ml-3 font-medium text-foreground">eSewa</span>
                                </label>
                                <label className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="khalti"
                                        checked={paymentMethod === 'khalti'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="ml-3 font-medium text-foreground">Khalti</span>
                                </label>
                                <label className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="imepay"
                                        checked={paymentMethod === 'imepay'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="ml-3 font-medium text-foreground">IME Pay</span>
                                </label>
                            </div>
                        </div>

                        {/* Price & Checkout */}
                        <div className="bg-card rounded-xl shadow-sm border border-border p-6 sticky top-24">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-muted-foreground">Selected Seats ({selectedSeats.length})</span>
                                <span className="font-bold text-foreground">{selectedSeats.map(s => s.seatNumber).join(", ")}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold text-foreground mb-6 pt-4 border-t border-border">
                                <span>Total Amount</span>
                                <span className="text-primary">NPR {totalCost}</span>
                            </div>
                            <button
                                onClick={handleBooking}
                                disabled={selectedSeats.length === 0 || isProcessing}
                                className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
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
