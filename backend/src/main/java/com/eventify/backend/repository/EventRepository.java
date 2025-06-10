package com.eventify.backend.repository;

import com.eventify.backend.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    /**
     * Fetches all events with their associated images in a single query using JOIN FETCH
     * This avoids N+1 query problems
     */
    @Query("SELECT DISTINCT e FROM Event e LEFT JOIN FETCH e.images LEFT JOIN FETCH e.category")
    List<Event> findAllWithImages();

    /**
     * Fetches a specific event with its images in a single query
     */
    @Query("SELECT e FROM Event e LEFT JOIN FETCH e.images LEFT JOIN FETCH e.category WHERE e.id = :id")
    Optional<Event> findByIdWithImages(@Param("id") Long id);

    /**
     * Fetches recent events with their images ordered by date desc
     */
    @Query(value = "SELECT DISTINCT e FROM Event e LEFT JOIN FETCH e.images LEFT JOIN FETCH e.category ORDER BY e.date DESC")
    List<Event> findRecentEventsWithImages();
}
