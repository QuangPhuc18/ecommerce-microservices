package com.example.review_service.controller;

import com.example.review_service.entity.Review;
import com.example.review_service.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewRepository.findByReviewedUserIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/user/{userId}/rating")
    public ResponseEntity<Map<String, Object>> getUserAverageRating(@PathVariable Long userId) {
        Double avgRating = reviewRepository.getAverageRatingByUserId(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<Review> replyToReview(@PathVariable Long reviewId, @RequestBody Map<String, String> payload) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setSellerReply(payload.get("reply"));
        review.setRepliedAt(java.time.LocalDateTime.now());
        return ResponseEntity.ok(reviewRepository.save(review));
    }
}
