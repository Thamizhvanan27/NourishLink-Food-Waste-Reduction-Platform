package com.foodwaste.service;

import com.foodwaste.dto.NgoResponse;
import com.foodwaste.dto.UserResponse;
import com.foodwaste.entity.Ngo;
import com.foodwaste.entity.Role;
import com.foodwaste.entity.User;
import com.foodwaste.exception.BadRequestException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.DonationRequestRepository;
import com.foodwaste.repository.NgoRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private NgoRepository ngoRepository;

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private DonationRequestRepository requestRepository;

    @Mock
    private EntityMapper mapper;

    @Mock
    private NotificationService notificationService;

    @Mock
    private com.foodwaste.email.EmailService emailService;

    @InjectMocks
    private AdminServiceImpl adminService;

    private User sampleUser;
    private Ngo sampleNgo;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder().id(10L).fullName("Test User").role(Role.ROLE_DONOR).blocked(false).build();
        sampleNgo = Ngo.builder().id(20L).ngoName("Charity Aid").approved(false).build();
    }

    @Test
    void testApproveNgo() {
        when(ngoRepository.findById(20L)).thenReturn(Optional.of(sampleNgo));
        when(ngoRepository.save(any(Ngo.class))).thenReturn(sampleNgo);
        when(mapper.toNgoResponse(any(Ngo.class))).thenReturn(
                NgoResponse.builder().id(20L).approved(true).build()
        );

        NgoResponse response = adminService.approveNgo(20L);

        assertNotNull(response);
        assertTrue(response.getApproved());
        assertTrue(sampleNgo.getApproved());
        verify(ngoRepository, times(1)).save(sampleNgo);
    }

    @Test
    void testRejectNgo() {
        sampleNgo.setApproved(true);
        when(ngoRepository.findById(20L)).thenReturn(Optional.of(sampleNgo));
        when(ngoRepository.save(any(Ngo.class))).thenReturn(sampleNgo);
        when(mapper.toNgoResponse(any(Ngo.class))).thenReturn(
                NgoResponse.builder().id(20L).approved(false).build()
        );

        NgoResponse response = adminService.rejectNgo(20L);

        assertNotNull(response);
        assertFalse(response.getApproved());
        assertFalse(sampleNgo.getApproved());
        verify(ngoRepository, times(1)).save(sampleNgo);
    }

    @Test
    void testBlockUser() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(mapper.toUserResponse(any(User.class))).thenReturn(
                UserResponse.builder().id(10L).blocked(true).build()
        );

        UserResponse response = adminService.blockUser(10L);

        assertNotNull(response);
        assertTrue(response.getBlocked());
        assertTrue(sampleUser.getBlocked());
    }

    @Test
    void testAdminCannotBeBlocked() {
        sampleUser.setRole(Role.ROLE_ADMIN);
        when(userRepository.findById(10L)).thenReturn(Optional.of(sampleUser));

        assertThrows(BadRequestException.class, () -> adminService.blockUser(10L));
    }
}
