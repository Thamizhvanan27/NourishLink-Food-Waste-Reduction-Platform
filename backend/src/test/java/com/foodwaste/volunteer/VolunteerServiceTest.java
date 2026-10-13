package com.foodwaste.volunteer;

import com.foodwaste.dto.VolunteerTaskResponse;
import com.foodwaste.entity.*;
import com.foodwaste.exception.BadRequestException;
import com.foodwaste.exception.ForbiddenException;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.*;
import com.foodwaste.service.NotificationService;
import com.foodwaste.email.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VolunteerServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private VolunteerProfileRepository volunteerProfileRepository;

    @Mock
    private VolunteerTaskRepository volunteerTaskRepository;

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private DonationRequestRepository donationRequestRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EntityMapper mapper;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private VolunteerServiceImpl volunteerService;

    private User volunteer;
    private User otherVolunteer;
    private Donation donation;
    private VolunteerTask task;

    @BeforeEach
    void setUp() {
        volunteer = User.builder().id(10L).email("volunteer@test.com").fullName("Volunteer 1").role(Role.ROLE_VOLUNTEER).build();
        otherVolunteer = User.builder().id(20L).email("other@test.com").fullName("Volunteer 2").role(Role.ROLE_VOLUNTEER).build();

        donation = Donation.builder()
                .id(100L)
                .foodName("Surplus Rice")
                .donor(User.builder().id(1L).email("donor@test.com").build())
                .status(DonationStatus.ACCEPTED)
                .build();

        task = VolunteerTask.builder()
                .id(50L)
                .donation(donation)
                .status(VolunteerTaskStatus.AVAILABLE)
                .build();

        lenient().when(mapper.toVolunteerTaskResponse(any(VolunteerTask.class)))
                .thenAnswer(inv -> {
                    VolunteerTask t = inv.getArgument(0);
                    return VolunteerTaskResponse.builder().id(t.getId()).status(t.getStatus()).build();
                });
    }

    @Test
    void testAcceptTaskSuccess() {
        when(userRepository.findByEmail("volunteer@test.com")).thenReturn(Optional.of(volunteer));
        when(volunteerTaskRepository.findById(50L)).thenReturn(Optional.of(task));
        when(volunteerTaskRepository.save(any(VolunteerTask.class))).thenReturn(task);
        when(donationRequestRepository.findByDonation(donation)).thenReturn(Collections.emptyList());

        VolunteerTaskResponse response = volunteerService.acceptTask("volunteer@test.com", 50L);
        assertNotNull(response);
        assertEquals(VolunteerTaskStatus.ACCEPTED, task.getStatus());
        assertEquals(volunteer, task.getVolunteer());
    }

    @Test
    void testAcceptTaskAlreadyTakenThrowsBadRequest() {
        task.setStatus(VolunteerTaskStatus.ACCEPTED);
        task.setVolunteer(otherVolunteer);

        when(userRepository.findByEmail("volunteer@test.com")).thenReturn(Optional.of(volunteer));
        when(volunteerTaskRepository.findById(50L)).thenReturn(Optional.of(task));

        assertThrows(BadRequestException.class, () -> volunteerService.acceptTask("volunteer@test.com", 50L));
    }

    @Test
    void testPickupTaskSuccess() {
        task.setStatus(VolunteerTaskStatus.ACCEPTED);
        task.setVolunteer(volunteer);

        when(userRepository.findByEmail("volunteer@test.com")).thenReturn(Optional.of(volunteer));
        when(volunteerTaskRepository.findById(50L)).thenReturn(Optional.of(task));
        when(volunteerTaskRepository.save(any(VolunteerTask.class))).thenReturn(task);
        when(donationRequestRepository.findByDonation(donation)).thenReturn(Collections.emptyList());

        VolunteerTaskResponse response = volunteerService.markTaskPickedUp("volunteer@test.com", 50L);
        assertNotNull(response);
        assertEquals(VolunteerTaskStatus.PICKED_UP, task.getStatus());
        assertNotNull(task.getPickedUpAt());
    }

    @Test
    void testDeliverTaskSuccess() {
        task.setStatus(VolunteerTaskStatus.PICKED_UP);
        task.setVolunteer(volunteer);

        when(userRepository.findByEmail("volunteer@test.com")).thenReturn(Optional.of(volunteer));
        when(volunteerTaskRepository.findById(50L)).thenReturn(Optional.of(task));
        when(volunteerTaskRepository.save(any(VolunteerTask.class))).thenReturn(task);
        when(donationRequestRepository.findByDonation(donation)).thenReturn(Collections.emptyList());

        VolunteerTaskResponse response = volunteerService.markTaskDelivered("volunteer@test.com", 50L);
        assertNotNull(response);
        assertEquals(VolunteerTaskStatus.DELIVERED, task.getStatus());
        assertNotNull(task.getDeliveredAt());
    }

    @Test
    void testPickupFoodByUnauthorizedVolunteerThrowsForbidden() {
        task.setStatus(VolunteerTaskStatus.ACCEPTED);
        task.setVolunteer(otherVolunteer); // Assigned to other volunteer

        when(userRepository.findByEmail("volunteer@test.com")).thenReturn(Optional.of(volunteer));
        when(volunteerTaskRepository.findById(50L)).thenReturn(Optional.of(task));

        assertThrows(ForbiddenException.class, () -> volunteerService.markTaskPickedUp("volunteer@test.com", 50L));
    }
}
