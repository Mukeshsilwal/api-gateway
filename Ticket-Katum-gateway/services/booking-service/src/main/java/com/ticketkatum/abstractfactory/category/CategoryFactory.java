package com.ticketkatum.abstractfactory.category;

import com.ticketkatum.abstractfactory.provider.BookingProvider;

public interface CategoryFactory {
    BookingProvider getService(String serviceType);
}
