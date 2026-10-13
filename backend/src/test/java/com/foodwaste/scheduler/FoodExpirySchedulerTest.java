package com.foodwaste.scheduler;

import com.foodwaste.email.EmailService;
import com.foodwaste.entity.*;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.DonationRequestRepository;
import com.foodwaste.service.NotificationService;
import com.foodwaste.service.SystemSettingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FoodExpirySchedulerTest {

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private DonationRequestRepository donationRequestRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private SystemSettingService systemSettingService;

    @InjectMocks
    private FoodExpiryScheduler scheduler;

    private User donor;
    private Donation expiredDonation;

    @BeforeEach
    void setUp() {
        donor = User.builder().id(1L).email("donor@test.com").fullName("Test Donor").build();
        expiredDonation = Donation.builder()
                .id(101L)
                .foodName("Fresh Salad")
                .donor(donor)
                .status(DonationStatus.AVAILABLE)
                .expiryDate(LocalDateTime.now().minusHours(1))
                .reminder24hSent(false)
                .reminder2hSent(false)
                .build();
    }

    @Test
    void testProcessFoodExpirationsMarksExpired() {
        when(donationRepository.findByStatusAndExpiryDateBefore(eq(DonationStatus.AVAILABLE), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(expiredDonation));
        when(donationRequestRepository.findByDonationAndStatus(expiredDonation, RequestStatus.PENDING))
                .thenReturn(Collections.emptyList());
        when(systemSettingService.is24hReminderEnabled()).thenReturn(false);
        when(systemSettingService.is2hReminderEnabled()).thenReturn(false);

        scheduler.processFoodExpirationsAndReminders();

        assertEquals(DonationStatus.EXPIRED, expiredDonation.getStatus());
        verify(donationRepository, times(1)).save(expiredDonation);
        verify(notificationService, times(1)).createAndSendNotification(
                eq(donor),
                eq("Food Donation Expired"),
                anyString(),
                eq(NotificationType.EXPIRY),
                eq(101L)
        );
    }

    @Test
    void test24HourReminderPreventsDuplicates() {
        Donation donationSoon = Donation.builder()
                .id(102L)
                .foodName("Rice Bowl")
                .donor(donor)
                .status(DonationStatus.AVAILABLE)
                .expiryDate(LocalDateTime.now().plusHours(20))
                .reminder24hSent(false)
                .build();

        when(donationRepository.findByStatusAndExpiryDateBefore(eq(DonationStatus.AVAILABLE), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(systemSettingService.is24hReminderEnabled()).thenReturn(true);
        when(systemSettingService.is2hReminderEnabled()).thenReturn(false);

        when(donationRepository.findByStatusAndExpiryDateBetweenAndReminder24hSentFalse(
                eq(DonationStatus.AVAILABLE), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(donationSoon));

        scheduler.processFoodExpirationsAndReminders();

        assertTrue(donationSoon.getReminder24hSent(), "24h reminder flag should be set to true to prevent duplicate triggers");
        verify(donationRepository, times(1)).save(donationSoon);
        verify(emailService, times(1)).sendExpiryReminderEmail(
                eq(donor.getEmail()),
                eq(donor.getFullName()),
                eq(donationSoon.getFoodName()),
                anyString(),
                eq(24)
        );
    }
}
