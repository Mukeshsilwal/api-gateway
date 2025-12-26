import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const useSeatSelection = (initialSeats = [], maxSeats = 6) => {
    const [selectedSeats, setSelectedSeats] = useState([]);

    const toggleSeat = useCallback((seat) => {
        const status = seat.status ? seat.status.toLowerCase() : 'available';
        if (status === 'booked' || status === 'reserved' || status === 'disabled') {
            return;
        }

        setSelectedSeats((prev) => {
            const isSelected = prev.some((s) => s.id === seat.id);

            if (isSelected) {
                // Unselect
                return prev.filter((s) => s.id !== seat.id);
            } else {
                // Select
                if (prev.length >= maxSeats) {
                    toast(`You can only select up to ${maxSeats} seats.`, { icon: '⚠️' });
                    return prev;
                }
                return [...prev, seat];
            }
        });
    }, [maxSeats]);

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

    const isSelected = useCallback((seatId) => {
        return selectedSeats.some((s) => s.id === seatId);
    }, [selectedSeats]);

    const clearSelection = useCallback(() => {
        setSelectedSeats([]);
    }, []);

    return {
        selectedSeats,
        totalPrice,
        toggleSeat,
        isSelected,
        clearSelection
    };
};

export default useSeatSelection;
