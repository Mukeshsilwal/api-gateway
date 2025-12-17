package com.ticketkatum.repository;

import com.ticketkatum.entity.RentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RentTypeRepository extends JpaRepository<RentType, Long> {
    Optional<RentType> findByCode(String code);
    List<RentType> findByIsActiveTrue();
}
