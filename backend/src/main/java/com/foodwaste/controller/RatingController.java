package com.foodwaste.controller;

import com.foodwaste.dto.ApiResponse;
import com.foodwaste.dto.PagedResponse;
import com.foodwaste.dto.RatingCreateDTO;
import com.foodwaste.dto.RatingResponse;
import com.foodwaste.rating.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@Tag(name = "Ratings & Feedback", description = "Endpoints for rating donor and NGO experiences after donation completion")
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    @Operation(summary = "Submit a rating for a completed food donation")
    public ResponseEntity<ApiResponse<RatingResponse>> submitRating(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RatingCreateDTO createDTO) {
        RatingResponse response = ratingService.submitRating(userDetails.getUsername(), createDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rating submitted successfully", response));
    }

    @GetMapping("/donation/{donationId}")
    @Operation(summary = "Get all ratings for a completed donation")
    public ResponseEntity<ApiResponse<List<RatingResponse>>> getRatingsForDonation(@PathVariable Long donationId) {
        List<RatingResponse> responses = ratingService.getRatingsForDonation(donationId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get public ratings received by a specific user")
    public ResponseEntity<ApiResponse<PagedResponse<RatingResponse>>> getRatingsForUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        PagedResponse<RatingResponse> responses = ratingService.getRatingsForUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/user/{userId}/summary")
    @Operation(summary = "Get average rating and review count for a user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserRatingSummary(@PathVariable Long userId) {
        Map<String, Object> summary = ratingService.getUserRatingSummary(userId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/my")
    @Operation(summary = "Get ratings submitted by the logged-in user")
    public ResponseEntity<ApiResponse<PagedResponse<RatingResponse>>> getMySubmittedRatings(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        PagedResponse<RatingResponse> responses = ratingService.getMySubmittedRatings(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
