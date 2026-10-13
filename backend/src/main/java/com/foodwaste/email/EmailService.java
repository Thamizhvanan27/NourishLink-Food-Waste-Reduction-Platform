package com.foodwaste.email;

public interface EmailService {

    void sendWelcomeEmail(String toEmail, String fullName, String role);

    void sendNgoApprovalEmail(String toEmail, String ngoName);

    void sendNgoRejectionEmail(String toEmail, String ngoName, String reason);

    void sendDonationRequestEmail(String donorEmail, String donorName, String foodName, String ngoName);

    void sendRequestAcceptedEmail(String ngoEmail, String ngoName, String foodName, String donorAddress);

    void sendRequestRejectedEmail(String ngoEmail, String ngoName, String foodName);

    void sendPickupReminderEmail(String toEmail, String recipientName, String foodName, String pickupTime, String address);

    void sendDonationCompletedEmail(String toEmail, String recipientName, String foodName, Double quantity, String unit);

    void sendPasswordResetEmail(String toEmail, String fullName, String resetLink);

    void sendExpiryReminderEmail(String donorEmail, String donorName, String foodName, String expiryTime, int hoursRemaining);
}
