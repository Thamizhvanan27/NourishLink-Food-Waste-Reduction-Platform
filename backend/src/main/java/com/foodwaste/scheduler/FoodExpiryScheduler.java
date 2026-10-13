package com.foodwaste.scheduler;

import com.foodwaste.email.EmailService;
import com.foodwaste.entity.Donation;
import com.foodwaste.entity.DonationRequest;
import com.foodwaste.entity.DonationStatus;
import com.foodwaste.entity.NotificationType;
import com.foodwaste.entity.RequestStatus;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.DonationRequestRepository;
import com.foodwaste.service.NotificationService;
import com.foodwaste.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FoodExpiryScheduler {

    private final DonationRepository donationRepository;
    private final DonationRequestRepository donationRequestRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final SystemSettingService systemSettingService;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");

    /**
     * Run every 60 seconds to check for expired donations and process expiry reminders.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processFoodExpirationsAndReminders() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Process Automatic Expiry for AVAILABLE donations
        List<Donation> expiredDonations = donationRepository.findByStatusAndExpiryDateBefore(DonationStatus.AVAILABLE, now);
        for (Donation donation : expiredDonations) {
            log.info("Marking donation #{} ({}) as EXPIRED", donation.getId(), donation.getFoodName());
            donation.setStatus(DonationStatus.EXPIRED);
            donationRepository.save(donation);

            // Reject any pending requests for this expired donation
            List<DonationRequest> pendingRequests = donationRequestRepository.findByDonationAndStatus(donation, RequestStatus.PENDING);
            for (DonationRequest req : pendingRequests) {
                req.setStatus(RequestStatus.REJECTED);
                donationRequestRepository.save(req);

                notificationService.createAndSendNotification(
                        req.getNgo().getUser(),
                        "Donation Request Expired",
                        "The donation '" + donation.getFoodName() + "' has expired before acceptance.",
                        NotificationType.EXPIRY,
                        donation.getId()
                );
            }

            // Notify Donor
            notificationService.createAndSendNotification(
                    donation.getDonor(),
                    "Food Donation Expired",
                    "Your food donation '" + donation.getFoodName() + "' has reached its expiry time and is marked EXPIRED.",
                    NotificationType.EXPIRY,
                    donation.getId()
            );
        }

        // 2. Process 24-Hour Expiry Reminders
        if (systemSettingService.is24hReminderEnabled()) {
            LocalDateTime windowStart = now;
            LocalDateTime windowEnd = now.plusHours(24);

            List<Donation> dueFor24h = donationRepository.findByStatusAndExpiryDateBetweenAndReminder24hSentFalse(
                    DonationStatus.AVAILABLE, windowStart, windowEnd);

            for (Donation donation : dueFor24h) {
                donation.setReminder24hSent(true);
                donationRepository.save(donation);

                String formattedExpiry = donation.getExpiryDate().format(TIME_FMT);
                String msg = "Your food donation '" + donation.getFoodName() + "' expires in 24 hours (" + formattedExpiry + ").";

                notificationService.createAndSendNotification(
                        donation.getDonor(),
                        "Donation Expiry Reminder (24h)",
                        msg,
                        NotificationType.EXPIRY,
                        donation.getId()
                );

                emailService.sendExpiryReminderEmail(
                        donation.getDonor().getEmail(),
                        donation.getDonor().getFullName(),
                        donation.getFoodName(),
                        formattedExpiry,
                        24
                );
                log.info("Sent 24-hour expiry reminder for donation #{}", donation.getId());
            }
        }

        // 3. Process 2-Hour Expiry Reminders
        if (systemSettingService.is2hReminderEnabled()) {
            LocalDateTime windowStart = now;
            LocalDateTime windowEnd = now.plusHours(2);

            List<Donation> dueFor2h = donationRepository.findByStatusAndExpiryDateBetweenAndReminder2hSentFalse(
                    DonationStatus.AVAILABLE, windowStart, windowEnd);

            for (Donation donation : dueFor2h) {
                donation.setReminder2hSent(true);
                donationRepository.save(donation);

                String formattedExpiry = donation.getExpiryDate().format(TIME_FMT);
                String msg = "Urgent: Your food donation '" + donation.getFoodName() + "' expires soon in approximately 2 hours (" + formattedExpiry + ").";

                notificationService.createAndSendNotification(
                        donation.getDonor(),
                        "Urgent Expiry Reminder (2h)",
                        msg,
                        NotificationType.EXPIRY,
                        donation.getId()
                );

                emailService.sendExpiryReminderEmail(
                        donation.getDonor().getEmail(),
                        donation.getDonor().getFullName(),
                        donation.getFoodName(),
                        formattedExpiry,
                        2
                );
                log.info("Sent 2-hour urgent expiry reminder for donation #{}", donation.getId());
            }
        }
    }
}
