package com.ticketkatum.controller;

import com.ticketkatum.model.SeatDto;
import com.ticketkatum.service.SeatService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for seat-related operations
 * All exceptions are handled by GlobalExceptionHandler
 */
@Slf4j
@RestController
@RequestMapping("/seat")
@RequiredArgsConstructor
@Tag(name = "Seat Management", description = "APIs for managing bus seats, seat selection, and booking confirmation")
public class SeatController {
    private final SeatService seatService;

    @Operation(summary = "Get all seats", description = "Retrieves a list of all seats across all buses")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved seats", content = @Content(schema = @Schema(implementation = Response.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/get")
    public ResponseEntity<Response<List<SeatDto>>> getAllSeat() {
        log.info("Fetching all seats");
        List<SeatDto> seatDto = seatService.getAllSeat();
        Response<List<SeatDto>> response = ResponseHandler.success(
                "Found " + seatDto.size() + " seats",
                seatDto);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get seat by ID", description = "Retrieves detailed information about a specific seat")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Seat found"),
            @ApiResponse(responseCode = "404", description = "Seat not found")
    })
    @GetMapping("/get/{id}")
    public ResponseEntity<Response<SeatDto>> getSeatById(
            @Parameter(description = "Seat ID", required = true) @PathVariable Integer id) {
        log.info("Fetching seat with ID: {}", id);
        SeatDto seatDto = seatService.getSeatById(id);
        Response<SeatDto> response = ResponseHandler.success("Seat retrieved successfully", seatDto);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get seats by bus name", description = "Retrieves all seats for a specific bus")
    @GetMapping("/name")
    public ResponseEntity<Response<List<SeatDto>>> getBusByBusName(
            @Parameter(description = "Bus name", required = true) @RequestParam String busName) {
        log.info("Fetching seats for bus: {}", busName);
        List<SeatDto> dtos = seatService.findSeatRelatedToBus(busName);
        Response<List<SeatDto>> response = ResponseHandler.success(
                "Found " + dtos.size() + " seats for bus " + busName,
                dtos);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Select seat (Soft Lock)", description = "Temporarily holds a seat for 10 minutes for a specific user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Seat held successfully"),
            @ApiResponse(responseCode = "409", description = "Seat already held or booked")
    })
    @PostMapping("/select")
    public ResponseEntity<Response<SeatDto>> selectSeat(
            @Parameter(description = "Seat ID", required = true) @RequestParam Long seatId,
            @Parameter(description = "User ID", required = true) @RequestParam Long userId) {
        log.info("User {} selecting seat {}", userId, seatId);
        SeatDto dto = seatService.selectSeat(seatId, userId);
        return ResponseEntity.ok(ResponseHandler.success("Seat held for 10 minutes", dto));
    }

    @Operation(summary = "Confirm seat booking (Hard Lock)", description = "Permanently books a seat for a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Seat booked successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid booking request"),
            @ApiResponse(responseCode = "409", description = "Seat not available")
    })
    @PostMapping("/confirm")
    public ResponseEntity<Response<SeatDto>> confirmSeat(
            @Parameter(description = "Seat ID", required = true) @RequestParam Long seatId,
            @Parameter(description = "User ID", required = true) @RequestParam Long userId) {
        log.info("User {} confirming seat {}", userId, seatId);
        SeatDto dto = seatService.confirmSeat(seatId, userId);
        return ResponseEntity.ok(ResponseHandler.success("Seat booked successfully", dto));
    }
}
