package com.eventify.backend.repository;

import com.eventify.backend.entity.EventRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRequestRepository extends JpaRepository<EventRequest, Long> {
    List<EventRequest> findAllByOrderByRequestDateDesc();
    long countByViewedFalse();
    List<EventRequest> findByViewedFalseOrderByRequestDateDesc();
}
