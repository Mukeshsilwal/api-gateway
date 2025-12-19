package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.Hotel;
import com.ticketkatum.entity.Room;
import com.ticketkatum.exception.HotelNotFoundException;
import com.ticketkatum.exception.RoomAlreadyExistsException;
import com.ticketkatum.exception.RoomNotFoundException;
import com.ticketkatum.mapper.HotelMapper;
import com.ticketkatum.model.CreateRoomRequest;
import com.ticketkatum.model.RoomDTO;
import com.ticketkatum.repository.HotelRepository;
import com.ticketkatum.repository.RoomRepository;
import com.ticketkatum.service.RoomService;
import com.ticketkatum.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.slf4j.MDC;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Room Service Implementation
 * Enhanced with caching, custom exceptions, and business validation
 */
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
    @Transactional
    @CacheEvict(value = { "hotel-rooms", "rooms" }, allEntries = true)
    public RoomDTO addRoom(String hotelCode, CreateRoomRequest req) {
        MDC.put("hotelCode", hotelCode);
        MDC.put("roomNumber", req.getRoomNumber());

        try {
            log.info("Adding room {} to hotel: {}", req.getRoomNumber(), hotelCode);

            // Validate input data
            validateRoomData(req);

            // Find hotel
            Hotel hotel = hotelRepository.findByHotelCode(hotelCode)
                    .orElseThrow(() -> {
                        log.warn("Hotel not found with code: {}", hotelCode);
                        return new HotelNotFoundException(hotelCode);
                    });

            // Check for duplicate room number
            if (roomRepository.existsByHotelIdAndRoomNumber(hotel.getId(), req.getRoomNumber())) {
                log.warn("Room {} already exists in hotel {}", req.getRoomNumber(), hotelCode);
                throw new RoomAlreadyExistsException(req.getRoomNumber(), hotelCode);
            }

            Room room = Room.builder()
                    .roomNumber(req.getRoomNumber())
                    .roomType(req.getRoomType())
                    .description(req.getDescription())
                    .capacity(req.getCapacity())
                    .basePrice(req.getBasePrice())
                    .maxPrice(req.getMaxPrice())
                    .amenities(req.getAmenities())
                    .active(req.getActive() != null ? req.getActive() : true)
                    .hotel(hotel)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            Room savedRoom = roomRepository.save(room);

            // Initialize amenities before mapping (still inside transaction)
            Hibernate.initialize(savedRoom.getAmenities());

            log.info("Room added successfully: {} to hotel: {}", savedRoom.getId(), hotelCode);
            return hotelMapper.toRoomDTO(savedRoom);
        } finally {
            MDC.clear();
        }
    }

    /**
     * Update an existing room
     *
     * @param roomId The room ID
     * @param req    Room update request
     * @return Updated room DTO
     */
    @Override
    @Transactional
    @CachePut(value = "rooms", key = "#result.id")
    @CacheEvict(value = "hotel-rooms", allEntries = true)
    public RoomDTO updateRoom(Long roomId, CreateRoomRequest req) {
        MDC.put("roomId", String.valueOf(roomId));

        try {
            log.info("Updating room: {}", roomId);

            // Validate input data
            validateRoomData(req);

            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> {
                        log.warn("Room not found with id: {}", roomId);
                        return new RoomNotFoundException(roomId);
                    });

            // Check for duplicate room number (excluding current room)
            if (!room.getRoomNumber().equals(req.getRoomNumber()) &&
                    roomRepository.existsByHotelIdAndRoomNumber(room.getHotel().getId(), req.getRoomNumber())) {
                log.warn("Room {} already exists in hotel", req.getRoomNumber());
                throw new RoomAlreadyExistsException(req.getRoomNumber(), room.getHotel().getHotelCode());
            }

            room.setRoomNumber(req.getRoomNumber());
            room.setRoomType(req.getRoomType());
            room.setDescription(req.getDescription());
            room.setCapacity(req.getCapacity());
            room.setBasePrice(req.getBasePrice());
            room.setMaxPrice(req.getMaxPrice());
            room.setAmenities(req.getAmenities());
            room.setUpdatedAt(LocalDateTime.now());

            Room updatedRoom = roomRepository.save(room);

            // Initialize amenities before mapping (still inside transaction)
            Hibernate.initialize(updatedRoom.getAmenities());

            log.info("Room updated successfully: {}", updatedRoom.getId());
            return hotelMapper.toRoomDTO(updatedRoom);
        } finally {
            MDC.clear();
        }
    }

    /**
     * Get a single room by ID
     *
     * @param roomId The room ID
     * @return Room DTO
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "rooms", key = "#roomId", unless = "#result == null")
    public RoomDTO getRoom(Long roomId) {
        MDC.put("roomId", String.valueOf(roomId));

        try {
            log.debug("Fetching room from database: {}", roomId);

            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> {
                        log.warn("Room not found with id: {}", roomId);
                        return new RoomNotFoundException(roomId);
                    });

            // Initialize amenities while still in transaction
            Hibernate.initialize(room.getAmenities());

            // Initialize hotel if needed for the DTO
            if (room.getHotel() != null) {
                Hibernate.initialize(room.getHotel());
            }

            log.debug("Room retrieved successfully: {}", roomId);
            return hotelMapper.toRoomDTO(room);
        } finally {
            MDC.clear();
        }
    }

    /**
     * Get all rooms for a specific hotel
     *
     * @param hotelCode The hotel code
     * @return List of room DTOs
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "hotel-rooms", key = "#hotelCode")
    public List<RoomDTO> getRoomsByHotel(String hotelCode) {
        MDC.put("hotelCode", hotelCode);

        try {
            log.debug("Fetching rooms for hotel: {}", hotelCode);

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
        } finally {
            MDC.clear();
        }
    }

    /**
     * Delete a room
     *
     * @param roomId The room ID
     */
    @Override
    @Transactional
    @CacheEvict(value = { "rooms", "hotel-rooms" }, allEntries = true)
    public void deleteRoom(Long roomId) {
        MDC.put("roomId", String.valueOf(roomId));

        try {
            log.info("Deleting room: {}", roomId);

            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> {
                        log.warn("Room not found for deletion with id: {}", roomId);
                        return new RoomNotFoundException(roomId);
                    });

            roomRepository.delete(room);

            log.info("Room deleted successfully: {}", roomId);
        } finally {
            MDC.clear();
        }
    }

    /**
     * Validate room data
     *
     * @param req Room creation/update request
     */
    private void validateRoomData(CreateRoomRequest req) {
        // Validate required fields
        ValidationUtils.validateRoomNumber(req.getRoomNumber());

        // Validate capacity
        ValidationUtils.validateCapacity(req.getCapacity());

        // Validate price range
        ValidationUtils.validatePriceRange(req.getBasePrice(), req.getMaxPrice());
    }

    /**
     * Optional: Get rooms by hotel ID (instead of code)
     *
     * @param hotelId The hotel ID
     * @return List of room DTOs
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "hotel-rooms", key = "'hotel-id-' + #hotelId")
    public List<RoomDTO> getRoomsByHotelId(Long hotelId) {
        MDC.put("hotelId", String.valueOf(hotelId));

        try {
            log.debug("Fetching rooms for hotel ID: {}", hotelId);

            List<Room> rooms = roomRepository.findByHotelIdAndActiveTrue(hotelId);

            // Initialize amenities for all rooms
            rooms.forEach(room -> Hibernate.initialize(room.getAmenities()));

            log.info("Found {} active rooms for hotel ID: {}", rooms.size(), hotelId);
            return hotelMapper.toRoomDTOList(rooms);
        } finally {
            MDC.clear();
        }
    }

    /**
     * Optional: Get all rooms by hotel ID including inactive
     *
     * @param hotelId The hotel ID
     * @return List of room DTOs
     */
    @Transactional(readOnly = true)
    public List<RoomDTO> getAllRoomsByHotelId(Long hotelId) {
        MDC.put("hotelId", String.valueOf(hotelId));

        try {
            log.debug("Fetching all rooms (including inactive) for hotel ID: {}", hotelId);

            List<Room> rooms = roomRepository.findByHotelId(hotelId);

            // Initialize amenities for all rooms
            rooms.forEach(room -> Hibernate.initialize(room.getAmenities()));

            log.info("Found {} total rooms for hotel ID: {}", rooms.size(), hotelId);
            return hotelMapper.toRoomDTOList(rooms);
        } finally {
            MDC.clear();
        }
    }

    /**
     * Optional: Get rooms by type for a specific hotel
     *
     * @param hotelCode The hotel code
     * @param roomType  The room type
     * @return List of room DTOs
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "hotel-rooms", key = "#hotelCode + '-' + #roomType")
    public List<RoomDTO> getRoomsByHotelAndType(String hotelCode, String roomType) {
        MDC.put("hotelCode", hotelCode);
        MDC.put("roomType", roomType);

        try {
            log.debug("Fetching {} type rooms for hotel: {}", roomType, hotelCode);

            Hotel hotel = hotelRepository.findByHotelCode(hotelCode)
                    .orElseThrow(() -> {
                        log.warn("Hotel not found with code: {}", hotelCode);
                        return new HotelNotFoundException(hotelCode);
                    });

            List<Room> rooms = roomRepository.findByHotelIdAndRoomTypeAndActiveTrue(
                    hotel.getId(),
                    roomType);

            // Initialize amenities for all rooms
            rooms.forEach(room -> Hibernate.initialize(room.getAmenities()));

            log.info("Found {} {} type rooms", rooms.size(), roomType);
            return hotelMapper.toRoomDTOList(rooms);
        } finally {
            MDC.clear();
        }
    }

    /**
     * Optional: Check if hotel has available rooms
     *
     * @param hotelCode The hotel code
     * @return true if hotel has available rooms
     */
    @Transactional(readOnly = true)
    public boolean hasAvailableRooms(String hotelCode) {
        MDC.put("hotelCode", hotelCode);

        try {
            log.debug("Checking availability for hotel: {}", hotelCode);

            Hotel hotel = hotelRepository.findByHotelCode(hotelCode)
                    .orElseThrow(() -> {
                        log.warn("Hotel not found with code: {}", hotelCode);
                        return new HotelNotFoundException(hotelCode);
                    });

            boolean hasRooms = roomRepository.existsByHotelIdAndActiveTrue(hotel.getId());
            log.info("Hotel {} has available rooms: {}", hotelCode, hasRooms);

            return hasRooms;
        } finally {
            MDC.clear();
        }
    }

    /**
     * Optional: Count available rooms for a hotel
     *
     * @param hotelCode The hotel code
     * @return Number of available rooms
     */
    @Transactional(readOnly = true)
    public Long countAvailableRooms(String hotelCode) {
        MDC.put("hotelCode", hotelCode);

        try {
            log.debug("Counting available rooms for hotel: {}", hotelCode);

            Hotel hotel = hotelRepository.findByHotelCode(hotelCode)
                    .orElseThrow(() -> {
                        log.warn("Hotel not found with code: {}", hotelCode);
                        return new HotelNotFoundException(hotelCode);
                    });

            Long count = roomRepository.countAvailableRoomsByHotelId(hotel.getId());
            log.info("Hotel {} has {} available rooms", hotelCode, count);

            return count;
        } finally {
            MDC.clear();
        }
    }
}
