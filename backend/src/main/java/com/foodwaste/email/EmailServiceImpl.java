package com.foodwaste.email;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@nourishlink.org}")
    private String fromEmail;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Async
    @Override
    public void sendWelcomeEmail(String toEmail, String fullName, String role) {
        String title = "Welcome to NourishLink!";
        String content = "<p>Hello <strong>" + fullName + "</strong>,</p>"
                + "<p>Welcome to <strong>Food Waste Reduction Platform (NourishLink)</strong>. Your account has been registered successfully as a <strong>" + role + "</strong>.</p>"
                + "<p>Together, we are bridging the gap between surplus food and communities in need. Let's make every meal count!</p>";
        String actionBtn = "<a href=\"" + frontendUrl + "/login\" style=\"display:inline-block;padding:12px 24px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;\">Sign In to Dashboard</a>";

        sendHtmlEmail(toEmail, title, title, content, actionBtn);
    }

    @Async
    @Override
    public void sendNgoApprovalEmail(String toEmail, String ngoName) {
        String title = "NGO Account Approved!";
        String content = "<p>Dear <strong>" + ngoName + "</strong> Team,</p>"
                + "<p>Great news! Your NGO profile has been verified and approved by the platform administration.</p>"
                + "<p>You can now browse available food donations, submit real-time collection requests, and track pickups on the interactive map.</p>";
        String actionBtn = "<a href=\"" + frontendUrl + "/ngo/donations\" style=\"display:inline-block;padding:12px 24px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;\">Browse Food Donations</a>";

        sendHtmlEmail(toEmail, "Your NGO Account has been Approved", title, content, actionBtn);
    }

    @Async
    @Override
    public void sendNgoRejectionEmail(String toEmail, String ngoName, String reason) {
        String title = "NGO Verification Update";
        String content = "<p>Dear <strong>" + ngoName + "</strong> Team,</p>"
                + "<p>Thank you for submitting your NGO credentials. After review, your registration was not approved at this time.</p>"
                + "<p><strong>Reason / Notes:</strong> " + (reason != null ? reason : "Registration credentials could not be verified.") + "</p>"
                + "<p>Please review your documentation and update your organization details or reach out to support.</p>";
        String actionBtn = "<a href=\"" + frontendUrl + "/contact\" style=\"display:inline-block;padding:12px 24px;background-color:#6b7280;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;\">Contact Support</a>";

        sendHtmlEmail(toEmail, "NGO Verification Update", title, content, actionBtn);
    }

    @Async
    @Override
    public void sendDonationRequestEmail(String donorEmail, String donorName, String foodName, String ngoName) {
        String title = "New Request for Your Food Donation";
        String content = "<p>Hello <strong>" + donorName + "</strong>,</p>"
                + "<p>Verified NGO <strong>" + ngoName + "</strong> has requested your food donation: <strong>" + foodName + "</strong>.</p>"
                + "<p>Please visit your donor dashboard to accept or reject this request so pickup scheduling can proceed.</p>";
        String actionBtn = "<a href=\"" + frontendUrl + "/donor/requests\" style=\"display:inline-block;padding:12px 24px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;\">View Incoming Requests</a>";

        sendHtmlEmail(donorEmail, "New Food Request from " + ngoName, title, content, actionBtn);
    }

    @Async
    @Override
    public void sendRequestAcceptedEmail(String ngoEmail, String ngoName, String foodName, String donorAddress) {
        String title = "Donation Request Accepted!";
        String content = "<p>Hello <strong>" + ngoName + "</strong> Team,</p>"
                + "<p>The donor has accepted your request for <strong>" + foodName + "</strong>.</p>"
                + "<p><strong>Pickup Location:</strong> " + donorAddress + "</p>"
                + "<p>Please coordinate pickup within the designated window. Once picked up, confirm pickup in your dashboard.</p>";
        String actionBtn = "<a href=\"" + frontendUrl + "/ngo/requests\" style=\"display:inline-block;padding:12px 24px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;\">View Request Details</a>";

        sendHtmlEmail(ngoEmail, "Your Request for " + foodName + " has been Accepted", title, content, actionBtn);
    }

    @Async
    @Override
    public void sendRequestRejectedEmail(String ngoEmail, String ngoName, String foodName) {
        String title = "Donation Request Update";
        String content = "<p>Hello <strong>" + ngoName + "</strong> Team,</p>"
                + "<p>Your request for <strong>" + foodName + "</strong> could not be accommodated by the donor at this time.</p>"
                + "<p>Other nearby surplus food donations are continuously posted on the platform. Please check the discover page for other available items.</p>";
        String actionBtn = "<a href=\"" + frontendUrl + "/ngo/donations\" style=\"display:inline-block;padding:12px 24px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;\">Find Other Donations</a>";

        sendHtmlEmail(ngoEmail, "Update on Request for " + foodName, title, content, actionBtn);
    }

    @Async
    @Override
    public void sendPickupReminderEmail(String toEmail, String recipientName, String foodName, String pickupTime, String address) {
        String title = "Pickup Reminder: Time Approaching";
        String content = "<p>Hello <strong>" + recipientName + "</strong>,</p>"
                + "<p>This is a reminder that the scheduled pickup for <strong>" + foodName + "</strong> is approaching.</p>"
                + "<p><strong>Pickup Window:</strong> " + pickupTime + "<br/>"
                + "<strong>Address:</strong> " + address + "</p>";
        String actionBtn = "<a href=\"" + frontendUrl + "/\" style=\"display:inline-block;padding:12px 24px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;\">Open Platform</a>";

        sendHtmlEmail(toEmail, "Pickup Reminder: " + foodName, title, content, actionBtn);
    }

    @Async
    @Override
    public void sendDonationCompletedEmail(String toEmail, String recipientName, String foodName, Double quantity, String unit) {
        String title = "Donation Completed Successfully!";
        String content = "<p>Hello <strong>" + recipientName + "</strong>,</p>"
                + "<p>The food donation <strong>" + foodName + "</strong> (" + quantity + " " + unit + ") has been successfully picked up and distributed.</p>"
                + "<p>Thank you for your invaluable contribution to eliminating food waste and feeding communities in need. Don't forget to leave feedback and rating!</p>";
        String actionBtn = "<a href=\"" + frontendUrl + "/\" style=\"display:inline-block;padding:12px 24px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;\">Rate & View Impact</a>";

        sendHtmlEmail(toEmail, "Donation Completed: " + foodName, title, content, actionBtn);
    }

    @Async
    @Override
    public void sendPasswordResetEmail(String toEmail, String fullName, String resetLink) {
        String title = "Reset Your Password";
        String content = "<p>Hello <strong>" + fullName + "</strong>,</p>"
                + "<p>We received a request to reset your password on the Food Waste Reduction Platform. Click the button below to set a new password:</p>"
                + "<p>This link is valid for 60 minutes. If you did not request a password reset, you can safely ignore this email.</p>";
        String actionBtn = "<a href=\"" + resetLink + "\" style=\"display:inline-block;padding:12px 24px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;\">Reset Password</a>";

        sendHtmlEmail(toEmail, "Password Reset Request", title, content, actionBtn);
    }

    @Async
    @Override
    public void sendExpiryReminderEmail(String donorEmail, String donorName, String foodName, String expiryTime, int hoursRemaining) {
        String title = "Urgent: Food Donation Expires in " + hoursRemaining + " Hours";
        String content = "<p>Hello <strong>" + donorName + "</strong>,</p>"
                + "<p>Your food donation <strong>" + foodName + "</strong> is scheduled to expire at <strong>" + expiryTime + "</strong> (in approximately " + hoursRemaining + " hours).</p>"
                + "<p>If an NGO has requested this item, please consider accepting promptly so the food can be collected and utilized before expiry.</p>";
        String actionBtn = "<a href=\"" + frontendUrl + "/donor/donations\" style=\"display:inline-block;padding:12px 24px;background-color:#f59e0b;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;\">Manage Donation</a>";

        sendHtmlEmail(donorEmail, "Donation Expiring Soon: " + foodName, title, content, actionBtn);
    }

    private void sendHtmlEmail(String toEmail, String subject, String headerTitle, String bodyHtml, String actionButtonHtml) {
        if (!mailEnabled) {
            log.info("[MOCK MAIL] To: {} | Subject: {} | Header: {}", toEmail, subject, headerTitle);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "NourishLink Platform");
            helper.setTo(toEmail);
            helper.setSubject(subject);

            String fullHtml = buildTemplate(headerTitle, bodyHtml, actionButtonHtml);
            helper.setText(fullHtml, true);

            mailSender.send(message);
            log.info("Email successfully dispatched to {}", toEmail);
        } catch (Exception e) {
            log.warn("Failed to dispatch email to {}: {}. Continuing without breaking user workflow.", toEmail, e.getMessage());
        }
    }

    private String buildTemplate(String headerTitle, String bodyHtml, String actionButtonHtml) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset=\"UTF-8\"/><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/></head>"
                + "<body style=\"margin:0;padding:24px;background-color:#f3f4f6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;\">"
                + "<table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);\">"
                + "  <tr>"
                + "    <td style=\"background:linear-gradient(135deg,#065f46,#10b981);padding:28px;text-align:center;\">"
                + "      <div style=\"font-size:28px;font-weight:bold;color:#ffffff;\">🌱 NourishLink</div>"
                + "      <div style=\"color:#d1fae5;font-size:14px;margin-top:4px;\">Food Waste Reduction & Redistribution Platform</div>"
                + "    </td>"
                + "  </tr>"
                + "  <tr>"
                + "    <td style=\"padding:32px 28px;\">"
                + "      <h2 style=\"margin-top:0;color:#065f46;font-size:20px;\">" + headerTitle + "</h2>"
                + "      <div style=\"font-size:15px;line-height:1.6;color:#374151;\">" + bodyHtml + "</div>"
                + (actionButtonHtml != null ? "<div style=\"margin-top:28px;text-align:center;\">" + actionButtonHtml + "</div>" : "")
                + "    </td>"
                + "  </tr>"
                + "  <tr>"
                + "    <td style=\"background-color:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;\">"
                + "      <p style=\"margin:0;\">© 2026 NourishLink Food Waste Reduction Platform. All rights reserved.</p>"
                + "      <p style=\"margin:4px 0 0 0;\">You received this transactional email regarding your platform activities.</p>"
                + "    </td>"
                + "  </tr>"
                + "</table>"
                + "</body></html>";
    }
}
