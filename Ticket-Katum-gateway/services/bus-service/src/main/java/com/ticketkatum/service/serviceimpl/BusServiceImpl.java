package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.Bus;
import com.ticketkatum.entity.Route;
import com.ticketkatum.enums.BusType;
import com.ticketkatum.mapper.BusMapper;
import com.ticketkatum.model.BusDto;
import com.ticketkatum.model.BusSearchRequest;
import com.ticketkatum.model.BusSearchResponse;
import com.ticketkatum.repository.BusRepo;
import com.ticketkatum.repository.RouteRepo;
import com.ticketkatum.service.BusService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BusServiceImpl implements BusService {

    private final BusRepo busRepo;
    private final RouteRepo routeRepo;
    private final BusMapper busMapper;

    @Override
    public BusDto createBusForRoute(BusDto busDto, long routeId) {
        Route route = routeRepo.findById(routeId)
                .orElseThrow(() -> new RuntimeException());

        Bus bus = busMapper.toEntity(busDto);
        bus.setRoute(route);

        Bus saved = busRepo.save(bus);
        return busMapper.toDto(saved);
    }


    @Override
    public BusDto updateBusInfo(BusDto busDto, long busId, long routeId) {
        Bus bus = busRepo.findById(busId)
                .orElseThrow(() -> new RuntimeException());

        Route route = routeRepo.findById(routeId)
                .orElseThrow(() -> new RuntimeException());

        bus.setBusType(BusType.valueOf(busDto.getBusName()));
        bus.setDepartureDateTime(busDto.getDepartureDateTime());
        bus.setRoute(route);

        return busMapper.toDto(busRepo.save(bus));
    }

    @Override
    public void deleteBusInfo(long id) {
        Bus bus = busRepo.findById(id)
                .orElseThrow(() -> new RuntimeException());

        if (bus.getRoute() != null) {
            bus.getRoute().getBuses().remove(bus);
        }

        busRepo.delete(bus);
    }

    @Override
    public List<BusDto> getAllBusInfo() {
        return busRepo.findAll()
                .stream()
                .map(busMapper::toDto)
                .toList();
    }

    @Override
    public BusSearchResponse searchBuses(BusSearchRequest req) {

        List<Bus> buses = busRepo.searchBuses(
                req.getSource(),
                req.getDestination(),
                req.getDate(),
                req.getCursor(),
                req.getPageSize()
        );

        List<BusDto> result = buses.stream()
                .map(busMapper::toDto)
                .toList();

        Long nextCursor = buses.isEmpty() ? null :
                buses.get(buses.size() - 1).getId();

        boolean hasMore = buses.size() == req.getPageSize();

        return BusSearchResponse.builder()
                .buses(result)
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .build();
    }
}
