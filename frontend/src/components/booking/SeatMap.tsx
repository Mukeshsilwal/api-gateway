import React, { useState, useEffect } from 'react';
import { SeatDto } from '../../types/dto';
import { Check, X, Clock } from 'lucide-react';

interface SeatMapProps {
    seats: SeatDto[];
    selectedSeats: string[];
    onSeatSelect: (seatNumber: string) => void;
    maxSeats?: number;
}

/**
 * Interactive Seat Map Component
 * Displays bus seats with real-time availability using SeatDto[]
 */
const SeatMap: React.FC<SeatMapProps> = ({
    seats,
    selectedSeats,
    onSeatSelect,
    maxSeats = 4
}) => {
    const [holdTimers, setHoldTimers] = useState<Record<string, number>>({});

    // Update hold timers
    useEffect(() => {
        const interval = setInterval(() => {
            const newTimers: Record<string, number> = {};
            seats.forEach(seat => {
                if (seat.status === 'HELD' && seat.holdExpiresAt) {
                    const expiresAt = new Date(seat.holdExpiresAt).getTime();
                    const now = Date.now();
                    const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
                    newTimers[seat.seatNumber] = remaining;
                }
            });
            setHoldTimers(newTimers);
        }, 1000);

        return () => clearInterval(interval);
    }, [seats]);

    const getSeatStatus = (seat: SeatDto): 'available' | 'selected' | 'held' | 'booked' => {
        if (selectedSeats.includes(seat.seatNumber)) return 'selected';
        if (seat.status === 'BOOKED') return 'booked';
        if (seat.status === 'HELD') return 'held';
        return 'available';
    };

    const getSeatColor = (status: string): string => {
        switch (status) {
            case 'selected':
                return 'bg-blue-500 text-white border-blue-600 shadow-lg scale-105';
            case 'booked':
                return 'bg-gray-300 text-gray-500 cursor-not-allowed';
            case 'held':
                return 'bg-orange-200 text-orange-700 border-orange-300 cursor-not-allowed';
            default:
                return 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-md';
        }
    };

    const handleSeatClick = (seat: SeatDto) => {
        const status = getSeatStatus(seat);
        if (status === 'booked' || status === 'held') return;

        if (status === 'available' && selectedSeats.length >= maxSeats) {
            alert(`You can select maximum ${maxSeats} seats`);
            return;
        }

        onSeatSelect(seat.seatNumber);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Group seats by rows (assuming 4 seats per row: 2-aisle-2)
    const rows: SeatDto[][] = [];
    const sortedSeats = [...seats].sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));

    for (let i = 0; i < sortedSeats.length; i += 4) {
        rows.push(sortedSeats.slice(i, i + 4));
    }

    return (
        <div className="space-y-6">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded"></div>
                    <span className="text-sm text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 border-2 border-blue-600 rounded"></div>
                    <span className="text-sm text-gray-700">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-200 border-2 border-orange-300 rounded"></div>
                    <span className="text-sm text-gray-700">On Hold</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                    <span className="text-sm text-gray-700">Booked</span>
                </div>
            </div>

            {/* Seat Map */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                {/* Driver Section */}
                <div className="mb-6 flex justify-end">
                    <div className="w-16 h-12 bg-gray-200 rounded-t-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">Driver</span>
                    </div>
                </div>

                {/* Seats */}
                <div className="space-y-3">
                    {rows.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-3">
                            {/* Left side seats */}
                            <div className="flex gap-2">
                                {row.slice(0, 2).map((seat) => {
                                    const status = getSeatStatus(seat);
                                    const timer = holdTimers[seat.seatNumber];

                                    return (
                                        <button
                                            key={seat.seatNumber}
                                            onClick={() => handleSeatClick(seat)}
                                            disabled={status === 'booked' || status === 'held'}
                                            className={`relative w-14 h-14 border-2 rounded-lg font-semibold text-sm transition-all duration-200 ${getSeatColor(status)}`}
                                            title={`Seat ${seat.seatNumber} - NPR ${seat.price}`}
                                        >
                                            {status === 'selected' && <Check size={16} className="absolute top-1 right-1" />}
                                            {status === 'booked' && <X size={16} className="absolute top-1 right-1" />}
                                            {status === 'held' && timer !== undefined && (
                                                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1 rounded-full flex items-center gap-0.5">
                                                    <Clock size={10} />
                                                    {formatTime(timer)}
                                                </div>
                                            )}
                                            <div>{seat.seatNumber}</div>
                                            <div className="text-xs opacity-75">₹{seat.price}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Aisle */}
                            <div className="w-8"></div>

                            {/* Right side seats */}
                            <div className="flex gap-2">
                                {row.slice(2, 4).map((seat) => {
                                    const status = getSeatStatus(seat);
                                    const timer = holdTimers[seat.seatNumber];

                                    return (
                                        <button
                                            key={seat.seatNumber}
                                            onClick={() => handleSeatClick(seat)}
                                            disabled={status === 'booked' || status === 'held'}
                                            className={`relative w-14 h-14 border-2 rounded-lg font-semibold text-sm transition-all duration-200 ${getSeatColor(status)}`}
                                            title={`Seat ${seat.seatNumber} - NPR ${seat.price}`}
                                        >
                                            {status === 'selected' && <Check size={16} className="absolute top-1 right-1" />}
                                            {status === 'booked' && <X size={16} className="absolute top-1 right-1" />}
                                            {status === 'held' && timer !== undefined && (
                                                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1 rounded-full flex items-center gap-0.5">
                                                    <Clock size={10} />
                                                    {formatTime(timer)}
                                                </div>
                                            )}
                                            <div>{seat.seatNumber}</div>
                                            <div className="text-xs opacity-75">₹{seat.price}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Seats Summary */}
            {selectedSeats.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-blue-700 font-semibold mb-1">
                                Selected Seats ({selectedSeats.length}/{maxSeats})
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedSeats.map(seatNumber => {
                                    const seat = seats.find(s => s.seatNumber === seatNumber);
                                    return (
                                        <span key={seatNumber} className="px-2 py-1 bg-blue-500 text-white rounded text-sm">
                                            {seatNumber} (NPR {seat?.price})
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-600">Total</div>
                            <div className="text-2xl font-bold text-blue-600">
                                NPR {selectedSeats.reduce((total, seatNumber) => {
                                    const seat = seats.find(s => s.seatNumber === seatNumber);
                                    return total + (seat?.price || 0);
                                }, 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeatMap;
