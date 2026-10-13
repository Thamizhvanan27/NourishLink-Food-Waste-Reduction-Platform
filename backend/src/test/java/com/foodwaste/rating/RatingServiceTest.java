package com.foodwaste.rating;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private DonationRequestRepository donationRequestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EntityMapper mapper;

    @InjectMocks
    private RatingServiceImpl ratingService;

    private User donor;
    private User ngoUser;
    private Donation donation;

    @BeforeEach
    void setUp() {
        donor = User.builder().id(1L).email("donor@test.com").fullName("Donor").role(Role.ROLE_DONOR).build();
        ngoUser = User.builder().id(2L).email("ngo@test.com").fullName("NGO Rep").role(Role.ROLE_NGO).build();

        donation = Donation.builder()
                .id(100L)
                .foodName("Surplus Bread")
                .donor(donor)
                .status(DonationStatus.COMPLETED)
                .build();
    }

    @Test
    void testSubmitRatingSuccess() {
        RatingCreateDTO dto = RatingCreateDTO.builder()
                .donationId(100L)
                .rating(5)
                .feedback("Excellent experience, food was neatly packaged.")
                .build();

        when(userRepository.findByEmail("donor@test.com")).thenReturn(Optional.of(donor));
        when(donationRepository.findById(100L)).thenReturn(Optional.of(donation));
        when(ratingRepository.existsByDonationAndReviewer(donation, donor)).thenReturn(false);

        Ngo ngo = Ngo.builder().id(5L).user(ngoUser).build();
        DonationRequest request = DonationRequest.builder()
                .id(10L)
                .donation(donation)
                .ngo(ngo)
                .status(RequestStatus.COMPLETED)
                .build();

        when(donationRequestRepository.findFirstByDonationAndStatus(donation, RequestStatus.COMPLETED))
                .thenReturn(Optional.of(request));

        Rating savedRating = Rating.builder()
                .id(1L)
                .donation(donation)
                .reviewer(donor)
                .reviewedUser(ngoUser)
                .rating(5)
                .feedback(dto.getFeedback())
                .build();

        when(ratingRepository.save(any(Rating.class))).thenReturn(savedRating);
        when(mapper.toRatingResponse(savedRating)).thenReturn(RatingResponse.builder().id(1L).rating(5).build());

        RatingResponse response = ratingService.submitRating("donor@test.com", dto);
        assertNotNull(response);
        assertEquals(5, response.getRating());
        verify(ratingRepository, times(1)).save(any(Rating.class));
    }

    @Test
    void testSubmitRatingNotCompletedThrowsBadRequest() {
        donation.setStatus(DonationStatus.AVAILABLE);

        RatingCreateDTO dto = RatingCreateDTO.builder()
                .donationId(100L)
                .rating(5)
                .build();

        when(userRepository.findByEmail("donor@test.com")).thenReturn(Optional.of(donor));
        when(donationRepository.findById(100L)).thenReturn(Optional.of(donation));

        assertThrows(BadRequestException.class, () -> ratingService.submitRating("donor@test.com", dto));
        verify(ratingRepository, never()).save(any(Rating.class));
    }

    @Test
    void testSubmitRatingInvalidScoreThrowsBadRequest() {
        RatingCreateDTO dto = RatingCreateDTO.builder()
                .donationId(100L)
                .rating(6) // Greater than 5
                .build();

        when(userRepository.findByEmail("donor@test.com")).thenReturn(Optional.of(donor));
        when(donationRepository.findById(100L)).thenReturn(Optional.of(donation));

        assertThrows(BadRequestException.class, () -> ratingService.submitRating("donor@test.com", dto));
    }

    @Test
    void testSubmitDuplicateRatingThrowsBadRequest() {
        RatingCreateDTO dto = RatingCreateDTO.builder()
                .donationId(100L)
                .rating(4)
                .build();

        when(userRepository.findByEmail("donor@test.com")).thenReturn(Optional.of(donor));
        when(donationRepository.findById(100L)).thenReturn(Optional.of(donation));
        when(ratingRepository.existsByDonationAndReviewer(donation, donor)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> ratingService.submitRating("donor@test.com", dto));
    }
}
