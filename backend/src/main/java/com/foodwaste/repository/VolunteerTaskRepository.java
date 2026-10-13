package com.foodwaste.repository;

import com.foodwaste.entity.Donation;
import com.foodwaste.entity.User;
import com.foodwaste.entity.VolunteerTask;
import com.foodwaste.entity.VolunteerTaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerTaskRepository extends JpaRepository<VolunteerTask, Long> {

    List<VolunteerTask> findByDonation(Donation donation);

    Optional<VolunteerTask> findFirstByDonation(Donation donation);

    Page<VolunteerTask> findByVolunteer(User volunteer, Pageable pageable);

    Page<VolunteerTask> findByStatus(VolunteerTaskStatus status, Pageable pageable);
    List<VolunteerTask> findByStatus(VolunteerTaskStatus status);

    Page<VolunteerTask> findByVolunteerAndStatus(User volunteer, VolunteerTaskStatus status, Pageable pageable);

    long countByVolunteer(User volunteer);

    long countByVolunteerAndStatus(User volunteer, VolunteerTaskStatus status);

    long countByStatus(VolunteerTaskStatus status);

    @Query(value = "SELECT vt.* FROM volunteer_tasks vt " +
                   "JOIN donations d ON vt.donation_id = d.id " +
                   "WHERE vt.status = 'AVAILABLE' AND d.latitude IS NOT NULL AND d.longitude IS NOT NULL " +
                   "AND (6371 * acos(least(1.0, greatest(-1.0, cos(radians(:latitude)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(d.latitude)))))) <= :radiusKm " +
                   "ORDER BY (6371 * acos(least(1.0, greatest(-1.0, cos(radians(:latitude)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(d.latitude)))))) ASC",
           nativeQuery = true)
    List<VolunteerTask> findNearbyAvailableTasks(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radiusKm") Double radiusKm);
}
