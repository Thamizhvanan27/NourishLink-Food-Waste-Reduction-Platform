package com.foodwaste.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonorDashboardResponse {
    private long totalDonations;
    private long availableDonations;
    private long requestedDonations;
    private long acceptedDonations;
    private long completedDonations;
    private long cancelledDonations;
    private List<DonationResponse> recentDonations;
}
