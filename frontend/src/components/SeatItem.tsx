import React from 'react';
import { SeatIcon } from './SeatIcon';

const SeatItem = ({ seat, isSelected, onToggle }) => {
    const { id, status, type, price } = seat;

    // Normalize status for comparison
    const normalizedStatus = status ? status.toLowerCase() : 'available';
    const displayStatus = isSelected ? 'selected' : normalizedStatus;

    const handleClick = () => {
        if (normalizedStatus === 'available' || normalizedStatus === 'ladies') {
            onToggle(seat);
        }
    };

    return (
        <div
            className={`
                relative flex flex-col items-center justify-center p-1 
                transition-transform duration-200 
                ${(normalizedStatus === 'available' || normalizedStatus === 'ladies') ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-80'}
            `}
            onClick={handleClick}
        >
            <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14">
                <SeatIcon
                    status={displayStatus}
                    seatNumber={id}
                    type={type}
                />
            </div>

            {/* Tooltip on hover for desktop */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 hidden md:block">
                {status === 'booked' ? 'Booked' : `Seat ${id} - Rs.${price}`}
            </div>
        </div>
    );
};

export default SeatItem;
