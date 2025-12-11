package com.ticketkatum.service;

import com.ticketkatum.model.CreateHotelRequest;
import com.ticketkatum.model.HotelDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface HotelService {
    HotelDTO createHotel(CreateHotelRequest request);

    HotelDTO getHotel(Long hotelId);

    HotelDTO getHotelByCode(String hotelCode);

    List<HotelDTO> getAllHotels();

    Page<HotelDTO> getAllHotels(String city, Integer minStars, Integer maxPrice, Pageable pageable);

    HotelDTO updateHotel(Long hotelId, CreateHotelRequest request);

    void deleteHotel(Long hotelId);
}