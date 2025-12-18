package com.ticketkatum.service;

import com.ticketkatum.client.MarketServiceClient;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketAggregator {

    private final MarketServiceClient marketClient;
    private final com.ticketkatum.client.PaymentServiceClient paymentClient;

    public Mono<com.ticketkatum.dto.market.CompletePurchaseResponse> completePurchaseFlow(
            com.ticketkatum.dto.market.CompletePurchaseRequest request) {

        return marketClient.buyListing(request.getListingId(), request.getPurchaseDetails())
                .flatMap(transaction -> {
                    com.ticketkatum.dto.payment.request.PaymentRequest paymentReq = request.getPaymentDetails();
                    paymentReq.setBookingId(transaction.getId().toString());

                    if (transaction.getFinalPrice() != null) {
                        paymentReq.setAmount(transaction.getFinalPrice());
                    }

                    return Mono.fromFuture(paymentClient.initiatePayment(paymentReq.getProvider(), paymentReq))
                            .map(paymentResp -> com.ticketkatum.dto.market.CompletePurchaseResponse.builder()
                                    .transaction(transaction)
                                    .paymentData(paymentResp)
                                    .status(200)
                                    .message("Purchase completed and payment initiated")
                                    .build());
                });
    }

    public Mono<LiveDashboardDTO> getLiveDashboard(String eventId) {
        // Fetch all components in parallel using Mono.zip
        return Mono.zip(
                marketClient.getHeatmap(eventId).collectList(),
                marketClient.getPolls(eventId).collectList(),
                marketClient.getMenu(eventId).collectList()).map(
                        tuple -> LiveDashboardDTO.builder()
                                .heatmap(tuple.getT1())
                                .activePolls(tuple.getT2())
                                .menu(tuple.getT3())
                                .build());
    }

    public Mono<OrganizerDashboardDTO> getOrganizerDashboard(String eventId) {
        // In a real scenario, this would aggregate sales + crowd stats
        // Using heatmap as a proxy for crowd stats for now
        return marketClient.getHeatmap(eventId).collectList()
                .map(heatmap -> OrganizerDashboardDTO.builder()
                        .crowdStats(heatmap)
                        .build());
    }

    @Data
    @Builder
    public static class LiveDashboardDTO {
        private List<Object> heatmap;
        private List<Object> activePolls;
        private List<Object> menu;
    }

    @Data
    @Builder
    public static class OrganizerDashboardDTO {
        private List<Object> crowdStats;
        // Add sales stats here later
    }
}
