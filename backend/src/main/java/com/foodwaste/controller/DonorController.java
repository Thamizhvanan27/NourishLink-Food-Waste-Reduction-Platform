package com.foodwaste.controller;

import com.foodwaste.dto.ApiResponse;
import com.foodwaste.dto.DonorDashboardResponse;
import com.foodwaste.service.DonorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
@Tag(name = "Donor Operations", description = "Endpoints for Donor dashboard and operations")
public class DonorController {

    private final DonorService donorService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    @Operation(summary = "Get Donor dashboard summary and statistics")
    public ResponseEntity<ApiResponse<DonorDashboardResponse>> getDonorDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        DonorDashboardResponse response = donorService.getDonorDashboard(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
