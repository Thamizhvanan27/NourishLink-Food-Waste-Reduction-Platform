package com.foodwaste.service;

import com.foodwaste.dto.DonationCreateDTO;
import com.foodwaste.dto.DonationResponse;
import com.foodwaste.dto.DonationUpdateDTO;
import com.foodwaste.entity.*;
import com.foodwaste.exception.BadRequestException;
import com.foodwaste.exception.ForbiddenException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.CategoryRepository;
import com.foodwaste.repository.DonationRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.service.impl.DonationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DonationServiceTest {

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private EntityMapper mapper;

    @InjectMocks
    private DonationServiceImpl donationService;

    private User donor;
    private Category category;
    private Donation donation;

    @BeforeEach
    void setUp() {
        donor = User.builder().id(1L).email("donor@test.com").fullName("Donor").role(Role.ROLE_DONOR).build();
        category = Category.builder().id(1L).name("Meals").build();
        donation = Donation.builder()
                .id(10L)
                .foodName("Cooked Meals")
                .donor(donor)
                .category(category)
                .foodType(FoodType.VEGETARIAN)
                .quantity(20.0)
                .quantityUnit("servings")
                .expiryDate(LocalDateTime.now().plusDays(1))
                .status(DonationStatus.AVAILABLE)
                .city("City")
                .pickupAddress("Address")
                .build();
    }

    @Test
    void testCreateDonationSuccess() {
        DonationCreateDTO createDTO = DonationCreateDTO.builder()
                .foodName("Cooked Meals")
                .categoryId(1L)
                .foodType(FoodType.VEGETARIAN)
                .quantity(20.0)
                .quantityUnit("servings")
                .expiryDate(LocalDateTime.now().plusDays(1))
                .city("City")
                .pickupAddress("Address")
                .build();

        when(userRepository.findByEmail("donor@test.com")).thenReturn(Optional.of(donor));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(donationRepository.save(any(Donation.class))).thenReturn(donation);
        when(mapper.toDonationResponse(any(Donation.class))).thenReturn(
                DonationResponse.builder().id(10L).foodName("Cooked Meals").quantity(20.0).status(DonationStatus.AVAILABLE).build()
        );

        DonationResponse response = donationService.createDonation("donor@test.com", createDTO);

        assertNotNull(response);
        assertEquals("Cooked Meals", response.getFoodName());
        verify(donationRepository, times(1)).save(any(Donation.class));
    }

    @Test
    void testCreateDonationPastExpiryThrowsException() {
        DonationCreateDTO createDTO = DonationCreateDTO.builder()
                .foodName("Old food")
                .categoryId(1L)
                .foodType(FoodType.VEGETARIAN)
                .quantity(20.0)
                .quantityUnit("servings")
                .expiryDate(LocalDateTime.now().minusHours(2)) // past date
                .city("City")
                .pickupAddress("Address")
                .build();

        when(userRepository.findByEmail("donor@test.com")).thenReturn(Optional.of(donor));

        assertThrows(BadRequestException.class, () -> donationService.createDonation("donor@test.com", createDTO));
    }

    @Test
    void testUpdateDonationForbiddenForNonOwner() {
        DonationUpdateDTO updateDTO = DonationUpdateDTO.builder().foodName("Changed Name").build();
        User otherUser = User.builder().id(2L).email("other@test.com").role(Role.ROLE_DONOR).build();

        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherUser));

        assertThrows(ForbiddenException.class, () -> donationService.updateDonation("other@test.com", 10L, updateDTO));
    }

    @Test
    void testCompletedDonationCannotBeEdited() {
        donation.setStatus(DonationStatus.COMPLETED);
        DonationUpdateDTO updateDTO = DonationUpdateDTO.builder().foodName("Changed Name").build();

        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));
        when(userRepository.findByEmail("donor@test.com")).thenReturn(Optional.of(donor));

        assertThrows(BadRequestException.class, () -> donationService.updateDonation("donor@test.com", 10L, updateDTO));
    }
}
