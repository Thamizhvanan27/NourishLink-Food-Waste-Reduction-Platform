package com.foodwaste.service.impl;

import com.foodwaste.dto.DonationCreateDTO;
import com.foodwaste.dto.DonationResponse;
import com.foodwaste.dto.DonationUpdateDTO;
import com.foodwaste.dto.NearbyDonationResponse;
import com.foodwaste.dto.PagedResponse;
import com.foodwaste.entity.*;
import com.foodwaste.exception.BadRequestException;
import com.foodwaste.exception.ForbiddenException;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.CategoryRepository;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.service.DonationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DonationServiceImpl implements DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional
    public DonationResponse createDonation(String donorEmail, DonationCreateDTO createDTO) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));

        if (Boolean.TRUE.equals(donor.getBlocked())) {
            throw new ForbiddenException("Blocked users cannot create donations");
        }

        if (createDTO.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Expiry date must be in the future");
        }

        Category category = categoryRepository.findById(createDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + createDTO.getCategoryId()));

        Donation donation = Donation.builder()
                .foodName(createDTO.getFoodName().trim())
                .description(createDTO.getDescription())
                .category(category)
                .foodType(createDTO.getFoodType())
                .quantity(createDTO.getQuantity())
                .quantityUnit(createDTO.getQuantityUnit().trim())
                .preparationDate(createDTO.getPreparationDate())
                .expiryDate(createDTO.getExpiryDate())
                .pickupStartTime(createDTO.getPickupStartTime())
                .pickupEndTime(createDTO.getPickupEndTime())
                .pickupAddress(createDTO.getPickupAddress().trim())
                .city(createDTO.getCity().trim())
                .latitude(createDTO.getLatitude())
                .longitude(createDTO.getLongitude())
                .imageUrl(createDTO.getImageUrl())
                .status(DonationStatus.AVAILABLE)
                .donor(donor)
                .build();

        Donation saved = donationRepository.save(donation);
        return mapper.toDonationResponse(saved);
    }

    @Override
    @Transactional
    public DonationResponse updateDonation(String userEmail, Long id, DonationUpdateDTO updateDTO) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isOwner = donation.getDonor().getEmail().equalsIgnoreCase(userEmail);
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You are not authorized to edit this donation");
        }

        if (donation.getStatus() == DonationStatus.COMPLETED) {
            throw new BadRequestException("Completed donations cannot be edited");
        }

        if (updateDTO.getFoodName() != null && !updateDTO.getFoodName().isBlank()) {
            donation.setFoodName(updateDTO.getFoodName().trim());
        }
        if (updateDTO.getDescription() != null) {
            donation.setDescription(updateDTO.getDescription());
        }
        if (updateDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(updateDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + updateDTO.getCategoryId()));
            donation.setCategory(category);
        }
        if (updateDTO.getFoodType() != null) {
            donation.setFoodType(updateDTO.getFoodType());
        }
        if (updateDTO.getQuantity() != null && updateDTO.getQuantity() > 0) {
            donation.setQuantity(updateDTO.getQuantity());
        }
        if (updateDTO.getQuantityUnit() != null) {
            donation.setQuantityUnit(updateDTO.getQuantityUnit().trim());
        }
        if (updateDTO.getPreparationDate() != null) {
            donation.setPreparationDate(updateDTO.getPreparationDate());
        }
        if (updateDTO.getExpiryDate() != null) {
            if (updateDTO.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("Expiry date must be in the future");
            }
            donation.setExpiryDate(updateDTO.getExpiryDate());
        }
        if (updateDTO.getPickupStartTime() != null) {
            donation.setPickupStartTime(updateDTO.getPickupStartTime());
        }
        if (updateDTO.getPickupEndTime() != null) {
            donation.setPickupEndTime(updateDTO.getPickupEndTime());
        }
        if (updateDTO.getPickupAddress() != null && !updateDTO.getPickupAddress().isBlank()) {
            donation.setPickupAddress(updateDTO.getPickupAddress().trim());
        }
        if (updateDTO.getCity() != null && !updateDTO.getCity().isBlank()) {
            donation.setCity(updateDTO.getCity().trim());
        }
        if (updateDTO.getLatitude() != null) {
            donation.setLatitude(updateDTO.getLatitude());
        }
        if (updateDTO.getLongitude() != null) {
            donation.setLongitude(updateDTO.getLongitude());
        }
        if (updateDTO.getImageUrl() != null) {
            donation.setImageUrl(updateDTO.getImageUrl());
        }
        if (updateDTO.getStatus() != null) {
            donation.setStatus(updateDTO.getStatus());
        }

        return mapper.toDonationResponse(donationRepository.save(donation));
    }

    @Override
    @Transactional
    public void deleteDonation(String userEmail, Long id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isOwner = donation.getDonor().getEmail().equalsIgnoreCase(userEmail);
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You are not authorized to delete this donation");
        }

        donationRepository.delete(donation);
    }

    @Override
    @Transactional
    public DonationResponse getDonationById(Long id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));

        // Check if expired
        if (donation.getStatus() == DonationStatus.AVAILABLE && donation.getExpiryDate().isBefore(LocalDateTime.now())) {
            donation.setStatus(DonationStatus.EXPIRED);
            donationRepository.save(donation);
        }

        return mapper.toDonationResponse(donation);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationResponse> getMyDonations(String donorEmail, DonationStatus status, String keyword, Pageable pageable) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));

        Page<Donation> page = donationRepository.findByDonorAndFilters(donor, status, keyword, pageable);
        List<DonationResponse> dtoList = page.getContent().stream()
                .map(mapper::toDonationResponse)
                .collect(Collectors.toList());

        return PagedResponse.of(page, dtoList);
    }

    @Override
    @Transactional
    public PagedResponse<DonationResponse> getAvailableDonations(Long categoryId, FoodType foodType, String city, String keyword, String sortBy, Pageable pageable) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("expiry".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "expiryDate");
        } else if ("quantity".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "quantity");
        }

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<Donation> page = donationRepository.findAvailableDonations(categoryId, foodType, city, keyword, LocalDateTime.now(), sortedPageable);
        List<DonationResponse> dtoList = page.getContent().stream()
                .map(mapper::toDonationResponse)
                .collect(Collectors.toList());

        return PagedResponse.of(page, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationResponse> getAllDonationsForAdmin(DonationStatus status, Long categoryId, FoodType foodType, String keyword, Pageable pageable) {
        Page<Donation> page = donationRepository.findAllWithFilters(status, categoryId, foodType, keyword, pageable);
        List<DonationResponse> dtoList = page.getContent().stream()
                .map(mapper::toDonationResponse)
                .collect(Collectors.toList());

        return PagedResponse.of(page, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NearbyDonationResponse> getNearbyDonations(
            Double latitude, Double longitude, Double radiusKm, Long categoryId, FoodType foodType, DonationStatus status) {
        double radius = (radiusKm != null && radiusKm > 0) ? radiusKm : 10.0;
        String statusStr = (status != null) ? status.name() : DonationStatus.AVAILABLE.name();
        String foodTypeStr = (foodType != null) ? foodType.name() : null;

        List<Donation> list;
        if (latitude != null && longitude != null) {
            list = donationRepository.findNearbyDonations(
                    latitude, longitude, radius, statusStr, categoryId, foodTypeStr, LocalDateTime.now());
        } else {
            list = donationRepository.findAll().stream()
                    .filter(d -> d.getStatus() == (status != null ? status : DonationStatus.AVAILABLE))
                    .filter(d -> d.getExpiryDate().isAfter(LocalDateTime.now()))
                    .filter(d -> categoryId == null || (d.getCategory() != null && d.getCategory().getId().equals(categoryId)))
                    .filter(d -> foodType == null || d.getFoodType() == foodType)
                    .collect(Collectors.toList());
        }

        List<NearbyDonationResponse> responses = new java.util.ArrayList<>();
        for (Donation d : list) {
            Double distance = null;
            if (latitude != null && longitude != null && d.getLatitude() != null && d.getLongitude() != null) {
                distance = com.foodwaste.location.GeoUtils.calculateDistanceKm(latitude, longitude, d.getLatitude(), d.getLongitude());
            }
            responses.add(mapper.toNearbyDonationResponse(d, distance));
        }

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationResponse> searchDonations(
            String keyword, Long categoryId, FoodType foodType, String city,
            Double minQuantity, Double maxQuantity, Double radiusKm,
            Double latitude, Double longitude, String sort, Pageable pageable) {

        if (latitude != null && longitude != null && radiusKm != null && radiusKm > 0) {
            List<Donation> nearbyList = donationRepository.findNearbyDonations(
                    latitude, longitude, radiusKm, DonationStatus.AVAILABLE.name(), categoryId,
                    foodType != null ? foodType.name() : null, LocalDateTime.now());

            List<DonationResponse> filtered = nearbyList.stream()
                    .filter(d -> keyword == null || keyword.isBlank() ||
                            d.getFoodName().toLowerCase().contains(keyword.toLowerCase().trim()) ||
                            (d.getDescription() != null && d.getDescription().toLowerCase().contains(keyword.toLowerCase().trim())))
                    .filter(d -> city == null || city.isBlank() || d.getCity().equalsIgnoreCase(city.trim()))
                    .filter(d -> minQuantity == null || d.getQuantity() >= minQuantity)
                    .filter(d -> maxQuantity == null || d.getQuantity() <= maxQuantity)
                    .map(d -> {
                        DonationResponse resp = mapper.toDonationResponse(d);
                        if (d.getLatitude() != null && d.getLongitude() != null) {
                            resp.setDistance(com.foodwaste.location.GeoUtils.calculateDistanceKm(
                                    latitude, longitude, d.getLatitude(), d.getLongitude()));
                        }
                        return resp;
                    })
                    .collect(Collectors.toList());

            if ("expiry".equalsIgnoreCase(sort)) {
                filtered.sort(java.util.Comparator.comparing(DonationResponse::getExpiryDate));
            } else if ("quantity".equalsIgnoreCase(sort)) {
                filtered.sort(java.util.Comparator.comparing(DonationResponse::getQuantity).reversed());
            }

            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filtered.size());
            List<DonationResponse> pageContent = (start <= end && start < filtered.size()) ?
                    filtered.subList(start, end) : java.util.Collections.emptyList();

            org.springframework.data.domain.Page<DonationResponse> pageResult =
                    new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filtered.size());

            return PagedResponse.of(pageResult, pageContent);
        }

        Sort sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("expiry".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.ASC, "expiryDate");
        } else if ("quantity".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.DESC, "quantity");
        }

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sortObj);
        Page<Donation> page = donationRepository.findAvailableDonations(
                categoryId, foodType, city, keyword, LocalDateTime.now(), sortedPageable);

        List<DonationResponse> dtoList = page.getContent().stream()
                .filter(d -> minQuantity == null || d.getQuantity() >= minQuantity)
                .filter(d -> maxQuantity == null || d.getQuantity() <= maxQuantity)
                .map(mapper::toDonationResponse)
                .collect(Collectors.toList());

        return PagedResponse.of(page, dtoList);
    }
}
