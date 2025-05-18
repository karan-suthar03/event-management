package com.eventify.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "event_images")
public class EventImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
}
