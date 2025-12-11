package com.ticketkatum.service;

import com.ticketkatum.model.CreateRoomRequest;
import com.ticketkatum.model.RoomDTO;

import java.util.List;

public interface RoomService {
    RoomDTO addRoom(String hotelCode, CreateRoomRequest req);

    RoomDTO updateRoom(Long roomId, CreateRoomRequest req);

    RoomDTO getRoom(Long roomId);

    List<RoomDTO> getRoomsByHotel(String hotelId);

    void deleteRoom(Long roomId);
}
