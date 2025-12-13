package com.ticketkatum.mapper;

import com.ticketkatum.entity.BookingRequest;
import com.ticketkatum.entity.Seat;
import com.ticketkatum.model.BookingRequestDto;
import com.ticketkatum.model.SeatDto;
import org.springframework.stereotype.Component;

@Component
public class BookingRequestMapper {

    /**
     * Convert DTO → Entity
     */
    public BookingRequest toEntity(BookingRequestDto dto) {
        if (dto == null) {
            return null;
        }

        BookingRequest booking = new BookingRequest();
        booking.setId(dto.getId());

        if (dto.getSeat() != null) {
            Seat seat = new Seat();
            seat.setId(dto.getSeat().getBusId());
            booking.setSeat(seat);
        }

        return booking;
    }

    /**
     * Convert Entity → DTO
     */
    public BookingRequestDto toDto(BookingRequest entity) {
        if (entity == null) {
            return null;
        }

        BookingRequestDto dto = new BookingRequestDto();
        dto.setId(entity.getId());

        if (entity.getSeat() != null) {
            SeatDto seatDto = new SeatDto();
            seatDto.setBusId(entity.getSeat().getId());
            dto.setSeat(seatDto);
        }

        return dto;
    }
}
