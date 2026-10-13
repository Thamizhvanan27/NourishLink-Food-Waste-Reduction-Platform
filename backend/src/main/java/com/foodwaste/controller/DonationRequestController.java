package com.foodwaste.controller;

import com.foodwaste.dto.ApiResponse;
import com.foodwaste.dto.DonationRequestCreateDTO;
import com.foodwaste.dto.DonationRequestResponse;
import com.foodwaste.dto.PagedResponse;
import com.foodwaste.entity.RequestStatus;
import com.foodwaste.service.DonationRequestService;
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

@RestController
@RequestMapping("/api/donation-requests")
@RequiredArgsConstructor
@Tag(name = "Donation Requests", description = "Endpoints for requesting, accepting, picking up, and completing food donations")
public class DonationRequestController {

    private final DonationRequestService requestService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_NGO')")
    @Operation(summary = "Submit a request for available food (Approved NGO only)")
    public ResponseEntity<ApiResponse<DonationRequestResponse>> createRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DonationRequestCreateDTO requestDTO) {
        DonationRequestResponse response = requestService.createRequest(userDetails.getUsername(), requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Food donation requested successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_NGO')")
    @Operation(summary = "Get request history for the logged-in NGO")
    public ResponseEntity<ApiResponse<PagedResponse<DonationRequestResponse>>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) RequestStatus status,
            @PageableDefault(size = 10, sort = "requestedAt") Pageable pageable) {
        PagedResponse<DonationRequestResponse> response = requestService.getMyRequestsAsNgo(
                userDetails.getUsername(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/donor")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    @Operation(summary = "Get incoming requests for donor's food donations")
    public ResponseEntity<ApiResponse<PagedResponse<DonationRequestResponse>>> getRequestsForDonor(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) RequestStatus status,
            @PageableDefault(size = 10, sort = "requestedAt") Pageable pageable) {
        PagedResponse<DonationRequestResponse> response = requestService.getRequestsForDonor(
                userDetails.getUsername(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    @Operation(summary = "Accept an NGO food request (Donor only)")
    public ResponseEntity<ApiResponse<DonationRequestResponse>> acceptRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        DonationRequestResponse response = requestService.acceptRequest(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Request accepted successfully", response));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    @Operation(summary = "Reject an NGO food request (Donor only)")
    public ResponseEntity<ApiResponse<DonationRequestResponse>> rejectRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        DonationRequestResponse response = requestService.rejectRequest(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Request rejected", response));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('ROLE_NGO')")
    @Operation(summary = "Cancel a pending request (Requesting NGO only)")
    public ResponseEntity<ApiResponse<DonationRequestResponse>> cancelRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        DonationRequestResponse response = requestService.cancelRequest(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Request cancelled successfully", response));
    }

    @PutMapping("/{id}/pickup")
    @PreAuthorize("hasAuthority('ROLE_NGO')")
    @Operation(summary = "Mark donation as picked up (Assigned NGO only)")
    public ResponseEntity<ApiResponse<DonationRequestResponse>> pickupRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        DonationRequestResponse response = requestService.pickupRequest(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Food marked as picked up", response));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAuthority('ROLE_NGO')")
    @Operation(summary = "Mark donation as completed / distributed (Assigned NGO only)")
    public ResponseEntity<ApiResponse<DonationRequestResponse>> completeRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        DonationRequestResponse response = requestService.completeRequest(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Donation completed successfully", response));
    }
}
