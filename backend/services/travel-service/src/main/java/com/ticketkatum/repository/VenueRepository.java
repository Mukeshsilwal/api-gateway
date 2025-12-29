package com.ticketkatum.repository;

import com.ticketkatum.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Venue Repository
 */
@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
}
