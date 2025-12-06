package com.ticketkatum.repository;

import com.ticketkatum.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StaffRepo extends JpaRepository<Staff, Long> {

    List<Staff> findByHotelId(Long hotelId);

    @Query(
            value = "SELECT * FROM staff s " +
                    "WHERE s.hotel_id = :hotelId " +
                    "AND s.staff_type = :staffType " +
                    "AND s.status = :status " +
                    "ORDER BY s.id ASC " +
                    "LIMIT 1",
            nativeQuery = true
    )
    Staff findFirstAvailableStaff(
            @Param("hotelId") Long hotelId,
            @Param("staffType") String staffType,
            @Param("status") String status
    );
}
