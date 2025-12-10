package com.ticketkatum.mapper;

import com.ticketkatum.entity.BookingTicket;
import com.ticketkatum.model.BookingTicketDto;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingMapper {

    private final ModelMapper mapper;

    public BookingTicket toEntity(BookingTicketDto dto) {
        return mapper.map(dto, BookingTicket.class);
    }

    public BookingTicketDto toDto(BookingTicket entity) {
        return mapper.map(entity, BookingTicketDto.class);
    }
}
