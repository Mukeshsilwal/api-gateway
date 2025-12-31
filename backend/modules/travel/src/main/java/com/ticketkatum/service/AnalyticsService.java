package com.ticketkatum.service;

import com.ticketkatum.dto.DailyStatsDto;
import com.ticketkatum.dto.EventAnalyticsDto;
import com.ticketkatum.dto.TicketTypeStatsDto;
import com.ticketkatum.entity.Event;
import com.ticketkatum.entity.EventBooking;
import com.ticketkatum.entity.TicketType;
import com.ticketkatum.repository.EventBookingRepository;
import com.ticketkatum.repository.EventRepository;
import com.ticketkatum.repository.TicketTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Analytics Service
 * Provides comprehensive analytics for events
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final EventRepository eventRepository;
    private final EventBookingRepository eventBookingRepository;
    private final TicketTypeRepository ticketTypeRepository;

    /**
     * Get comprehensive analytics for an event
     */
    public EventAnalyticsDto getEventAnalytics(Long eventId) {
        log.info("Generating analytics for event: {}", eventId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));

        List<EventBooking> bookings = eventBookingRepository.findByEventId(eventId, Pageable.unpaged()).getContent();
        List<TicketType> ticketTypes = ticketTypeRepository.findByEventIdOrderBySortOrderAsc(eventId);

        return EventAnalyticsDto.builder()
                .eventId(eventId)
                .eventName(event.getName())
                .totalViews(calculateTotalViews(eventId))
                .totalBookings(bookings.size())
                .totalTicketsSold(event.getTicketsSold())
                .totalTicketsAvailable(event.getTotalTickets())
                .totalRevenue(calculateTotalRevenue(bookings))
                .platformFees(calculatePlatformFees(bookings))
                .netRevenue(calculateNetRevenue(bookings))
                .conversionRate(calculateConversionRate(eventId, bookings.size()))
                .averageTicketsPerBooking(calculateAverageTicketsPerBooking(bookings, event.getTicketsSold()))
                .averageOrderValue(calculateAverageOrderValue(bookings))
                .ticketTypeStats(calculateTicketTypeStats(ticketTypes, bookings))
                .dailyStats(calculateDailyStats(eventId, bookings))
                .bookingsByCity(calculateBookingsByCity(bookings))
                .bookingsByCountry(calculateBookingsByCountry(bookings))
                .trafficSources(calculateTrafficSources(eventId))
                .totalCheckIns(0) // TODO: Implement check-in tracking
                .pendingCheckIns(event.getTicketsSold())
                .checkInRate(0.0) // TODO: Implement check-in tracking
                .promoCodesUsed(0) // TODO: Implement when promo codes are added
                .totalDiscountGiven(BigDecimal.ZERO) // TODO: Implement when promo codes are added
                .build();
    }

    private Integer calculateTotalViews(Long eventId) {
        // Get views from the Event entity
        return eventRepository.findById(eventId)
                .map(Event::getViews)
                .orElse(0L)
                .intValue();
    }

    private BigDecimal calculateTotalRevenue(List<EventBooking> bookings) {
        return bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()))
                .map(EventBooking::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculatePlatformFees(List<EventBooking> bookings) {
        BigDecimal totalRevenue = calculateTotalRevenue(bookings);
        // Platform fee is 5% by default
        return totalRevenue.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateNetRevenue(List<EventBooking> bookings) {
        BigDecimal totalRevenue = calculateTotalRevenue(bookings);
        BigDecimal platformFees = calculatePlatformFees(bookings);
        return totalRevenue.subtract(platformFees);
    }

    private Double calculateConversionRate(Long eventId, int totalBookings) {
        Integer totalViews = calculateTotalViews(eventId);
        if (totalViews == 0)
            return 0.0;
        return ((double) totalBookings / totalViews) * 100;
    }

    private Double calculateAverageTicketsPerBooking(List<EventBooking> bookings, int totalTicketsSold) {
        if (bookings.isEmpty())
            return 0.0;
        int confirmedBookings = (int) bookings.stream()
                .filter(b -> EventBooking.BookingStatus.CONFIRMED.equals(b.getStatus()))
                .count();
        if (confirmedBookings == 0)
            return 0.0;
        return (double) totalTicketsSold / confirmedBookings;
    }

    private BigDecimal calculateAverageOrderValue(List<EventBooking> bookings) {
        List<EventBooking> confirmedBookings = bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()))
                .toList();

        if (confirmedBookings.isEmpty())
            return BigDecimal.ZERO;

        BigDecimal totalRevenue = calculateTotalRevenue(bookings);
        return totalRevenue.divide(
                new BigDecimal(confirmedBookings.size()),
                2,
                RoundingMode.HALF_UP);
    }

    private List<TicketTypeStatsDto> calculateTicketTypeStats(List<TicketType> ticketTypes,
            List<EventBooking> bookings) {
        if (ticketTypes == null || ticketTypes.isEmpty())
            return Collections.emptyList();

        return ticketTypes.stream().map(ticketType -> {
            int sold = ticketType.getQuantitySold() != null ? ticketType.getQuantitySold() : 0;

            BigDecimal revenue = ticketType.getPrice()
                    .multiply(new BigDecimal(sold))
                    .setScale(2, RoundingMode.HALF_UP);

            double sellThroughRate = ticketType.getQuantity() > 0
                    ? ((double) sold / ticketType.getQuantity()) * 100
                    : 0.0;

            return TicketTypeStatsDto.builder()
                    .ticketTypeId(ticketType.getId())
                    .ticketTypeName(ticketType.getName())
                    .price(ticketType.getPrice())
                    .totalQuantity(ticketType.getQuantity())
                    .soldQuantity(sold)
                    .remainingQuantity(ticketType.getQuantity() - sold)
                    .revenue(revenue)
                    .sellThroughRate(sellThroughRate)
                    .build();
        }).collect(Collectors.toList());
    }

    private List<DailyStatsDto> calculateDailyStats(Long eventId, List<EventBooking> bookings) {
        // Group bookings by date
        Map<LocalDate, List<EventBooking>> bookingsByDate = bookings.stream()
                .filter(b -> b.getCreatedAt() != null)
                .collect(Collectors.groupingBy(b -> b.getCreatedAt().toLocalDate()));

        return bookingsByDate.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<EventBooking> dayBookings = entry.getValue();

                    // TODO: Parse tickets JSON to get actual ticket count
                    int ticketsSold = dayBookings.size(); // Simplified for now

                    BigDecimal revenue = dayBookings.stream()
                            .filter(b -> EventBooking.BookingStatus.CONFIRMED.equals(b.getStatus()))
                            .map(EventBooking::getTotalAmount)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return DailyStatsDto.builder()
                            .date(date)
                            .views(0) // TODO: Implement view tracking
                            .bookings(dayBookings.size())
                            .ticketsSold(ticketsSold)
                            .revenue(revenue)
                            .build();
                })
                .sorted(Comparator.comparing(DailyStatsDto::getDate))
                .collect(Collectors.toList());
    }

    private Map<String, Integer> calculateBookingsByCity(List<EventBooking> bookings) {
        // TODO: Extract city from attendee or user data when available
        // Return empty map for now as we don't have city tracking yet
        return new HashMap<>();
    }

    private Map<String, Integer> calculateBookingsByCountry(List<EventBooking> bookings) {
        // TODO: Extract country from attendee or user data
        // For now, return sample data
        Map<String, Integer> countryMap = new HashMap<>();
        countryMap.put("Nepal", bookings.size());
        return countryMap;
    }

    private Map<String, Integer> calculateTrafficSources(Long eventId) {
        // TODO: Implement traffic source tracking when analytics are in place
        // Return empty map for now as we don't have traffic tracking yet
        return new HashMap<>();
    }
}
