package com.foodwaste.mapper;

import com.foodwaste.dto.*;
import com.foodwaste.entity.*;
import org.springframework.stereotype.Component;

@Component
public class EntityMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .city(user.getCity())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .blocked(user.getBlocked())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public CategoryDTO toCategoryDTO(Category category) {
        if (category == null) return null;
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.getActive())
                .build();
    }

    public NgoResponse toNgoResponse(Ngo ngo) {
        if (ngo == null) return null;
        return NgoResponse.builder()
                .id(ngo.getId())
                .userId(ngo.getUser() != null ? ngo.getUser().getId() : null)
                .ngoName(ngo.getNgoName())
                .registrationNumber(ngo.getRegistrationNumber())
                .contactPerson(ngo.getContactPerson())
                .email(ngo.getEmail())
                .phone(ngo.getPhone())
                .address(ngo.getAddress())
                .city(ngo.getCity())
                .description(ngo.getDescription())
                .approved(ngo.getApproved())
                .createdAt(ngo.getCreatedAt())
                .updatedAt(ngo.getUpdatedAt())
                .build();
    }

    public DonationResponse toDonationResponse(Donation donation) {
        if (donation == null) return null;
        return DonationResponse.builder()
                .id(donation.getId())
                .foodName(donation.getFoodName())
                .description(donation.getDescription())
                .category(toCategoryDTO(donation.getCategory()))
                .foodType(donation.getFoodType())
                .quantity(donation.getQuantity())
                .quantityUnit(donation.getQuantityUnit())
                .preparationDate(donation.getPreparationDate())
                .expiryDate(donation.getExpiryDate())
                .pickupStartTime(donation.getPickupStartTime())
                .pickupEndTime(donation.getPickupEndTime())
                .pickupAddress(donation.getPickupAddress())
                .city(donation.getCity())
                .latitude(donation.getLatitude())
                .longitude(donation.getLongitude())
                .imageUrl(donation.getImageUrl())
                .status(donation.getStatus())
                .donor(toUserResponse(donation.getDonor()))
                .createdAt(donation.getCreatedAt())
                .updatedAt(donation.getUpdatedAt())
                .build();
    }

    public NearbyDonationResponse toNearbyDonationResponse(Donation donation, Double distance) {
        if (donation == null) return null;
        return NearbyDonationResponse.builder()
                .id(donation.getId())
                .foodName(donation.getFoodName())
                .description(donation.getDescription())
                .category(toCategoryDTO(donation.getCategory()))
                .foodType(donation.getFoodType())
                .quantity(donation.getQuantity())
                .quantityUnit(donation.getQuantityUnit())
                .expiryDate(donation.getExpiryDate())
                .pickupStartTime(donation.getPickupStartTime())
                .pickupEndTime(donation.getPickupEndTime())
                .pickupAddress(donation.getPickupAddress())
                .city(donation.getCity())
                .latitude(donation.getLatitude())
                .longitude(donation.getLongitude())
                .distance(distance != null ? Math.round(distance * 100.0) / 100.0 : null)
                .imageUrl(donation.getImageUrl())
                .status(donation.getStatus())
                .donor(toUserResponse(donation.getDonor()))
                .createdAt(donation.getCreatedAt())
                .build();
    }

    public DonationRequestResponse toDonationRequestResponse(DonationRequest request) {
        if (request == null) return null;
        return DonationRequestResponse.builder()
                .id(request.getId())
                .donation(toDonationResponse(request.getDonation()))
                .ngo(toNgoResponse(request.getNgo()))
                .message(request.getMessage())
                .status(request.getStatus())
                .requestedAt(request.getRequestedAt())
                .acceptedAt(request.getAcceptedAt())
                .pickedUpAt(request.getPickedUpAt())
                .completedAt(request.getCompletedAt())
                .build();
    }

    public NotificationResponse toNotificationResponse(Notification notification) {
        if (notification == null) return null;
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser() != null ? notification.getUser().getId() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .read(notification.getRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    public RatingResponse toRatingResponse(Rating rating) {
        if (rating == null) return null;
        return RatingResponse.builder()
                .id(rating.getId())
                .donationId(rating.getDonation() != null ? rating.getDonation().getId() : null)
                .foodName(rating.getDonation() != null ? rating.getDonation().getFoodName() : null)
                .reviewerId(rating.getReviewer() != null ? rating.getReviewer().getId() : null)
                .reviewerName(rating.getReviewer() != null ? rating.getReviewer().getFullName() : null)
                .reviewedUserId(rating.getReviewedUser() != null ? rating.getReviewedUser().getId() : null)
                .reviewedUserName(rating.getReviewedUser() != null ? rating.getReviewedUser().getFullName() : null)
                .rating(rating.getRating())
                .feedback(rating.getFeedback())
                .createdAt(rating.getCreatedAt())
                .build();
    }

    public VolunteerTaskResponse toVolunteerTaskResponse(VolunteerTask task) {
        if (task == null) return null;
        Donation donation = task.getDonation();
        return VolunteerTaskResponse.builder()
                .id(task.getId())
                .donationId(donation != null ? donation.getId() : null)
                .foodName(donation != null ? donation.getFoodName() : null)
                .quantity(donation != null ? donation.getQuantity() : null)
                .quantityUnit(donation != null ? donation.getQuantityUnit() : null)
                .categoryName(donation != null && donation.getCategory() != null ? donation.getCategory().getName() : null)
                .pickupAddress(donation != null ? donation.getPickupAddress() : null)
                .pickupCity(donation != null ? donation.getCity() : null)
                .pickupStartTime(donation != null ? donation.getPickupStartTime() : null)
                .pickupEndTime(donation != null ? donation.getPickupEndTime() : null)
                .pickupLatitude(donation != null ? donation.getLatitude() : null)
                .pickupLongitude(donation != null ? donation.getLongitude() : null)
                .volunteerId(task.getVolunteer() != null ? task.getVolunteer().getId() : null)
                .volunteerName(task.getVolunteer() != null ? task.getVolunteer().getFullName() : null)
                .status(task.getStatus())
                .createdAt(task.getCreatedAt())
                .assignedAt(task.getAssignedAt())
                .acceptedAt(task.getAcceptedAt())
                .pickedUpAt(task.getPickedUpAt())
                .deliveredAt(task.getDeliveredAt())
                .build();
    }

    public VolunteerProfileDTO toVolunteerProfileDTO(VolunteerProfile profile) {
        if (profile == null) return null;
        return VolunteerProfileDTO.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .fullName(profile.getUser() != null ? profile.getUser().getFullName() : null)
                .email(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .city(profile.getCity())
                .latitude(profile.getLatitude())
                .longitude(profile.getLongitude())
                .availability(profile.getAvailability())
                .vehicleType(profile.getVehicleType())
                .active(profile.getActive())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    public SystemSettingDTO toSystemSettingDTO(SystemSetting setting) {
        if (setting == null) return null;
        return SystemSettingDTO.builder()
                .id(setting.getId())
                .settingKey(setting.getSettingKey())
                .settingValue(setting.getSettingValue())
                .description(setting.getDescription())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
}
