package com.ticketkatum.abstractfactory.hotel.factory;

import com.ticketkatum.abstractfactory.category.CategoryFactory;
import com.ticketkatum.abstractfactory.hotel.service.GenericHotelService;
import com.ticketkatum.abstractfactory.provider.BookingProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HotelFactory implements CategoryFactory {

    private final GenericHotelService genericHotelProvider;

    @Override
    public BookingProvider getService(String serviceType) {
        genericHotelProvider.setHotelCode(serviceType);
        return genericHotelProvider;
    }
}


