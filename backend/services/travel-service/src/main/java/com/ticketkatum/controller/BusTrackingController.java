package com.ticketkatum.controller;

import com.ticketkatum.service.BusLocationPublisher;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/buses")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Bus Tracking Integration", description = "APIs for bus location tracking")
public class BusTrackingController {

    private final BusLocationPublisher busLocationPublisher;

    @PostMapping("/{busId}/location")
    @Operation(summary = "Update bus location", description = "Update bus location and publish to tracking-service")
    public ResponseEntity<Map<String, String>> updateBusLocation(
            @PathVariable Long busId,
            @RequestBody BusLocationUpdate locationUpdate) {

        log.info("Updating location for bus: {}", busId);

        busLocationPublisher.publishBusLocation(
                busId,
                locationUpdate.getTripId(),
                locationUpdate.getLatitude(),
                locationUpdate.getLongitude(),
                locationUpdate.getSpeed(),
                locationUpdate.getHeading());

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Location update published"));
    }

    @GetMapping("/{busId}/live-location")
    @Operation(summary = "Get bus live location", description = "Get current location of bus from tracking-service")
    public Mono<ResponseEntity<Map>> getBusLiveLocation(@PathVariable Long busId) {
        log.info("Fetching live location for bus: {}", busId);

        return busLocationPublisher.getBusLiveLocation(busId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @Data
    public static class BusLocationUpdate {
        private Long tripId;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private BigDecimal speed;
        private BigDecimal heading;
    }
}
