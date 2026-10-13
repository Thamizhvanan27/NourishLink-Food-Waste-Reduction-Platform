package com.foodwaste.service;

import com.foodwaste.dto.ChangePasswordRequest;
import com.foodwaste.dto.LoginRequest;
import com.foodwaste.dto.LoginResponse;
import com.foodwaste.dto.RegisterRequest;
import com.foodwaste.dto.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    void changePassword(String userEmail, ChangePasswordRequest request);
    UserResponse getCurrentUserProfile(String userEmail);
    void forgotPassword(com.foodwaste.dto.ForgotPasswordRequest request);
    void resetPassword(com.foodwaste.dto.ResetPasswordRequest request);
}
