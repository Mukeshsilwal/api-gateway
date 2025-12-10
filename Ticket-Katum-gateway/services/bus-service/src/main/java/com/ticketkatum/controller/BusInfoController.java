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
@RequestMapping("/bus")
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
}