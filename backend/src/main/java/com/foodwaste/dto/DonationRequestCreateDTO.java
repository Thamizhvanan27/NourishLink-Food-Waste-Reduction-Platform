package com.foodwaste.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationRequestCreateDTO {

    @NotNull(message = "Donation ID is required")
    private Long donationId;

    private String message;
}
