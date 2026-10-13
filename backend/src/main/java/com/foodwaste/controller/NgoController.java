package com.foodwaste.controller;

import com.foodwaste.dto.ApiResponse;
import com.foodwaste.dto.NgoDashboardResponse;
import com.foodwaste.dto.NgoProfileUpdateDTO;
import com.foodwaste.dto.NgoResponse;
import com.foodwaste.service.NgoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ngos")
@RequiredArgsConstructor
@Tag(name = "NGO Operations", description = "Endpoints for NGO profile and dashboard")
public class NgoController {

    private final NgoService ngoService;

    @GetMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_NGO')")
    @Operation(summary = "Get current NGO profile details")
    public ResponseEntity<ApiResponse<NgoResponse>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        NgoResponse response = ngoService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_NGO')")
    @Operation(summary = "Update NGO profile details")
    public ResponseEntity<ApiResponse<NgoResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody NgoProfileUpdateDTO updateDTO) {
        NgoResponse response = ngoService.updateProfile(userDetails.getUsername(), updateDTO);
        return ResponseEntity.ok(ApiResponse.success("NGO profile updated successfully", response));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ROLE_NGO')")
    @Operation(summary = "Get NGO dashboard statistics")
    public ResponseEntity<ApiResponse<NgoDashboardResponse>> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        NgoDashboardResponse response = ngoService.getDashboardStats(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
