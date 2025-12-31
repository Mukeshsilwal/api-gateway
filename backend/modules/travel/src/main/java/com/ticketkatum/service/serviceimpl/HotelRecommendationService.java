package com.ticketkatum.service.serviceimpl;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketkatum.entity.Hotel;
import com.ticketkatum.entity.Room;
import com.ticketkatum.mapper.HotelMapper;
import com.ticketkatum.model.*;
import com.ticketkatum.redis.RedisHotelCacheService;
import com.ticketkatum.repository.HotelRepository;
import com.ticketkatum.repository.RoomRepository;
import com.ticketkatum.service.RedisRoomHoldService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HotelRecommendationService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final ObjectMapper objectMapper;
    private final RedisHotelCacheService redisCache;
    private final HotelMapper hotelMapper;
    @Autowired
    private RedisRoomHoldService roomHoldService;

    /**
     * Initialize Redis cache on startup
     */
    @PostConstruct
    public void init() {
        log.info("Initializing Redis hotel cache...");
        try {
            // Use method that eagerly loads images to prevent LazyInitializationException
            List<Hotel> allHotels = hotelRepository.findByActiveTrueWithImages();
            redisCache.warmUpCache(allHotels);
            log.info("Redis cache initialized with {} hotels", allHotels.size());
        } catch (Exception e) {
            log.error("Failed to initialize Redis cache", e);
        }
    }

    /**
     * Find nearby hotels using Redis geospatial features
     */
    @Transactional(readOnly = true)
    public NearbyHotelResponse findNearbyHotels(NearbyHotelRequest request) {
        log.info("Finding hotels near coordinates: ({}, {}) within {} km",
                request.getLatitude(), request.getLongitude(), request.getRadiusKm());

        String sortBy = request.getSortBy() != null ? request.getSortBy() : "distance";

        // Try to get from Redis cache first
        Optional<List<HotelRecommendation>> cachedResults = redisCache.getCachedSearchResults(
                request.getLatitude(),
                request.getLongitude(),
                request.getRadiusKm(),
                sortBy);

        List<HotelRecommendation> recommendations;

        if (cachedResults.isPresent()) {
            log.info("Cache HIT - Returning cached results");
            recommendations = cachedResults.get();

            // Apply pagination to cached results
            int start = (request.getPage() - 1) * request.getLimit();
            int end = Math.min(start + request.getLimit(), recommendations.size());
            recommendations = recommendations.subList(start, end);

        } else {
            log.info("Cache MISS - Querying database and Redis geo index");

            // Get nearby hotel IDs from Redis geospatial index
            List<String> nearbyHotelIds = redisCache.getNearbyHotelIds(
                    request.getLatitude(),
                    request.getLongitude(),
                    request.getRadiusKm());

            if (nearbyHotelIds.isEmpty()) {
                log.info("No hotels found in Redis geo index, falling back to database");
                return findNearbyHotelsFromDatabase(request);
            }

            // Fetch hotel details from cache or database
            List<Hotel> hotels = fetchHotelsFromCache(nearbyHotelIds);

            // Apply filters
            hotels = applyFilters(hotels, request);

            // Build recommendations
            recommendations = hotels.stream()
                    .map(hotel -> buildHotelRecommendation(
                            hotel,
                            request.getLatitude(),
                            request.getLongitude()))
                    .collect(Collectors.toList());

            calculateRecommendationScores(recommendations);
            sortRecommendations(recommendations, sortBy);

            // Cache the complete result set (before pagination)
            redisCache.cacheSearchResults(
                    request.getLatitude(),
                    request.getLongitude(),
                    request.getRadiusKm(),
                    sortBy,
                    recommendations);

            // Apply pagination
            int start = (request.getPage() - 1) * request.getLimit();
            int end = Math.min(start + request.getLimit(), recommendations.size());
            recommendations = recommendations.subList(start, end);
        }

        Long totalCount = hotelRepository.countHotelsWithinRadius(
                request.getLatitude(),
                request.getLongitude(),
                request.getRadiusKm());

        return NearbyHotelResponse.builder()
                .hotels(recommendations)
                .totalResults(totalCount.intValue())
                .page(request.getPage())
                .totalPages((int) Math.ceil((double) totalCount / request.getLimit()))
                .searchLocation(SearchLocation.builder()
                        .latitude(request.getLatitude())
                        .longitude(request.getLongitude())
                        .radiusKm(request.getRadiusKm())
                        .build())
                .build();
    }

    @Transactional
    public void bookedSeat(Long hotelId) {
        List<Room> rooms = roomRepository.findByHotelIdAndActiveTrue(hotelId);

        // Mark each room as inactive (booked) and save
        rooms.forEach(room -> {
            room.setActive(false);
            roomRepository.save(room);
        });
    }

    /**
     * Fallback to database query if Redis cache is empty
     */
    private NearbyHotelResponse findNearbyHotelsFromDatabase(NearbyHotelRequest request) {
        int offset = (request.getPage() - 1) * request.getLimit();
        List<Hotel> hotels = fetchHotelsWithFilters(request, offset);

        List<HotelRecommendation> recommendations = hotels.stream()
                .map(hotel -> buildHotelRecommendation(
                        hotel,
                        request.getLatitude(),
                        request.getLongitude()))
                .collect(Collectors.toList());

        calculateRecommendationScores(recommendations);
        sortRecommendations(recommendations, request.getSortBy());

        Long totalCount = hotelRepository.countHotelsWithinRadius(
                request.getLatitude(),
                request.getLongitude(),
                request.getRadiusKm());

        return NearbyHotelResponse.builder()
                .hotels(recommendations)
                .totalResults(totalCount.intValue())
                .page(request.getPage())
                .totalPages((int) Math.ceil((double) totalCount / request.getLimit()))
                .searchLocation(SearchLocation.builder()
                        .latitude(request.getLatitude())
                        .longitude(request.getLongitude())
                        .radiusKm(request.getRadiusKm())
                        .build())
                .build();
    }

    /**
     * Fetch hotels from Redis cache or database
     */
    private List<Hotel> fetchHotelsFromCache(List<String> hotelIds) {
        List<Hotel> hotels = new ArrayList<>();
        List<Long> missingIds = new ArrayList<>();

        // Step 1: Load from Redis cache
        for (String idStr : hotelIds) {
            Long id = Long.parseLong(idStr);
            Optional<Hotel> cached = redisCache.getCachedHotelDetails(id);

            if (cached.isPresent()) {
                hotels.add(cached.get());
            } else {
                missingIds.add(id);
            }
        }

        // Step 2: Fetch missing from DB via native query
        if (!missingIds.isEmpty()) {
            List<Map<String, Object>> rows = hotelRepository.findHotelWithImagesNative(missingIds);

            List<Hotel> dbHotels = rows.stream()
                    .map(hotelMapper::convertRowToHotel)
                    .filter(Hotel::getActive)
                    .toList();

            // Step 3: Cache them
            dbHotels.forEach(redisCache::cacheHotelDetails);

            hotels.addAll(dbHotels);
        }

        return hotels;
    }

    /**
     * Apply filters to hotel list
     */
    private List<Hotel> applyFilters(List<Hotel> hotels, NearbyHotelRequest request) {
        return hotels.stream()
                .filter(h -> request.getMinStarRating() == null ||
                        h.getStarRating() >= request.getMinStarRating())
                .filter(h -> request.getMaxPrice() == null ||
                        h.getMinPrice().compareTo(request.getMaxPrice()) <= 0)
                .collect(Collectors.toList());
    }

    /**
     * Get hotel by ID with Redis caching
     */
    @Transactional(readOnly = true)
    public HotelRecommendation getHotelById(Long hotelId, Double userLat, Double userLon) {
        log.info("Fetching hotel details for ID: {}", hotelId);

        // Check cache first
        Optional<HotelRecommendation> cached = redisCache.getCachedRecommendation(hotelId);
        if (cached.isPresent()) {
            log.info("Cache HIT - Returning cached hotel recommendation");
            return cached.get();
        }

        // Cache miss - fetch from database
        Hotel hotel = hotelRepository.findByIdAndActiveTrue(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found with ID: " + hotelId));

        HotelRecommendation recommendation = buildHotelRecommendation(hotel, userLat, userLon);

        // Cache the recommendation
        redisCache.cacheRecommendation(hotelId, recommendation);

        return recommendation;
    }

    /**
     * Get personalized recommendations
     */
    @Transactional(readOnly = true)
    public List<HotelRecommendation> getPersonalizedRecommendations(
            String userId, Double latitude, Double longitude, Integer limit) {
        log.info("Getting personalized recommendations for user: {}", userId);

        NearbyHotelRequest request = NearbyHotelRequest.builder()
                .latitude(latitude)
                .longitude(longitude)
                .radiusKm(20.0)
                .sortBy("rating")
                .limit(limit)
                .page(1)
                .build();

        return findNearbyHotels(request).getHotels();
    }

    /**
     * Get featured hotels with caching
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "featuredHotels", key = "#limit")
    public List<HotelRecommendation> getFeaturedHotels(int limit) {
        log.info("Fetching featured hotels, limit: {}", limit);

        List<Hotel> featuredHotels = hotelRepository.findByFeaturedTrueAndActiveTrue();

        return featuredHotels.stream()
                .limit(limit)
                .map(hotel -> buildHotelRecommendation(hotel, null, null))
                .sorted(Comparator.comparing(HotelRecommendation::getAverageRating,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    /**
     * Search hotels by city
     */
    @Transactional(readOnly = true)
    public List<HotelRecommendation> searchByCity(String city, Double userLat, Double userLon, Integer limit) {
        log.info("Searching hotels in city: {}", city);

        List<Hotel> hotels = hotelRepository.findByCityIgnoreCaseAndActiveTrue(city);

        return hotels.stream()
                .limit(limit)
                .map(hotel -> buildHotelRecommendation(hotel, userLat, userLon))
                .sorted((h1, h2) -> {
                    if (userLat != null && userLon != null) {
                        return Double.compare(
                                h1.getDistanceKm() != null ? h1.getDistanceKm() : Double.MAX_VALUE,
                                h2.getDistanceKm() != null ? h2.getDistanceKm() : Double.MAX_VALUE);
                    }
                    return Double.compare(
                            h2.getAverageRating() != null ? h2.getAverageRating() : 0.0,
                            h1.getAverageRating() != null ? h1.getAverageRating() : 0.0);
                })
                .collect(Collectors.toList());
    }

    /**
     * Advanced search
     */
    @Transactional(readOnly = true)
    public List<HotelRecommendation> advancedSearch(HotelSearchRequest searchRequest) {
        log.info("Advanced search with query: {}", searchRequest.getSearchQuery());

        List<Hotel> hotels;

        if (searchRequest.getLatitude() != null && searchRequest.getLongitude() != null) {
            hotels = hotelRepository.findNearestHotels(
                    searchRequest.getLatitude(),
                    searchRequest.getLongitude(),
                    searchRequest.getLimit());
        } else if (searchRequest.getCity() != null) {
            hotels = hotelRepository.findByCityIgnoreCaseAndActiveTrue(searchRequest.getCity());
        } else if (searchRequest.getSearchQuery() != null) {
            hotels = hotelRepository.searchHotels(
                    searchRequest.getSearchQuery(),
                    PageRequest.of(searchRequest.getPage() - 1, searchRequest.getLimit())).getContent();
        } else {
            hotels = hotelRepository.findByActiveTrue();
        }

        return hotels.stream()
                .filter(h -> matchesFilters(h, searchRequest))
                .limit(searchRequest.getLimit())
                .map(hotel -> buildHotelRecommendation(
                        hotel,
                        searchRequest.getLatitude(),
                        searchRequest.getLongitude()))
                .collect(Collectors.toList());
    }

    /**
     * Get top-rated hotels
     */
    @Transactional(readOnly = true)
    public List<HotelRecommendation> getTopRatedHotels(Integer limit, Double userLat, Double userLon) {
        log.info("Fetching top-rated hotels, limit: {}", limit);

        List<Hotel> topRated = hotelRepository.findTopRatedHotels(PageRequest.of(0, limit));

        return topRated.stream()
                .map(hotel -> buildHotelRecommendation(hotel, userLat, userLon))
                .collect(Collectors.toList());
    }

    /**
     * Get budget hotels
     */
    @Transactional(readOnly = true)
    public List<HotelRecommendation> getBudgetHotels(
            BigDecimal maxPrice, String city, Integer limit, Double userLat, Double userLon) {
        log.info("Fetching budget hotels with max price: NPR {}", maxPrice);

        List<Hotel> hotels = hotelRepository.findBudgetHotels(maxPrice);

        return getHotelRecommendations(city, limit, userLat, userLon, hotels);
    }

    /**
     * Get hotels by star rating
     */
    public List<HotelRecommendation> getHotelsByStarRating(
            Integer stars, String city, Integer limit, Double userLat, Double userLon) {
        log.info("Fetching {}-star hotels", stars);

        List<Hotel> hotels = hotelRepository.findByStarRatingAndActiveTrue(stars);

        return getHotelRecommendations(city, limit, userLat, userLon, hotels);
    }

    private List<HotelRecommendation> getHotelRecommendations(String city, Integer limit, Double userLat,
            Double userLon, List<Hotel> hotels) {
        if (city != null && !city.isEmpty()) {
            hotels = hotels.stream()
                    .filter(h -> h.getCity().equalsIgnoreCase(city))
                    .collect(Collectors.toList());
        }

        return hotels.stream()
                .limit(limit)
                .map(hotel -> buildHotelRecommendation(hotel, userLat, userLon))
                .collect(Collectors.toList());
    }

    /**
     * Get available cities
     */
    @Transactional(readOnly = true)
    public List<String> getAvailableCities() {
        log.info("Fetching available cities");

        List<Object[]> cityCounts = hotelRepository.countHotelsByCity();

        return cityCounts.stream()
                .map(row -> (String) row[0])
                .collect(Collectors.toList());
    }

    /**
     * Check hotel availability
     */
    @Transactional(readOnly = true)
    public HotelAvailabilityResponse checkAvailability(Long hotelId, HotelAvailabilityRequest request) {
        log.info("Checking availability for hotel ID: {}", hotelId);

        Hotel hotel = hotelRepository.findByIdAndActiveTrue(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        List<Room> allRooms = roomRepository.findByHotelIdAndActiveTrue(hotelId);

        LocalDate checkIn = request.getCheckIn();
        LocalDate checkOut = request.getCheckOut();

        long numberOfNights = ChronoUnit.DAYS.between(checkIn, checkOut);

        // Filter out rooms that are currently held by other booking sessions
        List<Room> availableRooms = allRooms.stream()
                .filter(room -> {
                    // Check if room is held in Redis
                    boolean isHeld = !roomHoldService.areRoomsAvailable(
                            List.of(room.getId()),
                            checkIn,
                            checkOut,
                            null // Don't exclude any session
                    );
                    return !isHeld;
                })
                .collect(Collectors.toList());

        List<RoomAvailability> roomAvailabilities = availableRooms.stream()
                .collect(Collectors.groupingBy(
                        room -> Objects.requireNonNull(room.getRoomType(), "RoomType must not be null")
                ))
                .entrySet().stream()
                .map(entry -> {
                    String roomType = entry.getKey();
                    List<Room> rooms = entry.getValue();
                    BigDecimal pricePerNight = rooms.get(0).getBasePrice();
                    BigDecimal totalPrice = pricePerNight.multiply(BigDecimal.valueOf(numberOfNights));

                    return RoomAvailability.builder()
                            .roomType(roomType)
                            .availableCount(rooms.size())
                            .pricePerNight(pricePerNight)
                            .totalPrice(totalPrice)
                            .build();
                })
                .collect(Collectors.toList());

        boolean available = !availableRooms.isEmpty();

        return HotelAvailabilityResponse.builder()
                .hotelId(hotelId)
                .hotelName(hotel.getName())
                .available(available)
                .availableRooms(roomAvailabilities)
                .checkInDate(request.getCheckIn())
                .checkOutDate(request.getCheckOut())
                .numberOfNights((int) numberOfNights)
                .totalEstimatedCost(hotel.getMinPrice() != null ? hotel.getMinPrice() : BigDecimal.ZERO)
                .build();
    }

    /**
     * Get filter options
     */
    @Transactional(readOnly = true)
    public HotelFilterOptions getFilterOptions() {
        log.info("Fetching filter options");

        List<String> cities = getAvailableCities();

        List<Object[]> starCounts = hotelRepository.countHotelsByStarRating();
        List<Integer> starRatings = starCounts.stream()
                .map(row -> ((Number) row[0]).intValue())
                .collect(Collectors.toList());

        List<Hotel> allHotels = hotelRepository.findByActiveTrue();
        BigDecimal minPrice = allHotels.stream()
                .filter(h -> h.getMinPrice() != null)
                .map(Hotel::getMinPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal maxPrice = allHotels.stream()
                .filter(h -> h.getMaxPrice() != null)
                .map(Hotel::getMaxPrice)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.valueOf(50000));

        return HotelFilterOptions.builder()
                .cities(cities)
                .starRatings(starRatings)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .availableAmenities(Arrays.asList("WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar"))
                .build();
    }

    /**
     * Add or update hotel - invalidates cache
     */
    @CacheEvict(value = { "nearbyHotels", "featuredHotels" }, allEntries = true)
    public void addOrUpdateHotel(Hotel hotel) {
        Hotel savedHotel = hotelRepository.save(hotel);

        // Reload with images eagerly loaded to prevent LazyInitializationException
        // during caching
        Hotel hotelWithImages = hotelRepository.findAllWithImages().stream()
                .filter(h -> h.getId().equals(savedHotel.getId()))
                .findFirst()
                .orElse(savedHotel);

        // Update Redis geo index and cache
        redisCache.updateHotelLocation(hotelWithImages);
        redisCache.cacheHotelDetails(hotelWithImages);

        log.info("Hotel {} added/updated in cache", savedHotel.getId());
    }

    /**
     * Delete hotel - invalidates cache
     */
    @CacheEvict(value = { "nearbyHotels", "featuredHotels" }, allEntries = true)
    public void deleteHotel(Long hotelId) {
        hotelRepository.deleteById(hotelId);
        redisCache.removeHotelFromGeoIndex(hotelId);

        log.info("Hotel {} removed from cache", hotelId);
    }

    // ============ Private Helper Methods ============

    @Transactional(readOnly = true)
    public List<Hotel> fetchHotelsWithFilters(NearbyHotelRequest request, int offset) {
        if (request.getMinStarRating() != null || request.getMaxPrice() != null) {
            return hotelRepository.findHotelsWithFilters(
                    request.getLatitude(),
                    request.getLongitude(),
                    request.getRadiusKm(),
                    request.getMinStarRating(),
                    request.getMaxPrice(),
                    request.getSortBy(),
                    request.getLimit(),
                    offset);
        } else {
            return hotelRepository.findHotelsWithinRadius(
                    request.getLatitude(),
                    request.getLongitude(),
                    request.getRadiusKm(),
                    request.getLimit(),
                    offset);
        }
    }

    private HotelRecommendation buildHotelRecommendation(Hotel hotel, Double fromLat, Double fromLon) {
        Double distance = null;
        String distanceLabel = null;
        if (fromLat != null && fromLon != null) {
            distance = hotel.distanceFrom(fromLat, fromLon);
            distanceLabel = formatDistance(distance);
        }

        List<String> amenities = parseJsonArray(hotel.getAmenities());
        List<Room> availableRooms = roomRepository.findByHotelIdAndActiveTrue(hotel.getId());
        boolean available = !availableRooms.isEmpty();

        String priceLabel = hotel.getMinPrice() != null
                ? String.format("From NPR %,.0f/night", hotel.getMinPrice())
                : "Price on request";

        return HotelRecommendation.builder()
                .hotelId(hotel.getId())
                .name(hotel.getName())
                .description(hotel.getDescription())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .latitude(hotel.getLatitude())
                .longitude(hotel.getLongitude())
                .distanceKm(distance)
                .distanceLabel(distanceLabel)
                .starRating(hotel.getStarRating())
                .averageRating(hotel.getAverageRating())
                .totalReviews(hotel.getTotalReviews())
                .amenities(amenities)
                .images(
                        hotel.getImages() == null
                                ? List.of()
                                : new ArrayList<>(hotel.getImages())
                )
                .minPrice(hotel.getMinPrice())
                .maxPrice(hotel.getMaxPrice())
                .priceLabel(priceLabel)
                .available(available)
                .availableRooms(availableRooms.size())
                .phoneNumber(hotel.getPhone())
                .email(hotel.getEmail())
                .website(hotel.getWebsite())
                .build();

    }

    private void calculateRecommendationScores(List<HotelRecommendation> recommendations) {
        for (HotelRecommendation rec : recommendations) {
            double score = 0.0;

            if (rec.getDistanceKm() != null) {
                double distanceScore = Math.max(0, 100 - (rec.getDistanceKm() * 5));
                score += distanceScore * 0.4;
            }

            if (rec.getAverageRating() != null) {
                score += (rec.getAverageRating() / 5.0) * 100 * 0.3;
            }

            if (rec.getStarRating() != null) {
                score += (rec.getStarRating() / 5.0) * 100 * 0.15;
            }

            if (rec.getAvailable()) {
                score += 15;
            }

            rec.setRecommendationScore(Math.min(100, score));
        }
    }

    private void sortRecommendations(List<HotelRecommendation> recommendations, String sortBy) {
        if (sortBy == null)
            sortBy = "distance";

        switch (sortBy.toLowerCase()) {
            case "price":
                recommendations.sort(Comparator.comparing(
                        r -> r.getMinPrice() != null ? r.getMinPrice() : BigDecimal.valueOf(Double.MAX_VALUE)));
                break;
            case "rating":
                recommendations.sort(Comparator.comparing(
                        HotelRecommendation::getAverageRating,
                        Comparator.nullsLast(Comparator.reverseOrder())));
                break;
            case "distance":
                recommendations.sort(Comparator.comparing(
                        r -> r.getDistanceKm() != null ? r.getDistanceKm() : Double.MAX_VALUE));
                break;
            default:
                recommendations.sort(Comparator.comparing(
                        HotelRecommendation::getRecommendationScore,
                        Comparator.nullsLast(Comparator.reverseOrder())));
        }
    }

    private boolean matchesFilters(Hotel hotel, HotelSearchRequest request) {
        if (request.getMinStarRating() != null &&
                (hotel.getStarRating() == null || hotel.getStarRating() < request.getMinStarRating())) {
            return false;
        }

        if (request.getMinPrice() != null &&
                (hotel.getMinPrice() == null || hotel.getMinPrice().compareTo(request.getMinPrice()) < 0)) {
            return false;
        }

        if (request.getMaxPrice() != null &&
                (hotel.getMinPrice() == null || hotel.getMinPrice().compareTo(request.getMaxPrice()) > 0)) {
            return false;
        }

        return true;
    }

    private String formatDistance(Double distanceKm) {
        if (distanceKm == null)
            return null;
        if (distanceKm < 1) {
            return String.format("%.0f m away", distanceKm * 1000);
        } else {
            return String.format("%.1f km away", distanceKm);
        }
    }

    private List<String> parseJsonArray(String json) {
        if (json == null || json.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            log.warn("Failed to parse JSON array: {}", json);
            return new ArrayList<>();
        }
    }
}