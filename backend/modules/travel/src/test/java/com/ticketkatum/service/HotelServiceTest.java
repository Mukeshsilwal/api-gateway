package com.ticketkatum.service;

import com.ticketkatum.entity.Hotel;
import com.ticketkatum.exception.HotelAlreadyExistsException;
import com.ticketkatum.exception.HotelNotFoundException;
import com.ticketkatum.mapper.HotelMapper;
import com.ticketkatum.model.CreateHotelRequest;
import com.ticketkatum.model.HotelDTO;
import com.ticketkatum.repository.HotelRepository;
import com.ticketkatum.repository.MealPlanRepository;
import com.ticketkatum.repository.RentTypeRepository;
import com.ticketkatum.service.serviceimpl.HotelServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HotelServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private RentTypeRepository rentTypeRepository;

    @Mock
    private MealPlanRepository mealPlanRepository;

    @Mock
    private HotelMapper hotelMapper;

    @InjectMocks
    private HotelServiceImpl hotelService;

    private CreateHotelRequest validRequest;
    private Hotel testHotel;
    private HotelDTO testHotelDto;

    @BeforeEach
    void setUp() {
        validRequest = CreateHotelRequest.builder()
                .name("Grand Annapurna")
                .hotelCode("HTL-ANN-01")
                .city("Kathmandu")
                .address("Durbar Marg, Kathmandu")
                .stars(5)
                .email("info@annapurna.com")
                .phone("9801234567")
                .minPrice(BigDecimal.valueOf(5000))
                .maxPrice(BigDecimal.valueOf(15000))
                .build();

        testHotel = Hotel.builder()
                .id(1L)
                .hotelCode("HTL-ANN-01")
                .name("Grand Annapurna")
                .city("Kathmandu")
                .address("Durbar Marg, Kathmandu")
                .stars(5)
                .email("info@annapurna.com")
                .phone("9801234567")
                .images(new HashSet<>())
                .rooms(new ArrayList<>())
                .build();

        testHotelDto = HotelDTO.builder()
                .id(1L)
                .hotelCode("HTL-ANN-01")
                .name("Grand Annapurna")
                .city("Kathmandu")
                .stars(5)
                .build();
    }

    @Test
    @DisplayName("Admin: Successfully creates a new hotel property")
    void testCreateHotel_Success() {
        when(hotelRepository.existsByHotelCode("HTL-ANN-01")).thenReturn(false);
        when(hotelRepository.save(any(Hotel.class))).thenReturn(testHotel);
        when(hotelMapper.toDTO(testHotel)).thenReturn(testHotelDto);

        HotelDTO result = hotelService.createHotel(validRequest);

        assertNotNull(result);
        assertEquals("HTL-ANN-01", result.getHotelCode());
        assertEquals("Grand Annapurna", result.getName());
        verify(hotelRepository, times(1)).save(any(Hotel.class));
    }

    @Test
    @DisplayName("Admin: Fails when hotel code already exists")
    void testCreateHotel_DuplicateHotelCode_ThrowsException() {
        when(hotelRepository.existsByHotelCode("HTL-ANN-01")).thenReturn(true);

        assertThrows(HotelAlreadyExistsException.class, () -> hotelService.createHotel(validRequest));
        verify(hotelRepository, never()).save(any(Hotel.class));
    }

    @Test
    @DisplayName("User/Admin: Successfully retrieves hotel by ID")
    void testGetHotel_Success() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(testHotel));
        when(hotelMapper.toDTO(testHotel)).thenReturn(testHotelDto);

        HotelDTO result = hotelService.getHotel(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Grand Annapurna", result.getName());
        verify(hotelRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("User/Admin: Throws HotelNotFoundException when hotel ID does not exist")
    void testGetHotel_NotFound_ThrowsException() {
        when(hotelRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(HotelNotFoundException.class, () -> hotelService.getHotel(999L));
    }
}
