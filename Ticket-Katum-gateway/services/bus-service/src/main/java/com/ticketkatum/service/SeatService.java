package com.ticketkatum.service;

import com.ticketkatum.model.SeatDto;

import java.util.List;

public interface SeatService {

    SeatDto createSeatForBus(SeatDto seatDto);

    List<SeatDto> createMultipleSeatsForBus(List<SeatDto> seatDtos, long busId);

    SeatDto updateSeat(SeatDto seatDto, long id);

    void deleteSeat(long id);

    SeatDto getSeatById(long id);

    List<SeatDto> getAllSeat();

    List<SeatDto> findSeatRelatedToBus(String busName);

    SeatDto reserveSeat(long seatId);

    SeatDto selectSeat(long seatId, Long userId);

    SeatDto confirmSeat(long seatId, Long userId);

    void releaseExpiredSeats();
}
