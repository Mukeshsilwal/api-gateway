package com.ticketkatum.specification;

import com.ticketkatum.entity.Room;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Specification class for dynamic Room filtering using JPA Criteria API
 */
public class RoomSpecification {

    /**
     * Build dynamic specification based on filter criteria
     */
    public static Specification<Room> withFilters(
            Long hotelId,
            String roomType,
            Integer minCapacity,
            Integer maxCapacity,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean active) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by hotel ID
            if (hotelId != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("hotel").get("id"), hotelId));
            }

            // Filter by room type (case-insensitive)
            if (roomType != null && !roomType.isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("roomType")),
                        roomType.toLowerCase()));
            }

            // Filter by minimum capacity
            if (minCapacity != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("capacity"), minCapacity));
            }

            // Filter by maximum capacity
            if (maxCapacity != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("capacity"), maxCapacity));
            }

            // Filter by minimum price
            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("basePrice"), minPrice));
            }

            // Filter by maximum price
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("basePrice"), maxPrice));
            }

            // Filter by active status (default to true if not specified)
            if (active != null) {
                predicates.add(criteriaBuilder.equal(root.get("active"), active));
            } else {
                // By default, only show active rooms
                predicates.add(criteriaBuilder.equal(root.get("active"), true));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Filter by hotel ID
     */
    public static Specification<Room> belongsToHotel(Long hotelId) {
        return (root, query, criteriaBuilder) -> {
            if (hotelId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("hotel").get("id"), hotelId);
        };
    }

    /**
     * Filter by room type
     */
    public static Specification<Room> hasRoomType(String roomType) {
        return (root, query, criteriaBuilder) -> {
            if (roomType == null || roomType.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("roomType")),
                    roomType.toLowerCase());
        };
    }

    /**
     * Filter by capacity range
     */
    public static Specification<Room> hasCapacityBetween(Integer minCapacity, Integer maxCapacity) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (minCapacity != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("capacity"), minCapacity));
            }

            if (maxCapacity != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("capacity"), maxCapacity));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Filter by price range
     */
    public static Specification<Room> hasPriceBetween(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("basePrice"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("basePrice"), maxPrice));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Filter by active status
     */
    public static Specification<Room> isActive() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("active"), true);
    }
}
