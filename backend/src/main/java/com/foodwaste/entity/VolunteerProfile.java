package com.foodwaste.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "volunteer_profiles", indexes = {
    @Index(name = "idx_volunteer_user", columnList = "user_id"),
    @Index(name = "idx_volunteer_active", columnList = "active"),
    @Index(name = "idx_volunteer_city", columnList = "city")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolunteerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    private Double latitude;

    private Double longitude;

    @Column(length = 100)
    private String availability; // e.g., Weekdays, Weekends, Anytime

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private VehicleType vehicleType = VehicleType.BIKE;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
