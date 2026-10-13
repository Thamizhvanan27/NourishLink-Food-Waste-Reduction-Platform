package com.foodwaste.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NgoResponse {
    private Long id;
    private Long userId;
    private String ngoName;
    private String registrationNumber;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String description;
    private Boolean approved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
