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
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BusServiceImpl implements BusService {

        private final BusRepo busRepo;
        private final RouteRepo routeRepo;
        private final BusMapper busMapper;
        private final com.ticketkatum.mapper.SeatMapper seatMapper;

        @Override
        public BusDto createBusForRoute(BusDto busDto, long routeId) {
                Route route = routeRepo.findById(routeId)
                                .orElseThrow(() -> new RuntimeException("Route not found with id: " + routeId));

                Bus bus = busMapper.toEntity(busDto);
                bus.setRoute(route);

                Bus saved = busRepo.save(bus);
                BusDto dto = busMapper.toDto(saved);
                dto.setRouteId(route.getId());
                if (dto.getRouteDto() == null) {
                    dto.setRouteDto(new org.modelmapper.ModelMapper().map(route, com.ticketkatum.model.RouteDto.class));
                }
                if (saved.getSeats() != null) {
                    dto.setSeats(seatMapper.toDtoList(saved.getSeats()));
                    dto.setNumberOfSeats(saved.getSeats().size());
                }
                return dto;
        }

        @Override
        public BusDto updateBusInfo(BusDto busDto, long busId, long routeId) {
                Bus bus = busRepo.findById(busId)
                                .orElseThrow(() -> new RuntimeException());

                Route route = routeRepo.findById(routeId)
                                .orElseThrow(() -> new RuntimeException());

                if (busDto.getBusType() != null) {
                        bus.setBusType(busDto.getBusType());
                } else if (busDto.getBusName() != null) {
                        // Fallback: Try to parse from name if type is missing (legacy support)
                        try {
                                bus.setBusType(BusType.valueOf(busDto.getBusName().toUpperCase()));
                        } catch (IllegalArgumentException e) {
                                // Ignore if not a valid type
                        }
                }
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

                LocalDate date = req.getDate() != null ? req.getDate() : LocalDate.now();

                LocalDateTime startDateTime = date.atStartOfDay();
                LocalDateTime endDateTime = date.plusDays(1).atStartOfDay();

                int pageSize = (req.getPageSize() != null && req.getPageSize() > 0) ? req.getPageSize() : 10;

                List<Bus> buses = busRepo.searchBuses(
                                req.getSource(),
                                req.getDestination(),
                                startDateTime,
                                endDateTime,
                                req.getCursor(),
                                PageRequest.of(0, pageSize));

                List<BusDto> result = buses.stream()
                                .map(busMapper::toDto)
                                .toList();

                Long nextCursor = buses.isEmpty() ? null : buses.get(buses.size() - 1).getId();

                boolean hasMore = buses.size() == pageSize;

                return BusSearchResponse.builder()
                                .buses(result)
                                .nextCursor(nextCursor)
                                .hasMore(hasMore)
                                .build();
        }

        @Override
        public BusDto getBusById(long id) {
                Bus bus = busRepo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Bus not found with id: " + id));
                BusDto dto = busMapper.toDto(bus);
                if (bus.getRoute() != null) {
                        dto.setRouteId(bus.getRoute().getId());
                        if (dto.getRouteDto() == null) {
                                dto.setRouteDto(new org.modelmapper.ModelMapper().map(bus.getRoute(), com.ticketkatum.model.RouteDto.class));
                        }
                }
                if (bus.getSeats() != null) {
                        dto.setSeats(seatMapper.toDtoList(bus.getSeats()));
                        dto.setNumberOfSeats(bus.getSeats().size());
                }
                return dto;
        }

        @Override
        public List<BusDto> getBusesByRoute(long routeId) {
                return busRepo.findAll().stream()
                                .filter(b -> b.getRoute() != null && b.getRoute().getId() == routeId)
                                .map(bus -> {
                                        BusDto dto = busMapper.toDto(bus);
                                        if (bus.getRoute() != null) {
                                                dto.setRouteId(bus.getRoute().getId());
                                                if (dto.getRouteDto() == null) {
                                                         dto.setRouteDto(new org.modelmapper.ModelMapper().map(bus.getRoute(), com.ticketkatum.model.RouteDto.class));
                                                }
                                        }
                                        if (bus.getSeats() != null) {
                                                dto.setSeats(seatMapper.toDtoList(bus.getSeats()));
                                                dto.setNumberOfSeats(bus.getSeats().size());
                                        }
                                        return dto;
                                })
                                .toList();
        }
}
