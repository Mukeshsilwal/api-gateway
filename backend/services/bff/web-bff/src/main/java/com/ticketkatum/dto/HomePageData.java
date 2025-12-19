package com.ticketkatum.dto;

import com.ticketkatum.dto.hotel.GeoLocation;
import com.ticketkatum.dto.hotel.HotelRecommendation;
import com.ticketkatum.dto.payment.response.PaymentProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomePageData {
    private List<HotelRecommendation> featuredHotels;
    private List<HotelRecommendation> personalizedRecommendations;
    private List<HotelRecommendation> topRatedHotels;
    private List<HotelRecommendation> nearbyHotels;
    private List<String> availableCities;
    private List<PaymentProvider> paymentProviders;
    private boolean hasPersonalizedData;
    private GeoLocation userLocation;
}
