package com.foodwaste.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations", indexes = {
    @Index(name = "idx_donation_status", columnList = "status"),
    @Index(name = "idx_donation_category", columnList = "category_id"),
    @Index(name = "idx_donation_city", columnList = "city"),
    @Index(name = "idx_donation_expiry", columnList = "expiryDate"),
    @Index(name = "idx_donation_location", columnList = "latitude, longitude")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String foodName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FoodType foodType;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false, length = 30)
    private String quantityUnit; // e.g. kg, packets, meals, servings

    private LocalDate preparationDate;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(length = 50)
    private String pickupStartTime; // e.g. "10:00 AM" or ISO / string

    @Column(length = 50)
    private String pickupEndTime; // e.g. "04:00 PM"

    @Column(nullable = false, length = 255)
    private String pickupAddress;

    @Column(nullable = false, length = 100)
    private String city;

    private Double latitude;

    private Double longitude;

    @Builder.Default
    @Column(nullable = false)
    private Boolean reminder24hSent = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean reminder2hSent = false;

    @Column(length = 255)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private DonationStatus status = DonationStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
