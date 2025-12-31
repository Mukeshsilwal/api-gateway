package com.ticketkatum.service;

import com.ticketkatum.model.BusDto;
import com.ticketkatum.model.BusSearchRequest;
import com.ticketkatum.model.BusSearchResponse;

import java.util.List;

public interface BusService {

    BusDto createBusForRoute(BusDto busDto, long routeId);

    BusDto updateBusInfo(BusDto busDto, long busId, long routeId);

    void deleteBusInfo(long id);

    List<BusDto> getAllBusInfo();

    BusSearchResponse searchBuses(BusSearchRequest request);  // NEW
}
