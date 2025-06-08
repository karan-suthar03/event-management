package com.eventify.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.eventify.backend.dto.EventRequestDTO;
import com.eventify.backend.entity.EventRequest;
import com.eventify.backend.repository.EventRequestRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

@Service
public class EventRequestService {
    
    @Autowired
    private EventRequestRepository eventRequestRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private WhatsAppService whatsAppService;
    
    @Value("${admin.email:admin@example.com}")
    private String adminEmail;
    
    @Value("${admin.phone:}")
    private String adminPhone;
      public EventRequest processEventRequest(EventRequestDTO requestDTO) {
        // Save to database first - this is the primary operation
        EventRequest eventRequest = convertToEntity(requestDTO);
        EventRequest savedRequest = eventRequestRepository.save(eventRequest);
        
        // Send notifications asynchronously - don't let failures affect user experience
        try {
            sendEmailNotification(requestDTO);
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
            // Continue execution - don't fail the request
        }
        
        try {
            sendWhatsAppNotification(requestDTO);
        } catch (Exception e) {
            System.err.println("Failed to send WhatsApp notification: " + e.getMessage());
            // Continue execution - don't fail the request
        }
        
        return savedRequest;
    }
    
    private EventRequest convertToEntity(EventRequestDTO dto) {
        EventRequest entity = new EventRequest();
        entity.setName(dto.getName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setMessage(dto.getMessage());
        entity.setEventId(dto.getEventId());
        entity.setEventTitle(dto.getEventTitle());
        entity.setRequestType(dto.getRequestType());
        entity.setViewed(false);
        
        // Parse request date or use current time
        try {
            if (dto.getRequestDate() != null && !dto.getRequestDate().isEmpty()) {
                entity.setRequestDate(LocalDateTime.parse(dto.getRequestDate()));
            } else {
                entity.setRequestDate(LocalDateTime.now());
            }
        } catch (DateTimeParseException e) {
            entity.setRequestDate(LocalDateTime.now());
        }
        
        return entity;
    }
    
    private void sendEmailNotification(EventRequestDTO request) {
        String subject = "🎉 New Event Request - " + (request.getEventTitle() != null ? request.getEventTitle() : "Custom Event");
        String body = buildEmailContent(request);
        emailService.sendEmail(adminEmail, subject, body);
    }
    
    private void sendWhatsAppNotification(EventRequestDTO request) {
        if (adminPhone != null && !adminPhone.isEmpty()) {
            String message = buildWhatsAppMessage(request);
            whatsAppService.sendMessage(adminPhone, message);
        }
    }
      private String buildEmailContent(EventRequestDTO request) {
        return String.format("""
            🎉 NEW EVENT REQUEST RECEIVED
            
            ═══════════════════════════════════════
            EVENT INFORMATION
            ═══════════════════════════════════════
            🆔 Event ID: %s
            🎪 Event Title: %s
            
            ═══════════════════════════════════════
            CLIENT INFORMATION
            ═══════════════════════════════════════
            👤 Name: %s
            📧 Email: %s
            📱 Phone: %s
            
            ═══════════════════════════════════════
            CLIENT MESSAGE
            ═══════════════════════════════════════
            💬 %s
            
            ═══════════════════════════════════════
            NEXT STEPS
            ═══════════════════════════════════════
            ✅ Contact the client within 24 hours
            ✅ Prepare event proposal based on referenced event
            ✅ Schedule consultation if needed
            
            Best regards,
            Eventify System
            """, 
            request.getEventId() != null ? request.getEventId() : "N/A",
            request.getEventTitle() != null ? request.getEventTitle() : "Custom Event Request",
            request.getName() != null ? request.getName() : "Not provided",
            request.getEmail() != null ? request.getEmail() : "Not provided",
            request.getPhone() != null ? request.getPhone() : "Not provided",
            request.getMessage() != null ? request.getMessage() : "No additional message provided."
        );
    }
      private String buildWhatsAppMessage(EventRequestDTO request) {
        return String.format(
            "🎉 *NEW EVENT REQUEST*\n\n" +
            "🆔 *Event ID:* %s\n" +
            "🎪 *Event Title:* %s\n\n" +
            "👤 *Client:* %s\n" +
            "📧 *Email:* %s\n" +
            "📱 *Phone:* %s\n\n" +
            "💬 *Message:*\n%s\n\n" +
            "⏰ *Please respond within 24 hours*",
            request.getEventId() != null ? request.getEventId() : "N/A",
            request.getEventTitle() != null ? request.getEventTitle() : "Custom Event",
            request.getName() != null ? request.getName() : "Not provided",
            request.getEmail() != null ? request.getEmail() : "Not provided", 
            request.getPhone() != null ? request.getPhone() : "Not provided",
            request.getMessage() != null ? request.getMessage() : "No message provided"
        );
    }
}
