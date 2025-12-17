package com.ticketkatum.repository;

import com.ticketkatum.entity.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    Optional<MealPlan> findByCode(String code);
    List<MealPlan> findByIsActiveTrue();
}
