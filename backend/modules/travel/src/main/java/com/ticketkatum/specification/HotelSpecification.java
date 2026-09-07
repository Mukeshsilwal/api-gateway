package com.ticketkatum.specification;

import com.ticketkatum.entity.Hotel;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

public class HotelSpecification {

    public static Specification<Hotel> hasCity(String city) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(city)) {
                return null;
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("city")),
                    "%" + city.trim().toLowerCase() + "%");
        };
    }

    public static Specification<Hotel> hasMinStars(Integer minStars) {
        return (root, query, criteriaBuilder) -> {
            if (minStars == null) {
                return null;
            }
            return criteriaBuilder.or(
                    criteriaBuilder.greaterThanOrEqualTo(root.get("stars"), minStars),
                    criteriaBuilder.greaterThanOrEqualTo(root.get("starRating"), minStars));
        };
    }

    public static Specification<Hotel> hasMaxPrice(BigDecimal maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (maxPrice == null) {
                return null;
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("minPrice"), maxPrice);
        };
    }

    public static Specification<Hotel> isActive() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.isTrue(root.get("active")),
                criteriaBuilder.isNull(root.get("active"))
        );
    }
}
