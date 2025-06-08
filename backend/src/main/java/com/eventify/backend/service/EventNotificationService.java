package com.eventify.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.eventify.backend.entity.Event;
import com.eventify.backend.repository.EventRepository;
import java.util.Optional;

@Service
public class EventNotificationService {
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private WhatsAppService whatsAppService;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Value("${admin.email:admin@example.com}")
    private String adminEmail;
    
    @Value("${admin.phone:}")
    private String adminPhone;
    
    /**
     * Send notification when a new event is created
     */
    public void sendEventCreatedNotification(Long eventId, String eventTitle) {
        try {
            sendEventCreatedEmail(eventId, eventTitle);
        } catch (Exception e) {
            System.err.println("Failed to send event created email notification: " + e.getMessage());
        }
        
        try {
            sendEventCreatedWhatsApp(eventId, eventTitle);
        } catch (Exception e) {
            System.err.println("Failed to send event created WhatsApp notification: " + e.getMessage());
        }
    }
    
    /**
     * Send notification when an event is updated
     */
    public void sendEventUpdatedNotification(Long eventId, String eventTitle) {
        try {
            sendEventUpdatedEmail(eventId, eventTitle);
        } catch (Exception e) {
            System.err.println("Failed to send event updated email notification: " + e.getMessage());
        }
        
        try {
            sendEventUpdatedWhatsApp(eventId, eventTitle);
        } catch (Exception e) {
            System.err.println("Failed to send event updated WhatsApp notification: " + e.getMessage());
        }
    }
    
    /**
     * Send notification when an event receives new feedback
     */
    public void sendEventFeedbackNotification(Long eventId, String eventTitle, String feedbackerName, String feedbackText) {
        try {
            sendEventFeedbackEmail(eventId, eventTitle, feedbackerName, feedbackText);
        } catch (Exception e) {
            System.err.println("Failed to send event feedback email notification: " + e.getMessage());
        }
        
        try {
            sendEventFeedbackWhatsApp(eventId, eventTitle, feedbackerName, feedbackText);
        } catch (Exception e) {
            System.err.println("Failed to send event feedback WhatsApp notification: " + e.getMessage());
        }
    }
    
    /**
     * Send notification when an event is featured/unfeatured
     */
    public void sendEventFeaturedNotification(Long eventId, String eventTitle, boolean isFeatured) {
        try {
            sendEventFeaturedEmail(eventId, eventTitle, isFeatured);
        } catch (Exception e) {
            System.err.println("Failed to send event featured email notification: " + e.getMessage());
        }
        
        try {
            sendEventFeaturedWhatsApp(eventId, eventTitle, isFeatured);
        } catch (Exception e) {
            System.err.println("Failed to send event featured WhatsApp notification: " + e.getMessage());
        }
    }
    
    /**
     * Generic method to send custom event notification
     */
    public void sendCustomEventNotification(Long eventId, String eventTitle, String subject, String message) {
        try {
            emailService.sendEmail(adminEmail, subject, buildCustomEmailContent(eventId, eventTitle, message));
        } catch (Exception e) {
            System.err.println("Failed to send custom event email notification: " + e.getMessage());
        }
        
        try {
            if (adminPhone != null && !adminPhone.isEmpty()) {
                whatsAppService.sendMessage(adminPhone, buildCustomWhatsAppMessage(eventId, eventTitle, message));
            }
        } catch (Exception e) {
            System.err.println("Failed to send custom event WhatsApp notification: " + e.getMessage());
        }
    }
    
    // Private methods for building email content
    private void sendEventCreatedEmail(Long eventId, String eventTitle) {
        String subject = "🎉 New Event Created - " + eventTitle;
        String body = buildEventCreatedEmailContent(eventId, eventTitle);
        emailService.sendEmail(adminEmail, subject, body);
    }
    
    private void sendEventUpdatedEmail(Long eventId, String eventTitle) {
        String subject = "✏️ Event Updated - " + eventTitle;
        String body = buildEventUpdatedEmailContent(eventId, eventTitle);
        emailService.sendEmail(adminEmail, subject, body);
    }
    
    private void sendEventFeedbackEmail(Long eventId, String eventTitle, String feedbackerName, String feedbackText) {
        String subject = "💬 New Feedback for Event - " + eventTitle;
        String body = buildEventFeedbackEmailContent(eventId, eventTitle, feedbackerName, feedbackText);
        emailService.sendEmail(adminEmail, subject, body);
    }
    
    private void sendEventFeaturedEmail(Long eventId, String eventTitle, boolean isFeatured) {
        String subject = (isFeatured ? "⭐ Event Featured - " : "📌 Event Unfeatured - ") + eventTitle;
        String body = buildEventFeaturedEmailContent(eventId, eventTitle, isFeatured);
        emailService.sendEmail(adminEmail, subject, body);
    }
    
    // Private methods for building WhatsApp messages
    private void sendEventCreatedWhatsApp(Long eventId, String eventTitle) {
        if (adminPhone != null && !adminPhone.isEmpty()) {
            String message = buildEventCreatedWhatsAppMessage(eventId, eventTitle);
            whatsAppService.sendMessage(adminPhone, message);
        }
    }
    
    private void sendEventUpdatedWhatsApp(Long eventId, String eventTitle) {
        if (adminPhone != null && !adminPhone.isEmpty()) {
            String message = buildEventUpdatedWhatsAppMessage(eventId, eventTitle);
            whatsAppService.sendMessage(adminPhone, message);
        }
    }
    
    private void sendEventFeedbackWhatsApp(Long eventId, String eventTitle, String feedbackerName, String feedbackText) {
        if (adminPhone != null && !adminPhone.isEmpty()) {
            String message = buildEventFeedbackWhatsAppMessage(eventId, eventTitle, feedbackerName, feedbackText);
            whatsAppService.sendMessage(adminPhone, message);
        }
    }
    
    private void sendEventFeaturedWhatsApp(Long eventId, String eventTitle, boolean isFeatured) {
        if (adminPhone != null && !adminPhone.isEmpty()) {
            String message = buildEventFeaturedWhatsAppMessage(eventId, eventTitle, isFeatured);
            whatsAppService.sendMessage(adminPhone, message);
        }
    }
    
    // Email content builders
    private String buildEventCreatedEmailContent(Long eventId, String eventTitle) {
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        Event event = eventOpt.orElse(null);
        
        return String.format("""
            🎉 NEW EVENT CREATED
            
            ═══════════════════════════════════════
            EVENT INFORMATION
            ═══════════════════════════════════════
            🆔 Event ID: %s
            🎪 Event Title: %s
            📅 Event Date: %s
            📍 Location: %s
            📝 Description: %s
            
            ═══════════════════════════════════════
            NEXT STEPS
            ═══════════════════════════════════════
            ✅ Review event details in admin dashboard
            ✅ Add promotional materials if needed
            ✅ Monitor for feedback and bookings
            
            Best regards,
            Eventify System
            """, 
            eventId,
            eventTitle,
            event != null && event.getDate() != null ? event.getDate().toString() : "Not specified",
            event != null && event.getLocation() != null ? event.getLocation() : "Not specified",
            event != null && event.getDescription() != null ? event.getDescription() : "No description provided"
        );
    }
    
    private String buildEventUpdatedEmailContent(Long eventId, String eventTitle) {
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        Event event = eventOpt.orElse(null);
        
        return String.format("""
            ✏️ EVENT UPDATED
            
            ═══════════════════════════════════════
            EVENT INFORMATION
            ═══════════════════════════════════════
            🆔 Event ID: %s
            🎪 Event Title: %s
            📅 Event Date: %s
            📍 Location: %s
            ⭐ Featured: %s
            
            ═══════════════════════════════════════
            NEXT STEPS
            ═══════════════════════════════════════
            ✅ Review updated event details
            ✅ Notify existing registrants if necessary
            ✅ Update promotional materials
            
            Best regards,
            Eventify System
            """, 
            eventId,
            eventTitle,
            event != null && event.getDate() != null ? event.getDate().toString() : "Not specified",
            event != null && event.getLocation() != null ? event.getLocation() : "Not specified",
            event != null ? (event.isFeatured() ? "Yes" : "No") : "No"
        );
    }
    
    private String buildEventFeedbackEmailContent(Long eventId, String eventTitle, String feedbackerName, String feedbackText) {
        return String.format("""
            💬 NEW FEEDBACK RECEIVED
            
            ═══════════════════════════════════════
            EVENT INFORMATION
            ═══════════════════════════════════════
            🆔 Event ID: %s
            🎪 Event Title: %s
            
            ═══════════════════════════════════════
            FEEDBACK DETAILS
            ═══════════════════════════════════════
            👤 Feedback by: %s
            💭 Feedback: %s
            
            ═══════════════════════════════════════
            NEXT STEPS
            ═══════════════════════════════════════
            ✅ Review feedback in admin dashboard
            ✅ Consider starring positive feedback
            ✅ Respond to feedback if necessary
            
            Best regards,
            Eventify System
            """, 
            eventId,
            eventTitle,
            feedbackerName != null ? feedbackerName : "Anonymous",
            feedbackText != null ? feedbackText : "No feedback text provided"
        );
    }
    
    private String buildEventFeaturedEmailContent(Long eventId, String eventTitle, boolean isFeatured) {
        String action = isFeatured ? "FEATURED" : "UNFEATURED";
        String actionEmoji = isFeatured ? "⭐" : "📌";
        String nextSteps = isFeatured ? 
            "✅ Event will appear prominently on homepage\n            ✅ Increased visibility for potential attendees\n            ✅ Monitor engagement and bookings" :
            "✅ Event removed from featured section\n            ✅ Still visible in regular event listings\n            ✅ Consider featuring other events";
            
        return String.format("""
            %s EVENT %s
            
            ═══════════════════════════════════════
            EVENT INFORMATION
            ═══════════════════════════════════════
            🆔 Event ID: %s
            🎪 Event Title: %s
            ⭐ Featured Status: %s
            
            ═══════════════════════════════════════
            NEXT STEPS
            ═══════════════════════════════════════
            %s
            
            Best regards,
            Eventify System
            """, 
            actionEmoji, action,
            eventId,
            eventTitle,
            isFeatured ? "Featured" : "Not Featured",
            nextSteps
        );
    }
    
    private String buildCustomEmailContent(Long eventId, String eventTitle, String customMessage) {
        return String.format("""
            📢 EVENT NOTIFICATION
            
            ═══════════════════════════════════════
            EVENT INFORMATION
            ═══════════════════════════════════════
            🆔 Event ID: %s
            🎪 Event Title: %s
            
            ═══════════════════════════════════════
            NOTIFICATION MESSAGE
            ═══════════════════════════════════════
            %s
            
            Best regards,
            Eventify System
            """, 
            eventId,
            eventTitle,
            customMessage != null ? customMessage : "No message provided"
        );
    }
    
    // WhatsApp message builders
    private String buildEventCreatedWhatsAppMessage(Long eventId, String eventTitle) {
        return String.format(
            "🎉 *NEW EVENT CREATED*\n\n" +
            "🆔 *Event ID:* %s\n" +
            "🎪 *Event Title:* %s\n\n" +
            "✅ *Review in admin dashboard*\n" +
            "✅ *Add promotional materials*\n" +
            "✅ *Monitor for bookings*",
            eventId,
            eventTitle
        );
    }
    
    private String buildEventUpdatedWhatsAppMessage(Long eventId, String eventTitle) {
        return String.format(
            "✏️ *EVENT UPDATED*\n\n" +
            "🆔 *Event ID:* %s\n" +
            "🎪 *Event Title:* %s\n\n" +
            "✅ *Review updated details*\n" +
            "✅ *Notify existing registrants*\n" +
            "✅ *Update promotional materials*",
            eventId,
            eventTitle
        );
    }
    
    private String buildEventFeedbackWhatsAppMessage(Long eventId, String eventTitle, String feedbackerName, String feedbackText) {
        return String.format(
            "💬 *NEW FEEDBACK*\n\n" +
            "🆔 *Event ID:* %s\n" +
            "🎪 *Event:* %s\n\n" +
            "👤 *From:* %s\n" +
            "💭 *Feedback:* %s\n\n" +
            "✅ *Review in admin dashboard*",
            eventId,
            eventTitle,
            feedbackerName != null ? feedbackerName : "Anonymous",
            feedbackText != null && feedbackText.length() > 100 ? 
                feedbackText.substring(0, 100) + "..." : 
                (feedbackText != null ? feedbackText : "No feedback text")
        );
    }
    
    private String buildEventFeaturedWhatsAppMessage(Long eventId, String eventTitle, boolean isFeatured) {
        String action = isFeatured ? "FEATURED" : "UNFEATURED";
        String emoji = isFeatured ? "⭐" : "📌";
        
        return String.format(
            "%s *EVENT %s*\n\n" +
            "🆔 *Event ID:* %s\n" +
            "🎪 *Event Title:* %s\n\n" +
            "✅ *Status updated successfully*\n" +
            "✅ *Check homepage for changes*",
            emoji, action,
            eventId,
            eventTitle
        );
    }
    
    private String buildCustomWhatsAppMessage(Long eventId, String eventTitle, String customMessage) {
        return String.format(
            "📢 *EVENT NOTIFICATION*\n\n" +
            "🆔 *Event ID:* %s\n" +
            "🎪 *Event:* %s\n\n" +
            "💬 *Message:*\n%s",
            eventId,
            eventTitle,
            customMessage != null && customMessage.length() > 150 ? 
                customMessage.substring(0, 150) + "..." : 
                (customMessage != null ? customMessage : "No message provided")
        );
    }
}
