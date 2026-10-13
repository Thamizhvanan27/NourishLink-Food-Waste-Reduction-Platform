package com.foodwaste.service;

import com.foodwaste.dto.DonationRequestCreateDTO;
import com.foodwaste.dto.DonationRequestResponse;
import com.foodwaste.dto.PagedResponse;
import com.foodwaste.entity.RequestStatus;
import org.springframework.data.domain.Pageable;

public interface DonationRequestService {
    DonationRequestResponse createRequest(String ngoEmail, DonationRequestCreateDTO requestDTO);
    DonationRequestResponse acceptRequest(String donorEmail, Long requestId);
    DonationRequestResponse rejectRequest(String donorEmail, Long requestId);
    DonationRequestResponse cancelRequest(String ngoEmail, Long requestId);
    DonationRequestResponse pickupRequest(String ngoEmail, Long requestId);
    DonationRequestResponse completeRequest(String ngoEmail, Long requestId);
    PagedResponse<DonationRequestResponse> getMyRequestsAsNgo(String ngoEmail, RequestStatus status, Pageable pageable);
    PagedResponse<DonationRequestResponse> getRequestsForDonor(String donorEmail, RequestStatus status, Pageable pageable);
    PagedResponse<DonationRequestResponse> getAllRequestsForAdmin(RequestStatus status, String keyword, Pageable pageable);
}
