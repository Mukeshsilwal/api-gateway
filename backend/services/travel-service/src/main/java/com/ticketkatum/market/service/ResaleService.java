package com.ticketkatum.market.service;

import com.ticketkatum.market.client.BookingServiceClient;
import com.ticketkatum.market.domain.ListingStatus;
import com.ticketkatum.market.domain.ResaleListing;
import com.ticketkatum.market.domain.ResaleTransaction;
import com.ticketkatum.market.dto.CreateListingRequest;
import com.ticketkatum.market.dto.PurchaseRequest;
import com.ticketkatum.market.repository.ResaleListingRepository;
import com.ticketkatum.market.repository.ResaleTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResaleService {

    private final ResaleListingRepository listingRepository;
    private final ResaleTransactionRepository transactionRepository;
    private final BookingServiceClient bookingServiceClient;
    private final com.ticketkatum.market.events.MarketEventPublisher eventPublisher;

    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.05"); // 5%
    private static final BigDecimal MAX_PRICE_MARKUP = new BigDecimal("1.10"); // 110% of face value

    @Transactional
    public ResaleListing createListing(CreateListingRequest request) {
        log.info("Creating resale listing for ticket: {}", request.getOriginalTicketId());

        // 1. Verify Ownership
        boolean isOwner = bookingServiceClient.validateTicketOwnership(request.getOriginalTicketId(),
                request.getSellerUserId());
        if (!isOwner) {
            throw new IllegalArgumentException("User does not own this ticket or it is not valid for resale.");
        }

        // 2. Validate Price Cap
        BigDecimal faceValue = bookingServiceClient.getTicketFaceValue(request.getOriginalTicketId());
        BigDecimal maxAllowedPrice = faceValue.multiply(MAX_PRICE_MARKUP);
        if (request.getResalePrice().compareTo(maxAllowedPrice) > 0) {
            throw new IllegalArgumentException("Resale price cannot exceed " + maxAllowedPrice);
        }

        // 3. Lock Ticket in Booking Service
        bookingServiceClient.lockTicketForResale(request.getOriginalTicketId());

        // 4. Create Listing
        ResaleListing listing = ResaleListing.builder()
                .originalTicketId(request.getOriginalTicketId())
                .sellerUserId(request.getSellerUserId())
                .eventId(request.getEventId())
                .status(ListingStatus.ACTIVE)
                .faceValue(faceValue)
                .resalePrice(request.getResalePrice())
                .commissionFee(request.getResalePrice().multiply(COMMISSION_RATE))
                .expiresAt(LocalDateTime.now().plusDays(7)) // Default 7 days expiry
                .build();

        ResaleListing savedListing = listingRepository.save(listing);

        // Publish event
        eventPublisher.publishListingCreated(savedListing);

        return savedListing;
    }

    @Transactional
    public ResaleTransaction purchaseListing(long listingId, PurchaseRequest request) {
        log.info("Processing purchase for listing: {}", listingId);

        ResaleListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new IllegalStateException("Listing is not active");
        }

        if (listing.getExpiresAt().isBefore(LocalDateTime.now())) {
            listing.setStatus(ListingStatus.EXPIRED);
            listingRepository.save(listing);
            throw new IllegalStateException("Listing has expired");
        }

        // 5. Atomic Transfer
        // TODO: Process Payment here (Call Payment Service)

        // Transfer Ticket Ownership in Booking Service (Invalidate old, create new)
        bookingServiceClient.transferTicket(listing.getOriginalTicketId(), request.getBuyerUserId());

        // Update Listing Status
        listing.setStatus(ListingStatus.SOLD);
        listingRepository.save(listing);

        // Record Transaction
        ResaleTransaction transaction = ResaleTransaction.builder()
                .listingId(listing.getId())
                .buyerUserId(request.getBuyerUserId())
                .sellerUserId(listing.getSellerUserId())
                .finalPrice(listing.getResalePrice())
                .payoutAmount(listing.getResalePrice().subtract(listing.getCommissionFee()))
                .build();

        ResaleTransaction savedTransaction = transactionRepository.save(transaction);

        // Publish event
        eventPublisher.publishListingSold(savedTransaction, listing);

        return savedTransaction;
    }

    public List<ResaleListing> getActiveListingsForEvent(Long eventId) {
        return listingRepository.findByEventIdAndStatus(eventId, ListingStatus.ACTIVE);
    }
}
