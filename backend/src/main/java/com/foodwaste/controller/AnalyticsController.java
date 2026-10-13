package com.foodwaste.controller;

import com.foodwaste.analytics.AnalyticsService;
import com.foodwaste.dto.AdminAnalyticsDTO;
import com.foodwaste.dto.ApiResponse;
import com.foodwaste.dto.DonorAnalyticsDTO;
import com.foodwaste.dto.NgoAnalyticsDTO;
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
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Endpoints for charts and visual impact analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get platform-wide analytics for admin dashboards")
    public ResponseEntity<ApiResponse<AdminAnalyticsDTO>> getAdminAnalytics() {
        AdminAnalyticsDTO analytics = analyticsService.getAdminAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/donor")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    @Operation(summary = "Get personalized analytics for food donors")
    public ResponseEntity<ApiResponse<DonorAnalyticsDTO>> getDonorAnalytics(
            @AuthenticationPrincipal UserDetails userDetails) {
        DonorAnalyticsDTO analytics = analyticsService.getDonorAnalytics(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/ngo")
    @PreAuthorize("hasAuthority('ROLE_NGO')")
    @Operation(summary = "Get operational analytics for NGOs")
    public ResponseEntity<ApiResponse<NgoAnalyticsDTO>> getNgoAnalytics(
            @AuthenticationPrincipal UserDetails userDetails) {
        NgoAnalyticsDTO analytics = analyticsService.getNgoAnalytics(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
