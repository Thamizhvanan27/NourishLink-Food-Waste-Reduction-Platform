package com.foodwaste.service;

import com.foodwaste.dto.NgoDashboardResponse;
import com.foodwaste.dto.NgoProfileUpdateDTO;
import com.foodwaste.dto.NgoResponse;

public interface NgoService {
    NgoResponse getProfile(String ngoEmail);
    NgoResponse updateProfile(String ngoEmail, NgoProfileUpdateDTO updateDTO);
    NgoDashboardResponse getDashboardStats(String ngoEmail);
}
