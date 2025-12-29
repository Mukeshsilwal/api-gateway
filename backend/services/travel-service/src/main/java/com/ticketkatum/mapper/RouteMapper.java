package com.ticketkatum.mapper;

import com.ticketkatum.entity.Route;
import com.ticketkatum.model.RouteDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class RouteMapper {

    private final ModelMapper mapper;

    public RouteMapper(ModelMapper mapper) {
        this.mapper = mapper;
    }

    public RouteDto toDto(Route entity) {
        return mapper.map(entity, RouteDto.class);
    }

    public Route toEntity(RouteDto dto) {
        return mapper.map(dto, Route.class);
    }
}
