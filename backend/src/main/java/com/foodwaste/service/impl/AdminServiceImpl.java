package com.foodwaste.service.impl;

import com.foodwaste.dto.AdminDashboardResponse;
import com.foodwaste.dto.NgoResponse;
import com.foodwaste.dto.PagedResponse;
import com.foodwaste.dto.UserResponse;
import com.foodwaste.entity.DonationStatus;
import com.foodwaste.entity.Ngo;
import com.foodwaste.entity.RequestStatus;
import com.foodwaste.entity.Role;
import com.foodwaste.entity.User;
import com.foodwaste.exception.BadRequestException;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.DonationRequestRepository;
import com.foodwaste.repository.NgoRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final NgoRepository ngoRepository;
    private final DonationRepository donationRepository;
    private final DonationRequestRepository requestRepository;
    private final EntityMapper mapper;
    private final com.foodwaste.service.NotificationService notificationService;
    private final com.foodwaste.email.EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalDonors = userRepository.countByRole(Role.ROLE_DONOR);
        long totalNgos = userRepository.countByRole(Role.ROLE_NGO);
        long approvedNgos = ngoRepository.countByApproved(true);
        long pendingNgos = ngoRepository.countByApproved(false);

        long totalDonations = donationRepository.count();
        long availableDonations = donationRepository.countActiveAvailable(LocalDateTime.now());
        long completedDonations = donationRepository.countByStatus(DonationStatus.COMPLETED);
        long expiredDonations = donationRepository.countExpiredDonations(LocalDateTime.now());
        long pendingRequests = requestRepository.countByStatus(RequestStatus.PENDING);

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalDonors(totalDonors)
                .totalNgos(totalNgos)
                .approvedNgos(approvedNgos)
                .pendingNgos(pendingNgos)
                .totalDonations(totalDonations)
                .availableDonations(availableDonations)
                .completedDonations(completedDonations)
                .expiredDonations(expiredDonations)
                .pendingRequests(pendingRequests)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsers(Role role, String keyword, Pageable pageable) {
        Page<User> page = userRepository.searchUsers(role, keyword, pageable);
        List<UserResponse> dtoList = page.getContent().stream()
                .map(mapper::toUserResponse)
                .collect(Collectors.toList());
        return PagedResponse.of(page, dtoList);
    }

    @Override
    @Transactional
    public UserResponse blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new BadRequestException("Admin user cannot be blocked");
        }

        user.setBlocked(true);
        return mapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setBlocked(false);
        return mapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<NgoResponse> getNgos(Boolean approved, String keyword, Pageable pageable) {
        Page<Ngo> page = ngoRepository.searchNgos(approved, keyword, pageable);
        List<NgoResponse> dtoList = page.getContent().stream()
                .map(mapper::toNgoResponse)
                .collect(Collectors.toList());
        return PagedResponse.of(page, dtoList);
    }

    @Override
    @Transactional
    public NgoResponse approveNgo(Long ngoId) {
        Ngo ngo = ngoRepository.findById(ngoId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found with id: " + ngoId));

        ngo.setApproved(true);
        Ngo saved = ngoRepository.save(ngo);

        notificationService.createAndSendNotification(
                ngo.getUser(),
                "NGO Account Approved!",
                "Your NGO account has been approved by the platform administration. You can now request food donations.",
                com.foodwaste.entity.NotificationType.SYSTEM,
                ngo.getId()
        );

        try {
            emailService.sendNgoApprovalEmail(ngo.getUser().getEmail(), ngo.getNgoName());
        } catch (Exception e) {
            // Log and continue
        }

        return mapper.toNgoResponse(saved);
    }

    @Override
    @Transactional
    public NgoResponse rejectNgo(Long ngoId) {
        Ngo ngo = ngoRepository.findById(ngoId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found with id: " + ngoId));

        ngo.setApproved(false);
        Ngo saved = ngoRepository.save(ngo);

        notificationService.createAndSendNotification(
                ngo.getUser(),
                "NGO Verification Update",
                "Your NGO account was not approved by administration at this time.",
                com.foodwaste.entity.NotificationType.SYSTEM,
                ngo.getId()
        );

        try {
            emailService.sendNgoRejectionEmail(ngo.getUser().getEmail(), ngo.getNgoName(), "Account credentials could not be verified");
        } catch (Exception e) {
            // Log and continue
        }

        return mapper.toNgoResponse(saved);
    }
}
