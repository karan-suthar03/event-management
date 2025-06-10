package com.eventify.backend.repository;

import com.eventify.backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    /**
     * Fetches all feedback for a specific event in a single query
     */
    @Query("SELECT f FROM Feedback f LEFT JOIN FETCH f.event WHERE f.event.id = :eventId")
    List<Feedback> findAllByEventId(@Param("eventId") Long eventId);

    /**
     * Fetches recent feedback across all events with event details
     */
    @Query(value = "SELECT f FROM Feedback f LEFT JOIN FETCH f.event ORDER BY f.id DESC")
    List<Feedback> findRecentFeedbackWithEvents();
}
