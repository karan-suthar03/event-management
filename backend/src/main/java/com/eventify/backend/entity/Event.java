package com.eventify.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Category category;

    @Column(nullable = false)
    private LocalDate date;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String highlights;

    @Column
    private String organizerNotes;

    @Column(nullable = true)
    private String location;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "event_descriptions", joinColumns = @JoinColumn(name = "event_id"))
    private List<DescriptionSection> descriptions = new ArrayList<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventImage> images = new ArrayList<>();

    @Column(nullable = false)
    private boolean featured = false;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getHighlights() { return highlights; }
    public void setHighlights(String highlights) { this.highlights = highlights; }
    public String getOrganizerNotes() { return organizerNotes; }
    public void setOrganizerNotes(String organizerNotes) { this.organizerNotes = organizerNotes; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public List<DescriptionSection> getDescriptions() { return descriptions; }
    public void setDescriptions(List<DescriptionSection> descriptions) { this.descriptions = descriptions; }
    public List<EventImage> getImages() { return images; }
    public void setImages(List<EventImage> images) { this.images = images; }
    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }
}
