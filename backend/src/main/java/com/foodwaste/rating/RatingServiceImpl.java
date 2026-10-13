package com.foodwaste.rating;

import com.foodwaste.dto.PagedResponse;
import com.foodwaste.dto.RatingCreateDTO;
import com.foodwaste.dto.RatingResponse;
import com.foodwaste.entity.*;
import com.foodwaste.exception.BadRequestException;
import com.foodwaste.exception.ForbiddenException;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.DonationRequestRepository;
import com.foodwaste.repository.RatingRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final DonationRepository donationRepository;
    private final DonationRequestRepository donationRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EntityMapper mapper;

    @Override
    @Transactional
    public RatingResponse submitRating(String reviewerEmail, RatingCreateDTO createDTO) {
        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (Boolean.TRUE.equals(reviewer.getBlocked())) {
            throw new ForbiddenException("Blocked users cannot submit ratings");
        }

        Donation donation = donationRepository.findById(createDTO.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + createDTO.getDonationId()));

        if (donation.getStatus() != DonationStatus.COMPLETED) {
            throw new BadRequestException("Ratings are allowed only after the donation has been marked COMPLETED");
        }

        if (createDTO.getRating() == null || createDTO.getRating() < 1 || createDTO.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars");
        }

        if (ratingRepository.existsByDonationAndReviewer(donation, reviewer)) {
            throw new BadRequestException("You have already submitted a rating for this completed donation");
        }

        // Find completed request to identify the NGO
        DonationRequest completedRequest = donationRequestRepository
                .findFirstByDonationAndStatus(donation, RequestStatus.COMPLETED)
                .orElse(null);

        User reviewedUser = null;
        boolean isDonor = donation.getDonor().getId().equals(reviewer.getId());

        if (isDonor) {
            if (completedRequest != null && completedRequest.getNgo() != null) {
                reviewedUser = completedRequest.getNgo().getUser();
            } else {
                throw new BadRequestException("No verified NGO record found for this completed donation");
            }
        } else if (completedRequest != null && completedRequest.getNgo().getUser().getId().equals(reviewer.getId())) {
            reviewedUser = donation.getDonor();
        } else {
            throw new ForbiddenException("Only the donor or receiving NGO involved in this donation can submit ratings");
        }

        Rating rating = Rating.builder()
                .donation(donation)
                .reviewer(reviewer)
                .reviewedUser(reviewedUser)
                .rating(createDTO.getRating())
                .feedback(createDTO.getFeedback() != null ? createDTO.getFeedback().trim() : null)
                .build();

        Rating saved = ratingRepository.save(rating);

        // Notify reviewed user
        notificationService.createAndSendNotification(
                reviewedUser,
                "New Rating Received (" + rating.getRating() + "★)",
                reviewer.getFullName() + " submitted a " + rating.getRating() + "-star rating for '" + donation.getFoodName() + "'.",
                NotificationType.SYSTEM,
                donation.getId()
        );

        return mapper.toRatingResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RatingResponse> getRatingsForDonation(Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));
        return ratingRepository.findByDonation(donation).stream()
                .map(mapper::toRatingResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<RatingResponse> getRatingsForUser(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Page<Rating> page = ratingRepository.findByReviewedUser(user, pageable);
        List<RatingResponse> dtoList = page.getContent().stream()
                .map(mapper::toRatingResponse)
                .collect(Collectors.toList());
        return PagedResponse.of(page, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<RatingResponse> getMySubmittedRatings(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Page<Rating> page = ratingRepository.findByReviewer(user, pageable);
        List<RatingResponse> dtoList = page.getContent().stream()
                .map(mapper::toRatingResponse)
                .collect(Collectors.toList());
        return PagedResponse.of(page, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserRatingSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Double avg = ratingRepository.findAverageRatingByReviewedUser(user);
        long count = ratingRepository.countByReviewedUser(user);

        return Map.of(
                "userId", userId,
                "averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
                "totalReviews", count
        );
    }
}
