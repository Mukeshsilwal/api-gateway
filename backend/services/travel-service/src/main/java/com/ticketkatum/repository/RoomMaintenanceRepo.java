package com.ticketkatum.repository;

import com.ticketkatum.entity.RoomMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomMaintenanceRepo extends JpaRepository<RoomMaintenance, Long> {

    /**
     * Get maintenance record by roomId
     */
    @Query(
            value = "SELECT * FROM room_maintenance rm WHERE rm.room_id = :roomId LIMIT 1",
            nativeQuery = true
    )
    Optional<RoomMaintenance> findByRoomId(Long roomId);


    /**
     * Get all maintenance records for a hotel (via rooms table)
     */
    @Query(
            value = "SELECT rm.* FROM room_maintenance rm " +
                    "INNER JOIN rooms r ON r.id = rm.room_id " +
                    "WHERE r.hotel_id = :hotelId",
            nativeQuery = true
    )
    List<RoomMaintenance> findAllByHotelId(Long hotelId);


    /**
     * Get pending cleaning maintenance for a hotel
     */
    @Query(
            value = "SELECT rm.* FROM room_maintenance rm " +
                    "JOIN rooms r ON r.id = rm.room_id " +
                    "WHERE r.hotel_id = :hotelId " +
                    "AND rm.cleaning_status = 'PENDING'",
            nativeQuery = true
    )
    List<RoomMaintenance> findPendingCleaning(Long hotelId);


    /**
     * Get rooms currently under maintenance
     */
    @Query(
            value = "SELECT rm.* FROM room_maintenance rm " +
                    "JOIN rooms r ON r.id = rm.room_id " +
                    "WHERE r.hotel_id = :hotelId " +
                    "AND rm.room_status = 'UNDER_MAINTENANCE'",
            nativeQuery = true
    )
    List<RoomMaintenance> findRoomsUnderMaintenance(Long hotelId);


    /**
     * Fast lookup for assigned staff
     */
    @Query(
            value = "SELECT * FROM room_maintenance rm WHERE rm.assigned_staff = :staffName LIMIT 20",
            nativeQuery = true
    )
    List<RoomMaintenance> findByAssignedStaff(String staffName);
}
