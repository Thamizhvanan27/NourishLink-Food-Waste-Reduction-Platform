package com.foodwaste.controller;

import com.foodwaste.dto.*;
import com.foodwaste.entity.VolunteerTaskStatus;
import com.foodwaste.volunteer.VolunteerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Volunteer Module", description = "Endpoints for volunteer registration, tasks discovery, pickup, and delivery")
public class VolunteerController {

    private final VolunteerService volunteerService;

    @PostMapping("/api/volunteers/register")
    @Operation(summary = "Register as a food rescue volunteer")
    public ResponseEntity<ApiResponse<UserResponse>> registerVolunteer(
            @Valid @RequestBody VolunteerRegisterRequest request) {
        UserResponse response = volunteerService.registerVolunteer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Volunteer registered successfully", response));
    }

    @GetMapping("/api/volunteers/profile")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    @Operation(summary = "Get logged-in volunteer profile")
    public ResponseEntity<ApiResponse<VolunteerProfileDTO>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        VolunteerProfileDTO profile = volunteerService.getVolunteerProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/api/volunteers/profile")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    @Operation(summary = "Update logged-in volunteer profile")
    public ResponseEntity<ApiResponse<VolunteerProfileDTO>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VolunteerProfileDTO profileDTO) {
        VolunteerProfileDTO profile = volunteerService.updateVolunteerProfile(userDetails.getUsername(), profileDTO);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    @GetMapping("/api/volunteer/tasks")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    @Operation(summary = "Get tasks assigned to or accepted by the logged-in volunteer")
    public ResponseEntity<ApiResponse<PagedResponse<VolunteerTaskResponse>>> getMyTasks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) VolunteerTaskStatus status,
            @PageableDefault(size = 10) Pageable pageable) {
        PagedResponse<VolunteerTaskResponse> response = volunteerService.getMyTasks(userDetails.getUsername(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/volunteer/tasks/nearby")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    @Operation(summary = "Discover nearby available pickup tasks")
    public ResponseEntity<ApiResponse<List<VolunteerTaskResponse>>> getNearbyTasks(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false, defaultValue = "25.0") Double radius) {
        List<VolunteerTaskResponse> response = volunteerService.getNearbyAvailableTasks(latitude, longitude, radius);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/volunteer/tasks/{id}")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    @Operation(summary = "Get volunteer task details by ID")
    public ResponseEntity<ApiResponse<VolunteerTaskResponse>> getTaskById(@PathVariable Long id) {
        VolunteerTaskResponse response = volunteerService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/volunteer/tasks/{id}/accept")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    @Operation(summary = "Accept an available pickup task")
    public ResponseEntity<ApiResponse<VolunteerTaskResponse>> acceptTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        VolunteerTaskResponse response = volunteerService.acceptTask(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Pickup task accepted successfully", response));
    }

    @PutMapping("/api/volunteer/tasks/{id}/pickup")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    @Operation(summary = "Mark task food as picked up from donor")
    public ResponseEntity<ApiResponse<VolunteerTaskResponse>> markPickedUp(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        VolunteerTaskResponse response = volunteerService.markTaskPickedUp(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Food marked as picked up", response));
    }

    @PutMapping("/api/volunteer/tasks/{id}/deliver")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    @Operation(summary = "Mark task food as delivered to NGO")
    public ResponseEntity<ApiResponse<VolunteerTaskResponse>> markDelivered(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        VolunteerTaskResponse response = volunteerService.markTaskDelivered(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Food marked as delivered successfully", response));
    }

    @GetMapping("/api/volunteer/stats")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    @Operation(summary = "Get volunteer dashboard metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVolunteerStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> stats = volunteerService.getVolunteerDashboardStats(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
