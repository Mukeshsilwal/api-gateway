package com.ticketkatum.controller;

import com.ticketkatum.model.SeatDto;
import com.ticketkatum.service.SeatService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/seat")
@RequiredArgsConstructor
public class SeatController {
    private final SeatService seatService;

    /**
     * Get all seats
     * GET /seat/get
     */
    @GetMapping("/get")
    public ResponseEntity<Response<List<SeatDto>>> getAllSeat() {
        log.info("Fetching all seats");

        try {
            List<SeatDto> seatDto = seatService.getAllSeat();
            Response<List<SeatDto>> response = ResponseHandler.success(
                    "Found " + seatDto.size() + " seats",
                    seatDto
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching seats", e);
            Response<List<SeatDto>> response = ResponseHandler.failure("Failed to fetch seats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get seat by ID
     * GET /seat/get/{id}
     */
    @GetMapping("/get/{id}")
    public ResponseEntity<Response<SeatDto>> getSeatById(@PathVariable Integer id) {
        log.info("Fetching seat with ID: {}", id);

        try {
            SeatDto seatDto = seatService.getSeatById(id);
            Response<SeatDto> response = ResponseHandler.success("Seat retrieved successfully", seatDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching seat: {}", id, e);
            Response<SeatDto> response = ResponseHandler.failure("Seat not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Get seats by bus name
     * GET /seat/name?busName={busName}
     */
    @GetMapping("/name")
    public ResponseEntity<Response<List<SeatDto>>> getBusByBusName(@RequestParam String busName) {
        log.info("Fetching seats for bus: {}", busName);

        try {
            List<SeatDto> dtos = seatService.findSeatRelatedToBus(busName);
            Response<List<SeatDto>> response = ResponseHandler.success(
                    "Found " + dtos.size() + " seats for bus " + busName,
                    dtos
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching seats for bus: {}", busName, e);
            Response<List<SeatDto>> response = ResponseHandler.failure("Failed to fetch seats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}