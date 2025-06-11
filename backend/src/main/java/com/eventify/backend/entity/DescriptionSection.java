package com.eventify.backend.entity;

import jakarta.persistence.*;

@Embeddable
public class DescriptionSection {
    @Column(length = 1000)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
