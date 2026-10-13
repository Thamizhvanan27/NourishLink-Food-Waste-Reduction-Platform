package com.foodwaste.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalDonors;
    private long totalNgos;
    private long approvedNgos;
    private long pendingNgos;
    private long totalDonations;
    private long availableDonations;
    private long completedDonations;
    private long expiredDonations;
    private long pendingRequests;
}
