package com.ticketkatum.controller;

import com.ticketkatum.model.BusStopDto;
import com.ticketkatum.service.BusStopService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/busStop")
@RequiredArgsConstructor
public class BusStopController {
    private final BusStopService busStopService;

    /**
     * Get all bus stops
     * GET /busStop/get
     */
    @GetMapping("/get")
    public ResponseEntity<Response<List<BusStopDto>>> getAllBusStops() {
        log.info("Fetching all bus stops");

        try {
            List<BusStopDto> busStopDtos = busStopService.getAllBusStops();
            Response<List<BusStopDto>> response = ResponseHandler.success(
                    "Found " + busStopDtos.size() + " bus stops",
                    busStopDtos
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching bus stops", e);
            Response<List<BusStopDto>> response = ResponseHandler.failure("Failed to fetch bus stops: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get bus stop by ID
     * GET /busStop/get/{id}
     */
    @GetMapping("/get/{id}")
    public ResponseEntity<Response<BusStopDto>> getById(@PathVariable int id) {
        log.info("Fetching bus stop with ID: {}", id);

        try {
            BusStopDto busStopDto = busStopService.getBusStopById(id);
            Response<BusStopDto> response = ResponseHandler.success("Bus stop retrieved successfully", busStopDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching bus stop: {}", id, e);
            Response<BusStopDto> response = ResponseHandler.failure("Bus stop not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}