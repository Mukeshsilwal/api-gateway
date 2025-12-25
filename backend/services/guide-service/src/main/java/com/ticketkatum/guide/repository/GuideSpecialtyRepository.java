package com.ticketkatum.guide.repository;

import com.ticketkatum.guide.entity.GuideSpecialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuideSpecialtyRepository extends JpaRepository<GuideSpecialty, Long> {
    Optional<GuideSpecialty> findBySpecialty(String spacialty);
}
