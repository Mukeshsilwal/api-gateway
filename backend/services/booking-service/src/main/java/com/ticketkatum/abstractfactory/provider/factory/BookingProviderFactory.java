package com.ticketkatum.abstractfactory.provider.factory;

import com.ticketkatum.abstractfactory.hotel.factory.HotelFactory;
import com.ticketkatum.abstractfactory.provider.BookingProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingProviderFactory {

    private final HotelFactory hotelFactory;

    public BookingProvider getProvider(String categoryType, String serviceType) {
        switch (categoryType.toLowerCase()) {
            case "hotel":
                return hotelFactory.getService(serviceType);
            default:
                throw new IllegalArgumentException("Unknown category: " + categoryType);
        }
    }
}