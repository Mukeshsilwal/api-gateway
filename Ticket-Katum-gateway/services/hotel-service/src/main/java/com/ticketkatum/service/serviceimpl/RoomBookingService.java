package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.MealPlan;
import com.ticketkatum.entity.MealService;
import com.ticketkatum.entity.RentType;
import com.ticketkatum.entity.Room;
import com.ticketkatum.entity.RoomBooking;
import com.ticketkatum.entity.RoomPricing;
import com.ticketkatum.enums.BookingStatus;
import com.ticketkatum.enums.MealType;
import com.ticketkatum.model.*;
import com.ticketkatum.repository.*;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class RoomBookingService {

    @Autowired
    private RoomBookingRepository bookingRepository;

    @Autowired
    private RoomPricingRepository pricingRepository;

    @Autowired
    private RentTypeRepository rentTypeRepository;

    @Autowired
    private MealPlanRepository mealPlanRepository;

    @Autowired
    private MealServiceRepository mealServiceRepository;

    @Autowired
    private RoomRepository roomRepository;

    /**
     * Calculate dynamic pricing for a room booking
     */
    public PricingResponseDto calculatePrice(PricingRequestDto request) {

        RoomPricing pricing = pricingRepository
                .findApplicablePricing(
                        request.getRoomId(),
                        request.getRentTypeId(),
                        request.getMealPlanId(),
                        request.getCheckIn().toLocalDate())
                .orElseThrow(() -> new RuntimeException(
                        "No pricing configuration found for the selected options"));

        RentType rentType = pricing.getRentType();

        // Calculate number of units (hours/days/weeks)
        long diffHours = ChronoUnit.HOURS.between(request.getCheckIn(), request.getCheckOut());
        double unitsDouble = (double) diffHours / rentType.getDurationHours();
        int units = (int) Math.ceil(unitsDouble);

        // Ensure at least 1 unit
        if (units == 0 && diffHours > 0)
            units = 1;

        // Calculate amounts
        BigDecimal baseTotal = pricing.getBaseRate().multiply(BigDecimal.valueOf(units));
        BigDecimal mealTotal = pricing.getMealAddonCost().multiply(BigDecimal.valueOf(units));
        BigDecimal subtotal = baseTotal.add(mealTotal);
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.13)); // 13% VAT
        BigDecimal total = subtotal.add(tax);

        String breakdown = String.format(
                "%s × %d %s = NPR %.2f | Meal: NPR %.2f | Tax (13%%): NPR %.2f",
                rentType.getName(), units, rentType.getName().toLowerCase(),
                baseTotal, mealTotal, tax);

        return PricingResponseDto.builder()
                .baseRate(pricing.getBaseRate())
                .mealCost(pricing.getMealAddonCost())
                .units(units)
                .rentTypeName(rentType.getName())
                .mealPlanName(pricing.getMealPlan().getName())
                .subtotal(subtotal)
                .tax(tax)
                .total(total)
                .priceBreakdown(breakdown)
                .build();
    }

    /**
     * Check if room is available (no conflicts)
     */
    public boolean checkAvailability(Long roomId, LocalDateTime checkIn, LocalDateTime checkOut) {
        Long conflicts = bookingRepository.countConflictingBookings(roomId, checkIn, checkOut);
        return conflicts == 0;
    }

    /**
     * Find available rooms with all pricing options
     */
    public List<AvailableRoomDto> findAvailableRooms(AvailabilityRequestDto request) {

        List<Room> availableRooms = bookingRepository.findAvailableRooms(
                request.getHotelId(),
                request.getRoomType(),
                request.getCheckIn(),
                request.getCheckOut(),
                request.getGuestsCount());

        if (availableRooms.isEmpty()) {
            return Collections.emptyList();
        }

        // Get all active rent types and meal plans
        List<RentType> rentTypes = rentTypeRepository.findByIsActiveTrue();
        List<MealPlan> mealPlans = mealPlanRepository.findByIsActiveTrue();

        return availableRooms.stream()
                .map(room -> {
                    List<PricingOptionDto> pricingOptions = new ArrayList<>();

                    // Generate all pricing combinations
                    for (RentType rentType : rentTypes) {
                        for (MealPlan mealPlan : mealPlans) {
                            try {
                                PricingRequestDto pricingReq = PricingRequestDto.builder()
                                        .roomId(room.getId())
                                        .rentTypeId(rentType.getId())
                                        .mealPlanId(mealPlan.getId())
                                        .checkIn(request.getCheckIn())
                                        .checkOut(request.getCheckOut())
                                        .build();

                                PricingResponseDto pricing = calculatePrice(pricingReq);

                                pricingOptions.add(PricingOptionDto.builder()
                                        .rentTypeId(rentType.getId())
                                        .rentTypeName(rentType.getName())
                                        .mealPlanId(mealPlan.getId())
                                        .mealPlanName(mealPlan.getName())
                                        .totalPrice(pricing.getTotal())
                                        .priceBreakdown(pricing.getPriceBreakdown())
                                        .build());

                            } catch (Exception e) {
                                // Skip invalid combinations
                            }
                        }
                    }

                    return AvailableRoomDto.builder()
                            .roomId(room.getId())
                            .roomNumber(room.getRoomNumber())
                            .roomType(room.getRoomType())
                            .capacity(room.getCapacity())
                            .amenities(room.getAmenities())
                            .pricingOptions(pricingOptions)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Create a new booking with validation
     */
    public BookingResponseDto createBooking(BookingRequestDto request, Long customerId) {

        // Find available rooms
        List<Room> availableRooms = bookingRepository.findAvailableRooms(
                request.getHotelId(),
                request.getRoomType(),
                request.getCheckIn(),
                request.getCheckOut(),
                request.getGuestsCount());

        if (availableRooms.isEmpty()) {
            throw new RuntimeException("No rooms available for the selected dates and criteria");
        }

        Room selectedRoom = availableRooms.get(0);

        // Double-check availability (prevent race condition)
        if (!checkAvailability(selectedRoom.getId(), request.getCheckIn(), request.getCheckOut())) {
            throw new RuntimeException("Room is no longer available");
        }

        // Calculate pricing
        PricingRequestDto pricingRequest = PricingRequestDto.builder()
                .roomId(selectedRoom.getId())
                .rentTypeId(request.getRentTypeId())
                .mealPlanId(request.getMealPlanId())
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .build();

        PricingResponseDto pricing = calculatePrice(pricingRequest);

        // Get rent type and meal plan
        RentType rentType = rentTypeRepository.findById(request.getRentTypeId())
                .orElseThrow(() -> new RuntimeException("Rent type not found"));
        MealPlan mealPlan = mealPlanRepository.findById(request.getMealPlanId())
                .orElseThrow(() -> new RuntimeException("Meal plan not found"));

        // Create booking
        RoomBooking booking = RoomBooking.builder()
                .bookingReference(generateBookingReference())
                .room(selectedRoom)
                .customerId(customerId)
                .rentType(rentType)
                .mealPlan(mealPlan)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .numberOfUnits(pricing.getUnits())
                .baseRate(pricing.getBaseRate())
                .mealCost(pricing.getMealCost())
                .subtotal(pricing.getSubtotal())
                .taxAmount(pricing.getTax())
                .totalAmount(pricing.getTotal())
                .guestsCount(request.getGuestsCount())
                .specialRequests(request.getSpecialRequests())
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .status(BookingStatus.CONFIRMED)
                .build();

        booking = bookingRepository.save(booking);

        // Create meal services if meal plan includes meals
        createMealServices(booking);

        log.info("Booking created successfully: {}", booking.getBookingReference());

        return mapToResponseDto(booking);
    }

    private String generateBookingReference() {
        return "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Get booking by reference
     */
    public BookingResponseDto getBooking(String reference) {
        RoomBooking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + reference));
        return mapToResponseDto(booking);
    }

    /**
     * Get customer bookings
     */
//    @Transactional(readOnly = true)
    public List<BookingResponseDto> getCustomerBookings(Long customerId) {
        return bookingRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Cancel booking
     */
    public void cancelBooking(String reference, Long customerId) {
        RoomBooking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new RuntimeException("Cannot cancel a completed booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        log.info("Booking cancelled: {}", reference);
    }

    /**
     * Check-in
     */
    public void checkIn(String reference) {
        RoomBooking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Can only check-in confirmed bookings");
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        bookingRepository.save(booking);

        log.info("Check-in completed: {}", reference);
    }

    /**
     * Check-out
     */
    public void checkOut(String reference) {
        RoomBooking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new RuntimeException("Can only check-out checked-in bookings");
        }

        booking.setStatus(BookingStatus.CHECKED_OUT);
        bookingRepository.save(booking);

        log.info("Check-out completed: {}", reference);
    }

    // Helper Methods

    private void createMealServices(RoomBooking booking) {
        String mealCode = booking.getMealPlan().getCode();

        if ("RO".equals(mealCode)) {
            return; // Room only, no meals
        }

        LocalDate startDate = booking.getCheckIn().toLocalDate();
        LocalDate endDate = booking.getCheckOut().toLocalDate();

        List<MealService> mealServices = new ArrayList<>();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            if ("BB".equals(mealCode)) {
                // Breakfast only
                mealServices.add(createMealService(booking, MealType.BREAKFAST, date));
            } else if ("HB".equals(mealCode)) {
                // Breakfast + Dinner
                mealServices.add(createMealService(booking, MealType.BREAKFAST, date));
                mealServices.add(createMealService(booking, MealType.DINNER, date));
            } else if ("FB".equals(mealCode)) {
                // All meals
                mealServices.add(createMealService(booking, MealType.BREAKFAST, date));
                mealServices.add(createMealService(booking, MealType.LUNCH, date));
                mealServices.add(createMealService(booking, MealType.DINNER, date));
            }
        }

        mealServiceRepository.saveAll(mealServices);
    }

    private MealService createMealService(RoomBooking booking, MealType mealType, LocalDate date) {
        return MealService.builder()
                .booking(booking)
                .serviceDate(date)
                .mealType(mealType)
                .build();
    }

    private BookingResponseDto mapToResponseDto(RoomBooking booking) {
        return BookingResponseDto.builder()
                .bookingReference(booking.getBookingReference())
                .roomType(booking.getRoom().getRoomType())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .status(BookingStatus.valueOf(booking.getStatus().name()))
                .totalAmount(booking.getTotalAmount())
                .customerName(booking.getCustomerName())
                .build();
    }

}