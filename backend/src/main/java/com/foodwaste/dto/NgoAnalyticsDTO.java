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
public class NgoAnalyticsDTO {
    private List<MonthlyMetricDTO> monthlyRequests;
    private List<MonthlyMetricDTO> monthlyPickups;
    private List<MonthlyMetricDTO> foodReceivedPerMonth;
    private List<DistributionItemDTO> statusDistribution;
    private Double totalFoodReceivedKg;
    private Long completedPickups;
    private Long estimatedMealsDistributed;
    private Double averageRating;
    private Long totalRatingsCount;
}
