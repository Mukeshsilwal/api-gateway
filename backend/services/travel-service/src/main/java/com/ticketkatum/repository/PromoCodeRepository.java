package com.ticketkatum.repository;

import com.ticketkatum.entity.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {

    Optional<PromoCode> findByCodeAndEventId(String code, Long eventId);

    List<PromoCode> findByEventId(Long eventId);

    Optional<PromoCode> findByCode(String code);

    boolean existsByCode(String code);
}
