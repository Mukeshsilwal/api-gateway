# Entity-DTO Mismatch Analysis

## Overview

This document identifies mismatches between Entity classes and their corresponding DTOs across all services, which can cause errors during creation/update operations.

## Critical Mismatches Found

### 1. Room Entity vs CreateRoomRequest DTO

#### Entity: `Room.java`
```java
- basePrice: BigDecimal
- maxPrice: BigDecimal
- amenities: Set<String>
- hotel: Hotel (ManyToOne relationship)
- active: boolean (primitive)
```

#### DTO: `CreateRoomRequest.java`
```java
- pricePerNight: BigDecimal  ❌ Maps to basePrice
- NO maxPrice field          ❌ Missing
- NO amenities field         ❌ Missing (but used in service!)
- NO hotel field             ❌ Passed separately as hotelCode
- active: Boolean (wrapper)  ⚠️ Type mismatch
```

#### How Service Handles It (`RoomServiceImpl.java` line 44-55)
```java
Room room = Room.builder()
    .roomNumber(req.getRoomNumber())
    .roomType(req.getRoomType())
    .description(req.getDescription())
    .capacity(req.getCapacity())
    .basePrice(req.getPricePerNight())  // ✅ Maps pricePerNight → basePrice
    .amenities(req.getAmenities())      // ❌ WILL FAIL - amenities not in DTO!
    .active(req.isActive())
    .hotel(hotel)                        // ✅ Fetched separately
    .build();
```

**Problem**: Line 50 calls `req.getAmenities()` but `CreateRoomRequest` doesn't have an `amenities` field!

---

### 2. Hotel Entity vs CreateHotelRequest DTO

#### Entity: `Hotel.java`
```java
- hotelCode: String (required, unique)
- latitude: Double (primitive)
- longitude: Double (primitive)
- images: Set<String>
- rooms: List<Room>
- pricePerNight: NOT IN ENTITY ❌
```

#### DTO: `CreateHotelRequest.java`
```java
- hotelCode: String ✅
- latitude: BigDecimal ⚠️ Type mismatch (entity uses Double)
- longitude: BigDecimal ⚠️ Type mismatch (entity uses Double)
- pricePerNight: BigDecimal ❌ Entity doesn't have this field!
- NO images field ❌
- NO rooms field ✅ (correct - managed separately)
```

#### How Service Handles It (`HotelServiceImpl.java` line 53-74)
```java
Hotel hotel = Hotel.builder()
    .hotelCode(request.getHotelCode())
    .latitude(request.getLatitude())      // ⚠️ BigDecimal → Double conversion
    .longitude(request.getLongitude())    // ⚠️ BigDecimal → Double conversion
    .images(request.getImages())          // ❌ WILL FAIL - images not in DTO!
    // pricePerNight is NOT set (doesn't exist in entity)
    .build();
```

**Problem**: Line 70 calls `request.getImages()` but `CreateHotelRequest` doesn't have an `images` field!

---

### 3. Bus Entity vs BusDto

#### Entity: `Bus.java`
```java
- id: Long
- busType: BusType (enum)
- basePrice: BigDecimal
- maxPrice: BigDecimal
- route: Route (ManyToOne)
- seats: List<Seat>
```

#### DTO: `BusDto.java`
```java
- id: int ⚠️ Type mismatch (should be Long)
- busType: String ⚠️ Type mismatch (should be BusType enum)
- basePrice: BigDecimal ✅
- maxPrice: BigDecimal ✅
- routeDto: RouteDto ✅
- seats: List<SeatDto> ✅
- date: LocalDate ❌ Not in entity
```

---

## Required Fixes

### Fix 1: Update CreateRoomRequest.java

Add missing fields:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {
    
    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotBlank(message = "Room type is required")
    private String roomType;

    // RENAMED: pricePerNight → basePrice to match entity
    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal basePrice;

    // ADDED: maxPrice field
    @DecimalMin(value = "0.01", message = "Max price must be greater than 0")
    private BigDecimal maxPrice;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String description;

    @NotNull(message = "Active status is required")
    private Boolean active;

    // ADDED: amenities field (matches entity's Set<String>)
    @Size(max = 20, message = "Maximum 20 amenities allowed")
    private Set<@NotBlank String> amenities;

    // REMOVED: imageUrl (not used in entity)
}
```

### Fix 2: Update CreateHotelRequest.java

Add missing fields and fix types:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHotelRequest {
    
    @NotBlank(message = "Hotel code is required")
    @ValidHotelCode
    private String hotelCode;

    @NotBlank(message = "Hotel name is required")
    private String name;

    // ... other fields ...

    // CHANGED: BigDecimal → Double to match entity
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private Double latitude;

    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private Double longitude;

    // ADDED: images field (matches entity's Set<String>)
    @Size(max = 10, message = "Maximum 10 images allowed")
    private Set<@Pattern(regexp = "^https?://.*") String> images;

    // REMOVED: pricePerNight (not in entity - use minPrice/maxPrice instead)
    
    // ADDED: minPrice and maxPrice (match entity)
    @DecimalMin(value = "0.01")
    private BigDecimal minPrice;

    @DecimalMin(value = "0.01")
    private BigDecimal maxPrice;
}
```

### Fix 3: Update BusDto.java

Fix type mismatches:

```java
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BusDto {
    private Long id;  // CHANGED: int → Long
    private String busName;
    private BusType busType;  // CHANGED: String → BusType enum
    private LocalDateTime departureDateTime;
    private BigDecimal basePrice;
    private BigDecimal maxPrice;
    private List<SeatDto> seats;
    private RouteDto routeDto;
    // REMOVED: date field (not in entity)
}
```

---

## Summary of Issues

| Entity | DTO | Issue | Severity |
|--------|-----|-------|----------|
| Room | CreateRoomRequest | Missing `amenities` field | 🔴 Critical |
| Room | CreateRoomRequest | `pricePerNight` vs `basePrice` | 🟡 Medium |
| Room | CreateRoomRequest | Missing `maxPrice` | 🟡 Medium |
| Hotel | CreateHotelRequest | Missing `images` field | 🔴 Critical |
| Hotel | CreateHotelRequest | `BigDecimal` vs `Double` for lat/lng | 🟡 Medium |
| Hotel | CreateHotelRequest | Has `pricePerNight` (not in entity) | 🟡 Medium |
| Bus | BusDto | `int` vs `Long` for id | 🟡 Medium |
| Bus | BusDto | `String` vs `BusType` enum | 🟡 Medium |

---

## Testing Impact

All tests created must account for these mismatches. Tests should:

1. ✅ Use actual field names from entities
2. ✅ Use correct data types
3. ✅ Include all required fields
4. ✅ Mock mapper conversions properly

**Example**: When testing `RoomServiceImpl.addRoom()`, the `CreateRoomRequest` must include `amenities` or the service will throw `NullPointerException`.
