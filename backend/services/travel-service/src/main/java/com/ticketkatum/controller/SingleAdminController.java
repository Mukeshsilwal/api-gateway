package com.ticketkatum.controller;


import com.ticketkatum.model.BusDto;
import com.ticketkatum.model.BusStopDto;
import com.ticketkatum.model.RouteDto;
import com.ticketkatum.model.SeatDto;
import com.ticketkatum.service.BusService;
import com.ticketkatum.service.BusStopService;
import com.ticketkatum.service.RouteService;
import com.ticketkatum.service.SeatService;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class SingleAdminController {
    private final BusStopService stopService;
    private final RouteService service;
    private final BusService busService;
    private final SeatService seatService;


    /**
     * Create a new bus stop
     * POST /admin/post
     */
    @PostMapping("/post")
    public ResponseEntity<Response<BusStopDto>> createBusStop(@Valid @RequestBody BusStopDto busStopDto) {
        log.info("Creating new bus stop: {}", busStopDto.getName());

        try {
            BusStopDto busStopDto1 = stopService.createBusStop(busStopDto);
            Response<BusStopDto> response = ResponseHandler.success("Bus stop created successfully", busStopDto1);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating bus stop", e);
            Response<BusStopDto> response = ResponseHandler.failure("Failed to create bus stop: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update bus stop
     * PUT /admin/updateBusStop/{id}
     */
    @PutMapping("/updateBusStop/{id}")
    public ResponseEntity<Response<BusStopDto>> updateBusStop(
            @Valid @RequestBody BusStopDto busStopDto,
            @PathVariable long id) {
        log.info("Updating bus stop with ID: {}", id);

        try {
            BusStopDto busStopDto1 = stopService.updateBusStop(busStopDto, id);
            Response<BusStopDto> response = ResponseHandler.success("Bus stop updated successfully", busStopDto1);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating bus stop: {}", id, e);
            Response<BusStopDto> response = ResponseHandler.failure("Failed to update bus stop: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete bus stop
     * DELETE /admin/deleteBusStop/{id}
     */
    @DeleteMapping("/deleteBusStop/{id}")
    public ResponseEntity<Response<Void>> deleteBusStop(@PathVariable long id) {
        log.info("Deleting bus stop with ID: {}", id);

        try {
            stopService.deleteBusStop(id);
            Response<Void> response = ResponseHandler.success("Bus stop has been deleted successfully", null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting bus stop: {}", id, e);
            Response<Void> response = ResponseHandler.failure("Failed to delete bus stop: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    /**
     * Create route with bus stops
     * POST /admin/busStopRoute/{id}/{id1}
     */
    @PostMapping("/busStopRoute/{id}/{id1}")
    public ResponseEntity<Response<RouteDto>> createRouteWithBusStop(
            @Valid @RequestBody RouteDto routeDto,
            @PathVariable("id") long id,
            @PathVariable("id1") long id1) {
        log.info("Creating route with bus stops ID: {} and ID: {}", id, id1);

        try {
            RouteDto routeDto1 = service.createRouteWithBusStop(routeDto, id, id1);
            Response<RouteDto> response = ResponseHandler.success("Route created successfully", routeDto1);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating route with bus stops: {} and {}", id, id1, e);
            Response<RouteDto> response = ResponseHandler.failure("Failed to create route: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete route
     * DELETE /admin/deleteRoute/{id}
     */
    @DeleteMapping("/deleteRoute/{id}")
    public ResponseEntity<Response<Void>> deleteRoute(@PathVariable long id) {
        log.info("Deleting route with ID: {}", id);

        try {
            service.deleteRoute(id);
            Response<Void> response = ResponseHandler.success("Route has been deleted successfully", null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting route: {}", id, e);
            Response<Void> response = ResponseHandler.failure("Failed to delete route: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    /**
     * Create bus in route
     * POST /admin/routeBus/{id}
     */
    @PostMapping("/routeBus/{id}")
    public ResponseEntity<Response<BusDto>> createBusInRoute(
            @Valid @RequestBody BusDto busDto,
            @PathVariable long id) {
        log.info("Creating bus for route ID: {}", id);

        try {
            BusDto busDto1 = busService.createBusForRoute(busDto, id);
            Response<BusDto> response = ResponseHandler.success("Bus created successfully", busDto1);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating bus for route: {}", id, e);
            Response<BusDto> response = ResponseHandler.failure("Failed to create bus: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update bus info with route
     * PUT /admin/bus/{id}/route/{routeId}
     */
    @PutMapping("/bus/{id}/route/{routeId}")
    public ResponseEntity<Response<BusDto>> updateBusInfoWithRoute(
            @Valid @RequestBody BusDto busDto,
            @PathVariable long id,
            @PathVariable Integer routeId) {
        log.info("Updating bus ID: {} with route ID: {}", id, routeId);

        try {
            BusDto busDto1 = busService.updateBusInfo(busDto, id, routeId);
            Response<BusDto> response = ResponseHandler.success("Bus updated successfully", busDto1);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating bus: {} with route: {}", id, routeId, e);
            Response<BusDto> response = ResponseHandler.failure("Failed to update bus: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete bus
     * DELETE /admin/deleteBus/{id}
     */
    @DeleteMapping("/deleteBus/{id}")
    public ResponseEntity<Response<Void>> deleteBus(@PathVariable long id) {
        log.info("Deleting bus with ID: {}", id);

        try {
            busService.deleteBusInfo(id);
            Response<Void> response = ResponseHandler.success("Bus has been deleted successfully", null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting bus: {}", id, e);
            Response<Void> response = ResponseHandler.failure("Failed to delete bus: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    /**
     * Create seat for bus
     * POST /admin/postSeat/{id}
     */
    @PostMapping("/postSeat")
    public ResponseEntity<Response<SeatDto>> createSeatForBus(
            @Valid @RequestBody SeatDto seatDto) {
        log.info("Creating seat for bus ID: {}", seatDto.getBusId());

        try {
            SeatDto seatDto1 = seatService.createSeatForBus(seatDto);
            Response<SeatDto> response = ResponseHandler.success("Seat created successfully", seatDto1);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating seat for bus:", e);
            Response<SeatDto> response = ResponseHandler.failure("Failed to create seat: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update seat
     * PUT /admin/updateSeat/{id}
     */
    @PutMapping("/updateSeat/{id}")
    public ResponseEntity<Response<SeatDto>> updateSeat(
            @Valid @RequestBody SeatDto seatDto,
            @PathVariable long id) {
        log.info("Updating seat with ID: {}", id);

        try {
            SeatDto seatDto1 = seatService.updateSeat(seatDto, id);
            Response<SeatDto> response = ResponseHandler.success("Seat updated successfully", seatDto1);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating seat: {}", id, e);
            Response<SeatDto> response = ResponseHandler.failure("Failed to update seat: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete seat
     * DELETE /admin/deleteSeat/{id}
     */
    @DeleteMapping("/deleteSeat/{id}")
    public ResponseEntity<Response<Void>> deleteSeat(@PathVariable long id) {
        log.info("Deleting seat with ID: {}", id);

        try {
            seatService.deleteSeat(id);
            Response<Void> response = ResponseHandler.success("Seat has been deleted successfully", null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting seat: {}", id, e);
            Response<Void> response = ResponseHandler.failure("Failed to delete seat: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}