package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.Hotel;
import com.ticketkatum.entity.Room;
import com.ticketkatum.mapper.HotelMapper;
import com.ticketkatum.model.CreateRoomRequest;
import com.ticketkatum.model.RoomDTO;
import com.ticketkatum.repository.HotelRepository;
import com.ticketkatum.repository.RoomRepository;
import com.ticketkatum.service.RoomService;
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
public class RoomServiceImpl implements RoomService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final HotelMapper hotelMapper;

    /**
     * Add a new room to a hotel
     *
     * @param hotelCode The hotel code
     * @param req       Room creation request
     * @return Created room DTO
     */
    @Override
    @Transactional // Write operation needs @Transactional
    public RoomDTO addRoom(String hotelCode, CreateRoomRequest req) {
        log.info("Adding room to hotel: {}", hotelCode);

        Hotel hotel = hotelRepository.findByHotelCode(hotelCode)
                .orElseThrow(() -> new RuntimeException("Hotel not found with code: " + hotelCode));

        Room room = Room.builder()
                .roomNumber(req.getRoomNumber())
                .roomType(req.getType())
                .description(req.getDescription())
                .capacity(req.getCapacity())
                .basePrice(req.getBasePrice())
                .maxPrice(req.getMaxPrice())
                .amenities(req.getAmenities())
                .active(req.isActive())
                .hotel(hotel)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Room savedRoom = roomRepository.save(room);

        // Initialize amenities before mapping (still inside transaction)
        Hibernate.initialize(savedRoom.getAmenities());

        log.info("Room added successfully: {} to hotel: {}", savedRoom.getId(), hotelCode);
        return hotelMapper.toRoomDTO(savedRoom);
    }

    /**
     * Update an existing room
     *
     * @param roomId The room ID
     * @param req    Room update request
     * @return Updated room DTO
     */
    @Override
    @Transactional // Write operation needs @Transactional
    public RoomDTO updateRoom(Long roomId, CreateRoomRequest req) {
        log.info("Updating room: {}", roomId);

        Room room = getRoomEntity(roomId);

        room.setRoomNumber(req.getRoomNumber());
        room.setRoomType(req.getType());
        room.setDescription(req.getDescription());
        room.setCapacity(req.getCapacity());
        room.setBasePrice(req.getBasePrice());
        room.setMaxPrice(req.getMaxPrice());
        room.setAmenities(req.getAmenities());
        room.setActive(req.isActive());
        room.setUpdatedAt(LocalDateTime.now());

        Room updatedRoom = roomRepository.save(room);

        // Initialize amenities before mapping (still inside transaction)
        Hibernate.initialize(updatedRoom.getAmenities());

        log.info("Room updated successfully: {}", updatedRoom.getId());
        return hotelMapper.toRoomDTO(updatedRoom);
    }

    /**
     * Get a single room by ID
     *
     * @param roomId The room ID
     * @return Room DTO
     */
    @Override
    @Transactional(readOnly = true) // CRITICAL: Read operation needs @Transactional
    public RoomDTO getRoom(Long roomId) {
        log.info("Fetching room: {}", roomId);

        Room room = getRoomEntity(roomId);

        // Initialize amenities while still in transaction
        Hibernate.initialize(room.getAmenities());

        // Initialize hotel if needed for the DTO
        if (room.getHotel() != null) {
            Hibernate.initialize(room.getHotel());
        }

        return hotelMapper.toRoomDTO(room);
    }

    /**
     * Get all rooms for a specific hotel
     *
     * @param hotelCode The hotel code
     * @return List of room DTOs
     */
    @Override
    @Transactional(readOnly = true) // CRITICAL: Read operation needs @Transactional
    public List<RoomDTO> getRoomsByHotel(String hotelCode) {
        log.info("Fetching rooms for hotel: {}", hotelCode);

        List<Room> rooms = roomRepository.findByHotelHotelCode(hotelCode);

        // Initialize amenities for ALL rooms while still in transaction
        rooms.forEach(room -> {
            Hibernate.initialize(room.getAmenities());
            // Also initialize hotel reference if needed
            if (room.getHotel() != null) {
                Hibernate.initialize(room.getHotel());
            }
        });

        log.info("Found {} rooms for hotel: {}", rooms.size(), hotelCode);
        return hotelMapper.toRoomDTOList(rooms);
    }

    /**
     * Delete a room
     *
     * @param roomId The room ID
     */
    @Override
    @Transactional // Delete operation needs @Transactional
    public void deleteRoom(Long roomId) {
        log.info("Deleting room: {}", roomId);

        Room room = getRoomEntity(roomId);
        roomRepository.delete(room);

        log.info("Room deleted successfully: {}", roomId);
    }

    /**
     * Helper method to get room entity
     * This should be called within a @Transactional method
     *
     * @param roomId The room ID
     * @return Room entity
     */
    private Room getRoomEntity(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
    }

    /**
     * Optional: Get rooms by hotel ID (instead of code)
     *
     * @param hotelId The hotel ID
     * @return List of room DTOs
     */
    @Transactional(readOnly = true)
    public List<RoomDTO> getRoomsByHotelId(Long hotelId) {
        log.info("Fetching rooms for hotel ID: {}", hotelId);

        List<Room> rooms = roomRepository.findByHotelIdAndActiveTrue(hotelId);

        // Initialize amenities for all rooms
        rooms.forEach(room -> Hibernate.initialize(room.getAmenities()));

        log.info("Found {} active rooms for hotel ID: {}", rooms.size(), hotelId);
        return hotelMapper.toRoomDTOList(rooms);
    }

    /**
     * Optional: Get all rooms by hotel ID including inactive
     *
     * @param hotelId The hotel ID
     * @return List of room DTOs
     */
    @Transactional(readOnly = true)
    public List<RoomDTO> getAllRoomsByHotelId(Long hotelId) {
        log.info("Fetching all rooms (including inactive) for hotel ID: {}", hotelId);

        List<Room> rooms = roomRepository.findByHotelId(hotelId);

        // Initialize amenities for all rooms
        rooms.forEach(room -> Hibernate.initialize(room.getAmenities()));

        log.info("Found {} total rooms for hotel ID: {}", rooms.size(), hotelId);
        return hotelMapper.toRoomDTOList(rooms);
    }

    /**
     * Optional: Get rooms by type for a specific hotel
     *
     * @param hotelCode The hotel code
     * @param roomType  The room type
     * @return List of room DTOs
     */
    @Transactional(readOnly = true)
    public List<RoomDTO> getRoomsByHotelAndType(String hotelCode, String roomType) {
        log.info("Fetching {} type rooms for hotel: {}", roomType, hotelCode);

        Hotel hotel = hotelRepository.findByHotelCode(hotelCode)
                .orElseThrow(() -> new RuntimeException("Hotel not found with code: " + hotelCode));

        List<Room> rooms = roomRepository.findByHotelIdAndRoomTypeAndActiveTrue(
                hotel.getId(),
                roomType
        );

        // Initialize amenities for all rooms
        rooms.forEach(room -> Hibernate.initialize(room.getAmenities()));

        log.info("Found {} {} type rooms", rooms.size(), roomType);
        return hotelMapper.toRoomDTOList(rooms);
    }

    /**
     * Optional: Check if hotel has available rooms
     *
     * @param hotelCode The hotel code
     * @return true if hotel has available rooms
     */
    @Transactional(readOnly = true)
    public boolean hasAvailableRooms(String hotelCode) {
        log.info("Checking availability for hotel: {}", hotelCode);

        Hotel hotel = hotelRepository.findByHotelCode(hotelCode)
                .orElseThrow(() -> new RuntimeException("Hotel not found with code: " + hotelCode));

        boolean hasRooms = roomRepository.existsByHotelIdAndActiveTrue(hotel.getId());
        log.info("Hotel {} has available rooms: {}", hotelCode, hasRooms);

        return hasRooms;
    }

    /**
     * Optional: Count available rooms for a hotel
     *
     * @param hotelCode The hotel code
     * @return Number of available rooms
     */
    @Transactional(readOnly = true)
    public Long countAvailableRooms(String hotelCode) {
        log.info("Counting available rooms for hotel: {}", hotelCode);

        Hotel hotel = hotelRepository.findByHotelCode(hotelCode)
                .orElseThrow(() -> new RuntimeException("Hotel not found with code: " + hotelCode));

        Long count = roomRepository.countAvailableRoomsByHotelId(hotel.getId());
        log.info("Hotel {} has {} available rooms", hotelCode, count);

        return count;
    }
}