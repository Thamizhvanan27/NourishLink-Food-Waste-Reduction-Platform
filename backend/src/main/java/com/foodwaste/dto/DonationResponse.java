package com.foodwaste.dto;

import com.foodwaste.entity.DonationStatus;
import com.foodwaste.entity.FoodType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationResponse {
    private Long id;
    private String foodName;
    private String description;
    private CategoryDTO category;
    private FoodType foodType;
    private Double quantity;
    private String quantityUnit;
    private LocalDate preparationDate;
    private LocalDateTime expiryDate;
    private String pickupStartTime;
    private String pickupEndTime;
    private String pickupAddress;
    private String city;
    private Double latitude;
    private Double longitude;
    private Double distance;
    private String imageUrl;
    private DonationStatus status;
    private UserResponse donor;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
