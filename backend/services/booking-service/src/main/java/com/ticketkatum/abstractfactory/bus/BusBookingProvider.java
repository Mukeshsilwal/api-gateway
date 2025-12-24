package com.ticketkatum.abstractfactory.bus;

import com.ticketkatum.abstractfactory.provider.BookingProvider;
import com.ticketkatum.utils.Request;
import com.ticketkatum.utils.Response;
import com.ticketkatum.utils.ResponseHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class BusBookingProvider implements BookingProvider<Request> {

    @Override
    public String getType() {
        return "BUS";
    }

    @Override
    public Response bookTicket(Request request) {
        log.info("Simulating BUS booking for: {}", request.getCustomerId());
        // In real implementation, this would call bus-service
        return ResponseHandler.success("Bus booking simulated success");
    }

    @Override
    public Response cancel(Request request) {
        log.info("Simulating BUS cancellation for: {}", request.getCustomerId());
        return ResponseHandler.success("Bus cancellation simulated success");
    }

    @Override
    public Response refund(Request request) {
        log.info("Simulating BUS refund for: {}", request.getCustomerId());
        return ResponseHandler.success("Bus refund simulated success");
    }

    @Override
    public String getBooking(String bookingId) {
        return "Simulated Bus Booking Details";
    }
}
