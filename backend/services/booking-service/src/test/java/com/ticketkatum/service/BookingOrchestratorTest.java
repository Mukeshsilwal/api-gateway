//package com.ticketkatum.service;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.ticketkatum.abstractfactory.bus.BusBookingProvider;
//import com.ticketkatum.abstractfactory.event.EventBookingProvider;
//import com.ticketkatum.abstractfactory.provider.BookingProvider;
//import com.ticketkatum.abstractfactory.provider.factory.BookingProviderFactory;
//import com.ticketkatum.model.CompositeBookingRequest;
//import com.ticketkatum.utils.Request;
//import com.ticketkatum.utils.Response;
//import com.ticketkatum.utils.ResponseHandler;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.util.ArrayList;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//public class BookingOrchestratorTest {
//
//    @Mock
//    private BookingProviderFactory bookingProviderFactory;
//
//    @Mock
//    private BookingProvider bookingProvider;
//
//    @Mock
//    private TripBookingService tripBookingService;
//
//    private BookingOrchestrator bookingOrchestrator;
//    private ObjectMapper objectMapper = new ObjectMapper();
//
//    @BeforeEach
//    void setUp() {
//        bookingOrchestrator = new BookingOrchestrator(bookingProviderFactory, objectMapper, tripBookingService);
//    }
//
//    @Test
//    void processUnifiedBooking_Success() {
//        CompositeBookingRequest request = new CompositeBookingRequest();
//        request.setCustomerId("cust123");
//        List<CompositeBookingRequest.BookingRequestItem> items = new ArrayList<>();
//
//        CompositeBookingRequest.BookingRequestItem item = new CompositeBookingRequest.BookingRequestItem();
//        item.setType("EVENT");
//        item.setPayload(new HashMap<>());
//        items.add(item);
//
//        request.setBookings(items);
//
//        // Mock Booking Verification Response
//        Map<String, Object> mockData = new HashMap<>();
//        mockData.put("bookingId", "12345");
//        mockData.put("confirmationNumber", "CONF-999");
//        mockData.put("amount", 1000.0);
//
//        when(bookingProviderFactory.getProvider(anyString(), anyString())).thenReturn(bookingProvider);
//        when(bookingProvider.bookTicket(any())).thenReturn(ResponseHandler.success(mockData));
//
//        bookingOrchestrator.processUnifiedBooking(request);
//
//        verify(bookingProvider, times(1)).bookTicket(any());
//        verify(tripBookingService, never()).associateBookingWithTrip(any(), any(), any(), any(), any());
//    }
//
//    @Test
//    void processUnifiedBooking_WithTripAssociation() {
//        CompositeBookingRequest request = new CompositeBookingRequest();
//        request.setCustomerId("cust123");
//        request.setTripId(101L); // Set Trip ID
//        List<CompositeBookingRequest.BookingRequestItem> items = new ArrayList<>();
//
//        CompositeBookingRequest.BookingRequestItem item = new CompositeBookingRequest.BookingRequestItem();
//        item.setType("HOTEL");
//        item.setPayload(new HashMap<>());
//        items.add(item);
//
//        request.setBookings(items);
//
//        // Mock Booking Verification Response
//        Map<String, Object> mockData = new HashMap<>();
//        mockData.put("bookingId", "555");
//        mockData.put("confirmationNumber", "HTL-555");
//        mockData.put("amount", 5000.0);
//
//        when(bookingProviderFactory.getProvider(anyString(), anyString())).thenReturn(bookingProvider);
//        when(bookingProvider.bookTicket(any())).thenReturn(ResponseHandler.success(mockData));
//
//        bookingOrchestrator.processUnifiedBooking(request);
//
//        // Verify booking was attempted
//        verify(bookingProvider, times(1)).bookTicket(any());
//
//        // Verify trip association was called
//        verify(tripBookingService, times(1)).associateBookingWithTrip(
//                eq(101L),
//                eq("HOTEL"),
//                eq(555L),
//                eq("HTL-555"),
//                any());
//    }
//}
