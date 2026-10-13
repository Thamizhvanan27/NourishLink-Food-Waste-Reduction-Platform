package com.foodwaste.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NgoProfileUpdateDTO {
    private String ngoName;
    private String contactPerson;
    private String phone;
    private String address;
    private String city;
    private String description;
}
