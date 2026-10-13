package com.foodwaste.repository;

import com.foodwaste.entity.Donation;
import com.foodwaste.entity.DonationStatus;
import com.foodwaste.entity.FoodType;
import com.foodwaste.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    Page<Donation> findByDonor(User donor, Pageable pageable);

    @Query("SELECT d FROM Donation d WHERE d.donor = :donor AND " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(d.foodName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.city) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Donation> findByDonorAndFilters(
            @Param("donor") User donor,
            @Param("status") DonationStatus status,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("SELECT d FROM Donation d WHERE d.status = 'AVAILABLE' AND d.expiryDate > :now AND " +
           "(:categoryId IS NULL OR d.category.id = :categoryId) AND " +
           "(:foodType IS NULL OR d.foodType = :foodType) AND " +
           "(:city IS NULL OR LOWER(d.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:keyword IS NULL OR LOWER(d.foodName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Donation> findAvailableDonations(
            @Param("categoryId") Long categoryId,
            @Param("foodType") FoodType foodType,
            @Param("city") String city,
            @Param("keyword") String keyword,
            @Param("now") LocalDateTime now,
            Pageable pageable);

    @Query("SELECT d FROM Donation d WHERE " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:categoryId IS NULL OR d.category.id = :categoryId) AND " +
           "(:foodType IS NULL OR d.foodType = :foodType) AND " +
           "(:keyword IS NULL OR LOWER(d.foodName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.donor.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Donation> findAllWithFilters(
            @Param("status") DonationStatus status,
            @Param("categoryId") Long categoryId,
            @Param("foodType") FoodType foodType,
            @Param("keyword") String keyword,
            Pageable pageable);

    long countByStatus(DonationStatus status);
    long countByDonor(User donor);
    long countByDonorAndStatus(User donor, DonationStatus status);

    @Query("SELECT COUNT(d) FROM Donation d WHERE d.status = 'AVAILABLE' AND d.expiryDate > :now")
    long countActiveAvailable(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(d) FROM Donation d WHERE d.expiryDate <= :now AND d.status != 'COMPLETED'")
    long countExpiredDonations(@Param("now") LocalDateTime now);

    List<Donation> findByStatusAndExpiryDateBefore(DonationStatus status, LocalDateTime expiryDate);

    List<Donation> findByStatusAndExpiryDateBetweenAndReminder24hSentFalse(
            DonationStatus status, LocalDateTime start, LocalDateTime end);

    List<Donation> findByStatusAndExpiryDateBetweenAndReminder2hSentFalse(
            DonationStatus status, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(d.quantity), 0.0) FROM Donation d WHERE d.status = 'COMPLETED'")
    Double sumCompletedQuantity();

    @Query("SELECT COALESCE(SUM(d.quantity), 0.0) FROM Donation d WHERE d.donor = :donor AND d.status = 'COMPLETED'")
    Double sumCompletedQuantityByDonor(@Param("donor") User donor);

    @Query("SELECT COALESCE(SUM(d.quantity), 0.0) FROM Donation d WHERE d.donor = :donor")
    Double sumTotalQuantityByDonor(@Param("donor") User donor);

    @Query(value = "SELECT d.* FROM donations d " +
                   "WHERE d.latitude IS NOT NULL AND d.longitude IS NOT NULL " +
                   "AND (:status IS NULL OR d.status = :status) " +
                   "AND (d.expiry_date > :now) " +
                   "AND (:categoryId IS NULL OR d.category_id = :categoryId) " +
                   "AND (:foodType IS NULL OR d.food_type = :foodType) " +
                   "HAVING (6371 * acos(least(1.0, greatest(-1.0, cos(radians(:latitude)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(d.latitude)))))) <= :radius " +
                   "ORDER BY (6371 * acos(least(1.0, greatest(-1.0, cos(radians(:latitude)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(d.latitude)))))) ASC",
           nativeQuery = true)
    List<Donation> findNearbyDonations(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radius") Double radius,
            @Param("status") String status,
            @Param("categoryId") Long categoryId,
            @Param("foodType") String foodType,
            @Param("now") LocalDateTime now);
}
