package com.ticketkatum.market.repository;

import com.ticketkatum.market.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByEventId(UUID eventId);
}
