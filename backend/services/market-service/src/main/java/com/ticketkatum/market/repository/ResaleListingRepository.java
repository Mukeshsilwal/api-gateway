package com.ticketkatum.market.repository;

import com.ticketkatum.market.domain.ListingStatus;
import com.ticketkatum.market.domain.ResaleListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResaleListingRepository extends JpaRepository<ResaleListing, Long> {
    List<ResaleListing> findByEventIdAndStatus(Long eventId, ListingStatus status);

    List<ResaleListing> findByEventId(Long eventId);

    List<ResaleListing> findBySellerUserId(long sellerUserId);
}
