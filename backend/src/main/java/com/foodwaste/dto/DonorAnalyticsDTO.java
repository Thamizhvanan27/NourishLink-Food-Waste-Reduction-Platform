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
public class DonorAnalyticsDTO {
    private List<MonthlyMetricDTO> monthlyDonations;
    private List<MonthlyMetricDTO> monthlyFoodRescued;
    private List<DistributionItemDTO> statusDistribution;
    private List<DistributionItemDTO> categoryDistribution;
    private Double totalFoodDonatedKg;
    private Double totalFoodRescuedKg;
    private Long completedDonations;
    private Long estimatedMealsProvided;
    private Double averageRating;
    private Long totalRatingsCount;
}
