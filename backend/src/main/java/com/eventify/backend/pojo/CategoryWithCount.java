package com.eventify.backend.pojo;

public class CategoryWithCount {
    private Long id;
    private String name;
    private String emoji;
    private Long offeringCount;

    public CategoryWithCount(Long id, String name, String emoji, Long offeringCount) {
        this.id = id;
        this.name = name;
        this.emoji = emoji;
        this.offeringCount = offeringCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
    public Long getOfferingCount() { return offeringCount; }
    public void setOfferingCount(Long offeringCount) { this.offeringCount = offeringCount; }
}
