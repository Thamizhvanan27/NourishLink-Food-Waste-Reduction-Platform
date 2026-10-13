package com.foodwaste.config;

import com.foodwaste.entity.*;
import com.foodwaste.repository.CategoryRepository;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.DonationRequestRepository;
import com.foodwaste.repository.NgoRepository;
import com.foodwaste.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final NgoRepository ngoRepository;
    private final DonationRepository donationRepository;
    private final DonationRequestRepository donationRequestRepository;
    private final com.foodwaste.repository.VolunteerProfileRepository volunteerProfileRepository;
    private final com.foodwaste.repository.VolunteerTaskRepository volunteerTaskRepository;
    private final com.foodwaste.repository.RatingRepository ratingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedCategories();
        seedAdminUser();
        seedDemoData();
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            log.info("Seeding default food categories...");
            List<Category> categories = List.of(
                    Category.builder().name("Rice").description("Cooked rice, biryani, pulao, fried rice").active(true).build(),
                    Category.builder().name("Meals").description("Prepared full meal combos, lunch boxes, thalis").active(true).build(),
                    Category.builder().name("Bakery").description("Bread loaves, buns, croissants, muffins, pastries").active(true).build(),
                    Category.builder().name("Fruits").description("Fresh seasonal fruits, cut fruit packs").active(true).build(),
                    Category.builder().name("Vegetables").description("Fresh greens, potatoes, tomatoes, vegetables").active(true).build(),
                    Category.builder().name("Dairy").description("Fresh milk, cheese, yogurt, paneer, curd").active(true).build(),
                    Category.builder().name("Snacks").description("Packaged savories, sandwiches, baked snacks").active(true).build(),
                    Category.builder().name("Beverages").description("Juices, bottled water, canned dairy drinks").active(true).build(),
                    Category.builder().name("Other").description("Pantry staples, canned goods, packed items").active(true).build()
            );
            categoryRepository.saveAll(categories);
            log.info("Categories seeded successfully.");
        }
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail("admin@foodwaste.org")) {
            log.info("Seeding default platform admin user...");
            User admin = User.builder()
                    .fullName("Platform Administrator")
                    .email("admin@foodwaste.org")
                    .phone("+1-800-FOOD-AID")
                    .password(passwordEncoder.encode("admin123"))
                    .address("100 Sustainability Blvd, Suite 400")
                    .city("Metropolis")
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .blocked(false)
                    .build();
            userRepository.save(admin);
            log.info("Admin user created (admin@foodwaste.org / admin123).");
        }
    }

    private void seedDemoData() {
        // Seed demo donor
        User donor = null;
        if (!userRepository.existsByEmail("donor@demo.com")) {
            log.info("Seeding demo donor user...");
            donor = User.builder()
                    .fullName("Sunset Hotel & Banquet")
                    .email("donor@demo.com")
                    .phone("+1-555-0199")
                    .password(passwordEncoder.encode("donor123"))
                    .address("742 Evergreen Terrace")
                    .city("Metropolis")
                    .latitude(12.9716)
                    .longitude(77.5946)
                    .role(Role.ROLE_DONOR)
                    .enabled(true)
                    .blocked(false)
                    .build();
            donor = userRepository.save(donor);
        } else {
            donor = userRepository.findByEmail("donor@demo.com").orElse(null);
            if (donor != null && donor.getLatitude() == null) {
                donor.setLatitude(12.9716);
                donor.setLongitude(77.5946);
                userRepository.save(donor);
            }
        }

        // Seed demo NGO
        Ngo ngo = null;
        if (!userRepository.existsByEmail("ngo@demo.com")) {
            log.info("Seeding demo NGO user...");
            User ngoUser = User.builder()
                    .fullName("Hope Harvest Foundation")
                    .email("ngo@demo.com")
                    .phone("+1-555-0144")
                    .password(passwordEncoder.encode("ngo123"))
                    .address("12 Community Care Way")
                    .city("Metropolis")
                    .latitude(12.9800)
                    .longitude(77.6000)
                    .role(Role.ROLE_NGO)
                    .enabled(true)
                    .blocked(false)
                    .build();
            ngoUser = userRepository.save(ngoUser);

            ngo = Ngo.builder()
                    .user(ngoUser)
                    .ngoName("Hope Harvest Foundation")
                    .registrationNumber("NGO-METRO-2024-9981")
                    .contactPerson("Sarah Jenkins")
                    .email("ngo@demo.com")
                    .phone("+1-555-0144")
                    .address("12 Community Care Way")
                    .city("Metropolis")
                    .latitude(12.9800)
                    .longitude(77.6000)
                    .description("Dedicated to feeding families and reducing community food waste.")
                    .approved(true) // Pre-approved for convenience
                    .build();
            ngo = ngoRepository.save(ngo);
        } else {
            User ngoUser = userRepository.findByEmail("ngo@demo.com").orElse(null);
            if (ngoUser != null && ngoUser.getLatitude() == null) {
                ngoUser.setLatitude(12.9800);
                ngoUser.setLongitude(77.6000);
                userRepository.save(ngoUser);
            }
            ngo = (ngoUser != null) ? ngoRepository.findByUser(ngoUser).orElse(null) : null;
        }

        // Seed demo Volunteer
        User volunteer = null;
        if (!userRepository.existsByEmail("volunteer@demo.com")) {
            log.info("Seeding demo volunteer user...");
            volunteer = User.builder()
                    .fullName("David Miller")
                    .email("volunteer@demo.com")
                    .phone("+1-555-0188")
                    .password(passwordEncoder.encode("volunteer123"))
                    .address("45 Green Valley Ave")
                    .city("Metropolis")
                    .latitude(12.9750)
                    .longitude(77.5980)
                    .role(Role.ROLE_VOLUNTEER)
                    .enabled(true)
                    .blocked(false)
                    .build();
            volunteer = userRepository.save(volunteer);

            com.foodwaste.entity.VolunteerProfile profile = com.foodwaste.entity.VolunteerProfile.builder()
                    .user(volunteer)
                    .phone("+1-555-0188")
                    .address("45 Green Valley Ave")
                    .city("Metropolis")
                    .latitude(12.9750)
                    .longitude(77.5980)
                    .availability("Weekdays & Evenings")
                    .vehicleType(com.foodwaste.entity.VehicleType.BIKE)
                    .active(true)
                    .build();
            volunteerProfileRepository.save(profile);
            log.info("Volunteer user seeded (volunteer@demo.com / volunteer123).");
        } else {
            volunteer = userRepository.findByEmail("volunteer@demo.com").orElse(null);
        }

        // Seed initial sample donations
        if (donationRepository.count() == 0 && donor != null) {
            Category mealsCat = categoryRepository.findByName("Meals").orElse(null);
            Category bakeryCat = categoryRepository.findByName("Bakery").orElse(null);
            Category fruitsCat = categoryRepository.findByName("Fruits").orElse(null);

            if (mealsCat != null && bakeryCat != null) {
                log.info("Seeding initial available food donations with geographic coordinates...");
                Donation donation1 = Donation.builder()
                        .foodName("Fresh Buffet Veg Meals & Rice Bowls")
                        .description("High-quality surplus vegetarian lunch meals from our banquet conference. Packed hygienically in food-grade meal trays.")
                        .category(mealsCat)
                        .foodType(FoodType.VEGETARIAN)
                        .quantity(65.0)
                        .quantityUnit("servings")
                        .preparationDate(LocalDate.now())
                        .expiryDate(LocalDateTime.now().plusHours(12))
                        .pickupStartTime("02:00 PM")
                        .pickupEndTime("06:00 PM")
                        .pickupAddress("742 Evergreen Terrace, Kitchen Dock B")
                        .city("Metropolis")
                        .latitude(12.9716)
                        .longitude(77.5946)
                        .imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80")
                        .status(DonationStatus.AVAILABLE)
                        .donor(donor)
                        .build();

                Donation donation2 = Donation.builder()
                        .foodName("Artisan Sourdough & Assorted Rolls")
                        .description("Freshly baked bread, whole grain baguettes and dinner rolls from today's morning bake. Pristine quality.")
                        .category(bakeryCat)
                        .foodType(FoodType.VEGETARIAN)
                        .quantity(40.0)
                        .quantityUnit("packets")
                        .preparationDate(LocalDate.now())
                        .expiryDate(LocalDateTime.now().plusDays(2))
                        .pickupStartTime("10:00 AM")
                        .pickupEndTime("08:00 PM")
                        .pickupAddress("742 Evergreen Terrace, Front Bakery")
                        .city("Metropolis")
                        .latitude(12.9650)
                        .longitude(77.5850)
                        .imageUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80")
                        .status(DonationStatus.AVAILABLE)
                        .donor(donor)
                        .build();

                Donation donation3 = Donation.builder()
                        .foodName("Fresh Organic Apples & Citrus Crate")
                        .description("Surplus organic fruits from morning event display. Intact and ready to eat.")
                        .category(fruitsCat != null ? fruitsCat : mealsCat)
                        .foodType(FoodType.VEGETARIAN)
                        .quantity(50.0)
                        .quantityUnit("kg")
                        .preparationDate(LocalDate.now().minusDays(1))
                        .expiryDate(LocalDateTime.now().plusDays(3))
                        .pickupStartTime("09:00 AM")
                        .pickupEndTime("05:00 PM")
                        .pickupAddress("100 Sustainability Blvd, Dock 1")
                        .city("Metropolis")
                        .latitude(12.9850)
                        .longitude(77.6100)
                        .imageUrl("https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80")
                        .status(DonationStatus.COMPLETED)
                        .donor(donor)
                        .build();

                donationRepository.saveAll(List.of(donation1, donation2, donation3));

                // Create a completed request and rating for donation3 if NGO exists
                if (ngo != null) {
                    DonationRequest completedReq = DonationRequest.builder()
                            .donation(donation3)
                            .ngo(ngo)
                            .message("We can distribute these fresh fruits to the children's shelter immediately.")
                            .status(RequestStatus.COMPLETED)
                            .requestedAt(LocalDateTime.now().minusDays(2))
                            .acceptedAt(LocalDateTime.now().minusDays(2).plusHours(1))
                            .pickedUpAt(LocalDateTime.now().minusDays(2).plusHours(3))
                            .completedAt(LocalDateTime.now().minusDays(2).plusHours(5))
                            .build();
                    donationRequestRepository.save(completedReq);

                    // Seed rating from NGO to Donor
                    com.foodwaste.entity.Rating rating1 = com.foodwaste.entity.Rating.builder()
                            .donation(donation3)
                            .reviewer(ngo.getUser())
                            .reviewedUser(donor)
                            .rating(5)
                            .feedback("Wonderful fresh fruit donation! Packaged cleanly and handover was smooth.")
                            .build();
                    ratingRepository.save(rating1);

                    // Seed rating from Donor to NGO
                    com.foodwaste.entity.Rating rating2 = com.foodwaste.entity.Rating.builder()
                            .donation(donation3)
                            .reviewer(donor)
                            .reviewedUser(ngo.getUser())
                            .rating(5)
                            .feedback("Punctual and courteous volunteer. Arrived right on schedule!")
                            .build();
                    ratingRepository.save(rating2);

                    // Seed volunteer task for donation3
                    if (volunteer != null) {
                        com.foodwaste.entity.VolunteerTask vTask = com.foodwaste.entity.VolunteerTask.builder()
                                .donation(donation3)
                                .volunteer(volunteer)
                                .status(com.foodwaste.entity.VolunteerTaskStatus.DELIVERED)
                                .acceptedAt(LocalDateTime.now().minusDays(2).plusHours(1))
                                .pickedUpAt(LocalDateTime.now().minusDays(2).plusHours(3))
                                .deliveredAt(LocalDateTime.now().minusDays(2).plusHours(5))
                                .build();
                        volunteerTaskRepository.save(vTask);
                    }
                }

                // Create an available volunteer task for donation1
                com.foodwaste.entity.VolunteerTask availTask = com.foodwaste.entity.VolunteerTask.builder()
                        .donation(donation1)
                        .status(com.foodwaste.entity.VolunteerTaskStatus.AVAILABLE)
                        .build();
                volunteerTaskRepository.save(availTask);

                log.info("Sample donations, requests, ratings and volunteer tasks created.");
            }
        }
    }
}
