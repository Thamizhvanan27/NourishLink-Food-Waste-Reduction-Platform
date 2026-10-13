package com.foodwaste.controller;

import com.foodwaste.dto.*;
import com.foodwaste.entity.DonationStatus;
import com.foodwaste.entity.FoodType;
import com.foodwaste.service.DonationService;
import com.foodwaste.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
@Tag(name = "Donations", description = "Endpoints for managing surplus food donations")
public class DonationController {

    private final DonationService donationService;
    private final FileStorageService fileStorageService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    @Operation(summary = "Create a new food donation (Donor only)")
    public ResponseEntity<ApiResponse<DonationResponse>> createDonation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DonationCreateDTO createDTO) {
        DonationResponse response = donationService.createDonation(userDetails.getUsername(), createDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Food donation created successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    @Operation(summary = "Get all donations created by the logged-in donor")
    public ResponseEntity<ApiResponse<PagedResponse<DonationResponse>>> getMyDonations(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) DonationStatus status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        PagedResponse<DonationResponse> response = donationService.getMyDonations(
                userDetails.getUsername(), status, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/available")
    @Operation(summary = "Get all available, non-expired food donations with search, filtering and sorting")
    public ResponseEntity<ApiResponse<PagedResponse<DonationResponse>>> getAvailableDonations(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) FoodType foodType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "latest") String sortBy,
            @PageableDefault(size = 12) Pageable pageable) {
        PagedResponse<DonationResponse> response = donationService.getAvailableDonations(
                categoryId, foodType, city, keyword, sortBy, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find nearby donations based on geographic coordinates and radius (Haversine formula)")
    public ResponseEntity<ApiResponse<java.util.List<com.foodwaste.dto.NearbyDonationResponse>>> getNearbyDonations(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false, defaultValue = "10.0") Double radius,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) FoodType foodType,
            @RequestParam(required = false) DonationStatus status) {
        java.util.List<com.foodwaste.dto.NearbyDonationResponse> response = donationService.getNearbyDonations(
                latitude, longitude, radius, categoryId, foodType, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @Operation(summary = "Advanced donation search with backend filtering, radius calculation and pagination")
    public ResponseEntity<ApiResponse<PagedResponse<DonationResponse>>> searchDonations(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) FoodType foodType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minQuantity,
            @RequestParam(required = false) Double maxQuantity,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false, defaultValue = "latest") String sort,
            @PageableDefault(size = 12) Pageable pageable) {
        PagedResponse<DonationResponse> response = donationService.searchDonations(
                keyword, categoryId, foodType, city, minQuantity, maxQuantity, radius, latitude, longitude, sort, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get donation details by ID")
    public ResponseEntity<ApiResponse<DonationResponse>> getDonationById(@PathVariable Long id) {
        DonationResponse response = donationService.getDonationById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing donation (Owner or Admin)")
    public ResponseEntity<ApiResponse<DonationResponse>> updateDonation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody DonationUpdateDTO updateDTO) {
        DonationResponse response = donationService.updateDonation(userDetails.getUsername(), id, updateDTO);
        return ResponseEntity.ok(ApiResponse.success("Donation updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a donation (Owner or Admin)")
    public ResponseEntity<ApiResponse<String>> deleteDonation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        donationService.deleteDonation(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Donation deleted successfully", null));
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    @Operation(summary = "Upload a food donation image (JPG, JPEG, PNG)")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.storeFile(file);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", Map.of("imageUrl", fileUrl)));
    }
}
