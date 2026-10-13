package com.foodwaste.dto;

import com.foodwaste.entity.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationRequestResponse {
    private Long id;
    private DonationResponse donation;
    private NgoResponse ngo;
    private String message;
    private RequestStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime completedAt;
}
