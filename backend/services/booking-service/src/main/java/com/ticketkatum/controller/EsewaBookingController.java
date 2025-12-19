package com.ticketkatum.controller;

import com.ticketkatum.abstractfactory.hotel.service.GenericHotelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/pay")
@RequiredArgsConstructor
public class EsewaBookingController {

    private final GenericHotelService genericHotelService;

    @GetMapping(
            value = "/esewa/{bookingId}",
            produces = MediaType.TEXT_HTML_VALUE
    )
    public String redirectToEsewa(@PathVariable String bookingId) {
        return genericHotelService.getBooking(bookingId);
    }

}
