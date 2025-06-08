package com.eventify.backend.entity;

import jakarta.persistence.*;

@Entity
public class GlobalSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String key;

    @Column(nullable = false)
    private String value;

    public GlobalSetting() {}
    public GlobalSetting(String key, String value) {
        this.key = key;
        this.value = value;
    }
    public Long getId() { return id; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
