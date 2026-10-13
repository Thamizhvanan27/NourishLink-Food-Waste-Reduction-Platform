package com.foodwaste.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyMetricDTO {
    private String month;       // e.g. "Jan 2026" or "2026-01"
    private Long count;         // number of donations / requests
    private Double value;       // weight in KG or other numerical metric
}
