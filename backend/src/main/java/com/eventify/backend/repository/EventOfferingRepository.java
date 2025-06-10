package com.eventify.backend.repository;

import com.eventify.backend.entity.EventOffering;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventOfferingRepository extends JpaRepository<EventOffering, Long> {
    List<EventOffering> findByMainCategory(com.eventify.backend.entity.Category mainCategory);

    @Query("SELECT DISTINCT eo FROM EventOffering eo LEFT JOIN FETCH eo.categories LEFT JOIN FETCH eo.mainCategory")
    List<EventOffering> findAllWithCategories();

    @Query("SELECT DISTINCT eo FROM EventOffering eo " +
           "LEFT JOIN FETCH eo.categories c " +
           "LEFT JOIN FETCH eo.mainCategory mc " +
           "WHERE (:search IS NULL OR :search = '' OR " +
           "       LOWER(eo.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(eo.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:category IS NULL OR :category = '' OR :category = 'undefined' OR " +
           "     LOWER(mc.name) = LOWER(:category) OR " +
           "     EXISTS (SELECT 1 FROM eo.categories cat WHERE LOWER(cat.name) = LOWER(:category))) " +
           "AND (:minPrice IS NULL OR eo.approximatePrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR eo.approximatePrice <= :maxPrice)")
    List<EventOffering> searchOfferings(
            @Param("search") String search,
            @Param("category") String category,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("sort") String sort
    );

    @Query("SELECT DISTINCT eo FROM EventOffering eo " +
           "LEFT JOIN FETCH eo.categories c " +
           "LEFT JOIN FETCH eo.mainCategory " +
           "WHERE eo.id = :id")
    Optional<EventOffering> findByIdWithCategories(@Param("id") Long id);
}
