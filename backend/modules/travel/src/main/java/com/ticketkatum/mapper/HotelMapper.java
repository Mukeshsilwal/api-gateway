package com.ticketkatum.mapper;

import com.ticketkatum.entity.Hotel;
import com.ticketkatum.entity.Room;
import com.ticketkatum.model.HotelDTO;
import com.ticketkatum.model.RoomDTO;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class HotelMapper {

    /**
     * Convert Hotel entity to DTO with safe lazy loading handling
     */
    public HotelDTO toDTO(Hotel hotel) {
        if (hotel == null) {
            return null;
        }

        HotelDTO.HotelDTOBuilder builder = HotelDTO.builder()
                .id(hotel.getId())
                .hotelCode(hotel.getHotelCode())
                .name(hotel.getName())
                .description(hotel.getDescription())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .country(hotel.getCountry())
                .phone(hotel.getPhone())
                .email(hotel.getEmail())
                .stars(hotel.getStars())
                .rating(hotel.getRating());
        // SAFE: Only access images if initialized
        if (Hibernate.isInitialized(hotel.getImages())) {
            builder.images(new HashSet<>(hotel.getImages()));
        } else {
            builder.images(new HashSet<>());
        }

        // SAFE: Only access rooms if initialized
        if (Hibernate.isInitialized(hotel.getRooms())) {
            List<RoomDTO> roomDTOs = hotel.getRooms().stream()
                    .map(this::toRoomDTOWithoutHotel)
                    .collect(Collectors.toList());
            builder.rooms(roomDTOs);
        } else {
            builder.rooms(new ArrayList<>());
        }

        return builder.build();
    }

    /**
     * Convert Room entity to DTO with full hotel details
     */
    public RoomDTO toRoomDTO(Room room) {
        if (room == null) {
            return null;
        }

        RoomDTO.RoomDTOBuilder builder = RoomDTO.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .description(room.getDescription())
                .capacity(room.getCapacity())
                .basePrice(room.getBasePrice())
                .maxPrice(room.getMaxPrice())
                .active(room.isActive())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt());

        // SAFE: Only access amenities if initialized
        if (Hibernate.isInitialized(room.getAmenities())) {
            builder.amenities(new HashSet<>(room.getAmenities()));
        } else {
            builder.amenities(new HashSet<>());
        }

        // SAFE: Only access images if initialized
        if (Hibernate.isInitialized(room.getImages())) {
            builder.images(new HashSet<>(room.getImages()));
        } else {
            builder.images(new HashSet<>());
        }

        // SAFE: Only access hotel if initialized
        if (room.getHotel() != null && Hibernate.isInitialized(room.getHotel())) {
            builder.hotelId(room.getHotel().getId());
            builder.hotelCode(room.getHotel().getHotelCode());
            builder.hotelName(room.getHotel().getName());
        }

        return builder.build();
    }

    /**
     * Convert Room to DTO without hotel details (prevents circular reference)
     */
    private RoomDTO toRoomDTOWithoutHotel(Room room) {
        if (room == null) {
            return null;
        }

        RoomDTO.RoomDTOBuilder builder = RoomDTO.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .description(room.getDescription())
                .capacity(room.getCapacity())
                .basePrice(room.getBasePrice())
                .maxPrice(room.getMaxPrice())
                .active(room.isActive())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt());

        // SAFE: Only access amenities if initialized
        if (Hibernate.isInitialized(room.getAmenities())) {
            builder.amenities(new HashSet<>(room.getAmenities()));
        } else {
            builder.amenities(new HashSet<>());
        }

        // SAFE: Only access images if initialized
        if (Hibernate.isInitialized(room.getImages())) {
            builder.images(new HashSet<>(room.getImages()));
        } else {
            builder.images(new HashSet<>());
        }

        return builder.build();
    }

    /**
     * Convert list of hotels to DTOs
     */
    public List<HotelDTO> toDTOList(List<Hotel> hotels) {
        if (hotels == null) {
            return new ArrayList<>();
        }
        return hotels.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert list of rooms to DTOs
     */
    public List<RoomDTO> toRoomDTOList(List<Room> rooms) {
        if (rooms == null) {
            return new ArrayList<>();
        }
        return rooms.stream()
                .map(this::toRoomDTO)
                .collect(Collectors.toList());
    }

    /**
     * Alternative method for converting Hotel with explicit collection handling
     * Use this when you know collections are loaded
     */
    public HotelDTO toHotelDTOWithCollections(Hotel hotel) {
        if (hotel == null) {
            return null;
        }

        return HotelDTO.builder()
                .id(hotel.getId())
                .hotelCode(hotel.getHotelCode())
                .name(hotel.getName())
                .description(hotel.getDescription())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .country(hotel.getCountry())
                .phone(hotel.getPhone())
                .email(hotel.getEmail())
                .stars(hotel.getStars())
                .rating(hotel.getRating())
                .images(new HashSet<>(hotel.getImages()))
                .rooms(hotel.getRooms().stream()
                        .map(this::roomToDTOWithCollections)
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * Alternative method for converting Room with explicit collection handling
     * Use this when you know amenities are loaded
     */
    private RoomDTO roomToDTOWithCollections(Room room) {
        if (room == null) {
            return null;
        }

        return RoomDTO.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .description(room.getDescription())
                .capacity(room.getCapacity())
                .basePrice(room.getBasePrice())
                .maxPrice(room.getMaxPrice())
                .amenities(new HashSet<>(room.getAmenities()))
                .images(new HashSet<>(room.getImages()))
                .active(room.isActive())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }

    /**
     * Utility method to check if all required collections are initialized
     */
    public boolean areCollectionsInitialized(Hotel hotel) {
        return hotel != null &&
                Hibernate.isInitialized(hotel.getImages()) &&
                Hibernate.isInitialized(hotel.getRooms()) &&
                hotel.getRooms().stream()
                        .allMatch(room -> Hibernate.isInitialized(room.getAmenities())
                                && Hibernate.isInitialized(room.getImages()));
    }

    /**
     * Utility method to check if room amenities are initialized
     */
    public boolean isRoomFullyInitialized(Room room) {
        return room != null && Hibernate.isInitialized(room.getAmenities())
                && Hibernate.isInitialized(room.getImages());
    }

    public Hotel convertRowToHotel(Map<String, Object> row) {
        Hotel hotel = new Hotel();
        hotel.setId(((Number) row.get("id")).longValue());
        hotel.setName((String) row.get("name"));
        hotel.setAddress((String) row.get("address"));
        hotel.setLatitude(row.get("latitude") != null ? ((Number) row.get("latitude")).doubleValue() : null);
        hotel.setLongitude(row.get("longitude") != null ? ((Number) row.get("longitude")).doubleValue() : null);
        hotel.setActive(true);

        String imagesConcat = (String) row.get("images");

        Set<String> images = (imagesConcat != null)
                ? new HashSet<>(List.of(imagesConcat.split(",")))
                : new HashSet<>();

        hotel.setImages(images);

        return hotel;
    }

}