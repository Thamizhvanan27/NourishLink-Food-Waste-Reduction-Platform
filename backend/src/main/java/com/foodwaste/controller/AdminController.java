package com.foodwaste.controller;

import com.foodwaste.dto.*;
import com.foodwaste.entity.DonationStatus;
import com.foodwaste.entity.FoodType;
import com.foodwaste.entity.RequestStatus;
import com.foodwaste.entity.Role;
import com.foodwaste.service.AdminService;
import com.foodwaste.service.DonationRequestService;
import com.foodwaste.service.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Operations", description = "Endpoints for platform administration, user management, NGO approvals, and donation monitoring")
public class AdminController {

    private final AdminService adminService;
    private final DonationService donationService;
    private final DonationRequestService donationRequestService;
    private final com.foodwaste.service.SystemSettingService systemSettingService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get comprehensive admin dashboard statistics")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboardStats() {
        AdminDashboardResponse response = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/users")
    @Operation(summary = "Get list of all users with optional filtering and search")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        PagedResponse<UserResponse> response = adminService.getUsers(role, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/users/{id}/block")
    @Operation(summary = "Block a user from performing platform operations")
    public ResponseEntity<ApiResponse<UserResponse>> blockUser(@PathVariable Long id) {
        UserResponse response = adminService.blockUser(id);
        return ResponseEntity.ok(ApiResponse.success("User blocked successfully", response));
    }

    @PutMapping("/users/{id}/unblock")
    @Operation(summary = "Unblock a blocked user")
    public ResponseEntity<ApiResponse<UserResponse>> unblockUser(@PathVariable Long id) {
        UserResponse response = adminService.unblockUser(id);
        return ResponseEntity.ok(ApiResponse.success("User unblocked successfully", response));
    }

    @GetMapping("/ngos")
    @Operation(summary = "Get list of NGOs by approval status")
    public ResponseEntity<ApiResponse<PagedResponse<NgoResponse>>> getNgos(
            @RequestParam(required = false) Boolean approved,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        PagedResponse<NgoResponse> response = adminService.getNgos(approved, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/ngos/{id}/approve")
    @Operation(summary = "Approve an NGO registration")
    public ResponseEntity<ApiResponse<NgoResponse>> approveNgo(@PathVariable Long id) {
        NgoResponse response = adminService.approveNgo(id);
        return ResponseEntity.ok(ApiResponse.success("NGO approved successfully", response));
    }

    @PutMapping("/ngos/{id}/reject")
    @Operation(summary = "Reject or revoke an NGO approval")
    public ResponseEntity<ApiResponse<NgoResponse>> rejectNgo(@PathVariable Long id) {
        NgoResponse response = adminService.rejectNgo(id);
        return ResponseEntity.ok(ApiResponse.success("NGO approval rejected/revoked", response));
    }

    @GetMapping("/donations")
    @Operation(summary = "Get all platform donations with status and category filtering")
    public ResponseEntity<ApiResponse<PagedResponse<DonationResponse>>> getAllDonations(
            @RequestParam(required = false) DonationStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) FoodType foodType,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        PagedResponse<DonationResponse> response = donationService.getAllDonationsForAdmin(
                status, categoryId, foodType, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/donations/{id}")
    @Operation(summary = "Delete an inappropriate donation as Admin")
    public ResponseEntity<ApiResponse<String>> deleteDonation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        donationService.deleteDonation(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Donation deleted by admin", null));
    }

    @GetMapping("/requests")
    @Operation(summary = "View all donation requests across the platform")
    public ResponseEntity<ApiResponse<PagedResponse<DonationRequestResponse>>> getAllRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "requestedAt") Pageable pageable) {
        PagedResponse<DonationRequestResponse> response = donationRequestService.getAllRequestsForAdmin(
                status, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/settings")
    @Operation(summary = "Get all platform system settings")
    public ResponseEntity<ApiResponse<java.util.List<SystemSettingDTO>>> getAllSettings() {
        java.util.List<SystemSettingDTO> settings = systemSettingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @GetMapping("/settings/{key}")
    @Operation(summary = "Get specific system setting by key")
    public ResponseEntity<ApiResponse<SystemSettingDTO>> getSettingByKey(@PathVariable String key) {
        SystemSettingDTO setting = systemSettingService.getSettingByKey(key);
        return ResponseEntity.ok(ApiResponse.success(setting));
    }

    @PutMapping("/settings/{key}")
    @Operation(summary = "Update specific system setting value and description")
    public ResponseEntity<ApiResponse<SystemSettingDTO>> updateSetting(
            @PathVariable String key,
            @RequestBody SystemSettingDTO settingDTO) {
        SystemSettingDTO updated = systemSettingService.updateSetting(
                key, settingDTO.getSettingValue(), settingDTO.getDescription());
        return ResponseEntity.ok(ApiResponse.success("Setting updated successfully", updated));
    }
}
