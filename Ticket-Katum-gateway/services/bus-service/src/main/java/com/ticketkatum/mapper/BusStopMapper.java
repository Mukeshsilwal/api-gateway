package com.ticketkatum.mapper;

import com.ticketkatum.entity.BusStop;
import com.ticketkatum.model.BusStopDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class BusStopMapper {

    private final ModelMapper mapper;

    public BusStopMapper(ModelMapper mapper) {
        this.mapper = mapper;
    }

    public BusStopDto toDto(BusStop entity) {
        return mapper.map(entity, BusStopDto.class);
    }

    public BusStop toEntity(BusStopDto dto) {
        return mapper.map(dto, BusStop.class);
    }

    public void updateEntity(BusStopDto dto, BusStop entity) {
        entity.setName(dto.getName());
    }
}
