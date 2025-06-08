package com.eventify.backend.repository;

import com.eventify.backend.entity.EventOffering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventOfferingRepository extends JpaRepository<EventOffering, Long> {
    List<EventOffering> findByMainCategory(com.eventify.backend.entity.Category mainCategory);
}
