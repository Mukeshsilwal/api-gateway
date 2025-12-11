package com.ticketkatum.service;

import com.ticketkatum.model.CreateHotelRequest;
import com.ticketkatum.model.HotelDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface HotelService {
    HotelDTO createHotel(CreateHotelRequest request);

    HotelDTO getHotel(Long hotelId);

    HotelDTO getHotelByCode(String hotelCode);

    List<HotelDTO> getAllHotels();

    HotelDTO updateHotel(Long hotelId, CreateHotelRequest request);

    void deleteHotel(Long hotelId);

    // Paginated methods
    Page<HotelDTO> getAllHotels(Pageable pageable);

    Page<HotelDTO> searchHotels(String city, Integer minStars, Integer maxStars,
            BigDecimal minPrice, BigDecimal maxPrice,
            Boolean featured, String searchQuery,
            Pageable pageable);
}