package com.ticketkatum.service;

import com.ticketkatum.client.BookingServiceClient;
import com.ticketkatum.client.HotelServiceClient;
import com.ticketkatum.client.PaymentServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AggregationService {

    private final BookingServiceClient bookingClient;
    private final PaymentServiceClient paymentClient;
    private final HotelServiceClient hotelClient;
    private final MoviesServiceClient moviesClient;

    /**
     * Complete booking flow with payment processing
     */
    public Mono<CompleteBookingResponse> completeBooking(
            CompleteBookingRequest request, String userId) {

        log.info("Starting complete booking flow | user_id={} | hotel_id={}",
                userId, request.getHotelId());

        // ==== Step 1: Build booking request ====
        BookingRequest bookingReq = BookingRequest.builder()
                .userId(userId)
                .hotelId(request.getHotelId())
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .numberOfGuests(request.getNumberOfGuests())
                .contactDetails(request.getContactDetails())
                .paymentDetails(request.getPaymentDetails())
                .roomType(request.getRoomType())
                .build();

        GenericRequest<BookingRequest> wrappedBooking =
                GenericRequest.wrap(bookingReq, "web-bff");

        // ==== Step 2: Create Booking ====
        return bookingClient.createBooking(wrappedBooking.getPayload())
                .flatMap(bookingResponse -> {

                    if (!bookingResponse.isSuccess()) {
                        return Mono.error(new RuntimeException(
                                "Booking failed: " + bookingResponse.getMessage()
                        ));
                    }

                    BookingResponse booking = bookingResponse.getData();

                    log.info("Booking created | booking_id={} | total={}",
                            booking.getBookingId(), booking.getTotalAmount());

                    // ==== Step 3: Payment Initiation ====
                    InitiatePaymentRequest paymentReq = InitiatePaymentRequest.builder()
                            .bookingId(booking.getBookingId())
                            .userId(userId)
                            .amount(booking.getTotalAmount())
                            .currency("NPR")
                            .paymentMethod(request.getPaymentDetails().getPaymentMethod())
                            .customerEmail(request.getContactDetails().getEmail())
                            .customerName(request.getContactDetails().getName())
                            .description("Payment for booking " + booking.getBookingId())
                            .build();

                    GenericRequest<InitiatePaymentRequest> wrappedPayment =
                            GenericRequest.wrap(paymentReq, "web-bff");

                    return paymentClient.initiatePayment(wrappedPayment)
                            .map(paymentResponse -> {

                                PaymentResponse payment = paymentResponse.getData();

                                log.info("Payment initiated | payment_id={} | status={}",
                                        payment.getPaymentId(), payment.getStatus());

                                // ==== Step 4: Build final response ====
                                return CompleteBookingResponse.builder()
                                        .bookingId(booking.getBookingId())
                                        .paymentId(payment.getPaymentId())
                                        .totalAmount(booking.getTotalAmount())
                                        .status(payment.getStatus())
                                        .hotelName(booking.getHotelName())
                                        .checkInDate(booking.getCheckInDate())
                                        .checkOutDate(booking.getCheckOutDate())
                                        .confirmationNumber(booking.getConfirmationNumber())
                                        .paymentUrl(payment.getPaymentUrl())
                                        .timestamp(LocalDateTime.now())
                                        .build();
                            });
                })
                .doOnSuccess(res -> log.info(
                        "Completed booking flow | booking_id={} | payment_id={}",
                        res.getBookingId(), res.getPaymentId()))
                .doOnError(err -> log.error(
                        "Booking failed | user_id={} | error={}",
                        userId, err.getMessage()));
    }

    /**
     * Search hotels with enrichment
     */
    public Mono<EnrichedHotelSearchResponse> searchHotelsWithEnrichment(
            HotelSearchRequest searchRequest) {

        log.info("Enriched hotel search | lat={} lon={} radius={}",
                searchRequest.getLatitude(), searchRequest.getLongitude(), searchRequest.getRadiusKm());

        NearbyHotelRequest nearbyReq = NearbyHotelRequest.builder()
                .latitude(searchRequest.getLatitude())
                .longitude(searchRequest.getLongitude())
                .radiusKm(searchRequest.getRadiusKm() != null ? searchRequest.getRadiusKm() : 10.0)
                .minStarRating(searchRequest.getMinStarRating())
                .maxPrice(searchRequest.getMaxPrice())
                .sortBy(searchRequest.getSortBy() != null ? searchRequest.getSortBy() : "distance")
                .page(searchRequest.getPage() != null ? searchRequest.getPage() : 1)
                .limit(searchRequest.getLimit() != null ? searchRequest.getLimit() : 20)
                .build();

        GenericRequest<NearbyHotelRequest> wrappedReq =
                GenericRequest.wrap(nearbyReq, "web-bff");

        return hotelClient.searchNearbyHotels(wrappedReq)
                .map(response -> {

                    NearbyHotelResponse resp = response.getData();

                    return EnrichedHotelSearchResponse.builder()
                            .hotels(resp.getHotels())
                            .totalResults(resp.getTotalResults())
                            .page(resp.getPage())
                            .totalPages(resp.getTotalPages())
                            .searchLocation(resp.getSearchLocation())
                            .filters(buildAppliedFilters(searchRequest))
                            .timestamp(LocalDateTime.now())
                            .build();
                });
    }

    private Mono<BookingHistoryResponse> enrichBookingWithPayment(BookingResponse booking) {

        return paymentClient.getPaymentByBookingId(booking.getBookingId())
                .map(paymentResponse -> {

                    PaymentResponse payment = paymentResponse.getData();

                    return BookingHistoryResponse.builder()
                            .bookingId(booking.getBookingId())
                            .hotelName(booking.getHotelName())
                            .checkInDate(booking.getCheckInDate())
                            .checkOutDate(booking.getCheckOutDate())
                            .totalAmount(booking.getTotalAmount())
                            .bookingStatus(booking.getStatus())
                            .paymentId(payment != null ? payment.getPaymentId() : null)
                            .paymentStatus(payment != null ? payment.getStatus() : "UNKNOWN")
                            .paymentMethod(payment != null ? payment.getPaymentMethod() : null)
                            .bookingDate(booking.getCreatedAt())
                            .confirmationNumber(booking.getConfirmationNumber())
                            .build();
                })
                .onErrorResume(err -> {

                    return Mono.just(BookingHistoryResponse.builder()
                            .bookingId(booking.getBookingId())
                            .hotelName(booking.getHotelName())
                            .checkInDate(booking.getCheckInDate())
                            .checkOutDate(booking.getCheckOutDate())
                            .totalAmount(booking.getTotalAmount())
                            .bookingStatus(booking.getStatus())
                            .paymentStatus("UNKNOWN")
                            .bookingDate(booking.getCreatedAt())
                            .build());
                });
    }

    private SearchFilters buildAppliedFilters(HotelSearchRequest req) {

        return SearchFilters.builder()
                .minStarRating(req.getMinStarRating())
                .maxPrice(req.getMaxPrice())
                .radiusKm(req.getRadiusKm())
                .sortBy(req.getSortBy())
                .build();
    }
}
