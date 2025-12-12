package com.ticketkatum.market.service;

import com.ticketkatum.market.domain.ResaleTransaction;
import com.ticketkatum.market.dto.EventAnalytics;
import com.ticketkatum.market.repository.ResaleTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizerAnalyticsService {

    private final ResaleTransactionRepository resaleRepository;
    // In a real app, inject BookingServiceClient to fetch Primary Sales
    
    public EventAnalytics getAnalytics(UUID eventId) {
        // 1. Fetch Primary Sales (Mocked for now as we don't have full Event db access here)
        int primarySold = 450;
        int totalCapacity = 500;
        BigDecimal primaryRevenue = BigDecimal.valueOf(45000); // $100 * 450
        
        // 2. Fetch Resale Stats
        // We need to add a method to Repo to find by Event? 
        // Currently ResaleTransaction stores Listing, Listing stores EventId.
        // For simplicity, we assume we can fetch or we iterate (not performant but fine for demo)
        
        // Let's assume we have a custom query or just mock the resale part for speed
        int resaleVolume = 15;
        BigDecimal resaleRevenue = BigDecimal.valueOf(1500); // Commission
        
        // 3. Aggregate
        return EventAnalytics.builder()
                .eventId(eventId.toString())
                .totalRevenue(primaryRevenue.add(resaleRevenue))
                .itemsSold(primarySold)
                .resaleVolume(resaleVolume)
                .occupancyRate((double) primarySold / totalCapacity)
                .hypeIndex(calculateHype(resaleVolume, totalCapacity - primarySold))
                .build();
    }
    
    private int calculateHype(int resaleVol, int remainingSeats) {
        if (remainingSeats == 0) return 100; // Max Hype
        return (resaleVol * 10) / remainingSeats; // Arbitrary logic
    }
}
