package com.ticketkatum.service.serviceimpl;


import com.ticketkatum.entity.BusStop;
import com.ticketkatum.entity.Route;
import com.ticketkatum.mapper.RouteMapper;
import com.ticketkatum.model.RouteDto;
import com.ticketkatum.repository.BusStopRepo;
import com.ticketkatum.repository.RouteRepo;
import com.ticketkatum.service.RouteService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RouteServiceImpl implements RouteService {

    private final RouteRepo routeRepo;
    private final BusStopRepo busStopRepo;
    private final RouteMapper mapper;

    public RouteServiceImpl(RouteRepo routeRepo, BusStopRepo busStopRepo, RouteMapper mapper) {
        this.routeRepo = routeRepo;
        this.busStopRepo = busStopRepo;
        this.mapper = mapper;
    }

    @Override
    public RouteDto createRouteWithBusStop(RouteDto dto, long sourceId, long destId) {

        BusStop source = busStopRepo.findById(sourceId)
                .orElseThrow(() -> new RuntimeException());

        BusStop dest = busStopRepo.findById(destId)
                .orElseThrow(() -> new RuntimeException());

        Route route = mapper.toEntity(dto);
        route.setSourceBusStop(source);
        route.setDestinationBusStop(dest);

        return mapper.toDto(routeRepo.save(route));
    }

    @Override
    public void deleteRoute(long id) {
        Route route = routeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException());

        routeRepo.delete(route);
    }

    @Override
    public RouteDto getRouteById(long id) {
        Route route = routeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException());
        return mapper.toDto(route);
    }

    @Override
    public List<RouteDto> getAllRoute() {
        return routeRepo.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    public Slice<RouteDto> getRoutesInfiniteScroll(long cursor, int size) {
        Pageable pageable = PageRequest.of(0, size, Sort.by("id").ascending());
        Slice<Route> slice = routeRepo.findByIdGreaterThan(cursor, pageable);

        return slice.map(mapper::toDto);
    }

}

