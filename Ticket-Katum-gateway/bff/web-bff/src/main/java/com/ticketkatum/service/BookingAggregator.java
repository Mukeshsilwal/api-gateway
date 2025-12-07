package com.ticketkatum.service;

import com.ticketkatum.client.BookingServiceClient;
import com.ticketkatum.client.HotelServiceClient;
import com.ticketkatum.client.PaymentServiceClient;
import com.ticketkatum.client.RecommendationServiceClient;
import com.ticketkatum.dto.auth.UserStatistics;
import com.ticketkatum.dto.booking.BookingSummary;
import com.ticketkatum.dto.booking.request.CompleteBookingRequest;
import com.ticketkatum.dto.booking.response.BookingDetailsResponse;
import com.ticketkatum.dto.booking.response.BookingHistoryResponse;
import com.ticketkatum.dto.booking.response.CompleteBookingResponse;
import com.ticketkatum.dto.hotel.HotelDTO;
import com.ticketkatum.dto.hotel.RoomDTO;
import com.ticketkatum.dto.hotel.request.HotelBookingRequest;
import com.ticketkatum.dto.hotel.request.RefundRequest;
import com.ticketkatum.dto.hotel.response.CancellationResponse;
import com.ticketkatum.dto.payment.request.PaymentRequest;
import com.ticketkatum.exception.AggregationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Booking Domain Aggregator
 * Handles all booking-related aggregations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingAggregator {

    private final BookingServiceClient bookingClient;
    private final HotelServiceClient hotelClient;
    private final RecommendationServiceClient recommendationClient;
    private final PaymentServiceClient paymentClient;

    /**
     * Complete booking flow: validate -> book -> pay
     */
    public CompletableFuture<CompleteBookingResponse> completeBookingFlow(
            CompleteBookingRequest request) {

        log.info("Complete booking flow for user: {}", request.getUserId());

        HotelBookingRequest bookingReq = request.getBookingRequest();

        // Step 1: Validate hotel and rooms
        CompletableFuture<HotelDTO> hotelFuture =
                hotelClient.getHotelById(bookingReq.getHotelId());

        CompletableFuture<List<RoomDTO>> roomsFuture =
                hotelClient.getRoomsByIds(bookingReq.getRoomIds());

        return CompletableFuture.allOf(hotelFuture, roomsFuture)
                .thenCompose(v -> {
                    HotelDTO hotel = hotelFuture.join();
                    List<RoomDTO> rooms = roomsFuture.join();

                    // Step 2: Check availability
                    return recommendationClient.checkAvailability(
                            bookingReq.getHotelId(),
                            LocalDate.parse(bookingReq.getCheckIn()),
                            LocalDate.parse(bookingReq.getCheckOut()),
                            bookingReq.getRoomIds()
                    ).thenCompose(availability -> {
                        if (!availability.isAvailable()) {
                            throw new AggregationException("Rooms not available");
                        }

                        // Step 3: Create booking
                        return bookingClient.bookTicket(
                                bookingReq.getCategory(),
                                bookingReq.getService(),
                                bookingReq
                        ).thenCompose(bookingResponse -> {
                            // Step 4: Initiate payment
                            PaymentRequest paymentReq = request.getPaymentRequest();
                            paymentReq.setAmount(availability.getTotalPrice());
                            paymentReq.getMetadata().put("bookingId", bookingResponse.getBookingId());

                            return paymentClient.initiatePayment(
                                    paymentReq.getProvider(), paymentReq
                            ).thenApply(paymentResponse ->
                                    CompleteBookingResponse.builder()
                                            .bookingData(bookingResponse)
                                            .paymentData(paymentResponse)
                                            .hotelDetails(hotel)
                                            .bookedRooms(rooms)
                                            .totalAmount(availability.getTotalPrice())
                                            .confirmationEmail("Sent to " + bookingReq.getGuestEmail())
                                            .confirmationSms("Sent to " + bookingReq.getGuestPhone())
                                            .build()
                            );
                        });
                    });
                })
                .exceptionally(ex -> {
                    log.error("Booking flow failed", ex);
                    throw new AggregationException("Booking failed", ex);
                });
    }

    /**
     * Cancel booking with automatic refund
     */
    public CompletableFuture<CancellationResponse> cancelBookingWithRefund(
            String category, String service, HotelBookingRequest request, String reason) {

        log.info("Cancelling booking with refund");

        return bookingClient.cancelBooking(category, service, request)
                .thenCompose(cancellationResponse -> {
                    if (!cancellationResponse.isSuccess()) {
                        throw new AggregationException("Cancellation failed");
                    }

                    // Process refund if applicable
                    if (cancellationResponse.getRefundAmount() != null &&
                            cancellationResponse.getRefundAmount().compareTo(BigDecimal.ZERO) > 0) {

                        RefundRequest refundReq = RefundRequest.builder()
                                .bookingId(cancellationResponse.getBookingId())
                                .reason(reason)
                                .amount(cancellationResponse.getRefundAmount())
                                .build();

                        return bookingClient.refundBooking(category, service, refundReq)
                                .thenApply(refundResponse -> {
                                    cancellationResponse.setRefundStatus(refundResponse.getRefundStatus());
                                    return cancellationResponse;
                                });
                    }

                    return CompletableFuture.completedFuture(cancellationResponse);
                })
                .exceptionally(ex -> {
                    log.error("Cancellation with refund failed", ex);
                    throw new AggregationException("Cancellation failed", ex);
                });
    }

    /**
     * Get booking details with hotel and payment info
     */
    public CompletableFuture<BookingDetailsResponse> getBookingDetails(String bookingId) {
        log.info("Fetching booking details: {}", bookingId);

        // TODO: Implement actual booking details fetch
        return CompletableFuture.completedFuture(
                BookingDetailsResponse.builder()
                        .bookingInfo(new BookingSummary())
                        .canCancel(true)
                        .canModify(false)
                        .build()
        );
    }

    /**
     * Get booking history with statistics
     */
    public CompletableFuture<BookingHistoryResponse> getBookingHistory(
            Integer userId, Integer page, Integer size) {

        log.info("Fetching booking history for user: {}", userId);

        // TODO: Implement actual booking history fetch
        return CompletableFuture.completedFuture(
                BookingHistoryResponse.builder()
                        .bookings(Collections.emptyList())
                        .totalBookings(0)
                        .totalPages(0)
                        .currentPage(page)
                        .statistics(new UserStatistics())
                        .build()
        );
    }
}
