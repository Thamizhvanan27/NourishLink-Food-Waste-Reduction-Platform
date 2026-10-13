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
public class NgoDashboardResponse {
    private long availableDonations;
    private long pendingRequests;
    private long acceptedDonations;
    private long pickedUpDonations;
    private long completedDonations;
    private List<DonationRequestResponse> recentRequests;
}
