package com.foodwaste.service.impl;

import com.foodwaste.dto.*;
import com.foodwaste.entity.Ngo;
import com.foodwaste.entity.Role;
import com.foodwaste.entity.User;
import com.foodwaste.exception.BadRequestException;
import com.foodwaste.exception.DuplicateResourceException;
import com.foodwaste.exception.ForbiddenException;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.NgoRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.security.CustomUserDetails;
import com.foodwaste.security.JwtService;
import com.foodwaste.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final NgoRepository ngoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EntityMapper mapper;
    private final com.foodwaste.repository.PasswordResetTokenRepository passwordResetTokenRepository;
    private final com.foodwaste.email.EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new DuplicateResourceException("An account with this email already exists: " + request.getEmail());
        }

        if (request.getRole() == Role.ROLE_ADMIN) {
            throw new BadRequestException("Admin accounts cannot be registered publicly");
        }

        if (request.getRole() == Role.ROLE_NGO) {
            if (request.getRegistrationNumber() == null || request.getRegistrationNumber().isBlank()) {
                throw new BadRequestException("Registration number is required for NGO accounts");
            }
            if (ngoRepository.existsByRegistrationNumber(request.getRegistrationNumber().trim())) {
                throw new DuplicateResourceException("NGO registration number already exists: " + request.getRegistrationNumber());
            }
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .password(passwordEncoder.encode(request.getPassword()))
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .city(request.getCity().trim())
                .role(request.getRole())
                .enabled(true)
                .blocked(false)
                .build();

        User savedUser = userRepository.save(user);

        if (request.getRole() == Role.ROLE_NGO) {
            Ngo ngo = Ngo.builder()
                    .user(savedUser)
                    .ngoName(request.getNgoName() != null && !request.getNgoName().isBlank() ? request.getNgoName().trim() : savedUser.getFullName())
                    .registrationNumber(request.getRegistrationNumber().trim())
                    .contactPerson(request.getContactPerson() != null && !request.getContactPerson().isBlank() ? request.getContactPerson().trim() : savedUser.getFullName())
                    .email(savedUser.getEmail())
                    .phone(savedUser.getPhone())
                    .address(savedUser.getAddress())
                    .city(savedUser.getCity())
                    .description(request.getDescription())
                    .approved(false) // NGO requires Admin approval
                    .build();
            ngoRepository.save(ngo);
        }

        try {
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole().name());
        } catch (Exception e) {
            log.warn("Welcome email could not be sent: {}", e.getMessage());
        }

        return mapper.toUserResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (Boolean.TRUE.equals(user.getBlocked())) {
            throw new ForbiddenException("Your account has been blocked by administrator. Please contact support.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
            );
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("name", user.getFullName());

        Boolean approved = null;
        Long ngoId = null;
        if (user.getRole() == Role.ROLE_NGO) {
            Ngo ngo = ngoRepository.findByUser(user).orElse(null);
            if (ngo != null) {
                approved = ngo.getApproved();
                ngoId = ngo.getId();
                extraClaims.put("approved", approved);
                extraClaims.put("ngoId", ngoId);
            }
        }

        String token = jwtService.generateToken(userDetails, extraClaims);

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .approved(approved)
                .ngoId(ngoId)
                .build();
    }

    @Override
    @Transactional
    public void changePassword(String userEmail, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        userRepository.findByEmail(email).ifPresent(user -> {
            String token = java.util.UUID.randomUUID().toString();
            // Invalidate any existing unused tokens for user
            passwordResetTokenRepository.findByUserAndUsedFalse(user)
                    .ifPresent(existing -> {
                        existing.setUsed(true);
                        passwordResetTokenRepository.save(existing);
                    });

            com.foodwaste.entity.PasswordResetToken resetToken = com.foodwaste.entity.PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiryDate(java.time.LocalDateTime.now().plusMinutes(60))
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(resetToken);

            String resetLink = frontendUrl + "/reset-password?token=" + token;
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);
            log.info("Password reset token generated for user: {}", user.getEmail());
        });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        com.foodwaste.entity.PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken().trim())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new BadRequestException("This password reset link has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Password reset link has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        log.info("Password successfully updated for user: {}", user.getEmail());
    }
}
