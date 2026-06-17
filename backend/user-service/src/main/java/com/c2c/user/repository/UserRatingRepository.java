package com.c2c.user.repository;

import com.c2c.user.model.UserRating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface UserRatingRepository extends JpaRepository<UserRating, Long> {
    List<UserRating> findByReviewedId(UUID reviewedId);
}
