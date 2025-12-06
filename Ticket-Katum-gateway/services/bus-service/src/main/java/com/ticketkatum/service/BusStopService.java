package com.ticketkatum.service;

import com.ticketkatum.model.BusStopDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BusStopService {
    BusStopDto createBusStop(BusStopDto busStopDto);

    BusStopDto updateBusStop(BusStopDto busStopDto, long id);

    void deleteBusStop(long id);

    List<BusStopDto> getAllBusStops();

    BusStopDto getBusStopById(long id);
    Page<BusStopDto> getBusStops(Pageable pageable);
}
