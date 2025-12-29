package com.ticketkatum.market.events;

import com.ticketkatum.market.domain.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

/**
 * Publisher for market-related events to Kafka.
 * Publishes events for resale listings, bundles, loyalty points, etc.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MarketEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Topic names
    private static final String LISTING_CREATED_TOPIC = "market.listing.created";
    private static final String LISTING_SOLD_TOPIC = "market.listing.sold";
    private static final String BUNDLE_BOOKED_TOPIC = "market.bundle.booked";
    private static final String POINTS_EARNED_TOPIC = "market.points.earned";
    private static final String POINTS_REDEEMED_TOPIC = "market.points.redeemed";
    private static final String PRODUCT_ORDERED_TOPIC = "market.product.ordered";
    private static final String POLL_CREATED_TOPIC = "market.poll.created";
    private static final String VOTE_CAST_TOPIC = "market.vote.cast";

    /**
     * Publish event when a resale listing is created
     */
    public void publishListingCreated(ResaleListing listing) {
        try {
            ListingCreatedEvent event = ListingCreatedEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .timestamp(Instant.now())
                    .listingId(listing.getId())
                    .originalTicketId(listing.getOriginalTicketId())
                    .sellerUserId(listing.getSellerUserId())
                    .eventIdRef(listing.getEventId())
                    .resalePrice(listing.getResalePrice())
                    .faceValue(listing.getFaceValue())
                    .commissionFee(listing.getCommissionFee())
                    .build();

            kafkaTemplate.send(LISTING_CREATED_TOPIC, listing.getId().toString(), event);
            log.info("Published listing created event for listing: {}", listing.getId());
        } catch (Exception e) {
            log.error("Failed to publish listing created event", e);
        }
    }

    /**
     * Publish event when a resale listing is sold
     */
    public void publishListingSold(ResaleTransaction transaction, ResaleListing listing) {
        try {
            ListingSoldEvent event = ListingSoldEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .timestamp(Instant.now())
                    .transactionId(transaction.getId())
                    .listingId(transaction.getListingId())
                    .buyerUserId(transaction.getBuyerUserId())
                    .sellerUserId(transaction.getSellerUserId())
                    .finalPrice(transaction.getFinalPrice())
                    .payoutAmount(transaction.getPayoutAmount())
                    .eventIdRef(listing.getEventId())
                    .build();

            kafkaTemplate.send(LISTING_SOLD_TOPIC, String.valueOf(transaction.getId()), event);
            log.info("Published listing sold event for transaction: {}", transaction.getId());
        } catch (Exception e) {
            log.error("Failed to publish listing sold event", e);
        }
    }

    /**
     * Publish event when a bundle is booked
     */
    public void publishBundleBooked(Bundle bundle, UUID userId) {
        try {
            BundleBookedEvent event = BundleBookedEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .timestamp(Instant.now())
                    .bundleId(bundle.getId())
                    .bundleName(bundle.getName())
                    .userId(userId)
                    .totalPrice(bundle.getTotalPrice())
                    .discountPercentage(bundle.getDiscountPercentage())
                    .itemCount(bundle.getItems().size())
                    .build();

            kafkaTemplate.send(BUNDLE_BOOKED_TOPIC, bundle.getId().toString(), event);
            log.info("Published bundle booked event for bundle: {}", bundle.getId());
        } catch (Exception e) {
            log.error("Failed to publish bundle booked event", e);
        }
    }

    /**
     * Publish event when loyalty points are earned
     */
    public void publishPointsEarned(PointTransaction transaction) {
        try {
            PointsEarnedEvent event = PointsEarnedEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .timestamp(Instant.now())
                    .transactionId(transaction.getId())
                    .userId(transaction.getUserId())
                    .pointsEarned(transaction.getAmount())
                    .source(transaction.getSource())
                    .description(transaction.getDescription())
                    .build();

            kafkaTemplate.send(POINTS_EARNED_TOPIC, transaction.getUserId().toString(), event);
            log.info("Published points earned event for user: {}", transaction.getUserId());
        } catch (Exception e) {
            log.error("Failed to publish points earned event", e);
        }
    }

    /**
     * Publish event when loyalty points are redeemed
     */
    public void publishPointsRedeemed(PointTransaction transaction) {
        try {
            PointsRedeemedEvent event = PointsRedeemedEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .timestamp(Instant.now())
                    .transactionId(transaction.getId())
                    .userId(transaction.getUserId())
                    .pointsRedeemed(Math.abs(transaction.getAmount()))
                    .source(transaction.getSource())
                    .description(transaction.getDescription())
                    .build();

            kafkaTemplate.send(POINTS_REDEEMED_TOPIC, transaction.getUserId().toString(), event);
            log.info("Published points redeemed event for user: {}", transaction.getUserId());
        } catch (Exception e) {
            log.error("Failed to publish points redeemed event", e);
        }
    }

    /**
     * Publish event when a product is ordered
     */
    public void publishProductOrdered(long userId, Product product, String seatLocation) {
        try {
            ProductOrderedEvent event = ProductOrderedEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .timestamp(Instant.now())
                    .userId(userId)
                    .productId(product.getId())
                    .productName(product.getName())
                    .price(product.getPrice())
                    .productType(product.getType())
                    .seatLocation(seatLocation)
                    .eventIdRef(product.getEventId())
                    .build();

            kafkaTemplate.send(PRODUCT_ORDERED_TOPIC, String.valueOf(userId), event);
            log.info("Published product ordered event for user: {} product: {}", userId, product.getId());
        } catch (Exception e) {
            log.error("Failed to publish product ordered event", e);
        }
    }

    /**
     * Publish event when a poll is created
     */
    public void publishPollCreated(LivePoll poll) {
        try {
            PollCreatedEvent event = PollCreatedEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .timestamp(Instant.now())
                    .pollId(poll.getId())
                    .eventIdRef(Long.valueOf(poll.getEventId()))
                    .question(poll.getQuestion())
                    .status(poll.getStatus())
                    .build();

            kafkaTemplate.send(POLL_CREATED_TOPIC, poll.getId().toString(), event);
            log.info("Published poll created event for poll: {}", poll.getId());
        } catch (Exception e) {
            log.error("Failed to publish poll created event", e);
        }
    }

    /**
     * Publish event when a vote is cast
     */
    public void publishVoteCast(long pollId, String selectedOption) {
        try {
            VoteCastEvent event = VoteCastEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .timestamp(Instant.now())
                    .pollId(pollId)
                    .selectedOption(selectedOption)
                    .build();

            kafkaTemplate.send(VOTE_CAST_TOPIC, String.valueOf(pollId), event);
            log.info("Published vote cast event for poll: {}", pollId);
        } catch (Exception e) {
            log.error("Failed to publish vote cast event", e);
        }
    }
}
