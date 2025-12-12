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
        SeatDto dto = mapper.map(entity, SeatDto.class);
        if (entity.getStatus() != null) {
            dto.setStatus(entity.getStatus().name());
            // Backward compatibility: HELD or BOOKED means reserved
            dto.setReserved(entity.getStatus() != com.ticketkatum.enums.SeatStatus.AVAILABLE);
        }
        if (entity.getHoldExpiresAt() != null) {
            dto.setHoldExpiresAt(entity.getHoldExpiresAt().toString());
        }
        return dto;
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
