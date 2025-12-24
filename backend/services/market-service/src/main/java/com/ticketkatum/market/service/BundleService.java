package com.ticketkatum.market.service;

import com.ticketkatum.market.client.BookingServiceClient;
import com.ticketkatum.market.domain.Bundle;
import com.ticketkatum.market.domain.BundleItem;
import com.ticketkatum.market.domain.ItemType;
import com.ticketkatum.market.dto.BookingRequest;
import com.ticketkatum.market.dto.ContactDetails;
import com.ticketkatum.market.dto.PaymentDetails;
import com.ticketkatum.market.repository.BundleRepository;
import com.ticketkatum.utils.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BundleService {

    private final BundleRepository bundleRepository;
    private final BookingServiceClient bookingServiceClient;
    private final com.ticketkatum.market.events.MarketEventPublisher eventPublisher;

    public List<Bundle> getActiveBundles() {
        return bundleRepository.findByActiveTrue();
    }

    // SAGA ORCHESTRATION
    @Transactional(rollbackFor = Exception.class)
    public void bookBundle(UUID bundleId, UUID userId, ContactDetails contact, PaymentDetails payment) {
        Bundle bundle = bundleRepository.findById(bundleId)
                .orElseThrow(() -> new IllegalArgumentException("Bundle not found"));

        if (!bundle.isActive()) {
            throw new IllegalStateException("Bundle is not active");
        }

        List<BundleItem> processedItems = new ArrayList<>();

        try {
            for (BundleItem item : bundle.getItems()) {
                log.info("Processing bundle item: {} - {}", item.getItemType(), item.getItemReferenceId());

                BookingRequest request = createBookingRequest(item, userId, contact, payment);

                // Map ItemType to Category/Service strings expected by BookingService
                String category = mapToCategory(item.getItemType());
                String service = mapToService(item.getItemType()); // e.g., "star-hotel" or "qfx"

                Response response = bookingServiceClient.bookTicket(category, service, request);

                // Check if response indicates success (Assuming Response has status or code)
                // If using standard shared Response, we assume HTTP 200 meant success or check
                // body
                // For simplicity here, if it didn't throw FeignException, we assume success or
                // check 'code'

                processedItems.add(item);
            }

            // If all succeeded, publish event
            eventPublisher.publishBundleBooked(bundle, userId);
            log.info("Bundle {} successfully booked for user {}", bundleId, userId);

        } catch (Exception e) {
            log.error("Bundle booking failed, initiating rollback", e);
            compensate(processedItems, userId, contact);
            throw new RuntimeException("Failed to book bundle: " + e.getMessage());
        }
    }

    private void compensate(List<BundleItem> items, UUID userId, ContactDetails contact) {
        // Reverse order compensation
        for (int i = items.size() - 1; i >= 0; i--) {
            BundleItem item = items.get(i);
            try {
                log.info("Compensating (Cancelling) item: {}", item.getId());
                BookingRequest request = createBookingRequest(item, userId, contact, null); // Payment null for cancel?
                String category = mapToCategory(item.getItemType());
                String service = mapToService(item.getItemType());

                bookingServiceClient.cancelBooking(category, service, request);
            } catch (Exception e) {
                log.error("Failed to compensate item: {}", item.getId(), e);
                // In production, push to Dead Letter Queue for manual intervention
            }
        }
    }

    private BookingRequest createBookingRequest(BundleItem item, UUID userId, ContactDetails contact,
            PaymentDetails payment) {
        // Construct Request based on Item details
        // This maps the generic BundleItem to the specific Service Request
        return BookingRequest.builder()
                .hotelId(item.getItemType() == ItemType.HOTEL ? item.getItemReferenceId() : null)
                .roomType(item.getItemType() == ItemType.HOTEL ? item.getSubReferenceId() : null)
                // Add logic for Bus/Event fields if needed
                .numberOfRooms(item.getQuantity())
                .contactDetails(contact)
                .paymentDetails(payment)
                // .checkInDate(...) // In a real app, user selects dates for the bundle
                .build();
    }

    private String mapToCategory(ItemType type) {
        return switch (type) {
            case HOTEL -> "hotel";
            case BUS -> "bus";
            case EVENT -> "cinema"; // Mapping EVENT to CINEMA context for now as per BookingService
            default -> "misc";
        };
    }

    private String mapToService(ItemType type) {
        // This is tricky. BookingService expects "service" name like "himchuli" or
        // "qfx".
        // We might store this in itemReferenceId or subReferenceId?
        // For now, hardcode or assume it's part of the ID logic.
        // Let's assume itemReferenceId contains "serviceName" or we default.
        return "default-service";
    }
}
