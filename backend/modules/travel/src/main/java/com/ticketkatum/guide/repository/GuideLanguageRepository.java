package com.ticketkatum.guide.repository;

import com.ticketkatum.guide.entity.GuideLanguage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuideLanguageRepository extends JpaRepository<GuideLanguage, Long> {
    Optional<GuideLanguage> findByLanguage(String language);
}
