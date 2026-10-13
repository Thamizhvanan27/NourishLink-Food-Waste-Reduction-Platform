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
public class AdminAnalyticsDTO {
    private List<MonthlyMetricDTO> donationsPerMonth;
    private List<MonthlyMetricDTO> foodRescuedPerMonth;
    private List<DistributionItemDTO> statusDistribution;
    private List<DistributionItemDTO> categoryDistribution;
    private List<DistributionItemDTO> cityDistribution;
    private Double totalFoodRescuedKg;
    private Long totalEstimatedMeals;
    private Long totalCompletedDonations;
    private Long totalActiveDonors;
    private Long totalActiveNgos;
    private Long totalVolunteers;
    private Double foodToMealRatio;
}
