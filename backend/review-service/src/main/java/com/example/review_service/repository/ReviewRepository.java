package com.example.review_service.repository;

import com.example.review_service.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByReviewedUserIdOrderByCreatedAtDesc(Long reviewedUserId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewedUserId = :reviewedUserId")
    Double getAverageRatingByUserId(Long reviewedUserId);
}
