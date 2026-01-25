package com.ticketkatum.market.repository;

import com.ticketkatum.market.domain.Bundle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Repository
public interface BundleRepository extends JpaRepository<Bundle, UUID> {
    List<Bundle> findByActiveTrue();
}
