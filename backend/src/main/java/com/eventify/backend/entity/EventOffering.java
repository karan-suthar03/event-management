package com.eventify.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "event_offerings")
public class EventOffering {    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;    @Column(nullable = false, length = 1000)
    private String title;

    @Column(nullable = false, length = 2000)
    private String decorationImageUrl;

    @Column(nullable = false)
    private Double approximatePrice;

    @Column(length = 1000)
    private String description;

    @Column(length = 2000)
    private String inclusions;

    @ManyToMany
    @JoinTable(
        name = "event_offering_categories",
        joinColumns = @JoinColumn(name = "offering_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private List<Category> categories;

    @ManyToOne
    @JoinColumn(name = "main_category_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Category mainCategory;

    @Column(length = 20)
    private String discountType; // "global", "special", or null/empty

    @Column(name = "specific_discounted_price")
    private Double specificDiscountedPrice;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDecorationImageUrl() { return decorationImageUrl; }
    public void setDecorationImageUrl(String decorationImageUrl) { this.decorationImageUrl = decorationImageUrl; }
    public Double getApproximatePrice() { return approximatePrice; }
    public void setApproximatePrice(Double approximatePrice) { this.approximatePrice = approximatePrice; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getInclusions() { return inclusions; }
    public void setInclusions(String inclusions) { this.inclusions = inclusions; }
    public List<Category> getCategories() { return categories; }
    public void setCategories(List<Category> categories) { this.categories = categories; }
    public Category getMainCategory() { return mainCategory; }
    public void setMainCategory(Category mainCategory) { this.mainCategory = mainCategory; }
    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }
    public Double getSpecificDiscountedPrice() { return specificDiscountedPrice; }
    public void setSpecificDiscountedPrice(Double specificDiscountedPrice) { this.specificDiscountedPrice = specificDiscountedPrice; }
}
