package com.ticketkatum.service;

import com.ticketkatum.client.BusServiceClient;
import com.ticketkatum.client.BusStopServiceClient;
import com.ticketkatum.client.RouteServiceClient;
import com.ticketkatum.client.SeatServiceClient;
import com.ticketkatum.dto.bus.*;
import com.ticketkatum.dto.hotel.PriceRange;
import com.ticketkatum.exception.AggregationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Bus Domain Aggregator
 * Handles all bus-related aggregations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BusAggregator {

    private final BusServiceClient busClient;
    private final RouteServiceClient routeClient;
    private final BusStopServiceClient busStopClient;
    private final SeatServiceClient seatClient;
    private final com.ticketkatum.client.PaymentServiceClient paymentClient;

    /**
     * Complete booking flow: create booking -> initiate payment
     */
    public CompletableFuture<CompleteBookingResponse> completeBookingFlow(
            CompleteBookingRequest request) {
        log.info("Starting complete booking flow for user: {}", request.getBookingTicket().getUserId());

        return busClient.createBooking(request.getBookingTicket())
                .thenCompose(bookingTicket -> {
                    com.ticketkatum.dto.payment.request.PaymentRequest paymentReq = request.getPaymentDetails();
                    // Link payment to booking
                    paymentReq.setBookingId(String.valueOf(bookingTicket.getBookingId()));

                    log.info("Initiating payment for booking: {}", bookingTicket.getBookingId());

                    return paymentClient.initiatePayment(paymentReq.getProvider(), paymentReq)
                            .thenApply(paymentResp -> CompleteBookingResponse.builder()
                                    .bookingTicket(bookingTicket)
                                    .paymentData(paymentResp)
                                    .status("SUCCESS")
                                    .message("Booking created and payment initiated")
                                    .build());
                })
                .exceptionally(ex -> {
                    log.error("Complete booking flow failed", ex);
                    throw new AggregationException("Booking flow failed: " + ex.getMessage(), ex);
                });
    }

    /**
     * Get complete bus information with route, stops, and seats
     */
    public CompletableFuture<CompleteBusInfo> getCompleteBusInfo(Long busId) {
        log.info("Aggregating complete bus info for busId: {}", busId);

        CompletableFuture<BusDto> busFuture = busClient.getBusById(busId);

        return busFuture.thenCompose(bus -> {
            CompletableFuture<RouteDto> routeFuture = routeClient.getRouteById(bus.getRouteDto().getId());

            CompletableFuture<List<SeatDto>> seatsFuture = seatClient.getSeatsByBusName(bus.getBusName());

            return CompletableFuture.allOf(routeFuture, seatsFuture)
                    .thenApply(v -> {
                        RouteDto route = routeFuture.join();
                        List<SeatDto> seats = seatsFuture.join();

                        // Get bus stops for route
                        List<BusStopDto> busStops = fetchBusStopsForRoute(route);

                        return CompleteBusInfo.builder()
                                .bus(bus)
                                .route(route)
                                .busStops(busStops)
                                .seats(seats)
                                .totalSeats(seats.size())
                                .availableSeats(countAvailableSeats(seats))
                                .bookedSeats(countBookedSeats(seats))
                                .seatAvailability(calculateSeatAvailability(seats))
                                .build();
                    });
        })
                .exceptionally(ex -> {
                    log.error("Error aggregating bus info", ex);
                    throw new AggregationException("Failed to aggregate bus info", ex);
                });
    }

    /**
     * Search buses with complete information
     * Aggregates: bus search, route details, seat availability
     */
    /**
     * Search buses with complete information
     * Aggregates: bus search, route details, seat availability
     */
    public CompletableFuture<AggregatedBusSearchResults> searchBusesWithDetails(
            BusSearchRequest searchRequest) {

        log.info("Searching buses: {} to {} on {}",
                searchRequest.getSource(),
                searchRequest.getDestination(),
                searchRequest.getDate());

        return busClient.searchBuses(searchRequest)
                .thenCompose(searchResponse -> {
                    List<BusDto> buses = searchResponse.getBuses();

                    // Fetch complete info for each bus in parallel
                    List<CompletableFuture<EnrichedBusDto>> enrichedFutures = buses.stream()
                            .map(bus -> enrichBusWithDetails(bus))
                            .toList();

                    return CompletableFuture.allOf(
                            enrichedFutures.toArray(new CompletableFuture[0]))
                            .thenApply(v -> {
                                List<EnrichedBusDto> enrichedBuses = enrichedFutures
                                        .stream()
                                        .map(CompletableFuture::join)
                                        .collect(Collectors.toList());

                                return AggregatedBusSearchResults.builder()
                                        .buses(enrichedBuses)
                                        .searchCriteria(searchRequest)
                                        .priceRange(calculatePriceRange(
                                                enrichedBuses))
                                        .availableOperators(extractOperators(
                                                enrichedBuses))
                                        .earliestDeparture(
                                                findEarliestDeparture(
                                                        enrichedBuses))
                                        .latestDeparture(findLatestDeparture(
                                                enrichedBuses))
                                        .hasMoreResults(searchResponse
                                                .isHasMore())
                                        .nextCursor(searchResponse
                                                .getNextCursor())
                                        .build();
                            });
                })
                .exceptionally(ex -> {
                    log.error("Error in bus search aggregation", ex);
                    throw new AggregationException("Bus search failed", ex);
                });
    }

    /**
     * Get route with bus stops and buses
     */
    public CompletableFuture<CompleteRouteInfo> getCompleteRouteInfo(Integer routeId) {
        log.info("Aggregating complete route info for routeId: {}", routeId);

        CompletableFuture<RouteDto> routeFuture = routeClient.getRouteById(routeId);

        return routeFuture.thenCompose(route -> {
            List<BusStopDto> busStops = fetchBusStopsForRoute(route);

            CompletableFuture<List<BusDto>> busesFuture = busClient.getBusesByRoute(routeId);

            return busesFuture.thenApply(buses -> CompleteRouteInfo.builder()
                    .route(route)
                    .busStops(busStops)
                    .buses(buses)
                    .totalBuses(buses.size())
                    .totalDistance(calculateTotalDistance(busStops))
                    .estimatedDuration(calculateEstimatedDuration(route))
                    .build());
        })
                .exceptionally(ex -> {
                    log.error("Error aggregating route info", ex);
                    throw new AggregationException("Route aggregation failed", ex);
                });
    }

    /**
     * Get all routes
     */
    public CompletableFuture<List<RouteDto>> getAllRoutes() {
        log.info("Fetching all routes");
        return routeClient.getAllRoutes();
    }

    /**
     * Get route by ID
     */
    public CompletableFuture<RouteDto> getRouteById(Integer routeId) {
        log.info("Fetching route by ID: {}", routeId);
        return routeClient.getRouteById(routeId);
    }

    /**
     * Get all bus stops with routes
     */
    public CompletableFuture<List<BusStopWithRoutes>> getAllBusStopsWithRoutes() {
        log.info("Fetching all bus stops with routes");

        return busStopClient.getAllBusStops()
                .thenCompose(busStops -> {
                    List<CompletableFuture<BusStopWithRoutes>> futures = busStops.stream()
                            .map(busStop -> {
                                CompletableFuture<List<RouteDto>> routesFuture = routeClient
                                        .getRoutesByBusStop(busStop.getId());

                                return routesFuture.thenApply(
                                        routes -> BusStopWithRoutes.builder()
                                                .busStop(busStop)
                                                .routes(routes)
                                                .routeCount(routes
                                                        .size())
                                                .build());
                            })
                            .toList();

                    return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                            .thenApply(v -> futures.stream()
                                    .map(CompletableFuture::join)
                                    .collect(Collectors.toList()));
                });
    }

    /**
     * Get admin dashboard for bus management
     */
    public CompletableFuture<BusManagementDashboard> getManagementDashboard() {
        log.info("Fetching bus management dashboard");

        CompletableFuture<List<BusDto>> busesFuture = busClient.getAllBuses();
        CompletableFuture<List<RouteDto>> routesFuture = routeClient.getAllRoutes();
        CompletableFuture<List<BusStopDto>> stopsFuture = busStopClient.getAllBusStops();
        CompletableFuture<List<SeatDto>> seatsFuture = seatClient.getAllSeats();

        return CompletableFuture.allOf(routesFuture, stopsFuture, seatsFuture, busesFuture)
                .thenApply(v -> {
                    List<BusDto> buses = busesFuture.join();
                    List<RouteDto> routes = routesFuture.join();
                    List<BusStopDto> stops = stopsFuture.join();
                    List<SeatDto> seats = seatsFuture.join();

                    return BusManagementDashboard.builder()
                            .totalRoutes(routes.size())
                            .totalBusStops(stops.size())
                            .totalSeats(seats.size())
                            .availableSeats(countAvailableSeats(seats))
                            .bookedSeats(countBookedSeats(seats))
                            .busesByOperator(groupBusesByOperator(buses))
                            .busesPerRoute(calculateBusesPerRoute(buses))
                            .occupancyRate(calculateOccupancyRate(seats))
                            .recentBuses(buses.stream().limit(10)
                                    .collect(Collectors.toList()))
                            .build();
                })
                .exceptionally(ex -> {
                    log.error("Error fetching management dashboard", ex);
                    throw new AggregationException("Dashboard fetch failed", ex);
                });
    }

    public CompletableFuture<List<BusDto>> getAllBusesWithDetails() {
        log.info("Fetching all buses (no enrichment)");

        return busClient.getAllBuses()
                .exceptionally(ex -> {
                    log.error("Failed to fetch buses", ex);
                    throw new AggregationException("Failed to fetch buses", ex);
                });
    }

    // ==================== Booking Delegates ====================

    public CompletableFuture<BookingTicketDto> createBooking(BookingTicketDto bookingTicketDto) {
        return busClient.createBooking(bookingTicketDto);
    }

    public CompletableFuture<BookingTicketDto> getBooking(Integer id) {
        return busClient.getBooking(id);
    }

    public CompletableFuture<SeatDto> selectSeat(Long seatId, Long userId) {
        return busClient.selectSeat(seatId, userId);
    }

    public CompletableFuture<SeatDto> confirmSeat(Long seatId, Long userId) {
        return busClient.confirmSeat(seatId, userId);
    }

    // ============ Helper Methods ============
    private CompletableFuture<EnrichedBusDto> enrichBusWithDetails(BusDto bus) {

        if (bus.getRouteDto() == null || bus.getRouteDto().getId() == 0) {
            log.warn("Bus {} has null routeDto, skipping route enrichment", bus.getBusName());

            return seatClient.getSeatsByBusName(bus.getBusName())
                    .thenApply(seats -> EnrichedBusDto.builder()
                            .bus(bus)
                            .route(null)
                            .totalSeats(seats.size())
                            .availableSeats(countAvailableSeats(seats))
                            .seatAvailability(calculateSeatAvailability(seats))
                            .build())
                    .exceptionally(ex -> {
                        log.warn("Error fetching seats for bus {}", bus.getBusName(), ex);
                        return EnrichedBusDto.builder()
                                .bus(bus)
                                .totalSeats(0)
                                .availableSeats(0)
                                .seatAvailability(0.0)
                                .build();
                    });
        }

        CompletableFuture<RouteDto> routeFuture = routeClient.getRouteById(bus.getRouteDto().getId());

        CompletableFuture<List<SeatDto>> seatsFuture = seatClient.getSeatsByBusName(bus.getBusName());

        return CompletableFuture.allOf(routeFuture, seatsFuture)
                .thenApply(v -> {
                    RouteDto route = routeFuture.join();
                    List<SeatDto> seats = seatsFuture.join();

                    return EnrichedBusDto.builder()
                            .bus(bus)
                            .route(route)
                            .totalSeats(seats.size())
                            .availableSeats(countAvailableSeats(seats))
                            .seatAvailability(calculateSeatAvailability(seats))
                            .build();
                })
                .exceptionally(ex -> {
                    log.warn("Error enriching bus: {}", bus.getBusName(), ex);
                    return EnrichedBusDto.builder()
                            .bus(bus)
                            .totalSeats(0)
                            .availableSeats(0)
                            .seatAvailability(0.0)
                            .build();
                });
    }

    private List<BusStopDto> fetchBusStopsForRoute(RouteDto route) {
        List<BusStopDto> stops = new ArrayList<>();

        if (route.getSourceBusStop().getId() == 0) {
            busStopClient.getBusStopById(route.getSourceBusStop().getId())
                    .thenAccept(stops::add)
                    .exceptionally(ex -> null)
                    .join();
        }

        if (route.getDestinationBusStop().getId() == 0) {
            busStopClient.getBusStopById(route.getDestinationBusStop().getId())
                    .thenAccept(stops::add)
                    .exceptionally(ex -> null)
                    .join();
        }

        return stops;
    }

    private int countAvailableSeats(List<SeatDto> seats) {
        return (int) seats.stream()
                .filter(seat -> !seat.isReserved())
                .count();
    }

    private int countBookedSeats(List<SeatDto> seats) {
        return (int) seats.stream()
                .filter(SeatDto::isReserved)
                .count();
    }

    private double calculateSeatAvailability(List<SeatDto> seats) {
        if (seats.isEmpty())
            return 0.0;
        return (double) countAvailableSeats(seats) / seats.size() * 100;
    }

    private PriceRange calculatePriceRange(List<EnrichedBusDto> buses) {
        if (buses.isEmpty()) {
            return new PriceRange(java.math.BigDecimal.ZERO, java.math.BigDecimal.ZERO);
        }

        java.math.BigDecimal min = buses.stream()
                .map(b -> b.getBus().getMaxPrice())
                .filter(Objects::nonNull)
                .min(java.math.BigDecimal::compareTo)
                .orElse(java.math.BigDecimal.ZERO);

        java.math.BigDecimal max = buses.stream()
                .map(b -> b.getBus().getMaxPrice())
                .filter(Objects::nonNull)
                .max(java.math.BigDecimal::compareTo)
                .orElse(java.math.BigDecimal.ZERO);

        return new PriceRange(min, max);
    }

    private List<String> extractOperators(List<EnrichedBusDto> buses) {
        return buses.stream()
                .map(b -> b.getBus().getBusType())
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    private String findEarliestDeparture(List<EnrichedBusDto> buses) {
        return buses.stream()
                .map(b -> b.getBus().getDepartureDateTime())
                .filter(Objects::nonNull)
                .min(Comparator.naturalOrder())
                .map(LocalDateTime::toString)
                .orElse("N/A");
    }

    private String findLatestDeparture(List<EnrichedBusDto> buses) {
        return buses.stream()
                .map(b -> b.getBus().getDepartureDateTime())
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder())
                .map(LocalDateTime::toString)
                .orElse("N/A");
    }

    private double calculateTotalDistance(List<BusStopDto> busStops) {
        // Implement distance calculation logic
        return busStops.size() * 50.0; // Placeholder
    }

    private String calculateEstimatedDuration(RouteDto route) {
        // Implement duration calculation
        return "4 hours"; // Placeholder
    }

    private Map<String, Integer> groupBusesByOperator(List<BusDto> buses) {
        return buses.stream()
                .collect(Collectors.groupingBy(
                        BusDto::getBusType,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));
    }

    private Map<Integer, Integer> calculateBusesPerRoute(List<BusDto> buses) {
        return buses.stream()
                .collect(Collectors.groupingBy(
                        busDto -> busDto.getRouteDto().getId(),
                        Collectors.reducing(0, e -> 1, Integer::sum)));
    }

    private double calculateOccupancyRate(List<SeatDto> seats) {
        if (seats.isEmpty())
            return 0.0;
        return (double) countBookedSeats(seats) / seats.size() * 100;
    }
}
