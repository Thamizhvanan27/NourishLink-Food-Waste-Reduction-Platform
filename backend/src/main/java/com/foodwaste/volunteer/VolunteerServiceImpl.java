package com.foodwaste.volunteer;

import com.foodwaste.dto.*;
import com.foodwaste.email.EmailService;
import com.foodwaste.entity.*;
import com.foodwaste.exception.BadRequestException;
import com.foodwaste.exception.DuplicateResourceException;
import com.foodwaste.exception.ForbiddenException;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.location.GeoUtils;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.*;
import com.foodwaste.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VolunteerServiceImpl implements VolunteerService {

    private final UserRepository userRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final VolunteerTaskRepository volunteerTaskRepository;
    private final DonationRepository donationRepository;
    private final DonationRequestRepository donationRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper mapper;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Override
    @Transactional
    public UserResponse registerVolunteer(VolunteerRegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with this email already exists: " + email);
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .city(request.getCity() != null ? request.getCity().trim() : null)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .role(Role.ROLE_VOLUNTEER)
                .enabled(true)
                .blocked(false)
                .build();

        User savedUser = userRepository.save(user);

        VolunteerProfile profile = VolunteerProfile.builder()
                .user(savedUser)
                .phone(savedUser.getPhone())
                .address(savedUser.getAddress())
                .city(savedUser.getCity())
                .latitude(savedUser.getLatitude())
                .longitude(savedUser.getLongitude())
                .availability(request.getAvailability() != null ? request.getAvailability().trim() : "Anytime")
                .vehicleType(request.getVehicleType() != null ? request.getVehicleType() : VehicleType.BIKE)
                .active(true)
                .build();

        volunteerProfileRepository.save(profile);

        try {
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFullName(), "Food Rescue Volunteer");
        } catch (Exception e) {
            log.warn("Failed to send volunteer welcome email: {}", e.getMessage());
        }

        return mapper.toUserResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public VolunteerProfileDTO getVolunteerProfile(String volunteerEmail) {
        User user = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer user not found"));

        VolunteerProfile profile = volunteerProfileRepository.findByUser(user)
                .orElseGet(() -> VolunteerProfile.builder()
                        .user(user)
                        .phone(user.getPhone())
                        .address(user.getAddress())
                        .city(user.getCity())
                        .latitude(user.getLatitude())
                        .longitude(user.getLongitude())
                        .availability("Anytime")
                        .vehicleType(VehicleType.BIKE)
                        .active(true)
                        .build());

        return mapper.toVolunteerProfileDTO(profile);
    }

    @Override
    @Transactional
    public VolunteerProfileDTO updateVolunteerProfile(String volunteerEmail, VolunteerProfileDTO profileDTO) {
        User user = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer user not found"));

        if (profileDTO.getFullName() != null && !profileDTO.getFullName().isBlank()) {
            user.setFullName(profileDTO.getFullName().trim());
        }
        if (profileDTO.getPhone() != null) {
            user.setPhone(profileDTO.getPhone().trim());
        }
        if (profileDTO.getAddress() != null) {
            user.setAddress(profileDTO.getAddress().trim());
        }
        if (profileDTO.getCity() != null) {
            user.setCity(profileDTO.getCity().trim());
        }
        if (profileDTO.getLatitude() != null) {
            user.setLatitude(profileDTO.getLatitude());
        }
        if (profileDTO.getLongitude() != null) {
            user.setLongitude(profileDTO.getLongitude());
        }
        userRepository.save(user);

        VolunteerProfile profile = volunteerProfileRepository.findByUser(user)
                .orElse(VolunteerProfile.builder().user(user).build());

        profile.setPhone(user.getPhone());
        profile.setAddress(user.getAddress());
        profile.setCity(user.getCity());
        profile.setLatitude(user.getLatitude());
        profile.setLongitude(user.getLongitude());
        if (profileDTO.getAvailability() != null) {
            profile.setAvailability(profileDTO.getAvailability().trim());
        }
        if (profileDTO.getVehicleType() != null) {
            profile.setVehicleType(profileDTO.getVehicleType());
        }
        if (profileDTO.getActive() != null) {
            profile.setActive(profileDTO.getActive());
        }

        VolunteerProfile saved = volunteerProfileRepository.save(profile);
        return mapper.toVolunteerProfileDTO(saved);
    }

    @Override
    @Transactional
    public VolunteerTask createPickupTaskForDonation(Donation donation) {
        // Check if task already exists
        List<VolunteerTask> existing = volunteerTaskRepository.findByDonation(donation);
        if (!existing.isEmpty()) {
            return existing.get(0);
        }

        VolunteerTask task = VolunteerTask.builder()
                .donation(donation)
                .status(VolunteerTaskStatus.AVAILABLE)
                .build();

        VolunteerTask saved = volunteerTaskRepository.save(task);
        log.info("Created pickup task #{} for donation #{}", saved.getId(), donation.getId());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<VolunteerTaskResponse> getMyTasks(String volunteerEmail, VolunteerTaskStatus status, Pageable pageable) {
        User volunteer = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found"));

        Page<VolunteerTask> page;
        if (status != null) {
            page = volunteerTaskRepository.findByVolunteerAndStatus(volunteer, status, pageable);
        } else {
            page = volunteerTaskRepository.findByVolunteer(volunteer, pageable);
        }

        List<VolunteerTaskResponse> responses = page.getContent().stream()
                .map(this::mapWithNgoDetails)
                .collect(Collectors.toList());

        return PagedResponse.of(page, responses);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerTaskResponse> getNearbyAvailableTasks(Double latitude, Double longitude, Double radiusKm) {
        double radius = (radiusKm != null && radiusKm > 0) ? radiusKm : 25.0;

        List<VolunteerTask> tasks;
        if (latitude != null && longitude != null) {
            tasks = volunteerTaskRepository.findNearbyAvailableTasks(latitude, longitude, radius);
        } else {
            tasks = volunteerTaskRepository.findByStatus(VolunteerTaskStatus.AVAILABLE);
        }

        List<VolunteerTaskResponse> responses = new ArrayList<>();
        for (VolunteerTask task : tasks) {
            VolunteerTaskResponse resp = mapWithNgoDetails(task);
            if (latitude != null && longitude != null && resp.getPickupLatitude() != null && resp.getPickupLongitude() != null) {
                double dist = GeoUtils.calculateDistanceKm(latitude, longitude, resp.getPickupLatitude(), resp.getPickupLongitude());
                resp.setDistance(dist);
            }
            responses.add(resp);
        }

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public VolunteerTaskResponse getTaskById(Long taskId) {
        VolunteerTask task = volunteerTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer task not found with id: " + taskId));
        return mapWithNgoDetails(task);
    }

    @Override
    @Transactional
    public VolunteerTaskResponse acceptTask(String volunteerEmail, Long taskId) {
        User volunteer = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found"));

        if (Boolean.TRUE.equals(volunteer.getBlocked())) {
            throw new ForbiddenException("Blocked volunteers cannot accept tasks");
        }

        VolunteerTask task = volunteerTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        if (task.getStatus() != VolunteerTaskStatus.AVAILABLE) {
            throw new BadRequestException("Task is no longer available (Status: " + task.getStatus() + ")");
        }

        task.setVolunteer(volunteer);
        task.setStatus(VolunteerTaskStatus.ACCEPTED);
        task.setAcceptedAt(LocalDateTime.now());
        VolunteerTask saved = volunteerTaskRepository.save(task);

        // Notify Donor
        Donation donation = task.getDonation();
        notificationService.createAndSendNotification(
                donation.getDonor(),
                "Volunteer Assigned",
                "Volunteer " + volunteer.getFullName() + " accepted the pickup task for '" + donation.getFoodName() + "'.",
                NotificationType.PICKUP,
                donation.getId()
        );

        // Notify NGO if request accepted
        donationRequestRepository.findFirstByDonationAndStatus(donation, RequestStatus.ACCEPTED)
                .ifPresent(req -> notificationService.createAndSendNotification(
                        req.getNgo().getUser(),
                        "Volunteer En Route",
                        "Volunteer " + volunteer.getFullName() + " has accepted to pick up '" + donation.getFoodName() + "'.",
                        NotificationType.PICKUP,
                        donation.getId()
                ));

        return mapWithNgoDetails(saved);
    }

    @Override
    @Transactional
    public VolunteerTaskResponse markTaskPickedUp(String volunteerEmail, Long taskId) {
        User volunteer = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found"));

        VolunteerTask task = volunteerTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        if (task.getVolunteer() == null || !task.getVolunteer().getId().equals(volunteer.getId())) {
            throw new ForbiddenException("Only the assigned volunteer can update task status");
        }

        if (task.getStatus() != VolunteerTaskStatus.ACCEPTED) {
            throw new BadRequestException("Task must be in ACCEPTED state before marking PICKED_UP (Current: " + task.getStatus() + ")");
        }

        task.setStatus(VolunteerTaskStatus.PICKED_UP);
        task.setPickedUpAt(LocalDateTime.now());
        VolunteerTask saved = volunteerTaskRepository.save(task);

        Donation donation = task.getDonation();
        donation.setStatus(DonationStatus.PICKED_UP);
        donationRepository.save(donation);

        // Update accepted request status
        donationRequestRepository.findFirstByDonationAndStatus(donation, RequestStatus.ACCEPTED)
                .ifPresent(req -> {
                    req.setStatus(RequestStatus.PICKED_UP);
                    req.setPickedUpAt(LocalDateTime.now());
                    donationRequestRepository.save(req);
                });

        // Notifications
        notificationService.createAndSendNotification(
                donation.getDonor(),
                "Food Picked Up",
                "Volunteer " + volunteer.getFullName() + " has picked up '" + donation.getFoodName() + "'.",
                NotificationType.PICKUP,
                donation.getId()
        );

        return mapWithNgoDetails(saved);
    }

    @Override
    @Transactional
    public VolunteerTaskResponse markTaskDelivered(String volunteerEmail, Long taskId) {
        User volunteer = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found"));

        VolunteerTask task = volunteerTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        if (task.getVolunteer() == null || !task.getVolunteer().getId().equals(volunteer.getId())) {
            throw new ForbiddenException("Only the assigned volunteer can update task status");
        }

        if (task.getStatus() != VolunteerTaskStatus.PICKED_UP) {
            throw new BadRequestException("Task must be marked PICKED_UP before DELIVERED (Current: " + task.getStatus() + ")");
        }

        task.setStatus(VolunteerTaskStatus.DELIVERED);
        task.setDeliveredAt(LocalDateTime.now());
        VolunteerTask saved = volunteerTaskRepository.save(task);

        Donation donation = task.getDonation();
        donation.setStatus(DonationStatus.COMPLETED);
        donationRepository.save(donation);

        // Update request to COMPLETED
        donationRequestRepository.findFirstByDonationAndStatus(donation, RequestStatus.PICKED_UP)
                .ifPresent(req -> {
                    req.setStatus(RequestStatus.COMPLETED);
                    req.setCompletedAt(LocalDateTime.now());
                    donationRequestRepository.save(req);

                    notificationService.createAndSendNotification(
                            req.getNgo().getUser(),
                            "Food Delivered Successfully",
                            "Volunteer " + volunteer.getFullName() + " delivered '" + donation.getFoodName() + "'.",
                            NotificationType.COMPLETED,
                            donation.getId()
                    );
                });

        // Notify Donor
        notificationService.createAndSendNotification(
                donation.getDonor(),
                "Donation Delivered & Completed",
                "Your food donation '" + donation.getFoodName() + "' was successfully delivered by " + volunteer.getFullName() + "!",
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
            log.warn("Completion email failed: {}", e.getMessage());
        }

        return mapWithNgoDetails(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getVolunteerDashboardStats(String volunteerEmail) {
        User volunteer = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found"));

        long availableTasks = volunteerTaskRepository.countByStatus(VolunteerTaskStatus.AVAILABLE);
        long assignedTasks = volunteerTaskRepository.countByVolunteerAndStatus(volunteer, VolunteerTaskStatus.ACCEPTED);
        long pickedUpTasks = volunteerTaskRepository.countByVolunteerAndStatus(volunteer, VolunteerTaskStatus.PICKED_UP);
        long deliveredTasks = volunteerTaskRepository.countByVolunteerAndStatus(volunteer, VolunteerTaskStatus.DELIVERED);

        return Map.of(
                "availableTasks", availableTasks,
                "assignedTasks", assignedTasks,
                "pickedUpTasks", pickedUpTasks,
                "deliveredTasks", deliveredTasks,
                "totalCompleted", deliveredTasks
        );
    }

    private VolunteerTaskResponse mapWithNgoDetails(VolunteerTask task) {
        VolunteerTaskResponse resp = mapper.toVolunteerTaskResponse(task);
        if (task.getDonation() != null) {
            donationRequestRepository.findByDonation(task.getDonation()).stream()
                    .filter(r -> r.getStatus() == RequestStatus.ACCEPTED || r.getStatus() == RequestStatus.PICKED_UP || r.getStatus() == RequestStatus.COMPLETED)
                    .findFirst()
                    .ifPresent(r -> {
                        if (r.getNgo() != null) {
                            resp.setDeliveryNgoName(r.getNgo().getNgoName());
                            resp.setDeliveryAddress(r.getNgo().getAddress() + ", " + r.getNgo().getCity());
                            resp.setDeliveryContact(r.getNgo().getContactPerson() + " (" + r.getNgo().getPhone() + ")");
                        }
                    });
        }
        return resp;
    }
}
