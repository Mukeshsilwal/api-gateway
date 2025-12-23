import React from 'react';

interface SeatIconProps {
    status?: string;
    seatNumber?: string;
    type?: 'standard' | 'sleeper' | 'driver';
    className?: string;
    onClick?: () => void;
}

export const SeatIcon: React.FC<SeatIconProps> = ({ status, seatNumber, type = 'standard', className, onClick }) => {
    // Colors based on status
    const getColors = () => {
        const normalizedStatus = status ? status.toLowerCase() : 'available';
        switch (normalizedStatus) {
            case 'booked':
                return {
                    fill: '#cbd5e1', // slate-300
                    stroke: '#94a3b8', // slate-400
                    text: '#64748b', // slate-500
                    accent: '#94a3b8'
                };
            case 'selected':
                return {
                    fill: '#f97316', // primary (orange-500)
                    stroke: '#c2410c', // orange-700
                    text: '#ffffff', // white
                    accent: '#fb923c' // orange-400
                };
            case 'ladies':
                return {
                    fill: '#f472b6', // pink-400
                    stroke: '#db2777', // pink-600
                    text: '#ffffff', // white
                    accent: '#f9a8d4' // pink-300
                };
            case 'disabled':
                return {
                    fill: '#94a3b8', // slate-400
                    stroke: '#64748b', // slate-500
                    text: '#f1f5f9', // slate-100
                    accent: '#cbd5e1'
                };
            case 'available':
            default:
                return {
                    fill: '#ffffff', // white
                    stroke: '#cbd5e1', // slate-300
                    text: '#475569', // slate-600
                    accent: '#e2e8f0' // slate-200
                };
        }
    };

    const colors = getColors();

    const renderStandardSeat = () => (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Backrest */}
            <path
                d="M20 15 C20 5, 80 5, 80 15 L80 60 C80 65, 75 70, 70 70 L30 70 C25 70, 20 65, 20 60 Z"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="2"
            />
            {/* Headrest accent */}
            <path
                d="M30 15 C30 10, 70 10, 70 15 L70 25 C70 28, 65 28, 65 25 L35 25 C35 28, 30 28, 30 25 Z"
                fill={colors.accent}
                opacity="0.3"
            />
            {/* Seat Cushion */}
            <path
                d="M15 60 C15 60, 85 60, 85 60 C92 60, 92 85, 85 85 L15 85 C8 85, 8 60, 15 60 Z"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="2"
            />
            {/* Armrests */}
            <path d="M15 60 L15 75" stroke={colors.stroke} strokeWidth="3" strokeLinecap="round" />
            <path d="M85 60 L85 75" stroke={colors.stroke} strokeWidth="3" strokeLinecap="round" />
        </svg>
    );

    const renderSleeperSeat = () => (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Main Bed */}
            <rect
                x="10"
                y="15"
                width="80"
                height="70"
                rx="8"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="2"
            />
            {/* Pillow */}
            <rect
                x="15"
                y="20"
                width="70"
                height="15"
                rx="4"
                fill={colors.accent}
                opacity="0.5"
            />
            {/* Blanket fold */}
            <path
                d="M10 60 Q 50 50 90 60 L 90 80 Q 50 70 10 80 Z"
                fill={colors.accent}
                opacity="0.2"
            />
        </svg>
    );

    const renderDriverSeat = () => (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Steering Wheel */}
            <circle cx="50" cy="35" r="25" fill="none" stroke="#64748b" strokeWidth="4" />
            <path d="M50 35 L50 10" stroke="#64748b" strokeWidth="4" />
            <path d="M50 35 L28 50" stroke="#64748b" strokeWidth="4" />
            <path d="M50 35 L72 50" stroke="#64748b" strokeWidth="4" />

            {/* Seat */}
            <path
                d="M25 60 C25 55, 75 55, 75 60 L75 85 C75 90, 25 90, 25 85 Z"
                fill="#94a3b8"
                stroke="#64748b"
                strokeWidth="2"
            />
        </svg>
    );

    return (
        <div
            className={`relative w-full h-full ${className || ''}`}
            onClick={onClick}
        >
            {type === 'driver' ? renderDriverSeat() :
                type === 'sleeper' ? renderSleeperSeat() :
                    renderStandardSeat()}

            {type !== 'driver' && (
                <span
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] md:text-xs font-bold pointer-events-none select-none"
                    style={{ color: colors.text, marginTop: type === 'sleeper' ? '5px' : '8px' }}
                >
                    {seatNumber}
                </span>
            )}
        </div>
    );
};
