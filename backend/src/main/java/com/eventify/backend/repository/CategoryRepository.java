package com.eventify.backend.repository;

import com.eventify.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    @Query("""
        SELECT c.id, c.name, c.emoji, COUNT(DISTINCT eo.id) as offeringCount
        FROM Category c
        LEFT JOIN EventOffering eo ON (c.id = eo.mainCategory.id OR c.id IN (SELECT cat.id FROM eo.categories cat))
        GROUP BY c.id, c.name, c.emoji
        HAVING COUNT(DISTINCT eo.id) > 0
        ORDER BY COUNT(DISTINCT eo.id) DESC, c.name ASC
    """)
    List<Object[]> findCategoriesWithOfferingCount();
}
