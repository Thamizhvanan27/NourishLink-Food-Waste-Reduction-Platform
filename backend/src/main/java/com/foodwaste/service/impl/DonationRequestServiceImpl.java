package com.foodwaste.service.impl;

import com.foodwaste.dto.DonationRequestCreateDTO;
import com.foodwaste.dto.DonationRequestResponse;
import com.foodwaste.dto.PagedResponse;
import com.foodwaste.entity.*;
import com.foodwaste.exception.BadRequestException;
import com.foodwaste.exception.ForbiddenException;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.DonationRequestRepository;
import com.foodwaste.repository.NgoRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.service.DonationRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DonationRequestServiceImpl implements DonationRequestService {

    private final DonationRequestRepository requestRepository;
    private final DonationRepository donationRepository;
    private final NgoRepository ngoRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;
    private final com.foodwaste.service.NotificationService notificationService;
    private final com.foodwaste.email.EmailService emailService;
    private final com.foodwaste.volunteer.VolunteerService volunteerService;

    @Override
    @Transactional
    public DonationRequestResponse createRequest(String ngoEmail, DonationRequestCreateDTO requestDTO) {
        User user = userRepository.findByEmail(ngoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (Boolean.TRUE.equals(user.getBlocked())) {
            throw new ForbiddenException("Blocked users cannot make donation requests");
        }

        Ngo ngo = ngoRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("NGO profile not found for this user"));

        if (!Boolean.TRUE.equals(ngo.getApproved())) {
            throw new ForbiddenException("Your NGO account is awaiting Admin approval. Unapproved NGOs cannot request food.");
        }

        Donation donation = donationRepository.findById(requestDTO.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + requestDTO.getDonationId()));

        if (donation.getDonor().getId().equals(user.getId())) {
            throw new BadRequestException("You cannot request your own food donation");
        }

        if (donation.getStatus() != DonationStatus.AVAILABLE && donation.getStatus() != DonationStatus.REQUESTED) {
            throw new BadRequestException("This donation is no longer available for requests (Status: " + donation.getStatus() + ")");
        }

        if (donation.getExpiryDate().isBefore(LocalDateTime.now())) {
            donation.setStatus(DonationStatus.EXPIRED);
            donationRepository.save(donation);
            throw new BadRequestException("This donation has expired and cannot be requested");
        }

        if (requestRepository.existsByDonationAndNgo(donation, ngo)) {
            throw new BadRequestException("You have already submitted a request for this donation");
        }

        DonationRequest request = DonationRequest.builder()
                .donation(donation)
                .ngo(ngo)
                .message(requestDTO.getMessage())
                .status(RequestStatus.PENDING)
                .build();

        DonationRequest savedRequest = requestRepository.save(request);

        // Update donation status to REQUESTED if still AVAILABLE
        if (donation.getStatus() == DonationStatus.AVAILABLE) {
            donation.setStatus(DonationStatus.REQUESTED);
            donationRepository.save(donation);
        }

        // Notify Donor
        notificationService.createAndSendNotification(
                donation.getDonor(),
                "New Food Donation Request",
                ngo.getNgoName() + " requested your food donation: " + donation.getFoodName(),
                NotificationType.DONATION_REQUEST,
                donation.getId()
        );

        try {
            emailService.sendDonationRequestEmail(
                    donation.getDonor().getEmail(),
                    donation.getDonor().getFullName(),
                    donation.getFoodName(),
                    ngo.getNgoName()
            );
        } catch (Exception e) {
            log.warn("Failed to dispatch donation request email: {}", e.getMessage());
        }

        return mapper.toDonationRequestResponse(savedRequest);
    }

    @Override
    @Transactional
    public DonationRequestResponse acceptRequest(String donorEmail, Long requestId) {
        DonationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + requestId));

        Donation donation = request.getDonation();
        if (!donation.getDonor().getEmail().equalsIgnoreCase(donorEmail)) {
            throw new ForbiddenException("Only the donation owner can accept requests");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be accepted");
        }

        request.setStatus(RequestStatus.ACCEPTED);
        request.setAcceptedAt(LocalDateTime.now());
        DonationRequest savedRequest = requestRepository.save(request);

        donation.setStatus(DonationStatus.ACCEPTED);
        donationRepository.save(donation);

        // Reject other pending requests for the same donation
        List<DonationRequest> otherRequests = requestRepository.findByDonationAndStatus(donation, RequestStatus.PENDING);
        for (DonationRequest other : otherRequests) {
            if (!other.getId().equals(requestId)) {
                other.setStatus(RequestStatus.REJECTED);
                requestRepository.save(other);

                notificationService.createAndSendNotification(
                        other.getNgo().getUser(),
                        "Food Request Update",
                        "The donation '" + donation.getFoodName() + "' was assigned to another request.",
                        NotificationType.REQUEST_REJECTED,
                        donation.getId()
                );
            }
        }

        // Create volunteer pickup task
        try {
            volunteerService.createPickupTaskForDonation(donation);
        } catch (Exception e) {
            log.warn("Could not create volunteer pickup task: {}", e.getMessage());
        }

        // Notify NGO
        notificationService.createAndSendNotification(
                request.getNgo().getUser(),
                "Food Request Accepted",
                "Your food request has been accepted.",
                NotificationType.REQUEST_ACCEPTED,
                donation.getId()
        );

        try {
            emailService.sendRequestAcceptedEmail(
                    request.getNgo().getUser().getEmail(),
                    request.getNgo().getNgoName(),
                    donation.getFoodName(),
                    donation.getPickupAddress()
            );
        } catch (Exception e) {
            log.warn("Failed to dispatch accepted request email: {}", e.getMessage());
        }

        return mapper.toDonationRequestResponse(savedRequest);
    }

    @Override
    @Transactional
    public DonationRequestResponse rejectRequest(String donorEmail, Long requestId) {
        DonationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + requestId));

        Donation donation = request.getDonation();
        if (!donation.getDonor().getEmail().equalsIgnoreCase(donorEmail)) {
            throw new ForbiddenException("Only the donation owner can reject requests");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be rejected");
        }

        request.setStatus(RequestStatus.REJECTED);
        DonationRequest savedRequest = requestRepository.save(request);

        // If no other pending requests exist, revert donation to AVAILABLE
        List<DonationRequest> remainingPending = requestRepository.findByDonationAndStatus(donation, RequestStatus.PENDING);
        if (remainingPending.isEmpty() && donation.getStatus() == DonationStatus.REQUESTED) {
            donation.setStatus(DonationStatus.AVAILABLE);
            donationRepository.save(donation);
        }

        // Notify NGO
        notificationService.createAndSendNotification(
                request.getNgo().getUser(),
                "Food Request Rejected",
                "Your food request has been rejected.",
                NotificationType.REQUEST_REJECTED,
                donation.getId()
        );

        try {
            emailService.sendRequestRejectedEmail(
                    request.getNgo().getUser().getEmail(),
                    request.getNgo().getNgoName(),
                    donation.getFoodName()
            );
        } catch (Exception e) {
            log.warn("Failed to dispatch rejection email: {}", e.getMessage());
        }

        return mapper.toDonationRequestResponse(savedRequest);
    }

    @Override
    @Transactional
    public DonationRequestResponse cancelRequest(String ngoEmail, Long requestId) {
        DonationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + requestId));

        if (!request.getNgo().getUser().getEmail().equalsIgnoreCase(ngoEmail)) {
            throw new ForbiddenException("Only the requesting NGO can cancel this request");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be cancelled");
        }

        request.setStatus(RequestStatus.CANCELLED);
        DonationRequest savedRequest = requestRepository.save(request);

        Donation donation = request.getDonation();
        List<DonationRequest> remainingPending = requestRepository.findByDonationAndStatus(donation, RequestStatus.PENDING);
        if (remainingPending.isEmpty() && donation.getStatus() == DonationStatus.REQUESTED) {
            donation.setStatus(DonationStatus.AVAILABLE);
            donationRepository.save(donation);
        }

        // Notify Donor
        notificationService.createAndSendNotification(
                donation.getDonor(),
                "Donation Request Cancelled",
                "The donation has been cancelled by NGO " + request.getNgo().getNgoName() + ".",
                NotificationType.SYSTEM,
                donation.getId()
        );

        return mapper.toDonationRequestResponse(savedRequest);
    }

    @Override
    @Transactional
    public DonationRequestResponse pickupRequest(String ngoEmail, Long requestId) {
        DonationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + requestId));

        if (!request.getNgo().getUser().getEmail().equalsIgnoreCase(ngoEmail)) {
            throw new ForbiddenException("Only the accepted NGO can confirm pickup");
        }

        if (request.getStatus() != RequestStatus.ACCEPTED) {
            throw new BadRequestException("Only accepted requests can be marked as picked up (Current status: " + request.getStatus() + ")");
        }

        request.setStatus(RequestStatus.PICKED_UP);
        request.setPickedUpAt(LocalDateTime.now());
        DonationRequest savedRequest = requestRepository.save(request);

        Donation donation = request.getDonation();
        donation.setStatus(DonationStatus.PICKED_UP);
        donationRepository.save(donation);

        // Notify Donor
        notificationService.createAndSendNotification(
                donation.getDonor(),
                "Food Donation Picked Up",
                "Your food donation has been picked up.",
                NotificationType.PICKUP,
                donation.getId()
        );

        return mapper.toDonationRequestResponse(savedRequest);
    }

    @Override
    @Transactional
    public DonationRequestResponse completeRequest(String ngoEmail, Long requestId) {
        DonationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + requestId));

        if (!request.getNgo().getUser().getEmail().equalsIgnoreCase(ngoEmail)) {
            throw new ForbiddenException("Only the assigned NGO can mark this donation as completed");
        }

        if (request.getStatus() != RequestStatus.PICKED_UP) {
            throw new BadRequestException("Donation must be picked up before completing (Current status: " + request.getStatus() + ")");
        }

        request.setStatus(RequestStatus.COMPLETED);
        request.setCompletedAt(LocalDateTime.now());
        DonationRequest savedRequest = requestRepository.save(request);

        Donation donation = request.getDonation();
        donation.setStatus(DonationStatus.COMPLETED);
        donationRepository.save(donation);

        // Notify Donor & NGO
        notificationService.createAndSendNotification(
                donation.getDonor(),
                "Donation Completed Successfully",
                "Your donation has been completed successfully.",
                NotificationType.COMPLETED,
                donation.getId()
        );

        notificationService.createAndSendNotification(
                request.getNgo().getUser(),
                "Donation Completed",
                "Your donation has been completed successfully. You may now submit your feedback and rating.",
                NotificationType.COMPLETED,
                donation.getId()
        );

        try {
            emailService.sendDonationCompletedEmail(
                    donation.getDonor().getEmail(),
                    donation.getDonor().getFullName(),
                    donation.getFoodName(),
                    donation.getQuantity(),
                    donation.getQuantityUnit()
            );
        } catch (Exception e) {
            log.warn("Failed to dispatch completion email: {}", e.getMessage());
        }

        return mapper.toDonationRequestResponse(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationRequestResponse> getMyRequestsAsNgo(String ngoEmail, RequestStatus status, Pageable pageable) {
        User user = userRepository.findByEmail(ngoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Ngo ngo = ngoRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("NGO profile not found"));

        Page<DonationRequest> page = requestRepository.findByNgoAndStatus(ngo, status, pageable);
        List<DonationRequestResponse> dtoList = page.getContent().stream()
                .map(mapper::toDonationRequestResponse)
                .collect(Collectors.toList());

        return PagedResponse.of(page, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationRequestResponse> getRequestsForDonor(String donorEmail, RequestStatus status, Pageable pageable) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));

        Page<DonationRequest> page = requestRepository.findByDonorAndStatus(donor, status, pageable);
        List<DonationRequestResponse> dtoList = page.getContent().stream()
                .map(mapper::toDonationRequestResponse)
                .collect(Collectors.toList());

        return PagedResponse.of(page, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationRequestResponse> getAllRequestsForAdmin(RequestStatus status, String keyword, Pageable pageable) {
        Page<DonationRequest> page = requestRepository.findAllWithFilters(status, keyword, pageable);
        List<DonationRequestResponse> dtoList = page.getContent().stream()
                .map(mapper::toDonationRequestResponse)
                .collect(Collectors.toList());

        return PagedResponse.of(page, dtoList);
    }
}
