import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useBusSeats, useHoldSeats, useCreateBusBooking } from '../../hooks/useApi';
import SeatMap from '../../components/booking/SeatMap';
import { ArrowLeft, Users } from 'lucide-react';
import type { PassengerDetail } from '../../types/dto';

/**
 * Bus Seat Selection Page
 * Interactive seat selection with passenger details
 */
const BusSeatSelectionPage: React.FC = () => {
    const { busId } = useParams<{ busId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [step, setStep] = useState<'seats' | 'details' | 'confirm'>('seats');
    const [passengerDetails, setPassengerDetails] = useState<PassengerDetail[]>([]);

    const { data: seats, isLoading } = useBusSeats(parseInt(busId || '0'));
    const holdSeatsMutation = useHoldSeats();
    const createBookingMutation = useCreateBusBooking();

    const handleSeatSelect = (seatNumber: string) => {
        setSelectedSeats(prev => {
            if (prev.includes(seatNumber)) {
                return prev.filter(s => s !== seatNumber);
            } else {
                return [...prev, seatNumber];
            }
        });
    };

    const handleContinue = async () => {
        if (step === 'seats') {
            // Hold seats
            await holdSeatsMutation.mutateAsync({
                busId: parseInt(busId || '0'),
                seatIds: selectedSeats.map(s => parseInt(s)),
            });

            // Initialize passenger details
            setPassengerDetails(selectedSeats.map(seatNumber => ({
                firstName: '',
                lastName: '',
                seatNumber,
            })));

            setStep('details');
        } else if (step === 'details') {
            setStep('confirm');
        } else {
            // Create booking
            const booking = await createBookingMutation.mutateAsync({
                busId: parseInt(busId || '0'),
                seatIds: selectedSeats.map(s => parseInt(s)),
                passengerDetails,
                travelDate: location.state?.searchParams?.date || '',
                contactEmail: 'user@example.com', // Would come from auth
                contactPhone: '+977-9800000000',
            });

            // Navigate to payment
            navigate(`/payment/${booking.bookingReference}`);
        }
    };

    const updatePassengerDetail = (index: number, field: keyof PassengerDetail, value: any) => {
        setPassengerDetails(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const totalPrice = selectedSeats.reduce((total, seatNumber) => {
        const seat = seats?.find(s => s.seatNumber === seatNumber);
        return total + (seat?.price || 0);
    }, 0);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <button
                    onClick={() => step === 'seats' ? navigate(-1) : setStep(step === 'details' ? 'seats' : 'details')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-4">
                        {['Select Seats', 'Passenger Details', 'Confirm'].map((label, idx) => {
                            const stepIndex = ['seats', 'details', 'confirm'].indexOf(step);
                            const isActive = idx === stepIndex;
                            const isCompleted = idx < stepIndex;

                            return (
                                <React.Fragment key={label}>
                                    <div className={`flex items-center gap-2 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${isActive ? 'bg-blue-500 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium">{label}</span>
                                    </div>
                                    {idx < 2 && <div className="w-16 h-0.5 bg-gray-300"></div>}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {step === 'seats' && seats && (
                            <SeatMap
                                seats={seats}
                                selectedSeats={selectedSeats}
                                onSeatSelect={handleSeatSelect}
                                maxSeats={4}
                            />
                        )}

                        {step === 'details' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Users size={24} />
                                    Passenger Details
                                </h2>

                                <div className="space-y-6">
                                    {passengerDetails.map((passenger, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold text-gray-900 mb-3">
                                                Passenger {idx + 1} - Seat {passenger.seatNumber}
                                            </h3>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        First Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={passenger.firstName}
                                                        onChange={(e) => updatePassengerDetail(idx, 'firstName', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Last Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={passenger.lastName}
                                                        onChange={(e) => updatePassengerDetail(idx, 'lastName', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Age
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={passenger.age || ''}
                                                        onChange={(e) => updatePassengerDetail(idx, 'age', parseInt(e.target.value))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Gender
                                                    </label>
                                                    <select
                                                        value={passenger.gender || ''}
                                                        onChange={(e) => updatePassengerDetail(idx, 'gender', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="MALE">Male</option>
                                                        <option value="FEMALE">Female</option>
                                                        <option value="OTHER">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 'confirm' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    Confirm Booking
                                </h2>

                                <div className="space-y-4">
                                    {passengerDetails.map((passenger, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-semibold">{passenger.firstName} {passenger.lastName}</div>
                                                <div className="text-sm text-gray-600">Seat {passenger.seatNumber}</div>
                                            </div>
                                            <div className="font-semibold">
                                                NPR {seats?.find(s => s.seatNumber === passenger.seatNumber)?.price.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                            <h3 className="font-bold text-gray-900 mb-4">Booking Summary</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Selected Seats</span>
                                    <span className="font-semibold">{selectedSeats.length}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Seats</span>
                                    <span className="font-semibold">{selectedSeats.join(', ')}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        NPR {totalPrice.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleContinue}
                                disabled={selectedSeats.length === 0 || (step === 'details' && passengerDetails.some(p => !p.firstName || !p.lastName))}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {step === 'seats' ? 'Continue' : step === 'details' ? 'Review Booking' : 'Proceed to Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusSeatSelectionPage;
