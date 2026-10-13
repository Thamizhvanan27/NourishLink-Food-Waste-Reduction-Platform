package com.foodwaste.rating;

import com.foodwaste.dto.PagedResponse;
import com.foodwaste.dto.RatingCreateDTO;
import com.foodwaste.dto.RatingResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface RatingService {
    RatingResponse submitRating(String reviewerEmail, RatingCreateDTO createDTO);
    List<RatingResponse> getRatingsForDonation(Long donationId);
    PagedResponse<RatingResponse> getRatingsForUser(Long userId, Pageable pageable);
    PagedResponse<RatingResponse> getMySubmittedRatings(String userEmail, Pageable pageable);
    Map<String, Object> getUserRatingSummary(Long userId);
}
