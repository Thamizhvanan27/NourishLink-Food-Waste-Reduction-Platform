package com.foodwaste.dto;

import com.foodwaste.entity.FoodType;
import jakarta.validation.constraints.*;
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
public class DonationCreateDTO {

    @NotBlank(message = "Food name is required")
    @Size(max = 150, message = "Food name cannot exceed 150 characters")
    private String foodName;

    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Food type is required")
    private FoodType foodType;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Double quantity;

    @NotBlank(message = "Quantity unit is required (e.g. kg, servings, packets)")
    private String quantityUnit;

    private LocalDate preparationDate;

    @NotNull(message = "Expiry date is required")
    @Future(message = "Expiry date must be in the future")
    private LocalDateTime expiryDate;

    private String pickupStartTime;
    private String pickupEndTime;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    @NotBlank(message = "City is required")
    private String city;

    private Double latitude;
    private Double longitude;

    private String imageUrl;
}
