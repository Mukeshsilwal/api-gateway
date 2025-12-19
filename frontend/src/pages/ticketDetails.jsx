import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import SelectedBusContext from "../context/selectedbus";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ApiService from "../services/api.service";
import API_CONFIG from "../config/api";
import authService from "../services/authService";
import { validateBookingForm } from "../utils/validators";
import Logger from "../utils/logger";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import SeatLayout from "../components/SeatLayout";
import useSeatSelection from "../hooks/useSeatSelection";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { User, Mail, Phone, MapPin, Calendar, Clock, CreditCard, ShieldCheck } from "lucide-react";
import { getEsewaPayload, generateEsewaForm } from "../utils/paymentUtils";

export default function TicketDetails() {
  const { selectedBus: initialBus } = useContext(SelectedBusContext);
  const [selectedBus, setSelectedBus] = useState(initialBus || {});
  const navigate = useNavigate();
  const location = useLocation();

  // Load complete details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      if (initialBus?.id) {
        try {
          const completeInfo = await (await import("../services/busService")).default.getBusCompleteDetails(initialBus.id);
          // Merge context data with complete info
          // The structure of completeInfo is { bus, seats, busStops, ... }
          // We need to map it to what the component expects.
          // Component expects `selectedBus` to have `seats`, `busName`, `route12`, etc.

          if (completeInfo && completeInfo.bus) {
            setSelectedBus(prev => ({
              ...prev,
              ...completeInfo.bus, // Update bus details
              seats: completeInfo.seats, // Update seats (most important)
              busStops: completeInfo.busStops
            }));
          }
        } catch (error) {
          console.error("Failed to fetch complete bus info", error);
          toast.error("Failed to refresh seat availability.");
        }
      }
    };
    fetchDetails();
  }, [initialBus?.id]);

  // Use the custom hook for seat selection
  const {
    selectedSeats,
    totalPrice,
    toggleSeat,
    clearSelection
  } = useSeatSelection([], 6); // Max 6 seats

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [provider, setProvider] = useState("esewa");

  // Reset selection if bus changes
  useEffect(() => {
    clearSelection();
  }, [selectedBus?.id, clearSelection]);

  // -----------------------------------
  // GENERATE RANDOM TRANSACTION ID
  // -----------------------------------
  function generateRandomId() {
    return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
  }


  // -----------------------------------
  // BOOK TICKET MAIN FUNCTION
  // -----------------------------------
  async function bookTicket() {
    // Force Login Check
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please login to proceed with payment.");
      navigate("/login", { state: { from: location } });
      return;
    }

    // Get User Data
    const userData = authService.getUserData();
    const userId = userData?.id || 0;

    // Extract seat numbers for validation
    const seatNumbers = selectedSeats.map(s => s.seatNumber);

    // Enhanced validation using validators utility
    const validation = validateBookingForm({
      name,
      email,
      contact,
      selectedSeats: seatNumbers
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    setFormErrors({});
    setIsBooking(true);

    try {
      const seatIds = selectedSeats.map(s => s.id);

      // Unified Bus Booking Payload
      const bookingPayload = {
        type: 'bus',
        busId: selectedBus.id || selectedBus._id,
        seatIds: seatIds,
        seatNumbers: seatNumbers,
        departureDateTime: selectedBus.departureDateTime,
        userId: Number(userId),
        contactDetails: {
          fullName: validation.sanitized.name,
          email: validation.sanitized.email,
          phone: contact
        },
        passengerDetails: [
          {
            fullName: validation.sanitized.name,
            email: validation.sanitized.email,
            phone: contact,
            seatIds: seatIds,
            seatNumbers: seatNumbers
          }
        ],
        paymentMethod: provider,
        amount: totalPrice,
        redirectUrl: `${window.location.origin}/payments/${provider}/success`,
        failureUrl: `${window.location.origin}/payments/${provider}/failure`
      };

      // Call Unified Endpoint (Aggregator API)
      const response = await ApiService.post(`${API_CONFIG.BFF_PREFIX}/bookings/complete`, bookingPayload);
      const data = response.data || response;

      // Store booking details for confirmation page (legacy support)
      localStorage.setItem("bookingRes", JSON.stringify(data));
      localStorage.setItem("seatRes", JSON.stringify(seatNumbers));
      localStorage.setItem("selectedSeats", JSON.stringify(seatNumbers));
      localStorage.setItem("email", email);

      // Extract booking and payment data
      const { bookingData, paymentData } = data;

      if (bookingData && paymentData) {
        const { bookingId } = bookingData;
        const { amount, provider: paymentProvider } = paymentData;

        // STEP 2: Initiate payment for eSewa
        if (paymentProvider === 'esewa' || provider === 'esewa') {
          const paymentService = (await import('../services/paymentService')).default;
          const paymentResponse = await paymentService.initiateEsewaPayment(amount, { bookingId });

          if (paymentResponse.status === 'SUCCESS' && paymentResponse.data) {
            const { gatewayUrl, method, params } = paymentResponse.data;

            // STEP 3: Redirect to eSewa
            if (method === 'POST' && gatewayUrl && params) {
              const { redirectToGateway } = await import('../utils/redirectToGateway');
              redirectToGateway(gatewayUrl, params);
            } else if (gatewayUrl) {
              window.location.href = gatewayUrl;
            }
          } else {
            throw new Error('Payment initiation failed');
          }
        } else {
          // Fallback for other payment methods
          toast.success("Ticket booked successfully!");
          navigate('/ticket-confirm');
        }
      } else {
        // Legacy response handling
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else if (data.paymentParams && provider === 'esewa') {
          const { generateEsewaForm } = await import("../utils/paymentUtils");
          generateEsewaForm(data.paymentParams);
        } else {
          toast.success("Ticket booked successfully!");
          navigate('/ticket-confirm');
        }
      }

    } catch (err) {
      Logger.error("Booking/Payment Error:", err);
      toast.error(err.message || "Failed to process booking.");
      setIsBooking(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Complete Your Booking</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Passenger & Seats */}
          <div className="flex-1 space-y-8">
            {/* Passenger Details */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
                Passenger Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  error={formErrors.name}
                  icon={User}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  error={formErrors.email}
                  icon={Mail}
                  required
                />

                <div className="md:col-span-2">
                  <Input
                    label="Contact Number"
                    type="tel"
                    placeholder="+977 9800000000"
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);
                      if (formErrors.contact) setFormErrors(prev => ({ ...prev, contact: undefined }));
                    }}
                    error={formErrors.contact}
                    icon={Phone}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Seat Selection */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
                Select Seats
              </h2>

              <div className="flex flex-col items-center">
                {selectedBus?.seats ? (
                  <SeatLayout
                    seats={selectedBus.seats}
                    layoutType={selectedBus.seatLayout?.type || '2x2'}
                    selectedSeats={selectedSeats}
                    onToggleSeat={toggleSeat}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Loading seat map...
                  </div>
                )}

                <div className="flex gap-6 mt-8 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-gray-300 bg-white"></div>
                    <span className="text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div>
                    <span className="text-gray-600">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary border border-primary"></div>
                    <span className="text-gray-600">Selected</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:w-96 flex-shrink-0">
            <Card className="sticky top-24 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Booking Summary</h2>

              <div className="space-y-6">
                <div className="pb-6 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Bus Operator</p>
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-primary" />
                    {selectedBus?.busName || 'Standard Bus'}
                  </p>
                </div>

                <div className="pb-6 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Route</p>
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{selectedBus?.route12?.sourceBusStop?.name || 'Source'}</span>
                    <span className="text-gray-300">→</span>
                    <span>{selectedBus?.route12?.destinationBusStop?.name || 'Destination'}</span>
                  </div>
                </div>

                <div className="pb-6 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Departure</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="font-medium">
                        {selectedBus?.departureDateTime ? new Date(selectedBus.departureDateTime).toLocaleDateString() : "TBD"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Clock size={16} className="text-gray-400" />
                      <span className="font-medium">
                        {selectedBus?.departureDateTime ? new Date(selectedBus.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pb-6 border-b border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Selected Seats ({selectedSeats.length})</span>
                    <span className="font-medium text-gray-900">
                      {selectedSeats.map(s => s.seatNumber).join(", ") || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 mt-4">
                    <span>Total Amount</span>
                    <span className="text-primary">NPR {totalPrice}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">Payment Method</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setProvider('esewa')}
                      className={`py-2 px-1 border rounded-lg text-xs font-bold transition-all ${provider === 'esewa' ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      eSewa
                    </button>
                    <button
                      onClick={() => setProvider('khalti')}
                      className={`py-2 px-1 border rounded-lg text-xs font-bold transition-all ${provider === 'khalti' ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      Khalti
                    </button>
                    <button
                      onClick={() => setProvider('imepay')}
                      className={`py-2 px-1 border rounded-lg text-xs font-bold transition-all ${provider === 'imepay' ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      IME Pay
                    </button>
                  </div>
                </div>

                <Button
                  onClick={bookTicket}
                  disabled={isBooking || selectedSeats.length === 0}
                  className="w-full py-4 text-lg shadow-xl shadow-primary/20"
                  isLoading={isBooking}
                  style={{
                    backgroundColor: provider === 'khalti' ? '#5c2d91' : provider === 'imepay' ? '#ed1c24' : undefined,
                  }}
                >
                  {isBooking ? 'Processing...' : `Pay NPR ${totalPrice}`}
                </Button>

                <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                  <ShieldCheck size={12} /> Secure Payment
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
