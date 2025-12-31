package com.ticketkatum.client;

import com.ticketkatum.utils.Response;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "booking-service", url = "${services.booking-service.url:http://localhost:8081}")
public interface BookingClient {

    @GetMapping("/api/booking/{bookingId}")
    Response getBookingDetails(@PathVariable("bookingId") String bookingId);
}
