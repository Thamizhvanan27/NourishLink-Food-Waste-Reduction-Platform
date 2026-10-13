package com.foodwaste.dto;

import com.foodwaste.entity.VolunteerTaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerTaskResponse {
    private Long id;
    private Long donationId;
    private String foodName;
    private Double quantity;
    private String quantityUnit;
    private String categoryName;
    private String pickupAddress;
    private String pickupCity;
    private String pickupStartTime;
    private String pickupEndTime;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private String deliveryAddress;
    private String deliveryNgoName;
    private String deliveryContact;
    private Double distance; // in KM
    private Long volunteerId;
    private String volunteerName;
    private VolunteerTaskStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime assignedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
}
