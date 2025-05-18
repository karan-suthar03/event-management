package com.eventify.backend.model;

public class AdminResponse {
    private String username;
    private String name;

    public AdminResponse(String username, String name) {
        this.username = username;
        this.name = name;
    }

    public String getUsername() {
        return username;
    }

    public String getName() {
        return name;
    }
}
