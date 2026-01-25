package com.ticketkatum.repository;

import com.ticketkatum.entity.HotelConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

@org.springframework.stereotype.Repository
public interface HotelConfigRepository extends JpaRepository<HotelConfig, Long> {
    Optional<HotelConfig>  findByHotelName(String hotelName);
}
