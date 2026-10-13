package com.foodwaste.dto;

import com.foodwaste.entity.DonationStatus;
import com.foodwaste.entity.FoodType;
import jakarta.validation.constraints.Positive;
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
public class DonationUpdateDTO {
    private String foodName;
    private String description;
    private Long categoryId;
    private FoodType foodType;

    @Positive(message = "Quantity must be greater than zero")
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
    private String imageUrl;
    private DonationStatus status;
}
