package com.foodwaste.analytics;

import com.foodwaste.dto.AdminAnalyticsDTO;
import com.foodwaste.dto.DonorAnalyticsDTO;
import com.foodwaste.dto.NgoAnalyticsDTO;

public interface AnalyticsService {
    AdminAnalyticsDTO getAdminAnalytics();
    DonorAnalyticsDTO getDonorAnalytics(String donorEmail);
    NgoAnalyticsDTO getNgoAnalytics(String ngoEmail);
}
