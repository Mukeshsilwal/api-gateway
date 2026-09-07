package com.ticketkatum.service;

import com.ticketkatum.entity.Bus;
import com.ticketkatum.entity.BusStop;
import com.ticketkatum.entity.Route;
import com.ticketkatum.enums.BusType;
import com.ticketkatum.mapper.BusMapper;
import com.ticketkatum.mapper.SeatMapper;
import com.ticketkatum.model.BusDto;
import com.ticketkatum.model.BusSearchRequest;
import com.ticketkatum.model.BusSearchResponse;
import com.ticketkatum.repository.BusRepo;
import com.ticketkatum.repository.RouteRepo;
import com.ticketkatum.service.serviceimpl.BusServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BusServiceTest {

    @Mock
    private BusRepo busRepo;

    @Mock
    private RouteRepo routeRepo;

    @Mock
    private BusMapper busMapper;

    @Mock
    private SeatMapper seatMapper;

    @InjectMocks
    private BusServiceImpl busService;

    private Route testRoute;
    private Bus testBus;
    private BusDto testBusDto;

    @BeforeEach
    void setUp() {
        BusStop source = BusStop.builder().id(1L).name("Kathmandu").build();
        BusStop destination = BusStop.builder().id(2L).name("Pokhara").build();

        testRoute = Route.builder()
                .id(10L)
                .sourceBusStop(source)
                .destinationBusStop(destination)
                .build();

        testBus = Bus.builder()
                .id(100L)
                .busName("Super Deluxe")
                .busType(BusType.DELUXE)
                .departureDateTime(LocalDateTime.now().plusDays(1))
                .basePrice(BigDecimal.valueOf(1200))
                .maxPrice(BigDecimal.valueOf(1500))
                .route(testRoute)
                .seats(new ArrayList<>())
                .build();

        testBusDto = new BusDto();
        testBusDto.setId(100L);
        testBusDto.setBusName("Super Deluxe");
        testBusDto.setBusType(BusType.DELUXE);
        testBusDto.setDepartureDateTime(LocalDateTime.now().plusDays(1));
        testBusDto.setBasePrice(BigDecimal.valueOf(1200));
        testBusDto.setMaxPrice(BigDecimal.valueOf(1500));
        testBusDto.setRouteId(10L);
    }

    @Test
    @DisplayName("Admin: Successfully creates a bus for a valid route")
    void testCreateBusForRoute_Success() {
        when(routeRepo.findById(10L)).thenReturn(Optional.of(testRoute));
        when(busMapper.toEntity(testBusDto)).thenReturn(testBus);
        when(busRepo.save(any(Bus.class))).thenReturn(testBus);
        when(busMapper.toDto(testBus)).thenReturn(testBusDto);

        BusDto result = busService.createBusForRoute(testBusDto, 10L);

        assertNotNull(result);
        assertEquals("Super Deluxe", result.getBusName());
        assertEquals(10L, result.getRouteId());
        verify(busRepo, times(1)).save(any(Bus.class));
    }

    @Test
    @DisplayName("Admin: Throws exception when creating bus for non-existent route")
    void testCreateBusForRoute_RouteNotFound() {
        when(routeRepo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> busService.createBusForRoute(testBusDto, 999L));
        verify(busRepo, never()).save(any());
    }

    @Test
    @DisplayName("User: Search buses by source, destination, and date")
    void testSearchBuses_Success() {
        BusSearchRequest request = new BusSearchRequest();
        request.setSource("Kathmandu");
        request.setDestination("Pokhara");
        request.setDate(LocalDate.now().plusDays(1));
        request.setPageSize(10);

        when(busRepo.searchBuses(
                eq("Kathmandu"),
                eq("Pokhara"),
                any(LocalDateTime.class),
                any(LocalDateTime.class),
                any(),
                any(PageRequest.class)
        )).thenReturn(List.of(testBus));

        when(busMapper.toDto(testBus)).thenReturn(testBusDto);

        BusSearchResponse response = busService.searchBuses(request);

        assertNotNull(response);
        assertEquals(1, response.getBuses().size());
        assertEquals("Super Deluxe", response.getBuses().get(0).getBusName());
        assertFalse(response.isHasMore());
    }

    @Test
    @DisplayName("Common: Get bus by ID returns valid bus details")
    void testGetBusById_Success() {
        when(busRepo.findById(100L)).thenReturn(Optional.of(testBus));
        when(busMapper.toDto(testBus)).thenReturn(testBusDto);

        BusDto result = busService.getBusById(100L);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(busRepo, times(1)).findById(100L);
    }

    @Test
    @DisplayName("Admin: Delete bus removes bus and unlinks from route")
    void testDeleteBusInfo_Success() {
        when(busRepo.findById(100L)).thenReturn(Optional.of(testBus));
        doNothing().when(busRepo).delete(testBus);

        busService.deleteBusInfo(100L);

        verify(busRepo, times(1)).delete(testBus);
    }
}
