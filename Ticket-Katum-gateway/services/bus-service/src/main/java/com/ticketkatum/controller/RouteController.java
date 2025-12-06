package com.ticketkatum.controller;

import com.ticketkatum.model.RouteDto;
import com.ticketkatum.service.RouteService;
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
@RequestMapping("/api/route")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    /**
     * GET ROUTE BY ID
     * GET /api/route/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Response<RouteDto>> getRouteById(@PathVariable int id) {
        log.info("📌 Fetching route by ID: {}", id);

        try {
            RouteDto routeDto = routeService.getRouteById(id);
            Response<RouteDto> response = ResponseHandler.success("Route fetched successfully", routeDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching route: {}", id, e);
            Response<RouteDto> response = ResponseHandler.failure("Route not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * GET ALL ROUTES
     * GET /api/route
     */
    @GetMapping
    public ResponseEntity<Response<List<RouteDto>>> getAllRoutes() {
        log.info("📌 Fetching all routes");

        try {
            List<RouteDto> routeDtos = routeService.getAllRoute();
            Response<List<RouteDto>> response = ResponseHandler.success(
                    "Found " + routeDtos.size() + " routes",
                    routeDtos
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching routes", e);
            Response<List<RouteDto>> response = ResponseHandler.failure("Failed to fetch routes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}