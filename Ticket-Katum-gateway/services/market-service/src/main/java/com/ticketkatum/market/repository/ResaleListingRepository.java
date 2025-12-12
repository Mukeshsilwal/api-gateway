package com.ticketkatum.market.repository;

import com.ticketkatum.market.domain.ListingStatus;
import com.ticketkatum.market.domain.ResaleListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResaleListingRepository extends JpaRepository<ResaleListing, UUID> {
    List<ResaleListing> findByEventIdAndStatus(UUID eventId, ListingStatus status);
    List<ResaleListing> findBySellerUserId(UUID sellerUserId);
}
