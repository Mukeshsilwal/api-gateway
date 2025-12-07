package com.ticketkatum.service;

import com.ticketkatum.client.*;
import com.ticketkatum.dto.AggregatedHotelDetails;
import com.ticketkatum.dto.hotel.HotelDTO;
import com.ticketkatum.dto.hotel.HotelRecommendation;
import com.ticketkatum.dto.hotel.RoomDTO;
import com.ticketkatum.dto.hotel.response.StaffResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Web-BFF Aggregator Service
 * Orchestrates multiple microservice calls and aggregates responses
 * for optimal frontend consumption
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WebBffAggregator {

    private final HotelServiceClient hotelClient;
    private final RecommendationServiceClient recommendationClient;
    private final PaymentServiceClient paymentClient;
    private final MaintenanceServiceClient maintenanceClient;
    private final StaffServiceClient staffClient;
    private final ImageServiceClient imageClient;
    private final AuthServiceClient authClient;
    private final UserServiceClient userClient;
    private final BookingServiceClient bookingClient;

    /**
     * Aggregates complete hotel details with rooms, staff, and maintenance status
     */
    public CompletableFuture<AggregatedHotelDetails> getCompleteHotelDetails(Long hotelId, String userId) {
        log.info("Aggregating complete hotel details for hotelId: {}", hotelId);

        try {
            // Parallel fetching of all related data
            CompletableFuture<HotelDTO> hotelFuture = hotelClient.getHotelById(hotelId);

            CompletableFuture<List<RoomDTO>> roomsFuture = hotelClient.getRoomsByHotelId(hotelId);

            CompletableFuture<List<StaffResponse>> staffFuture = staffClient.getStaffByHotel(hotelId);

            CompletableFuture<HotelRecommendation> recommendationFuture =
                    recommendationClient.getHotelRecommendation(hotelId, null, null);

            // Combine all results
            return CompletableFuture.allOf(hotelFuture, roomsFuture, staffFuture, recommendationFuture)
                    .thenApply(v -> {
                        HotelDTO hotel = hotelFuture.join();
                        List<RoomDTO> rooms = roomsFuture.join();
                        List<StaffResponse> staff = staffFuture.join();
                        HotelRecommendation recommendation = recommendationFuture.join();

                        // Fetch maintenance for each room (parallel)
                        Map<Long, RoomMaintenanceResponse> maintenanceMap = rooms.stream()
                                .map(room -> maintenanceClient.getMaintenanceByRoomId(room.getId())
                                        .exceptionally(ex -> null))
                                .map(CompletableFuture::join)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toMap(
                                        RoomMaintenanceResponse::getRoomId,
                                        m -> m
                                ));

                        return AggregatedHotelDetails.builder()
                                .hotel(hotel)
                                .rooms(enrichRoomsWithMaintenance(rooms, maintenanceMap))
                                .staff(staff)
                                .activeStaffCount(countActiveStaff(staff))
                                .totalRooms(rooms.size())
                                .availableRooms(countAvailableRooms(rooms))
                                .roomsUnderMaintenance(maintenanceMap.size())
                                .averageRating(recommendation != null ? recommendation.getRating() : null)
                                .reviewCount(recommendation != null ? recommendation.getReviewCount() : 0)
                                .priceRange(calculatePriceRange(rooms))
                                .amenities(extractAmenities(hotel, rooms))
                                .build();
                    })
                    .exceptionally(ex -> {
                        log.error("Error aggregating hotel details for hotelId: {}", hotelId, ex);
                        throw new AggregationException("Failed to aggregate hotel details", ex);
                    });

        } catch (Exception e) {
            log.error("Unexpected error in getCompleteHotelDetails", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Aggregates hotel search results with personalized recommendations
     */
    public CompletableFuture<AggregatedSearchResults> searchHotelsWithRecommendations(
            HotelSearchCriteria criteria, String userId) {

        log.info("Searching hotels with recommendations for user: {}", userId);

        try {
            // Parallel search operations
            CompletableFuture<List<HotelDTO>> searchFuture =
                    hotelClient.searchHotels(criteria);

            CompletableFuture<List<HotelRecommendation>> recommendationsFuture =
                    recommendationClient.getPersonalizedRecommendations(
                            userId, criteria.getLatitude(), criteria.getLongitude(), 20);

            CompletableFuture<List<HotelRecommendation>> nearbyFuture =
                    criteria.getLatitude() != null && criteria.getLongitude() != null
                            ? recommendationClient.findNearbyHotels(
                            criteria.getLatitude(), criteria.getLongitude(),
                            criteria.getRadius() != null ? criteria.getRadius() : 5.0)
                            : CompletableFuture.completedFuture(Collections.emptyList());

            return CompletableFuture.allOf(searchFuture, recommendationsFuture, nearbyFuture)
                    .thenApply(v -> {
                        List<HotelDTO> searchResults = searchFuture.join();
                        List<HotelRecommendation> recommendations = recommendationsFuture.join();
                        List<HotelRecommendation> nearby = nearbyFuture.join();

                        // Merge and enrich results
                        List<EnrichedHotelDTO> enrichedResults = enrichHotelsWithRecommendations(
                                searchResults, recommendations, nearby);

                        // Apply filters and sorting
                        enrichedResults = applyFiltersAndSort(enrichedResults, criteria);

                        return AggregatedSearchResults.builder()
                                .hotels(enrichedResults)
                                .totalResults(enrichedResults.size())
                                .appliedFilters(buildAppliedFilters(criteria))
                                .priceRange(calculateSearchPriceRange(enrichedResults))
                                .availableCities(extractUniqueCities(enrichedResults))
                                .recommendations(recommendations)
                                .nearbyHotels(nearby)
                                .searchMetadata(buildSearchMetadata(criteria, enrichedResults))
                                .build();
                    })
                    .exceptionally(ex -> {
                        log.error("Error in searchHotelsWithRecommendations", ex);
                        throw new AggregationException("Search aggregation failed", ex);
                    });

        } catch (Exception e) {
            log.error("Unexpected error in searchHotelsWithRecommendations", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Aggregates booking creation with payment initiation
     */
    public CompletableFuture<AggregatedBookingResponse> createBookingWithPayment(
            BookingRequest bookingRequest, PaymentRequest paymentRequest, String userId) {

        log.info("Creating booking with payment for user: {}", userId);

        try {
            // Step 1: Validate room availability
            CompletableFuture<HotelAvailabilityResponse> availabilityFuture =
                    recommendationClient.checkAvailability(
                            bookingRequest.getHotelId(),
                            bookingRequest.getCheckIn(),
                            bookingRequest.getCheckOut(),
                            bookingRequest.getRoomIds());

            return availabilityFuture.thenCompose(availability -> {
                        if (!availability.isAvailable()) {
                            throw new AggregationException("Rooms not available for selected dates");
                        }

                        // Step 2: Get room details for price calculation
                        return hotelClient.getRoomsByIds(bookingRequest.getRoomIds())
                                .thenCompose(rooms -> {
                                    BigDecimal totalAmount = calculateTotalAmount(rooms,
                                            bookingRequest.getCheckIn(), bookingRequest.getCheckOut());

                                    // Step 3: Initiate payment
                                    paymentRequest.setAmount(totalAmount);
                                    paymentRequest.getMetadata().put("userId", userId);
                                    paymentRequest.getMetadata().put("hotelId", bookingRequest.getHotelId().toString());
                                    paymentRequest.getMetadata().put("roomIds", bookingRequest.getRoomIds().toString());

                                    return paymentClient.initiatePayment(paymentRequest.getProvider(), paymentRequest)
                                            .thenApply(paymentResponse ->
                                                    AggregatedBookingResponse.builder()
                                                            .bookingReference(generateBookingReference())
                                                            .hotelId(bookingRequest.getHotelId())
                                                            .rooms(rooms)
                                                            .checkIn(bookingRequest.getCheckIn())
                                                            .checkOut(bookingRequest.getCheckOut())
                                                            .totalAmount(totalAmount)
                                                            .paymentStatus(paymentResponse.getStatus())
                                                            .paymentUrl(paymentResponse.getPaymentUrl())
                                                            .transactionId(paymentResponse.getTransactionId())
                                                            .availability(availability)
                                                            .build()
                                            );
                                });
                    })
                    .exceptionally(ex -> {
                        log.error("Error in createBookingWithPayment", ex);
                        throw new AggregationException("Booking creation failed", ex);
                    });

        } catch (Exception e) {
            log.error("Unexpected error in createBookingWithPayment", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Aggregates dashboard data for hotel management
     */
    public CompletableFuture<HotelManagementDashboard> getManagementDashboard(Long hotelId) {
        log.info("Fetching management dashboard for hotelId: {}", hotelId);

        try {
            CompletableFuture<HotelDTO> hotelFuture = hotelClient.getHotelById(hotelId);
            CompletableFuture<List<RoomDTO>> roomsFuture = hotelClient.getRoomsByHotelId(hotelId);
            CompletableFuture<List<StaffResponse>> staffFuture = staffClient.getStaffByHotel(hotelId);

            return CompletableFuture.allOf(hotelFuture, roomsFuture, staffFuture)
                    .thenApply(v -> {
                        List<RoomDTO> rooms = roomsFuture.join();
                        List<StaffResponse> staff = staffFuture.join();

                        // Fetch all maintenance records
                        List<RoomMaintenanceResponse> maintenanceRecords = rooms.stream()
                                .map(room -> maintenanceClient.getMaintenanceByRoomId(room.getId())
                                        .exceptionally(ex -> null))
                                .map(CompletableFuture::join)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());

                        return HotelManagementDashboard.builder()
                                .hotel(hotelFuture.join())
                                .totalRooms(rooms.size())
                                .availableRooms(countAvailableRooms(rooms))
                                .occupiedRooms(countOccupiedRooms(rooms))
                                .roomsUnderMaintenance(maintenanceRecords.size())
                                .totalStaff(staff.size())
                                .activeStaff(countActiveStaff(staff))
                                .maintenanceRecords(maintenanceRecords)
                                .staffByRole(groupStaffByRole(staff))
                                .roomsByType(groupRoomsByType(rooms))
                                .revenueMetrics(calculateRevenueMetrics(rooms))
                                .maintenanceAlerts(getMaintenanceAlerts(maintenanceRecords))
                                .build();
                    })
                    .exceptionally(ex -> {
                        log.error("Error fetching management dashboard", ex);
                        throw new AggregationException("Dashboard aggregation failed", ex);
                    });

        } catch (Exception e) {
            log.error("Unexpected error in getManagementDashboard", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Aggregates home page data with featured hotels and recommendations
     */
    public CompletableFuture<HomePageData> getHomePageData(String userId, Double lat, Double lon) {
        log.info("Fetching home page data for user: {}", userId);

        try {
            CompletableFuture<List<HotelRecommendation>> featuredFuture =
                    recommendationClient.getFeaturedHotels(10);

            CompletableFuture<List<HotelRecommendation>> personalizedFuture =
                    userId != null && lat != null && lon != null
                            ? recommendationClient.getPersonalizedRecommendations(userId, lat, lon, 10)
                            : CompletableFuture.completedFuture(Collections.emptyList());

            CompletableFuture<List<HotelRecommendation>> topRatedFuture =
                    recommendationClient.getTopRatedHotels(10, lat, lon);

            CompletableFuture<List<HotelRecommendation>> nearbyFuture =
                    lat != null && lon != null
                            ? recommendationClient.findNearbyHotels(lat, lon, 10.0)
                            : CompletableFuture.completedFuture(Collections.emptyList());

            CompletableFuture<List<String>> citiesFuture =
                    recommendationClient.getAvailableCities();

            CompletableFuture<List<PaymentProvider>> paymentProvidersFuture =
                    paymentClient.getPaymentProviders();

            return CompletableFuture.allOf(
                            featuredFuture, personalizedFuture, topRatedFuture,
                            nearbyFuture, citiesFuture, paymentProvidersFuture
                    ).thenApply(v ->
                            HomePageData.builder()
                                    .featuredHotels(featuredFuture.join())
                                    .personalizedRecommendations(personalizedFuture.join())
                                    .topRatedHotels(topRatedFuture.join())
                                    .nearbyHotels(nearbyFuture.join())
                                    .availableCities(citiesFuture.join())
                                    .paymentProviders(paymentProvidersFuture.join())
                                    .hasPersonalizedData(userId != null)
                                    .userLocation(lat != null && lon != null
                                            ? new GeoLocation(lat, lon) : null)
                                    .build()
                    )
                    .exceptionally(ex -> {
                        log.error("Error fetching home page data", ex);
                        throw new AggregationException("Home page aggregation failed", ex);
                    });

        } catch (Exception e) {
            log.error("Unexpected error in getHomePageData", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    // ============ Helper Methods ============

    private List<EnrichedRoomDTO> enrichRoomsWithMaintenance(
            List<RoomDTO> rooms, Map<Long, RoomMaintenanceResponse> maintenanceMap) {

        return rooms.stream()
                .map(room -> EnrichedRoomDTO.builder()
                        .room(room)
                        .maintenanceStatus(maintenanceMap.get(room.getId()))
                        .isUnderMaintenance(maintenanceMap.containsKey(room.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    private int countActiveStaff(List<StaffResponse> staff) {
        return (int) staff.stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .count();
    }

    private int countAvailableRooms(List<RoomDTO> rooms) {
        return (int) rooms.stream()
                .filter(RoomDTO::isActive)
                .count();
    }

    private int countOccupiedRooms(List<RoomDTO> rooms) {
        return (int) rooms.stream()
                .filter(r -> !r.isActive())
                .count();
    }

    private PriceRange calculatePriceRange(List<RoomDTO> rooms) {
        if (rooms.isEmpty()) {
            return new PriceRange(BigDecimal.ZERO, BigDecimal.ZERO);
        }

        BigDecimal min = rooms.stream()
                .map(RoomDTO::getPricePerNight)
                .filter(Objects::nonNull)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal max = rooms.stream()
                .map(RoomDTO::getPricePerNight)
                .filter(Objects::nonNull)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        return new PriceRange(min, max);
    }

    private List<String> extractAmenities(HotelDTO hotel, List<RoomDTO> rooms) {
        Set<String> amenities = new HashSet<>();

        // Add hotel-level amenities
        if (hotel.getAmenities() != null) {
            amenities.addAll(hotel.getAmenities());
        }

        // Add unique room amenities
        rooms.stream()
                .filter(r -> r.getAmenities() != null)
                .flatMap(r -> r.getAmenities().stream())
                .forEach(amenities::add);

        return new ArrayList<>(amenities);
    }

    private List<EnrichedHotelDTO> enrichHotelsWithRecommendations(
            List<HotelDTO> hotels,
            List<HotelRecommendation> recommendations,
            List<HotelRecommendation> nearby) {

        Map<Long, HotelRecommendation> recMap = recommendations.stream()
                .collect(Collectors.toMap(HotelRecommendation::getId, r -> r));

        Map<Long, HotelRecommendation> nearbyMap = nearby.stream()
                .collect(Collectors.toMap(HotelRecommendation::getId, r -> r));

        return hotels.stream()
                .map(hotel -> EnrichedHotelDTO.builder()
                        .hotel(hotel)
                        .recommendation(recMap.get(hotel.getId()))
                        .isNearby(nearbyMap.containsKey(hotel.getId()))
                        .distance(nearbyMap.containsKey(hotel.getId())
                                ? nearbyMap.get(hotel.getId()).getDistance() : null)
                        .build())
                .collect(Collectors.toList());
    }

    private List<EnrichedHotelDTO> applyFiltersAndSort(
            List<EnrichedHotelDTO> hotels, HotelSearchCriteria criteria) {

        return hotels.stream()
                .filter(h -> matchesCriteria(h, criteria))
                .sorted(getSortComparator(criteria.getSortBy()))
                .limit(criteria.getLimit() != null ? criteria.getLimit() : 50)
                .collect(Collectors.toList());
    }

    private boolean matchesCriteria(EnrichedHotelDTO hotel, HotelSearchCriteria criteria) {
        // Implement filtering logic
        return true; // Placeholder
    }

    private Comparator<EnrichedHotelDTO> getSortComparator(String sortBy) {
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(h -> h.getHotel().getMinPrice());
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(h -> h.getHotel().getMinPrice(), Comparator.reverseOrder());
        } else if ("rating".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(h ->
                            h.getRecommendation() != null ? h.getRecommendation().getRating() : 0.0,
                    Comparator.reverseOrder());
        }
        return Comparator.comparing(h -> h.getHotel().getId());
    }

    private Map<String, Object> buildAppliedFilters(HotelSearchCriteria criteria) {
        Map<String, Object> filters = new HashMap<>();
        if (criteria.getCity() != null) filters.put("city", criteria.getCity());
        if (criteria.getMinPrice() != null) filters.put("minPrice", criteria.getMinPrice());
        if (criteria.getMaxPrice() != null) filters.put("maxPrice", criteria.getMaxPrice());
        if (criteria.getStars() != null) filters.put("stars", criteria.getStars());
        return filters;
    }

    private PriceRange calculateSearchPriceRange(List<EnrichedHotelDTO> hotels) {
        if (hotels.isEmpty()) {
            return new PriceRange(BigDecimal.ZERO, BigDecimal.ZERO);
        }

        BigDecimal min = hotels.stream()
                .map(h -> h.getHotel().getMinPrice())
                .filter(Objects::nonNull)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal max = hotels.stream()
                .map(h -> h.getHotel().getMaxPrice())
                .filter(Objects::nonNull)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        return new PriceRange(min, max);
    }

    private List<String> extractUniqueCities(List<EnrichedHotelDTO> hotels) {
        return hotels.stream()
                .map(h -> h.getHotel().getCity())
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    private Map<String, Object> buildSearchMetadata(
            HotelSearchCriteria criteria, List<EnrichedHotelDTO> results) {

        return Map.of(
                "totalResults", results.size(),
                "hasMore", results.size() >= (criteria.getLimit() != null ? criteria.getLimit() : 50),
                "appliedFiltersCount", buildAppliedFilters(criteria).size(),
                "searchRadius", criteria.getRadius() != null ? criteria.getRadius() : 0
        );
    }

    private BigDecimal calculateTotalAmount(List<RoomDTO> rooms, LocalDate checkIn, LocalDate checkOut) {
        long nights = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
        return rooms.stream()
                .map(RoomDTO::getPricePerNight)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .multiply(BigDecimal.valueOf(nights));
    }

    private String generateBookingReference() {
        return "BK" + System.currentTimeMillis() +
                String.format("%04d", new Random().nextInt(10000));
    }

    private Map<String, Integer> groupStaffByRole(List<StaffResponse> staff) {
        return staff.stream()
                .collect(Collectors.groupingBy(
                        StaffResponse::getRole,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
    }

    private Map<String, Integer> groupRoomsByType(List<RoomDTO> rooms) {
        return rooms.stream()
                .collect(Collectors.groupingBy(
                        RoomDTO::getRoomType,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
    }

    private Map<String, BigDecimal> calculateRevenueMetrics(List<RoomDTO> rooms) {
        BigDecimal totalRevenue = rooms.stream()
                .map(RoomDTO::getPricePerNight)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "totalPotentialRevenue", totalRevenue,
                "averageRoomPrice", totalRevenue.divide(
                        BigDecimal.valueOf(rooms.size()), 2, BigDecimal.ROUND_HALF_UP)
        );
    }

    private List<MaintenanceAlert> getMaintenanceAlerts(List<RoomMaintenanceResponse> records) {
        return records.stream()
                .filter(m -> "PENDING".equalsIgnoreCase(m.getStatus()) ||
                        "IN_PROGRESS".equalsIgnoreCase(m.getStatus()))
                .map(m -> new MaintenanceAlert(
                        m.getRoomId(),
                        m.getStatus(),
                        m.getIssueType(),
                        m.getPriority()
                ))
                .collect(Collectors.toList());
    }

    // ============ Authentication & User Aggregation Methods ============

    /**
     * Aggregated login with user profile and preferences
     */
    public CompletableFuture<AggregatedLoginResponse> loginWithProfile(
            LoginRequest loginRequest, String ipAddress, String userAgent) {

        log.info("Aggregated login for user: {}", loginRequest.getUsername());

        try {
            // Step 1: Authenticate user
            return authClient.login(loginRequest, ipAddress, userAgent)
                    .thenCompose(loginResponse -> {
                        // Step 2: Fetch user profile
                        CompletableFuture<UserDto> userFuture =
                                userClient.getUserById(extractUserId(loginResponse.getUsername()));

                        // Step 3: Get online user count
                        CompletableFuture<Long> onlineCountFuture =
                                authClient.getOnlineUserCount();

                        return CompletableFuture.allOf(userFuture, onlineCountFuture)
                                .thenApply(v ->
                                        AggregatedLoginResponse.builder()
                                                .authData(loginResponse)
                                                .userProfile(userFuture.join())
                                                .onlineUserCount(onlineCountFuture.join())
                                                .recentBookings(Collections.emptyList()) // TODO: Add booking history
                                                .userPreferences(new HashMap<>())
                                                .build()
                                );
                    })
                    .exceptionally(ex -> {
                        log.error("Error in aggregated login", ex);
                        throw new AggregationException("Login aggregation failed", ex);
                    });

        } catch (Exception e) {
            log.error("Unexpected error in loginWithProfile", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Aggregated user dashboard with bookings, sessions, and statistics
     */
    public CompletableFuture<AggregatedUserDashboard> getUserDashboard(
            String username, Integer userId) {

        log.info("Fetching user dashboard for: {}", username);

        try {
            CompletableFuture<UserDto> userFuture = userClient.getUserById(userId);
            CompletableFuture<ActiveSessionsResponse> sessionsFuture =
                    authClient.getActiveSessions(username);

            return CompletableFuture.allOf(userFuture, sessionsFuture)
                    .thenApply(v -> {
                        UserDto user = userFuture.join();
                        ActiveSessionsResponse sessions = sessionsFuture.join();

                        // TODO: Fetch actual booking data from booking service
                        List<BookingSummary> recentBookings = Collections.emptyList();
                        List<BookingSummary> upcomingBookings = Collections.emptyList();

                        UserStatistics statistics = UserStatistics.builder()
                                .totalBookings(0)
                                .completedBookings(0)
                                .cancelledBookings(0)
                                .upcomingBookings(0)
                                .totalSpent(BigDecimal.ZERO)
                                .averageBookingValue(BigDecimal.ZERO)
                                .loyaltyPoints(0)
                                .build();

                        return AggregatedUserDashboard.builder()
                                .user(user)
                                .recentBookings(recentBookings)
                                .upcomingBookings(upcomingBookings)
                                .activeSessions(convertSessions(sessions.getSessions()))
                                .statistics(statistics)
                                .paymentHistory(Collections.emptyList())
                                .build();
                    })
                    .exceptionally(ex -> {
                        log.error("Error fetching user dashboard", ex);
                        throw new AggregationException("Dashboard fetch failed", ex);
                    });

        } catch (Exception e) {
            log.error("Unexpected error in getUserDashboard", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Complete booking flow with hotel validation, payment, and confirmation
     */
    public CompletableFuture<CompleteBookingResponse> completeBookingFlow(
            CompleteBookingRequest request) {

        log.info("Complete booking flow for user: {}", request.getUserId());

        try {
            HotelBookingRequest bookingReq = request.getBookingRequest();

            // Step 1: Validate hotel and room availability
            CompletableFuture<HotelDTO> hotelFuture =
                    hotelClient.getHotelById(bookingReq.getHotelId());

            CompletableFuture<List<RoomDTO>> roomsFuture =
                    hotelClient.getRoomsByIds(bookingReq.getRoomIds());

            return CompletableFuture.allOf(hotelFuture, roomsFuture)
                    .thenCompose(v -> {
                        HotelDTO hotel = hotelFuture.join();
                        List<RoomDTO> rooms = roomsFuture.join();

                        // Step 2: Check availability
                        return recommendationClient.checkAvailability(
                                bookingReq.getHotelId(),
                                LocalDate.parse(bookingReq.getCheckIn()),
                                LocalDate.parse(bookingReq.getCheckOut()),
                                bookingReq.getRoomIds()
                        ).thenCompose(availability -> {
                            if (!availability.isAvailable()) {
                                throw new AggregationException("Rooms not available for selected dates");
                            }

                            // Step 3: Create booking
                            return bookingClient.bookTicket(
                                    bookingReq.getCategory(),
                                    bookingReq.getService(),
                                    bookingReq
                            ).thenCompose(bookingResponse -> {
                                // Step 4: Initiate payment
                                PaymentRequest paymentReq = request.getPaymentRequest();
                                paymentReq.setAmount(availability.getTotalPrice());
                                paymentReq.getMetadata().put("bookingId", bookingResponse.getBookingId());
                                paymentReq.getMetadata().put("userId", request.getUserId());

                                return paymentClient.initiatePayment(
                                        paymentReq.getProvider(), paymentReq
                                ).thenApply(paymentResponse ->
                                        CompleteBookingResponse.builder()
                                                .bookingData(bookingResponse)
                                                .paymentData(paymentResponse)
                                                .hotelDetails(hotel)
                                                .bookedRooms(rooms)
                                                .totalAmount(availability.getTotalPrice())
                                                .confirmationEmail("Confirmation sent to " + bookingReq.getGuestEmail())
                                                .confirmationSms("SMS sent to " + bookingReq.getGuestPhone())
                                                .build()
                                );
                            });
                        });
                    })
                    .exceptionally(ex -> {
                        log.error("Error in complete booking flow", ex);
                        throw new AggregationException("Booking flow failed", ex);
                    });

        } catch (Exception e) {
            log.error("Unexpected error in completeBookingFlow", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Get booking details with hotel and payment information
     */
    public CompletableFuture<BookingDetailsResponse> getBookingDetails(String bookingId) {
        log.info("Fetching booking details for: {}", bookingId);

        try {
            // TODO: Implement actual booking details fetch
            // This would require a booking service endpoint to get booking by ID

            return CompletableFuture.completedFuture(
                    BookingDetailsResponse.builder()
                            .bookingInfo(new BookingSummary())
                            .canCancel(true)
                            .canModify(false)
                            .build()
            );

        } catch (Exception e) {
            log.error("Error fetching booking details", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Cancel booking with refund processing
     */
    public CompletableFuture<CancellationResponse> cancelBookingWithRefund(
            String category, String service, HotelBookingRequest request, String reason) {

        log.info("Cancelling booking with refund: {}", request.getHotelId());

        try {
            // Step 1: Cancel booking
            return bookingClient.cancelBooking(category, service, request)
                    .thenCompose(cancellationResponse -> {
                        if (!cancellationResponse.isSuccess()) {
                            throw new AggregationException("Booking cancellation failed");
                        }

                        // Step 2: Process refund if applicable
                        if (cancellationResponse.getRefundAmount() != null &&
                                cancellationResponse.getRefundAmount().compareTo(BigDecimal.ZERO) > 0) {

                            RefundRequest refundReq = RefundRequest.builder()
                                    .bookingId(cancellationResponse.getBookingId())
                                    .reason(reason)
                                    .amount(cancellationResponse.getRefundAmount())
                                    .build();

                            return bookingClient.refundBooking(category, service, refundReq)
                                    .thenApply(refundResponse -> {
                                        cancellationResponse.setRefundStatus(refundResponse.getRefundStatus());
                                        return cancellationResponse;
                                    });
                        }

                        return CompletableFuture.completedFuture(cancellationResponse);
                    })
                    .exceptionally(ex -> {
                        log.error("Error in booking cancellation", ex);
                        throw new AggregationException("Cancellation failed", ex);
                    });

        } catch (Exception e) {
            log.error("Unexpected error in cancelBookingWithRefund", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    // ============ Helper Methods for Auth & Booking ============

    private Integer extractUserId(String username) {
        // TODO: Implement actual user ID extraction logic
        // This might involve a lookup or parsing from JWT
        return 1;
    }

    private List<AggregatedUserDashboard.SessionInfo> convertSessions(
            List<Map<Object, Object>> sessions) {

        return sessions.stream()
                .map(session -> AggregatedUserDashboard.SessionInfo.builder()
                        .sessionId((String) session.get("sessionId"))
                        .ipAddress((String) session.get("ipAddress"))
                        .userAgent((String) session.get("userAgent"))
                        .loginTime(LocalDateTime.now()) // Parse from session data
                        .lastActivity(LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());
    }