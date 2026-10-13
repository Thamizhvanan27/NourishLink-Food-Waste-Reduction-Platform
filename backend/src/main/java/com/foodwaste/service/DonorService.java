package com.foodwaste.service;

import com.foodwaste.dto.DonorDashboardResponse;

public interface DonorService {
    DonorDashboardResponse getDonorDashboard(String donorEmail);
}
