package com.ticketkatum.specification;

import com.ticketkatum.entity.Hotel;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Specification class for dynamic Hotel filtering using JPA Criteria API
 */
public class HotelSpecification {

    /**
     * Build dynamic specification based on filter criteria
     */
    public static Specification<Hotel> withFilters(
            String city,
            Integer minStars,
            Integer maxStars,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean featured,
            Boolean active,
            String searchQuery) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by city (case-insensitive)
            if (city != null && !city.isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("city")),
                        city.toLowerCase()));
            }

            // Filter by minimum star rating
            if (minStars != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("starRating"), minStars));
            }

            // Filter by maximum star rating
            if (maxStars != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("starRating"), maxStars));
            }

            // Filter by minimum price
            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("minPrice"), minPrice));
            }

            // Filter by maximum price
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("minPrice"), maxPrice));
            }

            // Filter by featured status
            if (featured != null) {
                predicates.add(criteriaBuilder.equal(root.get("featured"), featured));
            }

            // Filter by active status (default to true if not specified)
            if (active != null) {
                predicates.add(criteriaBuilder.equal(root.get("active"), active));
            } else {
                // By default, only show active hotels
                predicates.add(criteriaBuilder.equal(root.get("active"), true));
            }

            // Search by name or address (case-insensitive)
            if (searchQuery != null && !searchQuery.isEmpty()) {
                String likePattern = "%" + searchQuery.toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")), likePattern);
                Predicate addressPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("address")), likePattern);
                predicates.add(criteriaBuilder.or(namePredicate, addressPredicate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Filter by city only
     */
    public static Specification<Hotel> hasCity(String city) {
        return (root, query, criteriaBuilder) -> {
            if (city == null || city.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("city")),
                    city.toLowerCase());
        };
    }

    /**
     * Filter by star rating range
     */
    public static Specification<Hotel> hasStarRatingBetween(Integer minStars, Integer maxStars) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (minStars != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("starRating"), minStars));
            }

            if (maxStars != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("starRating"), maxStars));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Filter by featured status
     */
    public static Specification<Hotel> isFeatured() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("featured"), true);
    }

    /**
     * Filter by active status
     */
    public static Specification<Hotel> isActive() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("active"), true);
    }

    /**
     * Search by name (contains, case-insensitive)
     */
    public static Specification<Hotel> nameContains(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    "%" + name.toLowerCase() + "%");
        };
    }
}
