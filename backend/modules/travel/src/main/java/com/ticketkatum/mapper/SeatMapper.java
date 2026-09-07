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
        if (dto == null) return null;
        Seat seat = new Seat();
        seat.setId(dto.getId());
        seat.setSeatNumber(dto.getSeatNumber());
        seat.setPrice(dto.getPrice());
        seat.setReserved(dto.isReserved());
        if (dto.getStatus() != null) {
            try {
                seat.setStatus(com.ticketkatum.enums.SeatStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (Exception ignored) {
                seat.setStatus(com.ticketkatum.enums.SeatStatus.AVAILABLE);
            }
        }
        return seat;
    }

    public SeatDto toDto(Seat entity) {
        if (entity == null) return null;
        SeatDto dto = new SeatDto();
        dto.setId(entity.getId());
        dto.setSeatNumber(entity.getSeatNumber());
        dto.setPrice(entity.getPrice());
        if (entity.getBus() != null) {
            try {
                dto.setBusId(entity.getBus().getId());
                dto.setBusName(entity.getBus().getBusName());
            } catch (Exception ignored) {
            }
        }
        if (entity.getStatus() != null) {
            dto.setStatus(entity.getStatus().name());
            // Backward compatibility: HELD or BOOKED means reserved
            dto.setReserved(entity.getStatus() != com.ticketkatum.enums.SeatStatus.AVAILABLE);
        } else {
            dto.setStatus(entity.isReserved() ? "BOOKED" : "AVAILABLE");
            dto.setReserved(entity.isReserved());
        }
        if (entity.getHoldExpiresAt() != null) {
            dto.setHoldExpiresAt(entity.getHoldExpiresAt().toString());
        }
        return dto;
    }

    public List<Seat> toEntityList(List<SeatDto> dtoList) {
        if (dtoList == null) return java.util.Collections.emptyList();
        return dtoList.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }

    public List<SeatDto> toDtoList(List<Seat> entityList) {
        if (entityList == null) return java.util.Collections.emptyList();
        return entityList.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
