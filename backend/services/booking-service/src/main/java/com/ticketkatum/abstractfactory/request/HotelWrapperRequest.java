package com.ticketkatum.abstractfactory.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ticketkatum.model.HotelBookingRequest;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)

public class HotelWrapperRequest {
    private String type;
    private String provider;
    private HotelBookingRequest data;
}
