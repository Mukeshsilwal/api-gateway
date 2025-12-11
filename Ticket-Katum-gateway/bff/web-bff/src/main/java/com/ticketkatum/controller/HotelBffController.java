package com.ticketkatum.controller;

import com.ticketkatum.client.HotelServiceClient;
import com.ticketkatum.dto.Response;
import com.ticketkatum.dto.hotel.HotelDTO;
import com.ticketkatum.dto.hotel.HotelSearchCriteria;
import com.ticketkatum.dto.hotel.RoomDTO;
import com.ticketkatum.dto.hotel.request.CreateHotelRequest;
import com.ticketkatum.dto.hotel.request.CreateRoomRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Hotel Controller for Web BFF
 * Proxies requests to Hotel Management Microservice
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/v1/hotels")
@RequiredArgsConstructor
public class HotelBffController {

    private final HotelServiceClient hotelClient;

    // ============ Hotel Operations ============

    /**
     * Create a new hotel
     * POST /api/v1/hotels
     */
    @PostMapping("/create")
    public CompletableFuture<ResponseEntity<Response<HotelDTO>>> createHotel(
            @Valid @RequestBody CreateHotelRequest request) {

        log.info("Creating hotel: {}", request.getName());

        return hotelClient.createHotel(request)
                .thenApply(hotel -> {
                    Response<HotelDTO> response = Response.<HotelDTO>builder()
                            .statusCode(200)
                            .message("Hotel created successfully")
                            .data(hotel)
                            .build();
                    return ResponseEntity.status(HttpStatus.CREATED).body(response);
                })
                .exceptionally(ex -> {
                    log.error("Error creating hotel", ex);
                    Response<HotelDTO> response = Response.<HotelDTO>builder()
                            .statusCode(500)
                            .message("Failed to create hotel: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                });
    }

    /**
     * Get hotel by ID
     * GET /api/v1/hotels/{hotelId}
     */
    @GetMapping("/{hotelId}")
    public CompletableFuture<ResponseEntity<Response<HotelDTO>>> getHotel(
            @PathVariable Long hotelId) {

        log.info("Fetching hotel with ID: {}", hotelId);

        return hotelClient.getHotelById(hotelId)
                .thenApply(hotel -> {
                    Response<HotelDTO> response = Response.<HotelDTO>builder()
                            .statusCode(200)
                            .message("Hotel retrieved successfully")
                            .data(hotel)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error fetching hotel {}", hotelId, ex);
                    Response<HotelDTO> response = Response.<HotelDTO>builder()
                            .statusCode(500)
                            .message("Hotel not found: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    /**
     * Get hotel by code
     * GET /api/v1/hotels/code/{hotelCode}
     */
    @GetMapping("/code/{hotelCode}")
    public CompletableFuture<ResponseEntity<Response<HotelDTO>>> getHotelByCode(
            @PathVariable String hotelCode) {

        log.info("Fetching hotel with code: {}", hotelCode);

        return hotelClient.getHotelByCode(hotelCode)
                .thenApply(hotel -> {
                    Response<HotelDTO> response = Response.<HotelDTO>builder()
                            .statusCode(200)
                            .message("Hotel retrieved successfully")
                            .data(hotel)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error fetching hotel by code {}", hotelCode, ex);
                    Response<HotelDTO> response = Response.<HotelDTO>builder()
                            .statusCode(500)
                            .message("Hotel not found: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    /**
     * Get all hotels with optional filters
     * GET /api/v1/hotels?city=Kathmandu&minStars=4
     */
    @GetMapping
    public CompletableFuture<ResponseEntity<Response<List<HotelDTO>>>> getAllHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer minStars) {

        log.info("Fetching all hotels - city: {}, minStars: {}", city, minStars);

        return hotelClient.getAllHotels(city, minStars)
                .thenApply(hotels -> {
                    Response<List<HotelDTO>> response = Response.<List<HotelDTO>>builder()
                            .statusCode(200)
                            .message("Found " + hotels.size() + " hotels")
                            .data(hotels)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error fetching hotels", ex);
                    Response<List<HotelDTO>> response = Response.<List<HotelDTO>>builder()
                            .statusCode(500)
                            .message("Failed to fetch hotels: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                });
    }

    /**
     * Search hotels by criteria
     * POST /api/v1/hotels/search
     */
    @PostMapping("/search")
    public CompletableFuture<ResponseEntity<Response<List<HotelDTO>>>> searchHotels(
            @RequestBody HotelSearchCriteria criteria) {

        log.info("Searching hotels with criteria: {}", criteria);

        return hotelClient.searchHotels(criteria)
                .thenApply(hotels -> {
                    Response<List<HotelDTO>> response = Response.<List<HotelDTO>>builder()
                            .statusCode(200)
                            .message("Found " + hotels.size() + " hotels")
                            .data(hotels)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error searching hotels", ex);
                    Response<List<HotelDTO>> response = Response.<List<HotelDTO>>builder()
                            .statusCode(500)
                            .message("Search failed: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                });
    }

    /**
     * Update hotel
     * PUT /api/v1/hotels/{hotelId}
     */
    @PutMapping("/{hotelId}")
    public CompletableFuture<ResponseEntity<Response<HotelDTO>>> updateHotel(
            @PathVariable Long hotelId,
            @Valid @RequestBody CreateHotelRequest request) {

        log.info("Updating hotel: {}", hotelId);

        return hotelClient.updateHotel(hotelId, request)
                .thenApply(hotel -> {
                    Response<HotelDTO> response = Response.<HotelDTO>builder()
                            .statusCode(200)
                            .message("Hotel updated successfully")
                            .data(hotel)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error updating hotel {}", hotelId, ex);
                    Response<HotelDTO> response = Response.<HotelDTO>builder()
                            .statusCode(500)
                            .message("Failed to update hotel: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                });
    }

    /**
     * Delete hotel
     * DELETE /api/v1/hotels/{hotelId}
     */
    @DeleteMapping("/{hotelId}")
    public CompletableFuture<ResponseEntity<Response<Void>>> deleteHotel(
            @PathVariable Long hotelId) {

        log.info("Deleting hotel: {}", hotelId);

        return hotelClient.deleteHotel(hotelId)
                .thenApply(v -> {
                    Response<Void> response = Response.<Void>builder()
                            .statusCode(200)
                            .message("Hotel deleted successfully")
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error deleting hotel {}", hotelId, ex);
                    Response<Void> response = Response.<Void>builder()
                            .statusCode(500)
                            .message("Failed to delete hotel: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                });
    }

    // ============ Room Operations ============

    /**
     * Add room to hotel
     * POST /api/v1/hotels/{hotelCode}/rooms
     */
    @PostMapping("/{hotelCode}/rooms")
    public CompletableFuture<ResponseEntity<Response<RoomDTO>>> addRoomToHotel(
            @PathVariable String hotelCode,
            @Valid @RequestBody CreateRoomRequest request) {

        log.info("Adding room to hotel: {}", hotelCode);

        return hotelClient.addRoom(hotelCode, request)
                .thenApply(room -> {
                    Response<RoomDTO> response = Response.<RoomDTO>builder()
                            .statusCode(200)
                            .message("Room added successfully")
                            .data(room)
                            .build();
                    return ResponseEntity.status(HttpStatus.CREATED).body(response);
                })
                .exceptionally(ex -> {
                    log.error("Error adding room to hotel {}", hotelCode, ex);
                    Response<RoomDTO> response = Response.<RoomDTO>builder()
                            .statusCode(500)
                            .message("Failed to add room: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                });
    }

    /**
     * Get rooms by hotel code
     * GET /api/v1/hotels/{hotelCode}/rooms
     */
    @GetMapping("/{hotelCode}/rooms")
    public CompletableFuture<ResponseEntity<Response<List<RoomDTO>>>> getRoomsByHotelCode(
            @PathVariable String hotelCode) {

        log.info("Fetching rooms for hotel: {}", hotelCode);

        return hotelClient.getRoomsByHotelCode(hotelCode)
                .thenApply(rooms -> {
                    Response<List<RoomDTO>> response = Response.<List<RoomDTO>>builder()
                            .statusCode(200)
                            .message("Found " + rooms.size() + " rooms")
                            .data(rooms)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error fetching rooms for hotel {}", hotelCode, ex);
                    Response<List<RoomDTO>> response = Response.<List<RoomDTO>>builder()
                            .statusCode(500)
                            .message("Failed to fetch rooms: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                });
    }

    /**
     * Get rooms by hotel ID
     * GET /api/v1/hotels/hotel/{hotelId}/rooms
     */
    @GetMapping("/hotel/{hotelId}/rooms")
    public CompletableFuture<ResponseEntity<Response<List<RoomDTO>>>> getRoomsByHotelId(
            @PathVariable Long hotelId) {

        log.info("Fetching rooms for hotel ID: {}", hotelId);

        return hotelClient.getRoomsByHotelId(hotelId)
                .thenApply(rooms -> {
                    Response<List<RoomDTO>> response = Response.<List<RoomDTO>>builder()
                            .statusCode(200)
                            .message("Found " + rooms.size() + " rooms")
                            .data(rooms)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error fetching rooms for hotel ID {}", hotelId, ex);
                    Response<List<RoomDTO>> response = Response.<List<RoomDTO>>builder()
                            .statusCode(500)
                            .message("Failed to fetch rooms: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                });
    }

    /**
     * Get room by ID
     * GET /api/v1/hotels/rooms/{roomId}
     */
    @GetMapping("/rooms/{roomId}")
    public CompletableFuture<ResponseEntity<Response<RoomDTO>>> getRoomById(
            @PathVariable Long roomId) {

        log.info("Fetching room with ID: {}", roomId);

        return hotelClient.getRoomById(roomId)
                .thenApply(room -> {
                    Response<RoomDTO> response = Response.<RoomDTO>builder()
                            .statusCode(200)
                            .message("Room retrieved successfully")
                            .data(room)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error fetching room {}", roomId, ex);
                    Response<RoomDTO> response = Response.<RoomDTO>builder()
                            .statusCode(500)
                            .message("Room not found: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    /**
     * Get multiple rooms by IDs
     * POST /api/v1/hotels/rooms/batch
     */
    @PostMapping("/rooms/batch")
    public CompletableFuture<ResponseEntity<Response<List<RoomDTO>>>> getRoomsByIds(
            @RequestBody List<Long> roomIds) {

        log.info("Fetching rooms by IDs: {}", roomIds);

        return hotelClient.getRoomsByIds(roomIds)
                .thenApply(rooms -> {
                    Response<List<RoomDTO>> response = Response.<List<RoomDTO>>builder()
                            .statusCode(200)
                            .message("Found " + rooms.size() + " rooms")
                            .data(rooms)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error fetching rooms by IDs", ex);
                    Response<List<RoomDTO>> response = Response.<List<RoomDTO>>builder()
                            .statusCode(500)
                            .message("Failed to fetch rooms: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                });
    }

    /**
     * Update room
     * PUT /api/v1/hotels/rooms/{roomId}
     */
    @PutMapping("/rooms/{roomId}")
    public CompletableFuture<ResponseEntity<Response<RoomDTO>>> updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody CreateRoomRequest request) {

        log.info("Updating room: {}", roomId);

        return hotelClient.updateRoom(roomId, request)
                .thenApply(room -> {
                    Response<RoomDTO> response = Response.<RoomDTO>builder()
                            .statusCode(200)
                            .message("Room updated successfully")
                            .data(room)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error updating room {}", roomId, ex);
                    Response<RoomDTO> response = Response.<RoomDTO>builder()
                            .statusCode(500)
                            .message("Failed to update room: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                });
    }

    /**
     * Delete room
     * DELETE /api/v1/hotels/rooms/{roomId}
     */
    @DeleteMapping("/rooms/{roomId}")
    public CompletableFuture<ResponseEntity<Response<Void>>> deleteRoom(
            @PathVariable Long roomId) {

        log.info("Deleting room: {}", roomId);

        return hotelClient.deleteRoom(roomId)
                .thenApply(v -> {
                    Response<Void> response = Response.<Void>builder()
                            .statusCode(200)
                            .message("Room deleted successfully")
                            .build();
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error deleting room {}", roomId, ex);
                    Response<Void> response = Response.<Void>builder()
                            .statusCode(500)
                            .message("Failed to delete room: " + ex.getMessage())
                            .build();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                });
    }
}