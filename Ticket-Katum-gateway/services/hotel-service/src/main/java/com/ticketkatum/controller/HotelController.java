package com.ticketkatum.controller;

import com.ticketkatum.model.CreateHotelRequest;
import com.ticketkatum.model.CreateRoomRequest;
import com.ticketkatum.model.HotelDTO;
import com.ticketkatum.model.RoomDTO;
import com.ticketkatum.service.HotelService;
import com.ticketkatum.service.RoomService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;
    private final RoomService roomService;

    /**
     * Create a new hotel
     * POST /api/hotels
     */
    @PostMapping
    public ResponseEntity<Response<HotelDTO>> createHotel(@Valid @RequestBody CreateHotelRequest request) {
        log.info("Creating hotel: {}", request.getName());

        try {
            HotelDTO hotel = hotelService.createHotel(request);
            Response<HotelDTO> response = ResponseHandler.created("Hotel created successfully", hotel);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating hotel", e);
            Response<HotelDTO> response = ResponseHandler.failure("Failed to create hotel: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get hotel by ID
     * GET /api/hotels/{hotelId}
     */
    @GetMapping("/{hotelId}")
    public ResponseEntity<Response<HotelDTO>> getHotel(@PathVariable("hotelId") Long hotelId) {
        log.info("Fetching hotel with ID: {}", hotelId);

        try {
            HotelDTO hotel = hotelService.getHotel(hotelId);
            Response<HotelDTO> response = ResponseHandler.success("Hotel retrieved successfully", hotel);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching hotel {}", hotelId, e);
            Response<HotelDTO> response = ResponseHandler.notFound("Hotel not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Get all hotels with optional filters
     * GET /api/hotels?city=Kathmandu&minStars=4
     */
    @GetMapping
    public ResponseEntity<Response<List<HotelDTO>>> getAllHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer minStars) {

        log.info("Fetching all hotels - city: {}, minStars: {}", city, minStars);

        try {
            List<HotelDTO> hotels = hotelService.getAllHotels();

            if (city != null) {
                hotels = hotels.stream()
                        .filter(h -> city.equalsIgnoreCase(h.getCity()))
                        .toList();
            }

            if (minStars != null) {
                hotels = hotels.stream()
                        .filter(h -> h.getStars() != null && h.getStars() >= minStars)
                        .toList();
            }

            Response<List<HotelDTO>> response = ResponseHandler.success(
                    "Found " + hotels.size() + " hotels",
                    hotels
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching hotels", e);
            Response<List<HotelDTO>> response = ResponseHandler.internalError(
                    "Failed to fetch hotels: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update hotel
     * PUT /api/hotels/{hotelId}
     */
    @PutMapping("/{hotelId}")
    public ResponseEntity<Response<HotelDTO>> updateHotel(
            @PathVariable Long hotelId,
            @Valid @RequestBody CreateHotelRequest request) {

        log.info("Updating hotel: {}", hotelId);

        try {
            HotelDTO hotel = hotelService.updateHotel(hotelId, request);
            Response<HotelDTO> response = ResponseHandler.success("Hotel updated successfully", hotel);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating hotel {}", hotelId, e);
            Response<HotelDTO> response = ResponseHandler.failure("Failed to update hotel: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Delete hotel
     * DELETE /api/hotels/{hotelId}
     */
    @DeleteMapping("/{hotelId}")
    public ResponseEntity<Response<Void>> deleteHotel(@PathVariable Long hotelId) {
        log.info("Deleting hotel: {}", hotelId);

        try {
            hotelService.deleteHotel(hotelId);
            Response<Void> response = ResponseHandler.success("Hotel deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting hotel {}", hotelId, e);
            Response<Void> response = ResponseHandler.failure("Failed to delete hotel: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    /**
     * Add room to hotel
     * POST /api/hotels/{hotelCode}/rooms
     */
    @PostMapping("/{hotelCode}/rooms")
    public ResponseEntity<Response<RoomDTO>> addRoomToHotel(
            @PathVariable String hotelCode,
            @Valid @RequestBody CreateRoomRequest request) {

        log.info("Adding room to hotel: {}", hotelCode);

        try {
            RoomDTO room = roomService.addRoom(hotelCode, request);
            Response<RoomDTO> response = ResponseHandler.created("Room added successfully", room);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error adding room to hotel {}", hotelCode, e);
            Response<RoomDTO> response = ResponseHandler.failure("Failed to add room: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get rooms by hotel with optional filters
     * GET /api/hotels/{hotelCode}/rooms?roomType=Deluxe&active=true
     */
    @GetMapping("/{hotelCode}/rooms")
    public ResponseEntity<Response<List<RoomDTO>>> getRoomsByHotel(
            @PathVariable String hotelCode,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) Boolean active) {

        log.info("Fetching rooms for hotel: {} - type: {}, active: {}", hotelCode, roomType, active);

        try {
            List<RoomDTO> rooms = roomService.getRoomsByHotel(hotelCode);

            if (roomType != null) {
                rooms = rooms.stream()
                        .filter(r -> roomType.equalsIgnoreCase(r.getRoomType()))
                        .toList();
            }

            if (active != null) {
                rooms = rooms.stream()
                        .filter(r -> r.isActive() == active)
                        .toList();
            }

            Response<List<RoomDTO>> response = ResponseHandler.success(
                    "Found " + rooms.size() + " rooms",
                    rooms
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching rooms for hotel {}", hotelCode, e);
            Response<List<RoomDTO>> response = ResponseHandler.failure(
                    "Failed to fetch rooms: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get room by ID
     * GET /api/hotels/rooms/{roomId}
     */
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<Response<RoomDTO>> getRoomById(@PathVariable Long roomId) {
        log.info("Fetching room with ID: {}", roomId);

        try {
            RoomDTO room = roomService.getRoom(roomId);
            Response<RoomDTO> response = ResponseHandler.success("Room retrieved successfully", room);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching room {}", roomId, e);
            Response<RoomDTO> response = ResponseHandler.notFound("Room not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Update room
     * PUT /api/hotels/rooms/{roomId}
     */
    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<Response<RoomDTO>> updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody CreateRoomRequest request) {

        log.info("Updating room: {}", roomId);

        try {
            RoomDTO room = roomService.updateRoom(roomId, request);
            Response<RoomDTO> response = ResponseHandler.success("Room updated successfully", room);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating room {}", roomId, e);
            Response<RoomDTO> response = ResponseHandler.failure("Failed to update room: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Delete room
     * DELETE /api/hotels/rooms/{roomId}
     */
    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Response<Void>> deleteRoom(@PathVariable Long roomId) {
        log.info("Deleting room: {}", roomId);

        try {
            roomService.deleteRoom(roomId);
            Response<Void> response = ResponseHandler.success("Room deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting room {}", roomId, e);
            Response<Void> response = ResponseHandler.failure("Failed to delete room: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    /**
     * Search hotels by city name
     * GET /api/hotels/search/city/name/{city}
     */
    @GetMapping("/search/city/name/{city}")
    public ResponseEntity<Response<List<HotelDTO>>> searchHotelsByCity(@PathVariable String city) {
        log.info("Searching hotels in city: {}", city);

        try {
            List<HotelDTO> hotels = hotelService.getAllHotels().stream()
                    .filter(h -> city.equalsIgnoreCase(h.getCity()))
                    .toList();

            Response<List<HotelDTO>> response = ResponseHandler.success(
                    "Found " + hotels.size() + " hotels in " + city,
                    hotels
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching hotels in city {}", city, e);
            Response<List<HotelDTO>> response = ResponseHandler.internalError(
                    "Search failed: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get hotel by code
     * GET /api/hotels/code/{hotelCode}
     */
    @GetMapping("/code/{hotelCode}")
    public ResponseEntity<Response<HotelDTO>> getHotelByCode(@PathVariable("hotelCode") String hotelCode) {
        log.info("Fetching hotel with code: {}", hotelCode);

        try {
            HotelDTO hotel = hotelService.getHotelByCode(hotelCode);
            Response<HotelDTO> response = ResponseHandler.success("Hotel retrieved successfully", hotel);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching hotel by code {}", hotelCode, e);
            Response<HotelDTO> response = ResponseHandler.notFound("Hotel not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}