package com.foodwaste.volunteer;

import com.foodwaste.dto.*;
import com.foodwaste.entity.VolunteerTask;
import com.foodwaste.entity.VolunteerTaskStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface VolunteerService {

    UserResponse registerVolunteer(VolunteerRegisterRequest request);

    VolunteerProfileDTO getVolunteerProfile(String volunteerEmail);

    VolunteerProfileDTO updateVolunteerProfile(String volunteerEmail, VolunteerProfileDTO profileDTO);

    VolunteerTask createPickupTaskForDonation(com.foodwaste.entity.Donation donation);

    PagedResponse<VolunteerTaskResponse> getMyTasks(String volunteerEmail, VolunteerTaskStatus status, Pageable pageable);

    List<VolunteerTaskResponse> getNearbyAvailableTasks(Double latitude, Double longitude, Double radiusKm);

    VolunteerTaskResponse getTaskById(Long taskId);

    VolunteerTaskResponse acceptTask(String volunteerEmail, Long taskId);

    VolunteerTaskResponse markTaskPickedUp(String volunteerEmail, Long taskId);

    VolunteerTaskResponse markTaskDelivered(String volunteerEmail, Long taskId);

    Map<String, Object> getVolunteerDashboardStats(String volunteerEmail);
}
