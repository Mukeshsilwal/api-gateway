package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.Hotel;
import com.ticketkatum.mapper.HotelMapper;
import com.ticketkatum.model.CreateHotelRequest;
import com.ticketkatum.model.HotelDTO;
import com.ticketkatum.repository.HotelRepository;
import com.ticketkatum.service.HotelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final HotelMapper hotelMapper;

    @Override
    @Transactional
    public HotelDTO createHotel(CreateHotelRequest request) {
        log.info("Creating hotel: {}", request.getName());

        if (hotelRepository.existsByHotelCode(request.getHotelCode())) {
            throw new IllegalArgumentException("Hotel with code " + request.getHotelCode() + " already exists");
        }

        Hotel hotel = Hotel.builder()
                .hotelCode(request.getHotelCode())
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .zipCode(request.getZipCode())
                .featured(request.getFeatured())
                .website(request.getWebsite())
                .averageRating(request.getRating())
                .phone(request.getPhone())
                .email(request.getEmail())
                .stars(request.getStars())
                .rating(request.getRating())
                .images(request.getImages())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .active(true)
                .build();

        Hotel savedHotel = hotelRepository.save(hotel);
        log.info("Hotel created successfully: {} - {}", savedHotel.getId(), savedHotel.getName());

        return hotelMapper.toDTO(savedHotel);
    }

    @Override
    @Transactional(readOnly = true) // CRITICAL: Must have @Transactional
    public HotelDTO getHotel(Long hotelId) {
        log.info("Fetching hotel with ID: {}", hotelId);

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id " + hotelId));

        // INITIALIZE collections while still in transaction
        Hibernate.initialize(hotel.getImages());
        Hibernate.initialize(hotel.getRooms());

        // Initialize amenities for each room
        hotel.getRooms().forEach(room -> {
            Hibernate.initialize(room.getAmenities());
        });

        return hotelMapper.toDTO(hotel);
    }

    @Override
    @Transactional(readOnly = true) // CRITICAL: Must have @Transactional
    public HotelDTO getHotelByCode(String hotelCode) {
        log.info("Fetching hotel with code: {}", hotelCode);

        Hotel hotel = hotelRepository.findByHotelCode(hotelCode)
                .orElseThrow(() -> new RuntimeException("Hotel not found with code " + hotelCode));

        // INITIALIZE collections while still in transaction
        Hibernate.initialize(hotel.getImages());
        Hibernate.initialize(hotel.getRooms());
        hotel.getRooms().forEach(room -> Hibernate.initialize(room.getAmenities()));

        return hotelMapper.toDTO(hotel);
    }

    @Override
    @Transactional(readOnly = true) // CRITICAL: Must have @Transactional
    public List<HotelDTO> getAllHotels() {
        log.info("Fetching all hotels");
        List<Hotel> hotels = hotelRepository.findAll();

        // INITIALIZE collections for all hotels while still in transaction
        hotels.forEach(hotel -> {
            Hibernate.initialize(hotel.getImages());
            Hibernate.initialize(hotel.getRooms());
            hotel.getRooms().forEach(room -> Hibernate.initialize(room.getAmenities()));
        });

        log.info("Found {} hotels", hotels.size());
        return hotelMapper.toDTOList(hotels);
    }

    @Override
    @Transactional
    public HotelDTO updateHotel(Long hotelId, CreateHotelRequest request) {
        log.info("Updating hotel: {}", hotelId);

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id " + hotelId));

        hotel.setName(request.getName());
        hotel.setDescription(request.getDescription());
        hotel.setAddress(request.getAddress());
        hotel.setCity(request.getCity());
        hotel.setCountry(request.getCountry());
        hotel.setPhone(request.getPhone());
        hotel.setEmail(request.getEmail());
        hotel.setStars(request.getStars());
        hotel.setRating(request.getRating());
        hotel.setImages(request.getImages());
        hotel.setUpdatedAt(LocalDateTime.now());

        Hotel updatedHotel = hotelRepository.save(hotel);

        // Initialize collections before mapping
        Hibernate.initialize(updatedHotel.getImages());
        Hibernate.initialize(updatedHotel.getRooms());
        updatedHotel.getRooms().forEach(room -> Hibernate.initialize(room.getAmenities()));

        log.info("Hotel updated successfully: {}", updatedHotel.getId());

        return hotelMapper.toDTO(updatedHotel);
    }

    @Override
    @Transactional
    public void deleteHotel(Long hotelId) {
        log.info("Deleting hotel: {}", hotelId);

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id " + hotelId));

        hotelRepository.delete(hotel);
        log.info("Hotel deleted successfully: {}", hotelId);
    }
}