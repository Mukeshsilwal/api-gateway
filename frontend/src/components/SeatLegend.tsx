import React from 'react';
import { SeatIcon } from './SeatIcon';

const SeatLegend = () => {
    const legendItems = [
        { status: 'available', label: 'Available' },
        { status: 'selected', label: 'Selected' },
        { status: 'booked', label: 'Booked' },
        { status: 'ladies', label: 'Ladies Only' },
    ];

    return (
        <div className="flex flex-wrap gap-4 justify-center md:justify-start items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            {legendItems.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                    <div className="w-6 h-6">
                        <SeatIcon status={item.status} seatNumber="" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default SeatLegend;
