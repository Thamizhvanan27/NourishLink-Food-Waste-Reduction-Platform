package com.foodwaste.service.impl;

import com.foodwaste.dto.DonationRequestResponse;
import com.foodwaste.dto.NgoDashboardResponse;
import com.foodwaste.dto.NgoProfileUpdateDTO;
import com.foodwaste.dto.NgoResponse;
import com.foodwaste.entity.Ngo;
import com.foodwaste.entity.RequestStatus;
import com.foodwaste.entity.User;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.DonationRequestRepository;
import com.foodwaste.repository.NgoRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.service.NgoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NgoServiceImpl implements NgoService {

    private final NgoRepository ngoRepository;
    private final UserRepository userRepository;
    private final DonationRepository donationRepository;
    private final DonationRequestRepository requestRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public NgoResponse getProfile(String ngoEmail) {
        User user = userRepository.findByEmail(ngoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Ngo ngo = ngoRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("NGO profile not found"));

        return mapper.toNgoResponse(ngo);
    }

    @Override
    @Transactional
    public NgoResponse updateProfile(String ngoEmail, NgoProfileUpdateDTO updateDTO) {
        User user = userRepository.findByEmail(ngoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Ngo ngo = ngoRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("NGO profile not found"));

        if (updateDTO.getNgoName() != null && !updateDTO.getNgoName().isBlank()) {
            ngo.setNgoName(updateDTO.getNgoName().trim());
        }
        if (updateDTO.getContactPerson() != null && !updateDTO.getContactPerson().isBlank()) {
            ngo.setContactPerson(updateDTO.getContactPerson().trim());
        }
        if (updateDTO.getPhone() != null) {
            ngo.setPhone(updateDTO.getPhone().trim());
            user.setPhone(updateDTO.getPhone().trim());
        }
        if (updateDTO.getAddress() != null) {
            ngo.setAddress(updateDTO.getAddress().trim());
            user.setAddress(updateDTO.getAddress().trim());
        }
        if (updateDTO.getCity() != null && !updateDTO.getCity().isBlank()) {
            ngo.setCity(updateDTO.getCity().trim());
            user.setCity(updateDTO.getCity().trim());
        }
        if (updateDTO.getDescription() != null) {
            ngo.setDescription(updateDTO.getDescription());
        }

        userRepository.save(user);
        return mapper.toNgoResponse(ngoRepository.save(ngo));
    }

    @Override
    @Transactional(readOnly = true)
    public NgoDashboardResponse getDashboardStats(String ngoEmail) {
        User user = userRepository.findByEmail(ngoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Ngo ngo = ngoRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("NGO profile not found"));

        long availableDonations = donationRepository.countActiveAvailable(LocalDateTime.now());
        long pendingRequests = requestRepository.countByNgoAndStatus(ngo, RequestStatus.PENDING);
        long acceptedDonations = requestRepository.countByNgoAndStatus(ngo, RequestStatus.ACCEPTED);
        long pickedUpDonations = requestRepository.countByNgoAndStatus(ngo, RequestStatus.PICKED_UP);
        long completedDonations = requestRepository.countByNgoAndStatus(ngo, RequestStatus.COMPLETED);

        List<DonationRequestResponse> recent = requestRepository.findByNgo(
                ngo,
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "requestedAt"))
        ).getContent().stream().map(mapper::toDonationRequestResponse).collect(Collectors.toList());

        return NgoDashboardResponse.builder()
                .availableDonations(availableDonations)
                .pendingRequests(pendingRequests)
                .acceptedDonations(acceptedDonations)
                .pickedUpDonations(pickedUpDonations)
                .completedDonations(completedDonations)
                .recentRequests(recent)
                .build();
    }
}
