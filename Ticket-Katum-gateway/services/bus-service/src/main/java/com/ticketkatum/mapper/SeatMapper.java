package com.ticketkatum.mapper;

import com.ticketkatum.entity.Seat;
import com.ticketkatum.model.SeatDto;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SeatMapper {

    private final ModelMapper mapper;

    public Seat toEntity(SeatDto dto) {
        return mapper.map(dto, Seat.class);
    }

    public SeatDto toDto(Seat entity) {
        return mapper.map(entity, SeatDto.class);
    }

    public List<Seat> toEntityList(List<SeatDto> dtoList) {
        return dtoList.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }

    public List<SeatDto> toDtoList(List<Seat> entityList) {
        return entityList.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}

