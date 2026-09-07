package com.ticketkatum.controller;

import com.ticketkatum.model.CreateHotelRequest;
import com.ticketkatum.model.CreateRoomRequest;
import com.ticketkatum.model.HotelDTO;
import com.ticketkatum.model.RoomDTO;
import com.ticketkatum.service.HotelService;
import com.ticketkatum.service.RoomService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Hotel Controller
 * Enhanced with validation, Swagger documentation, and simplified error
 * handling
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/hotels")
@RequiredArgsConstructor
@Validated
@Tag(name = "Hotel Management", description = "Hotel and Room CRUD operations")
public class HotelController {

    private final HotelService hotelService;
    private final RoomService roomService;

    @Operation(summary = "Create a new hotel", description = "Creates a new hotel with the provided details")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Hotel created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "409", description = "Hotel with this code already exists")
    })
    @PostMapping
    public ResponseEntity<Response<HotelDTO>> createHotel(
            @Parameter(description = "Hotel creation request", required = true) @Valid @RequestBody CreateHotelRequest request) {

        log.info("Creating hotel: {}", request.getName());

        HotelDTO hotel = hotelService.createHotel(request);
        Response<HotelDTO> response = ResponseHandler.created("Hotel created successfully", hotel);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Get hotel by ID", description = "Retrieves hotel details by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Hotel retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Hotel not found")
    })
    @GetMapping("/{hotelId}")
    public ResponseEntity<Response<HotelDTO>> getHotel(
            @Parameter(description = "Hotel ID", required = true, example = "1") @PathVariable("hotelId") @Min(value = 1, message = "Hotel ID must be positive") Long hotelId) {

        log.info("Fetching hotel with ID: {}", hotelId);

        HotelDTO hotel = hotelService.getHotel(hotelId);
        Response<HotelDTO> response = ResponseHandler.success("Hotel retrieved successfully", hotel);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all hotels", description = "Retrieves all hotels with optional filters and pagination")
    @GetMapping
    public ResponseEntity<Response<List<HotelDTO>>> getAllHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer minStars,
            @RequestParam(required = false) Integer maxPrice) {

        List<HotelDTO> hotels;
        if ((city != null && !city.isBlank()) || minStars != null || maxPrice != null) {
            hotels = hotelService.getAllHotels(city, minStars, maxPrice, org.springframework.data.domain.Pageable.unpaged()).getContent();
        } else {
            hotels = hotelService.getAllHotels();
        }

        Response<List<HotelDTO>> response = ResponseHandler.success(
                "Found " + hotels.size() + " hotels",
                hotels);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update hotel", description = "Updates an existing hotel")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Hotel updated successfully"),
            @ApiResponse(responseCode = "404", description = "Hotel not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PutMapping("/{hotelId}")
    public ResponseEntity<Response<HotelDTO>> updateHotel(
            @Parameter(description = "Hotel ID", required = true) @PathVariable("hotelId") @Min(1) Long hotelId,
            @Valid @RequestBody CreateHotelRequest request) {

        log.info("Updating hotel: {}", hotelId);

        HotelDTO hotel = hotelService.updateHotel(hotelId, request);
        Response<HotelDTO> response = ResponseHandler.success("Hotel updated successfully", hotel);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Delete hotel", description = "Deletes a hotel by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Hotel deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Hotel not found")
    })
    @DeleteMapping("/{hotelId}")
    public ResponseEntity<Response<Void>> deleteHotel(
            @Parameter(description = "Hotel ID", required = true) @PathVariable("hotelId") @Min(1) Long hotelId) {

        log.info("Deleting hotel: {}", hotelId);

        hotelService.deleteHotel(hotelId);
        Response<Void> response = ResponseHandler.success("Hotel deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ============ Room Operations ============

    @Operation(summary = "Add room to hotel", description = "Adds a new room to an existing hotel")
    @PostMapping("/{hotelCode}/rooms")
    public ResponseEntity<Response<RoomDTO>> addRoomToHotel(
            @Parameter(description = "Hotel code", required = true) @PathVariable("hotelCode") String hotelCode,
            @Valid @RequestBody CreateRoomRequest request) {

        log.info("Adding room to hotel: {}", hotelCode);

        RoomDTO room = roomService.addRoom(hotelCode, request);
        Response<RoomDTO> response = ResponseHandler.created("Room added successfully", room);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Get rooms by hotel", description = "Retrieves all rooms for a specific hotel")
    @GetMapping("/{hotelCode}/rooms")
    public ResponseEntity<Response<List<RoomDTO>>> getRoomsByHotel(
            @PathVariable("hotelCode") String hotelCode,
            @RequestParam(required = false,name = "roomType") String roomType,
            @RequestParam(required = false,name = "active") Boolean active) {

        log.info("Fetching rooms for hotel: {} - type: {}, active: {}", hotelCode, roomType, active);

        List<RoomDTO> rooms = roomService.getRoomsByHotel(hotelCode);

        // Apply filters (TODO: Move to service layer)
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
                rooms);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get room by ID", description = "Retrieves room details by ID")
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<Response<RoomDTO>> getRoomById(
            @PathVariable("roomId") @Min(1) Long roomId) {

        log.info("Fetching room with ID: {}", roomId);

        RoomDTO room = roomService.getRoom(roomId);
        Response<RoomDTO> response = ResponseHandler.success("Room retrieved successfully", room);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update room", description = "Updates an existing room")
    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<Response<RoomDTO>> updateRoom(
            @PathVariable("roomId") @Min(1) Long roomId,
            @Valid @RequestBody CreateRoomRequest request) {

        log.info("Updating room: {}", roomId);

        RoomDTO room = roomService.updateRoom(roomId, request);
        Response<RoomDTO> response = ResponseHandler.success("Room updated successfully", room);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Delete room", description = "Deletes a room by ID")
    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Response<Void>> deleteRoom(
            @PathVariable("roomId") @Min(1) Long roomId) {

        log.info("Deleting room: {}", roomId);

        roomService.deleteRoom(roomId);
        Response<Void> response = ResponseHandler.success("Room deleted successfully");
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Search hotels by city", description = "Searches for hotels in a specific city")
    @GetMapping("/search/city/name/{city}")
    public ResponseEntity<Response<List<HotelDTO>>> searchHotelsByCity(
            @Parameter(description = "City name", required = true) @PathVariable("city") String city) {

        log.info("Searching hotels in city: {}", city);

        List<HotelDTO> hotels = hotelService.getAllHotels().stream()
                .filter(h -> city.equalsIgnoreCase(h.getCity()))
                .toList();

        Response<List<HotelDTO>> response = ResponseHandler.success(
                "Found " + hotels.size() + " hotels in " + city,
                hotels);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get hotel by code", description = "Retrieves hotel details by hotel code")
    @GetMapping("/code/{hotelCode}")
    public ResponseEntity<Response<HotelDTO>> getHotelByCode(
            @Parameter(description = "Hotel code", required = true) @PathVariable("hotelCode") String hotelCode) {

        log.info("Fetching hotel with code: {}", hotelCode);

        HotelDTO hotel = hotelService.getHotelByCode(hotelCode);
        Response<HotelDTO> response = ResponseHandler.success("Hotel retrieved successfully", hotel);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all rent types", description = "Retrieves all available rent types")
    @GetMapping("/rent-types")
    public ResponseEntity<Response<List<com.ticketkatum.model.RentTypeDto>>> getAllRentTypes() {
        log.info("Fetching all rent types");
        List<com.ticketkatum.model.RentTypeDto> rentTypes = hotelService.getAllRentTypes();
        Response<List<com.ticketkatum.model.RentTypeDto>> response = ResponseHandler
                .success("Found " + rentTypes.size() + " rent types", rentTypes);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all meal plans", description = "Retrieves all available meal plans")
    @GetMapping("/meal-plans")
    public ResponseEntity<Response<List<com.ticketkatum.model.MealPlanDto>>> getAllMealPlans() {
        log.info("Fetching all meal plans");
        List<com.ticketkatum.model.MealPlanDto> mealPlans = hotelService.getAllMealPlans();
        Response<List<com.ticketkatum.model.MealPlanDto>> response = ResponseHandler
                .success("Found " + mealPlans.size() + " meal plans", mealPlans);
        return ResponseEntity.ok(response);
    }
}
