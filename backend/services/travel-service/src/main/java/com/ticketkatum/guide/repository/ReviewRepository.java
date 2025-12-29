package com.ticketkatum.guide.repository;

import com.ticketkatum.guide.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByGuide_GuideIdOrderByCreatedAtDesc(Long guideId);
    
    // For calculating average rating
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.guide.guideId = :guideId")
    Double getAverageRatingForGuide(Long guideId);
}
