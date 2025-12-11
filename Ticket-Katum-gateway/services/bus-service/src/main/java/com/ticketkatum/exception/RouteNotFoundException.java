package com.ticketkatum.exception;

import lombok.Getter;

@Getter
public class RouteNotFoundException extends BusServiceException {
    private final Long routeId;

    public RouteNotFoundException(Long routeId) {
        super(String.format("Route not found with ID: %d", routeId));
        this.routeId = routeId;
    }
}
