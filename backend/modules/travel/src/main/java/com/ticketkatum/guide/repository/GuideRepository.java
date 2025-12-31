package com.ticketkatum.guide.repository;

import com.ticketkatum.guide.entity.Guide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuideRepository extends JpaRepository<Guide, Long> {

    Optional<Guide> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
