package com.eventify.backend.dto;

public class EventRequestDTO {
    private String name;
    private String email;
    private String phone;
    private String message;
    private Long eventId;
    private String eventTitle;
    private String requestType;
    private String requestDate;

    // Default constructor
    public EventRequestDTO() {}

    // Constructor with parameters
    public EventRequestDTO(String name, String email, String phone, String message, Long eventId, String eventTitle, String requestType, String requestDate) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.message = message;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.requestType = requestType;
        this.requestDate = requestDate;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public String getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(String requestDate) {
        this.requestDate = requestDate;
    }
}
