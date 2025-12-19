package com.ticketkatum.integration.database;

import com.ticketkatum.HotelApplication;
import com.ticketkatum.entity.Hotel;
import com.ticketkatum.repository.HotelRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.jdbc.Sql;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for HotelRepository
 * Uses Testcontainers to spin up a real PostgreSQL database
 * FIXED: Explicitly specify HotelApplication to avoid conflict with
 * SharedApplication
 * FIXED: Use native SQL to clean up tables with CASCADE to avoid foreign key
 * constraint violations
 */
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes = HotelApplication.class)
@DisplayName("Hotel Repository Integration Tests")
class HotelRepositoryIntegrationTest {

        @Container
        static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
                        .withDatabaseName("testdb")
                        .withUsername("test")
                        .withPassword("test");

        @Autowired
        private HotelRepository hotelRepository;

        @Autowired
        private EntityManager entityManager;

        @BeforeEach
        void setUp() {
                // Use native SQL to truncate tables with CASCADE to avoid foreign key
                // constraint violations
                // This is necessary because the Staff entity has a foreign key reference to
                // Hotel
                entityManager.createNativeQuery(
                                "TRUNCATE TABLE staff, rooms, hotel_images, hotels RESTART IDENTITY CASCADE")
                                .executeUpdate();
                entityManager.flush();
                entityManager.clear();
        }

        @Test
        @DisplayName("Should save and retrieve hotel")
        void shouldSaveAndRetrieveHotel() {
                // Given
                Hotel hotel = Hotel.builder()
                                .hotelCode("HTL001")
                                .name("Integration Test Hotel")
                                .city("Kathmandu")
                                .address("Thamel")
                                .stars(4)
                                .latitude(27.7172)
                                .longitude(85.3240)
                                .active(true)
                                .build();

                // When
                Hotel saved = hotelRepository.save(hotel);
                Optional<Hotel> retrieved = hotelRepository.findById(saved.getId());

                // Then
                assertThat(retrieved).isPresent();
                assertThat(retrieved.get().getName()).isEqualTo("Integration Test Hotel");
                assertThat(retrieved.get().getCity()).isEqualTo("Kathmandu");
                assertThat(retrieved.get().getHotelCode()).isEqualTo("HTL001");
        }

        @Test
        @DisplayName("Should find hotel by hotel code")
        void shouldFindHotelByHotelCode() {
                // Given
                Hotel hotel = Hotel.builder()
                                .hotelCode("HTL002")
                                .name("Test Hotel")
                                .city("Pokhara")
                                .latitude(28.2096)
                                .longitude(83.9856)
                                .active(true)
                                .build();

                hotelRepository.save(hotel);

                // When
                Optional<Hotel> found = hotelRepository.findByHotelCode("HTL002");

                // Then
                assertThat(found).isPresent();
                assertThat(found.get().getName()).isEqualTo("Test Hotel");
                assertThat(found.get().getCity()).isEqualTo("Pokhara");
        }

        @Test
        @DisplayName("Should find hotels by city (case insensitive)")
        void shouldFindHotelsByCityIgnoreCase() {
                // Given
                Hotel hotel1 = Hotel.builder()
                                .hotelCode("HTL003")
                                .name("Kathmandu Hotel 1")
                                .city("Kathmandu")
                                .latitude(27.7172)
                                .longitude(85.3240)
                                .active(true)
                                .build();

                Hotel hotel2 = Hotel.builder()
                                .hotelCode("HTL004")
                                .name("Kathmandu Hotel 2")
                                .city("kathmandu") // lowercase
                                .latitude(27.7172)
                                .longitude(85.3240)
                                .active(true)
                                .build();

                Hotel hotel3 = Hotel.builder()
                                .hotelCode("HTL005")
                                .name("Pokhara Hotel")
                                .city("Pokhara")
                                .latitude(28.2096)
                                .longitude(83.9856)
                                .active(true)
                                .build();

                hotelRepository.saveAll(List.of(hotel1, hotel2, hotel3));

                // When
                List<Hotel> kathmanduHotels = hotelRepository.findByCityIgnoreCaseAndActiveTrue("KATHMANDU");

                // Then
                assertThat(kathmanduHotels).hasSize(2);
                assertThat(kathmanduHotels)
                                .extracting(Hotel::getName)
                                .containsExactlyInAnyOrder("Kathmandu Hotel 1", "Kathmandu Hotel 2");
        }

        @Test
        @DisplayName("Should update hotel")
        void shouldUpdateHotel() {
                // Given
                Hotel hotel = Hotel.builder()
                                .hotelCode("HTL006")
                                .name("Original Name")
                                .city("Kathmandu")
                                .stars(3)
                                .latitude(27.7172)
                                .longitude(85.3240)
                                .active(true)
                                .build();

                Hotel saved = hotelRepository.save(hotel);

                // When
                saved.setName("Updated Name");
                saved.setStars(5);
                Hotel updated = hotelRepository.save(saved);

                // Then
                Optional<Hotel> retrieved = hotelRepository.findById(updated.getId());
                assertThat(retrieved).isPresent();
                assertThat(retrieved.get().getName()).isEqualTo("Updated Name");
                assertThat(retrieved.get().getStars()).isEqualTo(5);
        }

        @Test
        @DisplayName("Should delete hotel")
        void shouldDeleteHotel() {
                // Given
                Hotel hotel = Hotel.builder()
                                .hotelCode("HTL007")
                                .name("Hotel to Delete")
                                .city("Kathmandu")
                                .stars(3)
                                .latitude(27.7172)
                                .longitude(85.3240)
                                .active(true)
                                .build();

                Hotel saved = hotelRepository.save(hotel);
                Long hotelId = saved.getId();

                // When
                hotelRepository.deleteById(hotelId);

                // Then
                Optional<Hotel> retrieved = hotelRepository.findById(hotelId);
                assertThat(retrieved).isEmpty();
        }

        @Test
        @DisplayName("Should check if hotel exists by hotel code")
        void shouldCheckIfHotelExistsByHotelCode() {
                // Given
                Hotel hotel = Hotel.builder()
                                .hotelCode("HTL008")
                                .name("Existing Hotel")
                                .city("Kathmandu")
                                .latitude(27.7172)
                                .longitude(85.3240)
                                .active(true)
                                .build();

                hotelRepository.save(hotel);

                // When
                boolean exists = hotelRepository.existsByHotelCode("HTL008");
                boolean notExists = hotelRepository.existsByHotelCode("HTL999");

                // Then
                assertThat(exists).isTrue();
                assertThat(notExists).isFalse();
        }

        @Test
        @DisplayName("Should find only active hotels by city")
        void shouldFindOnlyActiveHotelsByCity() {
                // Given
                Hotel activeHotel = Hotel.builder()
                                .hotelCode("HTL009")
                                .name("Active Hotel")
                                .city("Kathmandu")
                                .latitude(27.7172)
                                .longitude(85.3240)
                                .active(true)
                                .build();

                Hotel inactiveHotel = Hotel.builder()
                                .hotelCode("HTL010")
                                .name("Inactive Hotel")
                                .city("Kathmandu")
                                .latitude(27.7172)
                                .longitude(85.3240)
                                .active(false)
                                .build();

                hotelRepository.saveAll(List.of(activeHotel, inactiveHotel));

                // When
                List<Hotel> activeHotels = hotelRepository.findByCityIgnoreCaseAndActiveTrue("Kathmandu");

                // Then
                assertThat(activeHotels).hasSize(1);
                assertThat(activeHotels.get(0).getName()).isEqualTo("Active Hotel");
                assertThat(activeHotels.get(0).getActive()).isTrue();
        }
}
