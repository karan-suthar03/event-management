package com.eventify.backend.repository;

import com.eventify.backend.entity.OfferingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferingRequestRepository extends JpaRepository<OfferingRequest, Long> {
    List<OfferingRequest> findAllByOrderByRequestDateDesc();
    List<OfferingRequest> findByOfferingId(Long offeringId);
    long countByViewedFalse();
}
