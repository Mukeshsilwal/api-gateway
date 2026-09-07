package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.Hotel;
import com.ticketkatum.exception.HotelAlreadyExistsException;
import com.ticketkatum.exception.HotelNotFoundException;
import com.ticketkatum.mapper.HotelMapper;
import com.ticketkatum.model.CreateHotelRequest;
import com.ticketkatum.model.HotelDTO;
import com.ticketkatum.repository.HotelRepository;
import com.ticketkatum.repository.RentTypeRepository;
import com.ticketkatum.repository.MealPlanRepository;
import com.ticketkatum.service.HotelService;
import com.ticketkatum.specification.HotelSpecification;
import com.ticketkatum.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.slf4j.MDC;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Hotel Service Implementation
 * Enhanced with caching, custom exceptions, and structured logging
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final RentTypeRepository rentTypeRepository;
    private final MealPlanRepository mealPlanRepository;
    private final HotelMapper hotelMapper;

    @Override
    @Transactional
    @CacheEvict(value = { "hotel-search", "featured-hotels", "cities" }, allEntries = true)
    public HotelDTO createHotel(CreateHotelRequest request) {
        MDC.put("hotelCode", request.getHotelCode());
        MDC.put("city", request.getCity());

        try {
            log.info("Creating hotel - name: {}, city: {}, stars: {}",
                    request.getName(), request.getCity(), request.getStars());

            // Validate input data
            validateHotelData(request);

            // Check for duplicate hotel code
            if (hotelRepository.existsByHotelCode(request.getHotelCode())) {
                log.warn("Hotel already exists with code: {}", request.getHotelCode());
                throw new HotelAlreadyExistsException(request.getHotelCode());
            }

            Hotel hotel = Hotel.builder()
                    .hotelCode(request.getHotelCode())
                    .name(request.getName())
                    .description(request.getDescription())
                    .address(request.getAddress())
                    .city(request.getCity())
                    .country(request.getCountry() != null && !request.getCountry().isBlank() ? request.getCountry() : "Nepal")
                    .latitude(request.getLatitude() != null ? request.getLatitude() : 27.7172)
                    .longitude(request.getLongitude() != null ? request.getLongitude() : 85.3240)
                    .zipCode(request.getZipCode())
                    .featured(request.getFeatured() != null ? request.getFeatured() : false)
                    .website(request.getWebsite())
                    .averageRating(request.getRating())
                    .phone(request.getPhone() != null ? request.getPhone() : request.getContactPhone())
                    .email(request.getEmail() != null ? request.getEmail() : request.getContactEmail())
                    .stars(request.getStars())
                    .starRating(request.getStars())
                    .rating(request.getRating())
                    .minPrice(request.getMinPrice())
                    .maxPrice(request.getMaxPrice())
                    .amenities(request.getAmenities() != null && !request.getAmenities().isEmpty() ? String.join(",", request.getAmenities()) : null)
                    .images(request.getImages() != null ? request.getImages() : new java.util.HashSet<>())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .active(true)
                    .build();

            Hotel savedHotel = hotelRepository.save(hotel);

            log.info("Hotel created successfully - id: {}, code: {}",
                    savedHotel.getId(), savedHotel.getHotelCode());

            return hotelMapper.toDTO(savedHotel);
        } finally {
            MDC.clear();
        }
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "hotels", key = "#root.args[0]", unless = "#result == null")
    public HotelDTO getHotel(Long hotelId) {
        MDC.put("hotelId", String.valueOf(hotelId));

        try {
            log.debug("Fetching hotel from database - id: {}", hotelId);

            Hotel hotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> {
                        log.warn("Hotel not found - id: {}", hotelId);
                        return new HotelNotFoundException(hotelId);
                    });

            // Initialize collections while still in transaction
            Hibernate.initialize(hotel.getImages());
            Hibernate.initialize(hotel.getRooms());
            hotel.getRooms().forEach(room -> Hibernate.initialize(room.getAmenities()));

            log.debug("Hotel retrieved successfully - id: {}, name: {}",
                    hotel.getId(), hotel.getName());

            return hotelMapper.toDTO(hotel);
        } finally {
            MDC.clear();
        }
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "hotels", key = "#root.args[0]", unless = "#result == null")
    public HotelDTO getHotelByCode(String hotelCode) {
        MDC.put("hotelCode", hotelCode);

        try {
            log.debug("Fetching hotel from database - code: {}", hotelCode);

            Hotel hotel = hotelRepository.findByHotelCode(hotelCode)
                    .orElseGet(() -> {
                        try {
                            Long id = Long.parseLong(hotelCode);
                            return hotelRepository.findById(id).orElse(null);
                        } catch (NumberFormatException e) {
                            return null;
                        }
                    });

            if (hotel == null) {
                log.warn("Hotel not found - code: {}", hotelCode);
                throw new HotelNotFoundException(hotelCode);
            }

            // Initialize collections while still in transaction
            Hibernate.initialize(hotel.getImages());
            Hibernate.initialize(hotel.getRooms());
            hotel.getRooms().forEach(room -> Hibernate.initialize(room.getAmenities()));

            log.debug("Hotel retrieved successfully - code: {}, name: {}",
                    hotelCode, hotel.getName());

            return hotelMapper.toDTO(hotel);
        } finally {
            MDC.clear();
        }
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "hotel-search", key = "'all-hotels'")
    public List<HotelDTO> getAllHotels() {
        log.debug("Fetching all hotels from database");

        List<Hotel> hotels = hotelRepository.findAll();

        // Initialize collections for all hotels while still in transaction
        hotels.forEach(hotel -> {
            Hibernate.initialize(hotel.getImages());
            Hibernate.initialize(hotel.getRooms());
            hotel.getRooms().forEach(room -> Hibernate.initialize(room.getAmenities()));
        });

        log.info("Found {} hotels", hotels.size());
        return hotelMapper.toDTOList(hotels);
    }

    @Override
    @Transactional(readOnly = true)
    // Caching paginated results is complex due to combinations.
    // For now, we rely on database performance or specific cache keys if needed.
    // @Cacheable(value = "hotel-search-paged", key = "{#city, #minStars, #maxPrice,
    // #pageable.pageNumber, #pageable.pageSize}")
    public Page<HotelDTO> getAllHotels(String city, Integer minStars, Integer maxPrice, Pageable pageable) {
        log.debug("Fetching hotels with filters - city: {}, stars: {}, price: {}, page: {}",
                city, minStars, maxPrice, pageable.getPageNumber());

        Specification<Hotel> spec = Specification.where(HotelSpecification.isActive())
                .and(HotelSpecification.hasCity(city))
                .and(HotelSpecification.hasMinStars(minStars))
                .and(HotelSpecification.hasMaxPrice(maxPrice != null ? BigDecimal.valueOf(maxPrice) : null));

        Page<Hotel> hotelPage = hotelRepository.findAll(spec, pageable);

        // Initialize collections for the page content
        hotelPage.getContent().forEach(hotel -> {
            Hibernate.initialize(hotel.getImages());
            Hibernate.initialize(hotel.getRooms());
            hotel.getRooms().forEach(room -> Hibernate.initialize(room.getAmenities()));
        });

        log.info("Found {} hotels (page {} of {})",
                hotelPage.getNumberOfElements(), hotelPage.getNumber(), hotelPage.getTotalPages());

        return hotelPage.map(hotelMapper::toDTO);
    }

    @Override
    @Transactional
    @CachePut(value = "hotels", key = "#result.id")
    @CacheEvict(value = { "hotel-search", "featured-hotels" }, allEntries = true)
    public HotelDTO updateHotel(Long hotelId, CreateHotelRequest request) {
        MDC.put("hotelId", String.valueOf(hotelId));

        try {
            log.info("Updating hotel - id: {}", hotelId);

            // Validate input data
            validateHotelData(request);

            Hotel hotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> {
                        log.warn("Hotel not found for update - id: {}", hotelId);
                        return new HotelNotFoundException(hotelId);
                    });

            // Update hotel fields
            hotel.setName(request.getName());
            hotel.setDescription(request.getDescription());
            hotel.setAddress(request.getAddress());
            hotel.setCity(request.getCity());
            if (request.getCountry() != null && !request.getCountry().isBlank()) {
                hotel.setCountry(request.getCountry());
            }
            hotel.setPhone(request.getPhone() != null ? request.getPhone() : request.getContactPhone());
            hotel.setEmail(request.getEmail() != null ? request.getEmail() : request.getContactEmail());
            hotel.setStars(request.getStars());
            hotel.setStarRating(request.getStars());
            hotel.setRating(request.getRating());
            hotel.setAverageRating(request.getRating());
            if (request.getMinPrice() != null) {
                hotel.setMinPrice(request.getMinPrice());
            }
            if (request.getMaxPrice() != null) {
                hotel.setMaxPrice(request.getMaxPrice());
            }
            if (request.getAmenities() != null && !request.getAmenities().isEmpty()) {
                hotel.setAmenities(String.join(",", request.getAmenities()));
            }
            if (request.getImages() != null && !request.getImages().isEmpty()) {
                hotel.setImages(request.getImages());
            }
            if (request.getLatitude() != null) {
                hotel.setLatitude(request.getLatitude());
            }
            if (request.getLongitude() != null) {
                hotel.setLongitude(request.getLongitude());
            }
            if (request.getZipCode() != null) {
                hotel.setZipCode(request.getZipCode());
            }
            if (request.getWebsite() != null) {
                hotel.setWebsite(request.getWebsite());
            }
            if (request.getFeatured() != null) {
                hotel.setFeatured(request.getFeatured());
            }
            hotel.setUpdatedAt(LocalDateTime.now());

            Hotel updatedHotel = hotelRepository.save(hotel);

            // Initialize collections before mapping
            Hibernate.initialize(updatedHotel.getImages());
            Hibernate.initialize(updatedHotel.getRooms());
            updatedHotel.getRooms().forEach(room -> Hibernate.initialize(room.getAmenities()));

            log.info("Hotel updated successfully - id: {}, name: {}",
                    updatedHotel.getId(), updatedHotel.getName());

            return hotelMapper.toDTO(updatedHotel);
        } finally {
            MDC.clear();
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = { "hotels", "hotel-search", "featured-hotels" }, allEntries = true)
    public void deleteHotel(Long hotelId) {
        MDC.put("hotelId", String.valueOf(hotelId));

        try {
            log.info("Deleting hotel - id: {}", hotelId);

            if (!hotelRepository.existsById(hotelId)) {
                log.warn("Hotel not found for deletion - id: {}", hotelId);
                throw new HotelNotFoundException(hotelId);
            }

            hotelRepository.deleteById(hotelId);

            log.info("Hotel deleted successfully - id: {}", hotelId);
        } finally {
            MDC.clear();
        }
    }

    /**
     * Validate hotel data
     *
     * @param request Hotel creation/update request
     */
    private void validateHotelData(CreateHotelRequest request) {
        // Validate required fields
        ValidationUtils.validateHotelCode(request.getHotelCode());
        ValidationUtils.validateRequiredField(request.getName(), "Hotel name");
        ValidationUtils.validateRequiredField(request.getCity(), "City");

        // Validate coordinates if provided
        if (request.getLatitude() != null) {
            ValidationUtils.validateLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            ValidationUtils.validateLongitude(request.getLongitude());
        }

        // Validate star rating
        ValidationUtils.validateStarRating(request.getStars());

        // Validate contact information
        ValidationUtils.validateEmail(request.getEmail());
        ValidationUtils.validatePhoneNumber(request.getPhone());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "rent-types")
    public List<com.ticketkatum.model.RentTypeDto> getAllRentTypes() {
        return rentTypeRepository.findAll().stream()
                .filter(rentType -> Boolean.TRUE.equals(rentType.getIsActive()))
                .map(rentType -> com.ticketkatum.model.RentTypeDto.builder()
                        .id(rentType.getId())
                        .name(rentType.getName())
                        .code(rentType.getCode())
                        .durationHours(rentType.getDurationHours())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "meal-plans")
    public List<com.ticketkatum.model.MealPlanDto> getAllMealPlans() {
        return mealPlanRepository.findAll().stream()
                .filter(mealPlan -> Boolean.TRUE.equals(mealPlan.getIsActive()))
                .map(mealPlan -> com.ticketkatum.model.MealPlanDto.builder()
                        .id(mealPlan.getId())
                        .name(mealPlan.getName())
                        .code(mealPlan.getCode())
                        .description(mealPlan.getDescription())
                        .build())
                .toList();
    }
}
