package com.foodwaste.service;

import com.foodwaste.dto.LoginRequest;
import com.foodwaste.dto.LoginResponse;
import com.foodwaste.dto.RegisterRequest;
import com.foodwaste.dto.UserResponse;
import com.foodwaste.entity.Role;
import com.foodwaste.entity.User;
import com.foodwaste.exception.DuplicateResourceException;
import com.foodwaste.exception.ForbiddenException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.NgoRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.security.JwtService;
import com.foodwaste.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private NgoRepository ngoRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private EntityMapper mapper;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .fullName("John Donor")
                .email("donor@test.com")
                .password("encoded_pass")
                .role(Role.ROLE_DONOR)
                .city("City")
                .enabled(true)
                .blocked(false)
                .build();

        registerRequest = RegisterRequest.builder()
                .fullName("John Donor")
                .email("donor@test.com")
                .password("password123")
                .city("City")
                .role(Role.ROLE_DONOR)
                .build();
    }

    @Test
    void testRegisterSuccess() {
        when(userRepository.existsByEmail("donor@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(mapper.toUserResponse(any(User.class))).thenReturn(
                UserResponse.builder().id(1L).email("donor@test.com").fullName("John Donor").role(Role.ROLE_DONOR).build()
        );

        UserResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("donor@test.com", response.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
        verify(passwordEncoder, times(1)).encode("password123");
    }

    @Test
    void testRegisterDuplicateEmailThrowsException() {
        when(userRepository.existsByEmail("donor@test.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLoginSuccess() {
        LoginRequest loginRequest = new LoginRequest("donor@test.com", "password123");
        when(userRepository.findByEmail("donor@test.com")).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateToken(any(), any())).thenReturn("mocked-jwt-token");

        LoginResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.getToken());
        assertEquals("donor@test.com", response.getEmail());
    }

    @Test
    void testBlockedUserCannotLogin() {
        sampleUser.setBlocked(true);
        LoginRequest loginRequest = new LoginRequest("donor@test.com", "password123");
        when(userRepository.findByEmail("donor@test.com")).thenReturn(Optional.of(sampleUser));

        assertThrows(ForbiddenException.class, () -> authService.login(loginRequest));
        verify(authenticationManager, never()).authenticate(any());
    }
}
