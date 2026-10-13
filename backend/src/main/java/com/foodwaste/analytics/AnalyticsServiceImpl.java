package com.foodwaste.analytics;

import com.foodwaste.dto.*;
import com.foodwaste.entity.*;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.repository.*;
import com.foodwaste.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final DonationRepository donationRepository;
    private final DonationRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final NgoRepository ngoRepository;
    private final RatingRepository ratingRepository;
    private final CategoryRepository categoryRepository;
    private final SystemSettingService systemSettingService;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("MMM yyyy");

    @Override
    @Transactional(readOnly = true)
    public AdminAnalyticsDTO getAdminAnalytics() {
        double ratio = systemSettingService.getFoodToMealRatio();
        List<Donation> allDonations = donationRepository.findAll();

        // 1. Monthly donations & monthly food rescued (last 6 months)
        List<MonthlyMetricDTO> monthlyDonations = new ArrayList<>();
        List<MonthlyMetricDTO> monthlyRescued = new ArrayList<>();

        YearMonth currentYm = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentYm.minusMonths(i);
            String label = ym.format(MONTH_FMT);

            long donationCount = allDonations.stream()
                    .filter(d -> d.getCreatedAt() != null && YearMonth.from(d.getCreatedAt()).equals(ym))
                    .count();

            double rescuedKg = allDonations.stream()
                    .filter(d -> d.getStatus() == DonationStatus.COMPLETED &&
                            d.getUpdatedAt() != null && YearMonth.from(d.getUpdatedAt()).equals(ym))
                    .mapToDouble(Donation::getQuantity)
                    .sum();

            monthlyDonations.add(MonthlyMetricDTO.builder().month(label).count(donationCount).value((double) donationCount).build());
            monthlyRescued.add(MonthlyMetricDTO.builder().month(label).count((long) rescuedKg).value(Math.round(rescuedKg * 10.0) / 10.0).build());
        }

        // 2. Status distribution
        Map<DonationStatus, Long> statusCounts = allDonations.stream()
                .collect(Collectors.groupingBy(Donation::getStatus, Collectors.counting()));

        List<DistributionItemDTO> statusDist = Arrays.stream(DonationStatus.values()).map(s -> {
            long count = statusCounts.getOrDefault(s, 0L);
            double pct = allDonations.isEmpty() ? 0.0 : Math.round((count * 100.0 / allDonations.size()) * 10.0) / 10.0;
            return DistributionItemDTO.builder()
                    .name(s.name())
                    .count(count)
                    .percentage(pct)
                    .color(getStatusColor(s))
                    .build();
        }).collect(Collectors.toList());

        // 3. Category distribution
        Map<String, Long> categoryCounts = allDonations.stream()
                .filter(d -> d.getCategory() != null)
                .collect(Collectors.groupingBy(d -> d.getCategory().getName(), Collectors.counting()));

        List<Category> allCategories = categoryRepository.findAll();
        List<DistributionItemDTO> catDist = allCategories.stream().map(c -> {
            long count = categoryCounts.getOrDefault(c.getName(), 0L);
            double pct = allDonations.isEmpty() ? 0.0 : Math.round((count * 100.0 / allDonations.size()) * 10.0) / 10.0;
            return DistributionItemDTO.builder()
                    .name(c.getName())
                    .count(count)
                    .percentage(pct)
                    .color(getCategoryColor(c.getName()))
                    .build();
        }).collect(Collectors.toList());

        // 4. City distribution
        Map<String, Long> cityCounts = allDonations.stream()
                .filter(d -> d.getCity() != null && !d.getCity().isBlank())
                .collect(Collectors.groupingBy(d -> d.getCity().trim(), Collectors.counting()));

        List<DistributionItemDTO> cityDist = cityCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .map(e -> DistributionItemDTO.builder()
                        .name(e.getKey())
                        .count(e.getValue())
                        .percentage(allDonations.isEmpty() ? 0.0 : Math.round((e.getValue() * 100.0 / allDonations.size()) * 10.0) / 10.0)
                        .color("#10b981")
                        .build())
                .collect(Collectors.toList());

        // 5. Overall Platform Impact Metrics
        double totalRescuedKg = donationRepository.sumCompletedQuantity();
        long totalEstimatedMeals = Math.round(totalRescuedKg * ratio);
        long completedDonations = donationRepository.countByStatus(DonationStatus.COMPLETED);
        long activeDonors = userRepository.countByRole(Role.ROLE_DONOR);
        long activeNgos = ngoRepository.countByApproved(true);
        long volunteers = userRepository.countByRole(Role.ROLE_VOLUNTEER);

        return AdminAnalyticsDTO.builder()
                .donationsPerMonth(monthlyDonations)
                .foodRescuedPerMonth(monthlyRescued)
                .statusDistribution(statusDist)
                .categoryDistribution(catDist)
                .cityDistribution(cityDist)
                .totalFoodRescuedKg(Math.round(totalRescuedKg * 10.0) / 10.0)
                .totalEstimatedMeals(totalEstimatedMeals)
                .totalCompletedDonations(completedDonations)
                .totalActiveDonors(activeDonors)
                .totalActiveNgos(activeNgos)
                .totalVolunteers(volunteers)
                .foodToMealRatio(ratio)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DonorAnalyticsDTO getDonorAnalytics(String donorEmail) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));

        double ratio = systemSettingService.getFoodToMealRatio();
        List<Donation> donorDonations = donationRepository.findAll().stream()
                .filter(d -> d.getDonor().getId().equals(donor.getId()))
                .collect(Collectors.toList());

        // Monthly donations & monthly food rescued
        List<MonthlyMetricDTO> monthlyDonations = new ArrayList<>();
        List<MonthlyMetricDTO> monthlyRescued = new ArrayList<>();

        YearMonth currentYm = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentYm.minusMonths(i);
            String label = ym.format(MONTH_FMT);

            long donationCount = donorDonations.stream()
                    .filter(d -> d.getCreatedAt() != null && YearMonth.from(d.getCreatedAt()).equals(ym))
                    .count();

            double rescuedKg = donorDonations.stream()
                    .filter(d -> d.getStatus() == DonationStatus.COMPLETED &&
                            d.getUpdatedAt() != null && YearMonth.from(d.getUpdatedAt()).equals(ym))
                    .mapToDouble(Donation::getQuantity)
                    .sum();

            monthlyDonations.add(MonthlyMetricDTO.builder().month(label).count(donationCount).value((double) donationCount).build());
            monthlyRescued.add(MonthlyMetricDTO.builder().month(label).count((long) rescuedKg).value(Math.round(rescuedKg * 10.0) / 10.0).build());
        }

        // Status distribution
        Map<DonationStatus, Long> statusCounts = donorDonations.stream()
                .collect(Collectors.groupingBy(Donation::getStatus, Collectors.counting()));

        List<DistributionItemDTO> statusDist = Arrays.stream(DonationStatus.values()).map(s -> {
            long count = statusCounts.getOrDefault(s, 0L);
            double pct = donorDonations.isEmpty() ? 0.0 : Math.round((count * 100.0 / donorDonations.size()) * 10.0) / 10.0;
            return DistributionItemDTO.builder()
                    .name(s.name())
                    .count(count)
                    .percentage(pct)
                    .color(getStatusColor(s))
                    .build();
        }).collect(Collectors.toList());

        // Category distribution
        Map<String, Long> categoryCounts = donorDonations.stream()
                .filter(d -> d.getCategory() != null)
                .collect(Collectors.groupingBy(d -> d.getCategory().getName(), Collectors.counting()));

        List<DistributionItemDTO> catDist = categoryCounts.entrySet().stream()
                .map(e -> DistributionItemDTO.builder()
                        .name(e.getKey())
                        .count(e.getValue())
                        .percentage(donorDonations.isEmpty() ? 0.0 : Math.round((e.getValue() * 100.0 / donorDonations.size()) * 10.0) / 10.0)
                        .color(getCategoryColor(e.getKey()))
                        .build())
                .collect(Collectors.toList());

        double totalDonated = donorDonations.stream().mapToDouble(Donation::getQuantity).sum();
        double totalRescued = donorDonations.stream()
                .filter(d -> d.getStatus() == DonationStatus.COMPLETED)
                .mapToDouble(Donation::getQuantity)
                .sum();
        long completed = donorDonations.stream().filter(d -> d.getStatus() == DonationStatus.COMPLETED).count();
        long meals = Math.round(totalRescued * ratio);

        Double avgRating = ratingRepository.findAverageRatingByReviewedUser(donor);
        long ratingsCount = ratingRepository.countByReviewedUser(donor);

        return DonorAnalyticsDTO.builder()
                .monthlyDonations(monthlyDonations)
                .monthlyFoodRescued(monthlyRescued)
                .statusDistribution(statusDist)
                .categoryDistribution(catDist)
                .totalFoodDonatedKg(Math.round(totalDonated * 10.0) / 10.0)
                .totalFoodRescuedKg(Math.round(totalRescued * 10.0) / 10.0)
                .completedDonations(completed)
                .estimatedMealsProvided(meals)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .totalRatingsCount(ratingsCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public NgoAnalyticsDTO getNgoAnalytics(String ngoEmail) {
        User user = userRepository.findByEmail(ngoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Ngo ngo = ngoRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("NGO profile not found"));

        double ratio = systemSettingService.getFoodToMealRatio();
        List<DonationRequest> myRequests = requestRepository.findAll().stream()
                .filter(r -> r.getNgo().getId().equals(ngo.getId()))
                .collect(Collectors.toList());

        List<MonthlyMetricDTO> monthlyRequests = new ArrayList<>();
        List<MonthlyMetricDTO> monthlyPickups = new ArrayList<>();
        List<MonthlyMetricDTO> foodReceivedPerMonth = new ArrayList<>();

        YearMonth currentYm = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentYm.minusMonths(i);
            String label = ym.format(MONTH_FMT);

            long reqCount = myRequests.stream()
                    .filter(r -> r.getRequestedAt() != null && YearMonth.from(r.getRequestedAt()).equals(ym))
                    .count();

            long pickupCount = myRequests.stream()
                    .filter(r -> (r.getStatus() == RequestStatus.PICKED_UP || r.getStatus() == RequestStatus.COMPLETED)
                            && r.getPickedUpAt() != null && YearMonth.from(r.getPickedUpAt()).equals(ym))
                    .count();

            double receivedKg = myRequests.stream()
                    .filter(r -> r.getStatus() == RequestStatus.COMPLETED &&
                            r.getCompletedAt() != null && YearMonth.from(r.getCompletedAt()).equals(ym))
                    .mapToDouble(r -> r.getDonation() != null ? r.getDonation().getQuantity() : 0.0)
                    .sum();

            monthlyRequests.add(MonthlyMetricDTO.builder().month(label).count(reqCount).value((double) reqCount).build());
            monthlyPickups.add(MonthlyMetricDTO.builder().month(label).count(pickupCount).value((double) pickupCount).build());
            foodReceivedPerMonth.add(MonthlyMetricDTO.builder().month(label).count((long) receivedKg).value(Math.round(receivedKg * 10.0) / 10.0).build());
        }

        Map<RequestStatus, Long> statusCounts = myRequests.stream()
                .collect(Collectors.groupingBy(DonationRequest::getStatus, Collectors.counting()));

        List<DistributionItemDTO> statusDist = Arrays.stream(RequestStatus.values()).map(s -> {
            long count = statusCounts.getOrDefault(s, 0L);
            double pct = myRequests.isEmpty() ? 0.0 : Math.round((count * 100.0 / myRequests.size()) * 10.0) / 10.0;
            return DistributionItemDTO.builder()
                    .name(s.name())
                    .count(count)
                    .percentage(pct)
                    .color(getRequestStatusColor(s))
                    .build();
        }).collect(Collectors.toList());

        double totalReceived = myRequests.stream()
                .filter(r -> r.getStatus() == RequestStatus.COMPLETED && r.getDonation() != null)
                .mapToDouble(r -> r.getDonation().getQuantity())
                .sum();

        long completedPickups = myRequests.stream()
                .filter(r -> r.getStatus() == RequestStatus.COMPLETED)
                .count();

        long meals = Math.round(totalReceived * ratio);

        Double avgRating = ratingRepository.findAverageRatingByReviewedUser(user);
        long ratingsCount = ratingRepository.countByReviewedUser(user);

        return NgoAnalyticsDTO.builder()
                .monthlyRequests(monthlyRequests)
                .monthlyPickups(monthlyPickups)
                .foodReceivedPerMonth(foodReceivedPerMonth)
                .statusDistribution(statusDist)
                .totalFoodReceivedKg(Math.round(totalReceived * 10.0) / 10.0)
                .completedPickups(completedPickups)
                .estimatedMealsDistributed(meals)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .totalRatingsCount(ratingsCount)
                .build();
    }

    private String getStatusColor(DonationStatus status) {
        if (status == null) return "#6b7280";
        return switch (status) {
            case AVAILABLE -> "#10b981";
            case REQUESTED -> "#3b82f6";
            case ACCEPTED -> "#8b5cf6";
            case PICKED_UP -> "#f59e0b";
            case COMPLETED -> "#059669";
            case EXPIRED -> "#ef4444";
            case CANCELLED -> "#9ca3af";
        };
    }

    private String getRequestStatusColor(RequestStatus status) {
        if (status == null) return "#6b7280";
        return switch (status) {
            case PENDING -> "#3b82f6";
            case ACCEPTED -> "#8b5cf6";
            case PICKED_UP -> "#f59e0b";
            case COMPLETED -> "#10b981";
            case REJECTED, CANCELLED -> "#ef4444";
        };
    }

    private String getCategoryColor(String name) {
        if (name == null) return "#64748b";
        return switch (name.toLowerCase()) {
            case "rice" -> "#f59e0b";
            case "meals" -> "#10b981";
            case "bakery" -> "#d97706";
            case "fruits" -> "#ec4899";
            case "vegetables" -> "#22c55e";
            case "dairy" -> "#38bdf8";
            case "snacks" -> "#f97316";
            case "beverages" -> "#06b6d4";
            default -> "#8b5cf6";
        };
    }
}
