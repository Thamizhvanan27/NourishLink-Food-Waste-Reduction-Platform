package com.foodwaste.service.impl;

import com.foodwaste.dto.DonationResponse;
import com.foodwaste.dto.DonorDashboardResponse;
import com.foodwaste.entity.DonationStatus;
import com.foodwaste.entity.User;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.service.DonorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonorServiceImpl implements DonorService {

    private final UserRepository userRepository;
    private final DonationRepository donationRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public DonorDashboardResponse getDonorDashboard(String donorEmail) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));

        long total = donationRepository.countByDonor(donor);
        long available = donationRepository.countByDonorAndStatus(donor, DonationStatus.AVAILABLE);
        long requested = donationRepository.countByDonorAndStatus(donor, DonationStatus.REQUESTED);
        long accepted = donationRepository.countByDonorAndStatus(donor, DonationStatus.ACCEPTED);
        long completed = donationRepository.countByDonorAndStatus(donor, DonationStatus.COMPLETED);
        long cancelled = donationRepository.countByDonorAndStatus(donor, DonationStatus.CANCELLED);

        List<DonationResponse> recent = donationRepository.findByDonor(
                donor,
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent().stream().map(mapper::toDonationResponse).collect(Collectors.toList());

        return DonorDashboardResponse.builder()
                .totalDonations(total)
                .availableDonations(available)
                .requestedDonations(requested)
                .acceptedDonations(accepted)
                .completedDonations(completed)
                .cancelledDonations(cancelled)
                .recentDonations(recent)
                .build();
    }
}
