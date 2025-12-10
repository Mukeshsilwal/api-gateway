package com.ticketkatum.abstractfactory.hotel.request;

import com.ticketkatum.utils.Request;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HotelRequest extends Request {
    private String hotelId;
    private String roomType;
    private String checkInDate;
    private String checkOutDate;
}
