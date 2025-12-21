import React from 'react';
import { SeatDto } from '../../types/dto';

interface BusSeatPreviewProps {
    seats: SeatDto[];
    onSeatClick?: (seat: SeatDto) => void;
    selectedSeats?: (string | number)[];
    showLegend?: boolean;
}

/**
 * BusSeatPreview - Interactive 2D seat layout visualization
 * Shows seat arrangement in a bus with status indicators
 */
export const BusSeatPreview: React.FC<BusSeatPreviewProps> = ({
    seats = [],
    onSeatClick,
    selectedSeats = [],
    showLegend = true
}) => {
    // Group seats by row (assuming seat numbers like A1, A2, B1, B2, etc.)
    const getSeatGrid = () => {
        if (!seats || seats.length === 0) {
            // Generate a placeholder grid if no seats
            return [];
        }

        // Sort seats by seat number
        const sortedSeats = [...seats].sort((a, b) => {
            const numA = parseInt(a.seatNumber?.replace(/\D/g, '') || '0');
            const numB = parseInt(b.seatNumber?.replace(/\D/g, '') || '0');
            return numA - numB;
        });

        // Create rows of 4 seats (2 on each side with aisle in middle)
        const rows: SeatDto[][] = [];
        for (let i = 0; i < sortedSeats.length; i += 4) {
            rows.push(sortedSeats.slice(i, i + 4));
        }
        return rows;
    };

    const isSeatBooked = (seat: SeatDto) => {
        return seat.status === 'BOOKED' || (seat as any).booked || (seat as any).isBooked;
    };

    const getSeatStatus = (seat: SeatDto | undefined) => {
        if (!seat) return 'empty';
        // Check if selected (using generic ID or seatNumber check)
        const seatId = (seat as any).id;
        if (selectedSeats.includes(seatId) || selectedSeats.includes(seat.seatNumber)) return 'selected';

        if (isSeatBooked(seat)) return 'booked';
        return 'available';
    };

    const getSeatStyles = (status: string) => {
        const base = 'w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-pointer';

        switch (status) {
            case 'selected':
                return `${base} bg-indigo-600 text-white ring-2 ring-indigo-300 shadow-lg shadow-indigo-500/30 scale-105`;
            case 'booked':
                return `${base} bg-gray-300 text-gray-500 cursor-not-allowed`;
            case 'available':
                return `${base} bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:scale-105 border border-emerald-200`;
            default:
                return `${base} bg-gray-100 border-2 border-dashed border-gray-300`;
        }
    };

    const handleSeatClick = (seat: SeatDto) => {
        if (!seat || isSeatBooked(seat)) return;
        if (onSeatClick) onSeatClick(seat);
    };

    const seatGrid = getSeatGrid();

    // Helper to calculate capacity safely
    const bookedCount = seats.filter(s => isSeatBooked(s)).length;
    const availableCount = seats.length - bookedCount;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Bus Front */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                        </svg>
                    </div>
                    <span className="text-white font-medium">Driver</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>Front</span>
                </div>
            </div>

            {/* Seat Grid */}
            <div className="p-6">
                {seatGrid.length > 0 ? (
                    <div className="space-y-3">
                        {seatGrid.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex items-center justify-center gap-2">
                                {/* Left side (2 seats) */}
                                <div className="flex gap-2">
                                    {row.slice(0, 2).map((seat, idx) => (
                                        <button
                                            key={((seat as any).id) || `${rowIndex}-L${idx}`}
                                            className={getSeatStyles(getSeatStatus(seat))}
                                            onClick={() => seat && handleSeatClick(seat)}
                                            disabled={!seat || isSeatBooked(seat)}
                                            title={seat?.seatNumber || 'Empty'}
                                            type="button"
                                        >
                                            {seat?.seatNumber || '-'}
                                        </button>
                                    ))}
                                    {/* Fill empty spots on left */}
                                    {row.length < 2 && Array(2 - Math.min(row.length, 2)).fill(null).map((_, idx) => (
                                        <div key={`empty-L${idx}`} className={getSeatStyles('empty')}>-</div>
                                    ))}
                                </div>

                                {/* Aisle */}
                                <div className="w-8 flex items-center justify-center">
                                    <div className="w-1 h-8 bg-gray-200 rounded-full"></div>
                                </div>

                                {/* Right side (2 seats) */}
                                <div className="flex gap-2">
                                    {row.slice(2, 4).map((seat, idx) => (
                                        <button
                                            key={((seat as any).id) || `${rowIndex}-R${idx}`}
                                            className={getSeatStyles(getSeatStatus(seat))}
                                            onClick={() => seat && handleSeatClick(seat)}
                                            disabled={!seat || isSeatBooked(seat)}
                                            title={seat?.seatNumber || 'Empty'}
                                            type="button"
                                        >
                                            {seat?.seatNumber || '-'}
                                        </button>
                                    ))}
                                    {/* Fill empty spots on right */}
                                    {row.length < 4 && row.length >= 2 && Array(4 - row.length).fill(null).map((_, idx) => (
                                        <div key={`empty-R${idx}`} className={getSeatStyles('empty')}>-</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No seats configured</p>
                        <p className="text-gray-400 text-sm mt-1">Add seats to see the layout preview</p>
                    </div>
                )}
            </div>

            {/* Legend */}
            {showLegend && seatGrid.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-emerald-100 border border-emerald-200 rounded"></div>
                            <span className="text-gray-600">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-indigo-600 rounded"></div>
                            <span className="text-gray-600">Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                            <span className="text-gray-600">Booked</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Capacity Info */}
            <div className="px-6 py-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Total Capacity: <strong className="text-slate-800">{seats.length} seats</strong></span>
                </div>
                <div className="text-sm">
                    <span className="text-emerald-600 font-medium">
                        {availableCount} available
                    </span>
                    <span className="text-gray-400 mx-2">•</span>
                    <span className="text-gray-500">
                        {bookedCount} booked
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BusSeatPreview;
