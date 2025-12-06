package com.ticketkatum.abstractfactory.provider;

import com.ticketkatum.utils.Request;
import com.ticketkatum.utils.Response;

public interface BookingProvider<T> {
    String getType();
    Response bookTicket(Request request);
    Response cancel(Request request);
    Response refund(Request request);
}
