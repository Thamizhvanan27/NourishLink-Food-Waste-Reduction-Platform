package com.foodwaste.service;

import com.foodwaste.dto.AdminDashboardResponse;
import com.foodwaste.dto.NgoResponse;
import com.foodwaste.dto.PagedResponse;
import com.foodwaste.dto.UserResponse;
import com.foodwaste.entity.Role;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    AdminDashboardResponse getDashboardStats();
    PagedResponse<UserResponse> getUsers(Role role, String keyword, Pageable pageable);
    UserResponse blockUser(Long userId);
    UserResponse unblockUser(Long userId);
    PagedResponse<NgoResponse> getNgos(Boolean approved, String keyword, Pageable pageable);
    NgoResponse approveNgo(Long ngoId);
    NgoResponse rejectNgo(Long ngoId);
}
