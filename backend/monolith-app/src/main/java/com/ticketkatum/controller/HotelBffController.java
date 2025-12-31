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
                        @PathVariable("hotelId") Long hotelId) {

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
                        @PathVariable("hotelCode") String hotelCode) {

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
        public CompletableFuture<ResponseEntity<Response<List<HotelDTO>>>> getAllHotels() {

                return hotelClient.getAllHotels()
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
                        @PathVariable("hotelCode") String hotelCode,
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
                        @PathVariable("hotelCode") String hotelCode) {

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

        // ============ Booking Operations ============

        /**
         * Check availability
         * POST /api/bff/v1/hotels/bookings/availability
         */
        @PostMapping("/bookings/availability")
        public CompletableFuture<ResponseEntity<Response<List<com.ticketkatum.dto.hotel.booking.AvailableRoomDto>>>> checkAvailability(
                        @Valid @RequestBody com.ticketkatum.dto.hotel.booking.AvailabilityRequestDto request) {

                log.info("Checking availability for hotel: {}", request.getHotelId());

                return hotelClient.checkAvailability(request)
                                .thenApply(rooms -> {
                                        Response<List<com.ticketkatum.dto.hotel.booking.AvailableRoomDto>> response = Response.<List<com.ticketkatum.dto.hotel.booking.AvailableRoomDto>>builder()
                                                        .statusCode(200)
                                                        .message("Found " + rooms.size() + " available rooms")
                                                        .data(rooms)
                                                        .build();
                                        return ResponseEntity.ok(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error checking availability", ex);
                                        Response<List<com.ticketkatum.dto.hotel.booking.AvailableRoomDto>> response = Response.<List<com.ticketkatum.dto.hotel.booking.AvailableRoomDto>>builder()
                                                        .statusCode(500)
                                                        .message("Failed to check availability: " + ex.getMessage())
                                                        .build();
                                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                                });
        }

        /**
         * Calculate price
         * POST /api/bff/v1/hotels/bookings/price
         */
        @PostMapping("/bookings/price")
        public CompletableFuture<ResponseEntity<Response<com.ticketkatum.dto.hotel.booking.PricingResponseDto>>> calculatePrice(
                        @Valid @RequestBody com.ticketkatum.dto.hotel.booking.PricingRequestDto request) {

                log.info("Calculating price for room: {}", request.getRoomId());

                return hotelClient.calculatePrice(request)
                                .thenApply(pricing -> {
                                        Response<com.ticketkatum.dto.hotel.booking.PricingResponseDto> response = Response.<com.ticketkatum.dto.hotel.booking.PricingResponseDto>builder()
                                                        .statusCode(200)
                                                        .message("Price calculated successfully")
                                                        .data(pricing)
                                                        .build();
                                        return ResponseEntity.ok(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error calculating price", ex);
                                        Response<com.ticketkatum.dto.hotel.booking.PricingResponseDto> response = Response.<com.ticketkatum.dto.hotel.booking.PricingResponseDto>builder()
                                                        .statusCode(500)
                                                        .message("Failed to calculate price: " + ex.getMessage())
                                                        .build();
                                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                                });
        }

        /**
         * Lock Room (Initiate Booking)
         * POST /api/bff/v1/hotels/bookings/lock
         */
        @PostMapping("/bookings/lock")
        @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
        public CompletableFuture<ResponseEntity<Response<com.ticketkatum.dto.hotel.booking.BookingResponseDto>>> lockRoom(
                        @Valid @RequestBody com.ticketkatum.dto.hotel.booking.BookingRequestDto request,
                        @RequestAttribute(value = "userId", required = false) Object userIdObj) {

                if (userIdObj == null) {
                        return CompletableFuture
                                        .completedFuture(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
                }
                String userId = String.valueOf(userIdObj);

                log.info("Locking room for hotel: {} by user: {}", request.getHotelId(), userId);

                return hotelClient.lockRoom(request, userId)
                                .thenApply(booking -> {
                                        Response<com.ticketkatum.dto.hotel.booking.BookingResponseDto> response = Response.<com.ticketkatum.dto.hotel.booking.BookingResponseDto>builder()
                                                        .statusCode(201)
                                                        .message("Room locked successfully. Expires in 15 mins.")
                                                        .data(booking)
                                                        .build();
                                        return ResponseEntity.status(HttpStatus.CREATED).body(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error locking room", ex);
                                        Response<com.ticketkatum.dto.hotel.booking.BookingResponseDto> response = Response.<com.ticketkatum.dto.hotel.booking.BookingResponseDto>builder()
                                                        .statusCode(500)
                                                        .message("Failed to lock room: " + ex.getMessage())
                                                        .build();
                                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                                });
        }

        /**
         * Confirm Booking
         * POST /api/bff/v1/hotels/bookings/{reference}/confirm
         */
        @PostMapping("/bookings/{reference}/confirm")
        @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
        public CompletableFuture<ResponseEntity<Response<com.ticketkatum.dto.hotel.booking.BookingResponseDto>>> confirmBooking(
                        @PathVariable String reference,
                        @RequestAttribute(value = "userId", required = false) Object userIdObj) {

                if (userIdObj == null) {
                        return CompletableFuture
                                        .completedFuture(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
                }
                String userId = String.valueOf(userIdObj);

                log.info("Confirming booking: {} by user: {}", reference, userId);

                return hotelClient.confirmBooking(reference, userId)
                                .thenApply(booking -> {
                                        Response<com.ticketkatum.dto.hotel.booking.BookingResponseDto> response = Response.<com.ticketkatum.dto.hotel.booking.BookingResponseDto>builder()
                                                        .statusCode(200)
                                                        .message("Booking confirmed successfully")
                                                        .data(booking)
                                                        .build();
                                        return ResponseEntity.ok(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error confirming booking", ex);
                                        Response<com.ticketkatum.dto.hotel.booking.BookingResponseDto> response = Response.<com.ticketkatum.dto.hotel.booking.BookingResponseDto>builder()
                                                        .statusCode(500)
                                                        .message("Failed to confirm booking: " + ex.getMessage())
                                                        .build();
                                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                                });
        }

        // Legacy Create Booking (Delegates to Lock+Confirm in Service)
        @PostMapping("/bookings")
        @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
        public CompletableFuture<ResponseEntity<Response<com.ticketkatum.dto.hotel.booking.BookingResponseDto>>> createBooking(
                        @Valid @RequestBody com.ticketkatum.dto.hotel.booking.BookingRequestDto request,
                        @RequestAttribute(value = "userId", required = false) Object userIdObj) {

                if (userIdObj == null) {
                        return CompletableFuture
                                        .completedFuture(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
                }
                String userId = String.valueOf(userIdObj);

                log.info("Creating booking (Legacy) for hotel: {} by user: {}", request.getHotelId(), userId);

                return hotelClient.createBooking(request, userId)
                                .thenApply(booking -> {
                                        Response<com.ticketkatum.dto.hotel.booking.BookingResponseDto> response = Response.<com.ticketkatum.dto.hotel.booking.BookingResponseDto>builder()
                                                        .statusCode(201)
                                                        .message("Booking created successfully")
                                                        .data(booking)
                                                        .build();
                                        return ResponseEntity.status(HttpStatus.CREATED).body(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error creating booking", ex);
                                        Response<com.ticketkatum.dto.hotel.booking.BookingResponseDto> response = Response.<com.ticketkatum.dto.hotel.booking.BookingResponseDto>builder()
                                                        .statusCode(500)
                                                        .message("Failed to create booking: " + ex.getMessage())
                                                        .build();
                                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                                });
        }

        /**
         * Get booking by reference
         * GET /api/bff/v1/hotels/bookings/{reference}
         */
        @GetMapping("/bookings/{reference}")
        @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
        public CompletableFuture<ResponseEntity<Response<com.ticketkatum.dto.hotel.booking.BookingResponseDto>>> getBooking(
                        @PathVariable String reference) {

                log.info("Fetching booking: {}", reference);

                return hotelClient.getBooking(reference)
                                .thenApply(booking -> {
                                        Response<com.ticketkatum.dto.hotel.booking.BookingResponseDto> response = Response.<com.ticketkatum.dto.hotel.booking.BookingResponseDto>builder()
                                                        .statusCode(200)
                                                        .message("Booking retrieved successfully")
                                                        .data(booking)
                                                        .build();
                                        return ResponseEntity.ok(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error fetching booking {}", reference, ex);
                                        Response<com.ticketkatum.dto.hotel.booking.BookingResponseDto> response = Response.<com.ticketkatum.dto.hotel.booking.BookingResponseDto>builder()
                                                        .statusCode(500)
                                                        .message("Booking not found: " + ex.getMessage())
                                                        .build();
                                        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                                });
        }

        /**
         * Cancel booking
         * POST /api/bff/v1/hotels/bookings/{reference}/cancel
         */
        @PostMapping("/bookings/{reference}/cancel")
        @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
        public CompletableFuture<ResponseEntity<Response<Void>>> cancelBooking(
                        @PathVariable String reference,
                        @RequestAttribute(value = "userId", required = false) Object userIdObj) {

                if (userIdObj == null) {
                        return CompletableFuture
                                        .completedFuture(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
                }
                String userId = String.valueOf(userIdObj);

                log.info("Cancelling booking: {} by user: {}", reference, userId);

                return hotelClient.cancelBooking(reference, userId)
                                .thenApply(v -> {
                                        Response<Void> response = Response.<Void>builder()
                                                        .statusCode(200)
                                                        .message("Booking cancelled successfully")
                                                        .build();
                                        return ResponseEntity.ok(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error cancelling booking {}", reference, ex);
                                        Response<Void> response = Response.<Void>builder()
                                                        .statusCode(500)
                                                        .message("Failed to cancel booking: " + ex.getMessage())
                                                        .build();
                                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                                });
        }

        /**
         * Get customer bookings
         * GET /api/bff/v1/hotels/bookings
         */
        @GetMapping("/bookings")
        @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
        public CompletableFuture<ResponseEntity<Response<List<com.ticketkatum.dto.hotel.booking.BookingResponseDto>>>> getCustomerBookings(
                        @RequestAttribute(value = "userId", required = false) Object userIdObj) {

                if (userIdObj == null) {
                        return CompletableFuture
                                        .completedFuture(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
                }
                String userId = String.valueOf(userIdObj);

                log.info("Fetching bookings for user: {}", userId);

                return hotelClient.getCustomerBookings(userId)
                                .thenApply(bookings -> {
                                        Response<List<com.ticketkatum.dto.hotel.booking.BookingResponseDto>> response = Response.<List<com.ticketkatum.dto.hotel.booking.BookingResponseDto>>builder()
                                                        .statusCode(200)
                                                        .message("Found " + bookings.size() + " bookings")
                                                        .data(bookings)
                                                        .build();
                                        return ResponseEntity.ok(response);
                                })
                                .exceptionally(ex -> {
                                        log.error("Error fetching customer bookings", ex);
                                        Response<List<com.ticketkatum.dto.hotel.booking.BookingResponseDto>> response = Response.<List<com.ticketkatum.dto.hotel.booking.BookingResponseDto>>builder()
                                                        .statusCode(500)
                                                        .message("Failed to fetch bookings: " + ex.getMessage())
                                                        .build();
                                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                                });
        }
}