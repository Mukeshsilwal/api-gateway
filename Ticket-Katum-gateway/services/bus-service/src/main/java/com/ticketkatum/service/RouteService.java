package com.ticketkatum.service;


import com.ticketkatum.model.RouteDto;

import java.util.List;

public interface RouteService {
    void deleteRoute(long id);

    RouteDto getRouteById(long id);

    List<RouteDto> getAllRoute();

    RouteDto createRouteWithBusStop(RouteDto routeDto, long id, long id1);

}
