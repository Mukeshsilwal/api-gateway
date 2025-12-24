package com.ticketkatum.abstractfactory.provider.factory;

import com.ticketkatum.abstractfactory.hotel.factory.HotelFactory;
import com.ticketkatum.abstractfactory.provider.BookingProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingProviderFactory {

    private final HotelFactory hotelFactory;
    private final com.ticketkatum.abstractfactory.event.EventBookingProvider eventBookingProvider;
    private final com.ticketkatum.abstractfactory.bus.BusBookingProvider busBookingProvider;

    public BookingProvider getProvider(String categoryType, String serviceType) {
        switch (categoryType.toLowerCase()) {
            case "hotel":
                return hotelFactory.getService(serviceType);
            case "event":
                return eventBookingProvider;
            case "bus":
                return busBookingProvider;
            default:
                throw new IllegalArgumentException("Unknown category: " + categoryType);
        }
    }
}