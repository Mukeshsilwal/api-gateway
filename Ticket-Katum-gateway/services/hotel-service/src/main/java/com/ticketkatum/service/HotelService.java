package com.ticketkatum.service;


import com.ticketkatum.model.CreateHotelRequest;
import com.ticketkatum.model.HotelDTO;

import java.util.List;

public interface HotelService {
    HotelDTO createHotel(CreateHotelRequest request);
    HotelDTO getHotel(Long hotelId);
    HotelDTO getHotelByCode(String hotelCode);
    List<HotelDTO> getAllHotels();
    HotelDTO updateHotel(Long hotelId, CreateHotelRequest request);
    void deleteHotel(Long hotelId);
}