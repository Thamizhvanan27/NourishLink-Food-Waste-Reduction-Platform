package com.foodwaste.service;

import com.foodwaste.dto.DonationRequestCreateDTO;
import com.foodwaste.dto.DonationRequestResponse;
import com.foodwaste.entity.*;
import com.foodwaste.exception.BadRequestException;
import com.foodwaste.exception.ForbiddenException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.DonationRequestRepository;
import com.foodwaste.repository.NgoRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.service.impl.DonationRequestServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DonationRequestServiceTest {

    @Mock
    private DonationRequestRepository requestRepository;

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private NgoRepository ngoRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EntityMapper mapper;

    @Mock
    private NotificationService notificationService;

    @Mock
    private com.foodwaste.email.EmailService emailService;

    @Mock
    private com.foodwaste.volunteer.VolunteerService volunteerService;

    @InjectMocks
    private DonationRequestServiceImpl requestService;

    private User donorUser;
    private User ngoUser;
    private Ngo ngo;
    private Donation donation;
    private DonationRequest request;

    @BeforeEach
    void setUp() {
        donorUser = User.builder().id(1L).email("donor@test.com").fullName("Donor").role(Role.ROLE_DONOR).build();
        ngoUser = User.builder().id(2L).email("ngo@test.com").fullName("NGO Rep").role(Role.ROLE_NGO).build();
        ngo = Ngo.builder().id(5L).user(ngoUser).ngoName("Hope NGO").approved(true).build();

        donation = Donation.builder()
                .id(100L)
                .foodName("Hot Meals")
                .donor(donorUser)
                .status(DonationStatus.AVAILABLE)
                .expiryDate(LocalDateTime.now().plusDays(1))
                .build();

        request = DonationRequest.builder()
                .id(50L)
                .donation(donation)
                .ngo(ngo)
                .status(RequestStatus.PENDING)
                .build();
    }

    @Test
    void testCreateRequestSuccess() {
        DonationRequestCreateDTO dto = new DonationRequestCreateDTO(100L, "We can distribute this");

        when(userRepository.findByEmail("ngo@test.com")).thenReturn(Optional.of(ngoUser));
        when(ngoRepository.findByUser(ngoUser)).thenReturn(Optional.of(ngo));
        when(donationRepository.findById(100L)).thenReturn(Optional.of(donation));
        when(requestRepository.existsByDonationAndNgo(donation, ngo)).thenReturn(false);
        when(requestRepository.save(any(DonationRequest.class))).thenReturn(request);
        when(mapper.toDonationRequestResponse(any(DonationRequest.class))).thenReturn(
                DonationRequestResponse.builder().id(50L).status(RequestStatus.PENDING).build()
        );

        DonationRequestResponse response = requestService.createRequest("ngo@test.com", dto);

        assertNotNull(response);
        assertEquals(RequestStatus.PENDING, response.getStatus());
        verify(requestRepository, times(1)).save(any(DonationRequest.class));
    }

    @Test
    void testUnapprovedNgoCannotRequest() {
        ngo.setApproved(false);
        DonationRequestCreateDTO dto = new DonationRequestCreateDTO(100L, "Message");

        when(userRepository.findByEmail("ngo@test.com")).thenReturn(Optional.of(ngoUser));
        when(ngoRepository.findByUser(ngoUser)).thenReturn(Optional.of(ngo));

        assertThrows(ForbiddenException.class, () -> requestService.createRequest("ngo@test.com", dto));
    }

    @Test
    void testAcceptRequestWorkflow() {
        when(requestRepository.findById(50L)).thenReturn(Optional.of(request));
        when(requestRepository.save(any(DonationRequest.class))).thenReturn(request);
        when(requestRepository.findByDonationAndStatus(donation, RequestStatus.PENDING)).thenReturn(Collections.emptyList());
        when(mapper.toDonationRequestResponse(any(DonationRequest.class))).thenReturn(
                DonationRequestResponse.builder().id(50L).status(RequestStatus.ACCEPTED).build()
        );

        DonationRequestResponse response = requestService.acceptRequest("donor@test.com", 50L);

        assertNotNull(response);
        assertEquals(RequestStatus.ACCEPTED, request.getStatus());
        assertEquals(DonationStatus.ACCEPTED, donation.getStatus());
        verify(donationRepository, times(1)).save(donation);
    }

    @Test
    void testPickupWorkflow() {
        request.setStatus(RequestStatus.ACCEPTED);
        donation.setStatus(DonationStatus.ACCEPTED);

        when(requestRepository.findById(50L)).thenReturn(Optional.of(request));
        when(requestRepository.save(any(DonationRequest.class))).thenReturn(request);
        when(mapper.toDonationRequestResponse(any(DonationRequest.class))).thenReturn(
                DonationRequestResponse.builder().id(50L).status(RequestStatus.PICKED_UP).build()
        );

        DonationRequestResponse response = requestService.pickupRequest("ngo@test.com", 50L);

        assertNotNull(response);
        assertEquals(RequestStatus.PICKED_UP, request.getStatus());
        assertEquals(DonationStatus.PICKED_UP, donation.getStatus());
    }

    @Test
    void testCompleteWorkflow() {
        request.setStatus(RequestStatus.PICKED_UP);
        donation.setStatus(DonationStatus.PICKED_UP);

        when(requestRepository.findById(50L)).thenReturn(Optional.of(request));
        when(requestRepository.save(any(DonationRequest.class))).thenReturn(request);
        when(mapper.toDonationRequestResponse(any(DonationRequest.class))).thenReturn(
                DonationRequestResponse.builder().id(50L).status(RequestStatus.COMPLETED).build()
        );

        DonationRequestResponse response = requestService.completeRequest("ngo@test.com", 50L);

        assertNotNull(response);
        assertEquals(RequestStatus.COMPLETED, request.getStatus());
        assertEquals(DonationStatus.COMPLETED, donation.getStatus());
    }
}
