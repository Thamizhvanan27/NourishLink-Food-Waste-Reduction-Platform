package com.foodwaste.repository;

import com.foodwaste.entity.Donation;
import com.foodwaste.entity.Rating;
import com.foodwaste.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByDonation(Donation donation);

    Optional<Rating> findByDonationAndReviewer(Donation donation, User reviewer);

    boolean existsByDonationAndReviewer(Donation donation, User reviewer);

    Page<Rating> findByReviewedUser(User reviewedUser, Pageable pageable);

    Page<Rating> findByReviewer(User reviewer, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.reviewedUser = :user")
    Double findAverageRatingByReviewedUser(@Param("user") User user);

    long countByReviewedUser(User reviewedUser);
}
