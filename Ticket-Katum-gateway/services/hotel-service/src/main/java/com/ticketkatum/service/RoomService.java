package com.ticketkatum.service;

import com.ticketkatum.model.CreateRoomRequest;
import com.ticketkatum.model.RoomDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface RoomService {
    RoomDTO addRoom(String hotelCode, CreateRoomRequest req);

    RoomDTO updateRoom(Long roomId, CreateRoomRequest req);

    RoomDTO getRoom(Long roomId);

    List<RoomDTO> getRoomsByHotel(String hotelId);

    void deleteRoom(Long roomId);

    // Paginated methods
    Page<RoomDTO> getRoomsByHotel(String hotelCode, Pageable pageable);

    Page<RoomDTO> searchRooms(Long hotelId, String roomType, Integer minCapacity,
            BigDecimal maxPrice, Boolean active, Pageable pageable);
}
