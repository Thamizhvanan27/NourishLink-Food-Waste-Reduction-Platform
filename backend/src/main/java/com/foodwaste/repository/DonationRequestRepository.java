package com.foodwaste.repository;

import com.foodwaste.entity.Donation;
import com.foodwaste.entity.DonationRequest;
import com.foodwaste.entity.Ngo;
import com.foodwaste.entity.RequestStatus;
import com.foodwaste.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRequestRepository extends JpaRepository<DonationRequest, Long> {

    boolean existsByDonationAndNgo(Donation donation, Ngo ngo);

    List<DonationRequest> findByDonation(Donation donation);

    List<DonationRequest> findByDonationAndStatus(Donation donation, RequestStatus status);

    Page<DonationRequest> findByNgo(Ngo ngo, Pageable pageable);

    @Query("SELECT r FROM DonationRequest r WHERE r.ngo = :ngo AND " +
           "(:status IS NULL OR r.status = :status)")
    Page<DonationRequest> findByNgoAndStatus(
            @Param("ngo") Ngo ngo,
            @Param("status") RequestStatus status,
            Pageable pageable);

    @Query("SELECT r FROM DonationRequest r WHERE r.donation.donor = :donor AND " +
           "(:status IS NULL OR r.status = :status)")
    Page<DonationRequest> findByDonorAndStatus(
            @Param("donor") User donor,
            @Param("status") RequestStatus status,
            Pageable pageable);

    @Query("SELECT r FROM DonationRequest r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(r.donation.foodName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.ngo.ngoName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.donation.donor.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<DonationRequest> findAllWithFilters(
            @Param("status") RequestStatus status,
            @Param("keyword") String keyword,
            Pageable pageable);

    long countByStatus(RequestStatus status);

    long countByNgo(Ngo ngo);

    long countByNgoAndStatus(Ngo ngo, RequestStatus status);

    @Query("SELECT COUNT(r) FROM DonationRequest r WHERE r.donation.donor = :donor AND r.status = :status")
    long countByDonorAndStatus(@Param("donor") User donor, @Param("status") RequestStatus status);

    @Query("SELECT COALESCE(SUM(r.donation.quantity), 0.0) FROM DonationRequest r WHERE r.ngo = :ngo AND r.status = 'COMPLETED'")
    Double sumCompletedQuantityByNgo(@Param("ngo") Ngo ngo);

    java.util.Optional<DonationRequest> findFirstByDonationAndStatus(Donation donation, RequestStatus status);
}
