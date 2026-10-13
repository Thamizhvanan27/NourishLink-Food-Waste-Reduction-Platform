package com.foodwaste.repository;

import com.foodwaste.entity.User;
import com.foodwaste.entity.VolunteerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VolunteerProfileRepository extends JpaRepository<VolunteerProfile, Long> {
    Optional<VolunteerProfile> findByUser(User user);
    Optional<VolunteerProfile> findByUserEmail(String email);
    boolean existsByUser(User user);
}
