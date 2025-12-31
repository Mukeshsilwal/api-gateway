package com.ticketkatum.mapper;

import com.ticketkatum.entity.Bus;
import com.ticketkatum.model.BusDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class BusMapper {

    private final ModelMapper mapper;

    public BusMapper(ModelMapper mapper) {
        this.mapper = mapper;
    }

    public Bus toEntity(BusDto dto) {
        return mapper.map(dto, Bus.class);
    }

    public BusDto toDto(Bus entity) {
        return mapper.map(entity, BusDto.class);
    }
}
