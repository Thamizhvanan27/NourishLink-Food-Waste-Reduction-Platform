package com.foodwaste.service;

import com.foodwaste.dto.DonationCreateDTO;
import com.foodwaste.dto.DonationResponse;
import com.foodwaste.dto.DonationUpdateDTO;
import com.foodwaste.dto.PagedResponse;
import com.foodwaste.entity.DonationStatus;
import com.foodwaste.entity.FoodType;
import org.springframework.data.domain.Pageable;

public interface DonationService {
    DonationResponse createDonation(String donorEmail, DonationCreateDTO createDTO);
    DonationResponse updateDonation(String userEmail, Long id, DonationUpdateDTO updateDTO);
    void deleteDonation(String userEmail, Long id);
    DonationResponse getDonationById(Long id);
    PagedResponse<DonationResponse> getMyDonations(String donorEmail, DonationStatus status, String keyword, Pageable pageable);
    PagedResponse<DonationResponse> getAvailableDonations(Long categoryId, FoodType foodType, String city, String keyword, String sortBy, Pageable pageable);
    PagedResponse<DonationResponse> getAllDonationsForAdmin(DonationStatus status, Long categoryId, FoodType foodType, String keyword, Pageable pageable);

    java.util.List<com.foodwaste.dto.NearbyDonationResponse> getNearbyDonations(
            Double latitude, Double longitude, Double radiusKm, Long categoryId, FoodType foodType, DonationStatus status);

    PagedResponse<DonationResponse> searchDonations(
            String keyword, Long categoryId, FoodType foodType, String city,
            Double minQuantity, Double maxQuantity, Double radiusKm,
            Double latitude, Double longitude, String sort, Pageable pageable);
}
