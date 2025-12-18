package com.ticketkatum.service;

import com.ticketkatum.client.HotelServiceClient;
import com.ticketkatum.client.MaintenanceServiceClient;
import com.ticketkatum.client.RecommendationServiceClient;
import com.ticketkatum.client.StaffServiceClient;
import com.ticketkatum.dto.AggregatedHotelDetails;
import com.ticketkatum.dto.AggregatedSearchResults;
import com.ticketkatum.dto.HomePageData;
import com.ticketkatum.dto.hotel.*;
import com.ticketkatum.dto.hotel.response.RoomMaintenanceResponse;
import com.ticketkatum.dto.hotel.response.StaffResponse;
import com.ticketkatum.enums.StaffType;
import com.ticketkatum.exception.AggregationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Hotel Domain Aggregator
 * Handles all hotel-related aggregations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HotelAggregator {

        private final HotelServiceClient hotelClient;
        private final RecommendationServiceClient recommendationClient;
        private final MaintenanceServiceClient maintenanceClient;
        private final StaffServiceClient staffClient;

        /**
         * Get complete hotel details with rooms, staff, and maintenance
         */
        public CompletableFuture<AggregatedHotelDetails> getCompleteHotelDetails(
                        Long hotelId, String userId) {

                log.info("Aggregating complete hotel details for hotelId: {}", hotelId);

                CompletableFuture<HotelDTO> hotelFuture = hotelClient.getHotelById(hotelId);
                CompletableFuture<List<RoomDTO>> roomsFuture = hotelClient.getRoomsByHotelId(hotelId);
                CompletableFuture<List<StaffResponse>> staffFuture = staffClient.getStaffByHotel(hotelId);
                CompletableFuture<HotelRecommendation> recommendationFuture = recommendationClient
                                .getHotelRecommendation(hotelId, null, null);
                CompletableFuture<List<com.ticketkatum.dto.hotel.booking.RentTypeDto>> rentTypesFuture = hotelClient
                                .getRentTypes();
                CompletableFuture<List<com.ticketkatum.dto.hotel.booking.MealPlanDto>> mealPlansFuture = hotelClient
                                .getMealPlans();

                return CompletableFuture
                                .allOf(hotelFuture, roomsFuture, staffFuture, recommendationFuture, rentTypesFuture,
                                                mealPlansFuture)
                                .thenApply(v -> {
                                        HotelDTO hotel = hotelFuture.join();
                                        List<RoomDTO> rooms = roomsFuture.join();
                                        List<StaffResponse> staff = staffFuture.join();
                                        HotelRecommendation recommendation = recommendationFuture.join();
                                        List<com.ticketkatum.dto.hotel.booking.RentTypeDto> rentTypes = rentTypesFuture
                                                        .join();
                                        List<com.ticketkatum.dto.hotel.booking.MealPlanDto> mealPlans = mealPlansFuture
                                                        .join();

                                        Map<Long, RoomMaintenanceResponse> maintenanceMap = fetchMaintenanceForRooms(
                                                        rooms);

                                        return AggregatedHotelDetails.builder()
                                                        .rooms(enrichRoomsWithMaintenance(rooms, maintenanceMap,
                                                                        rentTypes, mealPlans))
                                                        .activeStaffCount(countActiveStaff(staff))
                                                        .totalRooms(rooms.size())
                                                        .availableRooms(countAvailableRooms(rooms))
                                                        .roomsUnderMaintenance(maintenanceMap.size())
                                                        .averageRating(recommendation != null
                                                                        ? recommendation.getAverageRating()
                                                                        : null)
                                                        .reviewCount(recommendation != null
                                                                        ? recommendation.getTotalReviews()
                                                                        : 0)
                                                        .priceRange(calculatePriceRange(rooms))
                                                        .amenities(extractAmenities(hotel, rooms))
                                                        .build();
                                })
                                .exceptionally(ex -> {
                                        log.error("Error aggregating hotel details", ex);
                                        throw new AggregationException("Failed to aggregate hotel details", ex);
                                });
        }

        /**
         * Search hotels with personalized recommendations
         */
        public CompletableFuture<AggregatedSearchResults> searchHotelsWithRecommendations(
                        HotelSearchCriteria criteria, String userId) {

                log.info("Searching hotels with recommendations for user: {}", userId);

                CompletableFuture<List<HotelDTO>> searchFuture = hotelClient.searchHotels(criteria);
                CompletableFuture<List<HotelRecommendation>> recommendationsFuture = recommendationClient
                                .getPersonalizedRecommendations(
                                                userId, criteria.getLatitude(), criteria.getLongitude(), 20);
                CompletableFuture<List<HotelRecommendation>> nearbyFuture = fetchNearbyHotels(criteria);

                return CompletableFuture.allOf(searchFuture, recommendationsFuture, nearbyFuture)
                                .thenApply(v -> {
                                        List<HotelDTO> searchResults = searchFuture.join();
                                        List<HotelRecommendation> recommendations = recommendationsFuture.join();
                                        List<HotelRecommendation> nearby = nearbyFuture.join();

                                        List<EnrichedHotelDTO> enrichedResults = enrichHotelsWithRecommendations(
                                                        searchResults, recommendations, nearby);
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
                                        log.error("Error in hotel search", ex);
                                        throw new AggregationException("Search aggregation failed", ex);
                                });
        }

        /**
         * Get hotel management dashboard
         */
        public CompletableFuture<HotelManagementDashboard> getManagementDashboard(Long hotelId) {
                log.info("Fetching management dashboard for hotelId: {}", hotelId);

                CompletableFuture<HotelDTO> hotelFuture = hotelClient.getHotelById(hotelId);
                CompletableFuture<List<RoomDTO>> roomsFuture = hotelClient.getRoomsByHotelId(hotelId);
                CompletableFuture<List<StaffResponse>> staffFuture = staffClient.getStaffByHotel(hotelId);

                return CompletableFuture.allOf(hotelFuture, roomsFuture, staffFuture)
                                .thenApply(v -> {
                                        List<RoomDTO> rooms = roomsFuture.join();
                                        List<StaffResponse> staff = staffFuture.join();
                                        List<RoomMaintenanceResponse> maintenanceRecords = fetchMaintenanceRecords(
                                                        rooms);

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
        }

        /**
         * Get home page hotel data
         */
        public CompletableFuture<HomePageData> getHomePageData(
                        String userId, Double lat, Double lon) {

                log.info("Fetching home page hotel data");

                CompletableFuture<List<HotelRecommendation>> featuredFuture = recommendationClient
                                .getFeaturedHotels(10);
                CompletableFuture<List<HotelRecommendation>> personalizedFuture = fetchPersonalizedRecommendations(
                                userId, lat, lon);
                CompletableFuture<List<HotelRecommendation>> topRatedFuture = recommendationClient.getTopRatedHotels(10,
                                lat, lon);
                CompletableFuture<List<HotelRecommendation>> nearbyFuture = fetchNearbyHotelsForHome(lat, lon);
                CompletableFuture<List<String>> citiesFuture = recommendationClient.getAvailableCities();

                return CompletableFuture.allOf(
                                featuredFuture, personalizedFuture, topRatedFuture, nearbyFuture, citiesFuture)
                                .thenApply(v -> HomePageData.builder()
                                                .featuredHotels(featuredFuture.join())
                                                .personalizedRecommendations(personalizedFuture.join())
                                                .topRatedHotels(topRatedFuture.join())
                                                .nearbyHotels(nearbyFuture.join())
                                                .availableCities(citiesFuture.join())
                                                .hasPersonalizedData(userId != null)
                                                .userLocation(lat != null && lon != null ? new GeoLocation(lat, lon)
                                                                : null)
                                                .build());
        }

        // ============ Helper Methods ============

        private Map<Long, RoomMaintenanceResponse> fetchMaintenanceForRooms(List<RoomDTO> rooms) {
                return rooms.stream()
                                .map(room -> maintenanceClient.getMaintenanceByRoomId(room.getId())
                                                .exceptionally(ex -> null))
                                .map(CompletableFuture::join)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toMap(
                                                RoomMaintenanceResponse::getRoomId,
                                                m -> m));
        }

        private List<RoomMaintenanceResponse> fetchMaintenanceRecords(List<RoomDTO> rooms) {
                return rooms.stream()
                                .map(room -> maintenanceClient.getMaintenanceByRoomId(room.getId())
                                                .exceptionally(ex -> null))
                                .map(CompletableFuture::join)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());
        }

        private CompletableFuture<List<HotelRecommendation>> fetchNearbyHotels(
                        HotelSearchCriteria criteria) {
                if (criteria.getLatitude() != null && criteria.getLongitude() != null) {
                        return recommendationClient.findNearbyHotels(
                                        criteria.getLatitude(),
                                        criteria.getLongitude(),
                                        criteria.getRadius() != null ? criteria.getRadius() : 5.0);
                }
                return CompletableFuture.completedFuture(Collections.emptyList());
        }

        private CompletableFuture<List<HotelRecommendation>> fetchPersonalizedRecommendations(
                        String userId, Double lat, Double lon) {
                if (userId != null && lat != null && lon != null) {
                        return recommendationClient.getPersonalizedRecommendations(userId, lat, lon, 10);
                }
                return CompletableFuture.completedFuture(Collections.emptyList());
        }

        private CompletableFuture<List<HotelRecommendation>> fetchNearbyHotelsForHome(
                        Double lat, Double lon) {
                if (lat != null && lon != null) {
                        return recommendationClient.findNearbyHotels(lat, lon, 10.0);
                }
                return CompletableFuture.completedFuture(Collections.emptyList());
        }

        private List<EnrichedRoomDTO> enrichRoomsWithMaintenance(
                        List<RoomDTO> rooms,
                        Map<Long, RoomMaintenanceResponse> maintenanceMap,
                        List<com.ticketkatum.dto.hotel.booking.RentTypeDto> rentTypes,
                        List<com.ticketkatum.dto.hotel.booking.MealPlanDto> mealPlans) {
                return rooms.stream()
                                .map(room -> EnrichedRoomDTO.builder()
                                                .room(room)
                                                .maintenanceStatus(maintenanceMap.get(room.getId()))
                                                .isUnderMaintenance(maintenanceMap.containsKey(room.getId()))
                                                .availableRentTypes(rentTypes)
                                                .availableMealPlans(mealPlans)
                                                .build())
                                .collect(Collectors.toList());
        }

        private int countActiveStaff(List<StaffResponse> staff) {
                return (int) staff.stream()
                                .filter(s -> "ACTIVE".equalsIgnoreCase(String.valueOf(s.getStatus())))
                                .count();
        }

        private int countAvailableRooms(List<RoomDTO> rooms) {
                return (int) rooms.stream().filter(RoomDTO::isActive).count();
        }

        private int countOccupiedRooms(List<RoomDTO> rooms) {
                return (int) rooms.stream().filter(r -> !r.isActive()).count();
        }

        private PriceRange calculatePriceRange(List<RoomDTO> rooms) {
                if (rooms.isEmpty())
                        return new PriceRange(BigDecimal.ZERO, BigDecimal.ZERO);

                BigDecimal min = rooms.stream()
                                .map(RoomDTO::getMaxPrice)
                                .filter(Objects::nonNull)
                                .min(BigDecimal::compareTo)
                                .orElse(BigDecimal.ZERO);

                BigDecimal max = rooms.stream()
                                .map(RoomDTO::getMaxPrice)
                                .filter(Objects::nonNull)
                                .max(BigDecimal::compareTo)
                                .orElse(BigDecimal.ZERO);

                return new PriceRange(min, max);
        }

        private List<String> extractAmenities(HotelDTO hotel, List<RoomDTO> rooms) {
                Set<String> amenities = new HashSet<>();
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
                                .collect(Collectors.toMap(HotelRecommendation::getHotelId, r -> r));
                Map<Long, HotelRecommendation> nearbyMap = nearby.stream()
                                .collect(Collectors.toMap(HotelRecommendation::getHotelId, r -> r));

                return hotels.stream()
                                .map(hotel -> EnrichedHotelDTO.builder()
                                                .hotel(hotel)
                                                .recommendation(recMap.get(hotel.getId()))
                                                .isNearby(nearbyMap.containsKey(hotel.getId()))
                                                .distance(nearbyMap.containsKey(hotel.getId())
                                                                ? nearbyMap.get(hotel.getId()).getDistanceKm()
                                                                : null)
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
                return true; // Implement filtering logic
        }

        private Comparator<EnrichedHotelDTO> getSortComparator(String sortBy) {
                if ("price_asc".equalsIgnoreCase(sortBy)) {

                        return Comparator.comparing(h -> h.getHotel().getRooms().get(0).getMaxPrice());
                }
                return Comparator.comparing(h -> h.getHotel().getId());
        }

        private Map<String, Object> buildAppliedFilters(HotelSearchCriteria criteria) {
                Map<String, Object> filters = new HashMap<>();
                if (criteria.getCity() != null)
                        filters.put("city", criteria.getCity());
                if (criteria.getMinPrice() != null)
                        filters.put("minPrice", criteria.getMinPrice());
                return filters;
        }

        private PriceRange calculateSearchPriceRange(List<EnrichedHotelDTO> hotels) {
                if (hotels.isEmpty())
                        return new PriceRange(BigDecimal.ZERO, BigDecimal.ZERO);

                BigDecimal min = hotels.stream()
                                .map(h -> h.getHotel().getRooms().get(0).getMaxPrice())
                                .filter(Objects::nonNull)
                                .min(BigDecimal::compareTo)
                                .orElse(BigDecimal.ZERO);

                BigDecimal max = hotels.stream()
                                .map(h -> h.getHotel().getRooms().get(0).getMaxPrice())
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
                                "hasMore", results.size() >= (criteria.getLimit() != null ? criteria.getLimit() : 50));
        }

        private Map<StaffType, Integer> groupStaffByRole(List<StaffResponse> staff) {
                return staff.stream()
                                .collect(Collectors.groupingBy(
                                                StaffResponse::getStaffType,
                                                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));
        }

        private Map<String, Integer> groupRoomsByType(List<RoomDTO> rooms) {
                return rooms.stream()
                                .collect(Collectors.groupingBy(
                                                RoomDTO::getRoomType,
                                                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));
        }

        private Map<String, BigDecimal> calculateRevenueMetrics(List<RoomDTO> rooms) {
                BigDecimal total = rooms.stream()
                                .map(RoomDTO::getMaxPrice)
                                .filter(Objects::nonNull)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                return Map.of(
                                "totalPotentialRevenue", total,
                                "averageRoomPrice", total.divide(
                                                BigDecimal.valueOf(rooms.size()), 2, BigDecimal.ROUND_HALF_UP));
        }

        private List<MaintenanceAlert> getMaintenanceAlerts(
                        List<RoomMaintenanceResponse> records) {
                return records.stream()
                                .filter(m -> "PENDING".equalsIgnoreCase(m.getCleaningStatus()) ||
                                                "IN_PROGRESS".equalsIgnoreCase(m.getMaintenanceStatus()))
                                .map(m -> new MaintenanceAlert(
                                                m.getRoomId(),
                                                m.getRoomStatus(),
                                                m.getCleaningStatus(),
                                                m.getMaintenanceStatus()))
                                .collect(Collectors.toList());
        }
}