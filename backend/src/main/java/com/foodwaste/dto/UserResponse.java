package com.foodwaste.dto;

import com.foodwaste.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private Role role;
    private Boolean enabled;
    private Boolean blocked;
    private LocalDateTime createdAt;
}
