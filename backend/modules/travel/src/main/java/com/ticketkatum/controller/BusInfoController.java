package com.ticketkatum.controller;

import com.ticketkatum.model.BusDto;
import com.ticketkatum.model.BusSearchRequest;
import com.ticketkatum.model.BusSearchResponse;
import com.ticketkatum.service.BusService;
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
@RequestMapping({"/bus", "/api/v1/buses"})
@RequiredArgsConstructor
public class BusInfoController {

    private final BusService busService;

    /**
     * Get all bus routes
     * GET /bus/route
     */
    @GetMapping("/route")
    public ResponseEntity<Response<List<BusDto>>> getAllRoute() {
        log.info("Fetching all bus routes");

        try {
            List<BusDto> buses = busService.getAllBusInfo();
            Response<List<BusDto>> response = ResponseHandler.success(
                    "Found " + buses.size() + " bus routes",
                    buses
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching bus routes", e);
            Response<List<BusDto>> response = ResponseHandler.failure("Failed to fetch bus routes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Search buses with pagination (infinite scroll)
     * POST /bus/search
     */
    @PostMapping("/search")
    public ResponseEntity<Response<BusSearchResponse>> searchBuses(@Valid @RequestBody BusSearchRequest req) {
        if (req.getPageSize() == null || req.getPageSize() <= 0) {
            req.setPageSize(10);
        }
        log.info("Searching buses - From: {}, To: {}, Date: {}, Page: {}",
                req.getSource(), req.getDestination(), req.getDate(), req.getPageSize());

        try {
            BusSearchResponse searchResponse = busService.searchBuses(req);
            Response<BusSearchResponse> response = ResponseHandler.success(
                    "Found " + searchResponse.getBuses().size() + " buses (Page " +
                            searchResponse.getNextCursor() + " of " + searchResponse.getNextCursor() + ")",
                    searchResponse
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching buses - From: {}, To: {}, Date: {}",
                    req.getSource(), req.getDestination(), req.getDate(), e);
            Response<BusSearchResponse> response = ResponseHandler.failure("Failed to search buses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get bus by ID
     * GET /bus/{id} or /api/v1/buses/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Response<BusDto>> getBusById(@PathVariable("id") long id) {
        log.info("Fetching bus by ID: {}", id);

        try {
            BusDto bus = busService.getBusById(id);
            Response<BusDto> response = ResponseHandler.success("Bus retrieved successfully", bus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching bus by ID: {}", id, e);
            Response<BusDto> response = ResponseHandler.failure("Failed to fetch bus: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Get buses by route ID
     * GET /bus/route/{routeId} or /api/v1/buses/route/{routeId}
     */
    @GetMapping("/route/{routeId}")
    public ResponseEntity<Response<List<BusDto>>> getBusesByRoute(@PathVariable("routeId") long routeId) {
        log.info("Fetching buses for route ID: {}", routeId);

        try {
            List<BusDto> buses = busService.getBusesByRoute(routeId);
            Response<List<BusDto>> response = ResponseHandler.success("Found " + buses.size() + " buses", buses);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching buses for route: {}", routeId, e);
            Response<List<BusDto>> response = ResponseHandler.failure("Failed to fetch buses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}