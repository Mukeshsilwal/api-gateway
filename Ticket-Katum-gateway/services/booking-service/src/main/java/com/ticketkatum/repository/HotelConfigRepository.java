package com.ticketkatum.repository;

import com.ticketkatum.entity.HotelConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HotelConfigRepository extends JpaRepository<HotelConfig, Long> {
    Optional<HotelConfig>  findByHotelCode(String hotelId);
}
