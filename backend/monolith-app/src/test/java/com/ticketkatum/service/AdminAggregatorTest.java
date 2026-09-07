package com.ticketkatum.service;

import com.ticketkatum.client.*;
import com.ticketkatum.dto.admin.DashboardSummaryDto;
import com.ticketkatum.dto.bus.BusDto;
import com.ticketkatum.dto.hotel.HotelDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AdminAggregatorTest {

    @Mock
    private BusServiceClient busClient;

    @Mock
    private BusStopServiceClient busStopClient;

    @Mock
    private RouteServiceClient routeClient;

    @Mock
    private SeatServiceClient seatClient;

    @Mock
    private HotelServiceClient hotelClient;

    @Mock
    private BookingServiceClient bookingClient;

    @Mock
    private LiveTrackingService liveTrackingService;

    @Mock
    private AuthServiceClient authClient;

    @InjectMocks
    private AdminAggregator adminAggregator;

    @BeforeEach
    void setUp() {
        LiveTrackingService.LiveTrackingPayload payload = new LiveTrackingService.LiveTrackingPayload();
        payload.setActiveBuses(12);
        when(liveTrackingService.getSnapshot()).thenReturn(payload);
    }

    @Test
    @DisplayName("Admin Dashboard: Aggregates bus, hotel, and live tracking metrics asynchronously")
    void testGetDashboardSummary_Success() throws Exception {
        BusDto bus1 = new BusDto();
        bus1.setId(1L);
        BusDto bus2 = new BusDto();
        bus2.setId(2L);

        HotelDTO hotel1 = HotelDTO.builder().id(10L).name("Lakeside").build();

        when(busClient.getAllBuses()).thenReturn(CompletableFuture.completedFuture(List.of(bus1, bus2)));
        when(hotelClient.getAllHotels()).thenReturn(CompletableFuture.completedFuture(List.of(hotel1)));

        CompletableFuture<DashboardSummaryDto> future = adminAggregator.getDashboardSummary("30d", "Asia/Kathmandu");
        DashboardSummaryDto summary = future.get();

        assertNotNull(summary);
        assertNotNull(summary.getTotals());
        assertEquals(2, summary.getTotals().getBuses());
        assertEquals(1, summary.getTotals().getHotels());
        assertEquals(12, summary.getTotals().getActiveTripsToday());
        assertEquals(12, summary.getLiveTracking().getActiveBuses());
        assertTrue(summary.getLiveTracking().isGpsActive());
    }
}
