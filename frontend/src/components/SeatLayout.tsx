import React from 'react';
import SeatItem from './SeatItem';
import { SeatIcon } from './SeatIcon';

const SeatLayout = ({
    seats,
    layoutType = '2x2', // '2x2', '2x1', '1x1'
    selectedSeats,
    onToggleSeat
}) => {
    // Group seats by row
    const rows = seats.reduce((acc, seat) => {
        const seatId = String(seat.id); // Convert to string to handle both string and number IDs
        const rowId = seatId.replace(/\d+/, ''); // Extract row letter (A, B, C...)
        if (!acc[rowId]) acc[rowId] = [];
        acc[rowId].push(seat);
        return acc;
    }, {});

    const sortedRowKeys = Object.keys(rows).sort();

    // Determine grid columns based on layout type
    // 2x2: A1 A2 (aisle) A3 A4
    // 2x1: A1 A2 (aisle) A3
    const getGridTemplate = () => {
        switch (layoutType) {
            case '2x1': return 'grid-cols-[repeat(2,1fr)_40px_1fr]';
            case '1x1': return 'grid-cols-[1fr_40px_1fr]';
            case '2x2':
            default: return 'grid-cols-[repeat(2,1fr)_40px_repeat(2,1fr)]';
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Driver Cabin Area */}
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-end">
                <div className="w-12 h-12 opacity-80">
                    <SeatIcon type="driver" status="booked" />
                </div>
            </div>

            {/* Seat Map */}
            <div className="p-6 md:p-8 bg-white">
                <div className={`grid ${getGridTemplate()} gap-y-6 gap-x-2 md:gap-x-4 justify-items-center`}>
                    {sortedRowKeys.map((rowKey) => {
                        const rowSeats = rows[rowKey];
                        // Assuming seats are sorted A1, A2, A3, A4
                        // We need to insert a spacer for the aisle

                        // Logic to split seats based on layout
                        let leftSide = [];
                        let rightSide = [];

                        if (layoutType === '2x2') {
                            leftSide = rowSeats.slice(0, 2);
                            rightSide = rowSeats.slice(2, 4);
                        } else if (layoutType === '2x1') {
                            leftSide = rowSeats.slice(0, 2);
                            rightSide = rowSeats.slice(2, 3);
                        } else {
                            // Default fallback
                            const mid = Math.ceil(rowSeats.length / 2);
                            leftSide = rowSeats.slice(0, mid);
                            rightSide = rowSeats.slice(mid);
                        }

                        return (
                            <React.Fragment key={rowKey}>
                                {/* Left Side Seats */}
                                {leftSide.map(seat => (
                                    <SeatItem
                                        key={seat.id}
                                        seat={seat}
                                        isSelected={selectedSeats.some(s => s.id === seat.id)}
                                        onToggle={onToggleSeat}
                                    />
                                ))}

                                {/* Aisle Spacer */}
                                <div className="w-full h-full text-center text-gray-300 text-xs flex items-center justify-center">
                                    {/* Optional: Row Label */}
                                    {/* {rowKey} */}
                                </div>

                                {/* Right Side Seats */}
                                {rightSide.map(seat => (
                                    <SeatItem
                                        key={seat.id}
                                        seat={seat}
                                        isSelected={selectedSeats.some(s => s.id === seat.id)}
                                        onToggle={onToggleSeat}
                                    />
                                ))}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Bus Rear Decoration */}
            <div className="h-4 bg-gray-100 border-t border-gray-200"></div>
        </div>
    );
};

export default SeatLayout;
