package com.foodwaste.repository;

import com.foodwaste.entity.Ngo;
import com.foodwaste.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NgoRepository extends JpaRepository<Ngo, Long> {
    Optional<Ngo> findByUser(User user);
    Optional<Ngo> findByUserId(Long userId);
    boolean existsByRegistrationNumber(String registrationNumber);
    long countByApproved(Boolean approved);

    Page<Ngo> findByApproved(Boolean approved, Pageable pageable);

    @Query("SELECT n FROM Ngo n WHERE " +
           "(:approved IS NULL OR n.approved = :approved) AND " +
           "(:keyword IS NULL OR LOWER(n.ngoName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.registrationNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.contactPerson) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Ngo> searchNgos(@Param("approved") Boolean approved, @Param("keyword") String keyword, Pageable pageable);
}
