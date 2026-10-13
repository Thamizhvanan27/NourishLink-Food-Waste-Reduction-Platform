package com.foodwaste.dto;

import com.foodwaste.entity.DonationStatus;
import com.foodwaste.entity.FoodType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyDonationResponse {
    private Long id;
    private String foodName;
    private String description;
    private CategoryDTO category;
    private FoodType foodType;
    private Double quantity;
    private String quantityUnit;
    private LocalDateTime expiryDate;
    private String pickupStartTime;
    private String pickupEndTime;
    private String pickupAddress;
    private String city;
    private String imageUrl;
    private DonationStatus status;
    private Double latitude;
    private Double longitude;
    private Double distance; // in KM
    private UserResponse donor;
    private LocalDateTime createdAt;
}
