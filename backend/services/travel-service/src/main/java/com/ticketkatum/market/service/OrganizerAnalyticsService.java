package com.ticketkatum.market.service;

import com.ticketkatum.market.domain.ResaleTransaction;
import com.ticketkatum.market.dto.EventAnalytics;
import com.ticketkatum.market.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizerAnalyticsService {

    private final ResaleTransactionRepository resaleTransactionRepository;
    private final ResaleListingRepository resaleListingRepository;
    private final BundleRepository bundleRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final ProductRepository productRepository;

    public EventAnalytics getAnalytics(Long eventId) {
        log.info("Fetching analytics for event: {}", eventId);

        // 1. Fetch Resale Statistics
        List<com.ticketkatum.market.domain.ResaleListing> eventListings = resaleListingRepository
                .findByEventId(eventId);

        int totalListings = eventListings.size();
        int activeListings = (int) eventListings.stream()
                .filter(l -> l.getStatus() == com.ticketkatum.market.domain.ListingStatus.ACTIVE)
                .count();
        int soldListings = (int) eventListings.stream()
                .filter(l -> l.getStatus() == com.ticketkatum.market.domain.ListingStatus.SOLD)
                .count();

        // Calculate resale revenue (commission fees from sold listings)
        BigDecimal resaleRevenue = eventListings.stream()
                .filter(l -> l.getStatus() == com.ticketkatum.market.domain.ListingStatus.SOLD)
                .map(com.ticketkatum.market.domain.ResaleListing::getCommissionFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Calculate total revenue from resale transactions
        BigDecimal totalResaleValue = eventListings.stream()
                .filter(l -> l.getStatus() == com.ticketkatum.market.domain.ListingStatus.SOLD)
                .map(com.ticketkatum.market.domain.ResaleListing::getResalePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Bundle statistics (bundles don't have direct event_id, so this is
        // approximate)
        // In a real system, you'd track bundle bookings per event
        long totalBundles = bundleRepository.findByActiveTrue().size();

        // 4. Loyalty engagement (total point transactions - this is system-wide)
        // In a real system, you'd filter by event-related transactions
        long loyaltyTransactions = pointTransactionRepository.count();

        // 5. F&B Revenue (products for this event)
        // Note: This requires tracking orders, which we don't have a table for yet
        // For now, we'll return 0 or you can add an orders table
        BigDecimal fbRevenue = BigDecimal.ZERO;
        long productCount = productRepository.findByEventId(eventId).size();

        // 6. Calculate hype index based on resale activity
        int hypeIndex = calculateHype(soldListings, activeListings);

        // 7. Build analytics response
        return EventAnalytics.builder()
                .eventId(eventId.toString())
                .totalRevenue(resaleRevenue.add(fbRevenue))
                .itemsSold(soldListings)
                .resaleVolume(totalListings)
                .activeListings(activeListings)
                .soldListings(soldListings)
                .averageResalePrice(soldListings > 0
                        ? totalResaleValue.divide(BigDecimal.valueOf(soldListings), 2, java.math.RoundingMode.HALF_UP)
                        : BigDecimal.ZERO)
                .commissionEarned(resaleRevenue)
                .bundlesAvailable((int) totalBundles)
                .loyaltyEngagement(loyaltyTransactions)
                .fbProductCount(productCount)
                .fbRevenue(fbRevenue)
                .hypeIndex(hypeIndex)
                .build();
    }

    /**
     * Calculate hype index based on resale activity
     * Higher resale activity = higher demand = higher hype
     */
    private int calculateHype(int soldListings, int activeListings) {
        if (soldListings == 0 && activeListings == 0) {
            return 0; // No activity
        }

        // Hype is based on:
        // 1. Number of sold listings (demand)
        // 2. Ratio of sold to active (velocity)
        int baseHype = Math.min(soldListings * 5, 50); // Max 50 from volume

        if (activeListings > 0) {
            double soldRatio = (double) soldListings / (soldListings + activeListings);
            int velocityHype = (int) (soldRatio * 50); // Max 50 from velocity
            return Math.min(baseHype + velocityHype, 100);
        }

        return Math.min(baseHype, 100);
    }
}
