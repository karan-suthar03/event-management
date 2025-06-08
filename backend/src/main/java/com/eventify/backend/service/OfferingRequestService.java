package com.eventify.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.eventify.backend.entity.OfferingRequest;
import com.eventify.backend.entity.EventOffering;
import com.eventify.backend.entity.GlobalSetting;
import com.eventify.backend.repository.OfferingRequestRepository;
import com.eventify.backend.repository.EventOfferingRepository;
import com.eventify.backend.repository.GlobalSettingRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.Optional;

@Service
public class OfferingRequestService {
    
    @Autowired
    private OfferingRequestRepository offeringRequestRepository;
    
    @Autowired
    private EventOfferingRepository offeringRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private WhatsAppService whatsAppService;

    @Autowired
    private GlobalSettingRepository globalSettingRepository;
    
    @Value("${admin.email:admin@example.com}")
    private String adminEmail;
    
    @Value("${admin.phone:}")
    private String adminPhone;

    public OfferingRequest processOfferingRequest(Map<String, Object> requestData) {
        // Save to database first - this is the primary operation
        OfferingRequest request = convertToEntity(requestData);
        OfferingRequest savedRequest = offeringRequestRepository.save(request);
        
        // Send notifications asynchronously - don't let failures affect user experience
        try {
            sendEmailNotification(savedRequest);
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
            // Continue execution - don't fail the request
        }
        
        try {
            sendWhatsAppNotification(savedRequest);
        } catch (Exception e) {
            System.err.println("Failed to send WhatsApp notification: " + e.getMessage());
            // Continue execution - don't fail the request
        }
        
        return savedRequest;
    }
    
    private OfferingRequest convertToEntity(Map<String, Object> requestData) {
        OfferingRequest request = new OfferingRequest();
        
        request.setName((String) requestData.get("name"));
        request.setContact((String) requestData.get("contact"));
        request.setMessage((String) requestData.get("message"));
        request.setOfferingId(Long.valueOf(String.valueOf(requestData.get("offeringId"))));
        request.setOfferingTitle((String) requestData.get("offeringTitle"));
        
        // Handle optional date field
        String requestDateStr = (String) requestData.get("requestDate");
        if (requestDateStr != null && !requestDateStr.isEmpty()) {
            try {
                request.setRequestDate(LocalDateTime.parse(requestDateStr));
            } catch (DateTimeParseException e) {
                request.setRequestDate(LocalDateTime.now());
            }
        } else {
            request.setRequestDate(LocalDateTime.now());
        }
        
        request.setViewed(false);
        
        return request;
    }
    
    private void sendEmailNotification(OfferingRequest request) {
        String subject = "🎁 New Offering Request - " + (request.getOfferingTitle() != null ? request.getOfferingTitle() : "Service Request");
        String body = buildEmailContent(request);
        emailService.sendEmail(adminEmail, subject, body);
    }
    
    private void sendWhatsAppNotification(OfferingRequest request) {
        if (adminPhone != null && !adminPhone.isEmpty()) {
            String message = buildWhatsAppMessage(request);
            whatsAppService.sendMessage(adminPhone, message);
        }
    }
      private String getOfferingDetails(Long offeringId) {
        if (offeringId == null) {
            return "🌟 Service: Service Request\n🆔 Offering ID: Not specified";
        }
        
        Optional<EventOffering> offeringOpt;
        try {
            offeringOpt = offeringRepository.findById(offeringId);
            if (offeringOpt.isEmpty()) {
                System.err.println("WARNING: Offering with ID " + offeringId + " not found in database");
                return "🌟 Service: Service Request\n🆔 Offering ID: " + offeringId + " (Offering no longer available)";
            }
        } catch (Exception e) {
            System.err.println("ERROR: Failed to fetch offering with ID " + offeringId + ": " + e.getMessage());
            return "🌟 Service: Service Request\n🆔 Offering ID: " + offeringId + " (Database error)";
        }
        
        EventOffering offering = offeringOpt.get();
        StringBuilder details = new StringBuilder();
        
        details.append("🌟 Service: ").append(offering.getTitle() != null ? offering.getTitle() : "Unknown Service").append("\n");
        details.append("🆔 Offering ID: ").append(offeringId).append("\n");

        if(offering.getDiscountType() != null && !offering.getDiscountType().isEmpty()) {
            details.append("💸 Discount Type: ").append(offering.getDiscountType()).append("\n");
            if (offering.getDiscountType().equals("GLOBAL")) {
                GlobalSetting globalSetting = globalSettingRepository.findByKey("global_discount").orElse(null);
                if (globalSetting != null && globalSetting.getValue() != null) {
                    BigDecimal discount = new BigDecimal(globalSetting.getValue());
                    Double price = offering.getApproximatePrice();
                    if (price != null) {
                        price = price - (price * discount.doubleValue() / 100);
                        details.append("💰 price: ").append(price).append(" (discounted)\n");
                    }
                } 
            } else if (offering.getDiscountType().equals("SPECIAL")) {
                details.append("💰 Price: ").append(offering.getSpecificDiscountedPrice()).append(" (special rate)\n");
            }
        }
        
        return details.toString().trim();
    }    private String getOfferingDetailsForWhatsApp(Long offeringId) {
        if (offeringId == null) {
            return "🌟 *Service:* Service Request\n🆔 *ID:* Not specified";
        }
        
        Optional<EventOffering> offeringOpt;
        try {
            offeringOpt = offeringRepository.findById(offeringId);
            if (offeringOpt.isEmpty()) {
                System.err.println("WARNING: Offering with ID " + offeringId + " not found in database");
                return "🌟 *Service:* Service Request\n🆔 *ID:* " + offeringId + " (Offering no longer available)";
            }
        } catch (Exception e) {
            System.err.println("ERROR: Failed to fetch offering with ID " + offeringId + ": " + e.getMessage());
            return "🌟 *Service:* Service Request\n🆔 *ID:* " + offeringId + " (Database error)";
        }

        EventOffering offering = offeringOpt.get();
        StringBuilder details = new StringBuilder();
        
        details.append("🌟 *Service:* ").append(offering.getTitle() != null ? offering.getTitle() : "Unknown Service").append("\n");
        details.append("🆔 *ID:* ").append(offeringId).append("\n");

        
        
        if (offering.getApproximatePrice() != null) {
            Double price = offering.getApproximatePrice();
            // get global discount
            GlobalSetting globalSetting = globalSettingRepository.findByKey("global_discount").orElse(null);
            if (globalSetting != null && globalSetting.getValue() != null) {
                BigDecimal discount = new BigDecimal(globalSetting.getValue());
                price = price - (price * discount.doubleValue() / 100);
                details.append("💰 *Price:* INR").append(price).append(" (discounted)").append("\n");
            }else {
                details.append("💰 *Price:* INR").append(price).append("\n");
            }
        }
        
        return details.toString().trim();
    }
    
    private String buildEmailContent(OfferingRequest request) {
        return String.format("""
            🎁 NEW OFFERING REQUEST RECEIVED
            
            ═══════════════════════════════════════
            CLIENT INFORMATION
            ═══════════════════════════════════════
            👤 Name: %s
            📧 Contact: %s
            
            ═══════════════════════════════════════
            OFFERING DETAILS
            ═══════════════════════════════════════
            %s
            📅 Request Date: %s
            
            ═══════════════════════════════════════
            CLIENT MESSAGE
            ═══════════════════════════════════════
            💬 %s
            
            ═══════════════════════════════════════
            NEXT STEPS
            ═══════════════════════════════════════
            ✅ Review the request details above
            ✅ Contact the client within 24 hours
            ✅ Prepare a customized quote
            ✅ Schedule a consultation if needed
            
            Best regards,
            Eventify System
            """, 
            request.getName() != null ? request.getName() : "Not provided",
            request.getContact() != null ? request.getContact() : "Not provided",
            getOfferingDetails(request.getOfferingId()),
            request.getRequestDate() != null ? request.getRequestDate().toString() : "Not specified",
            request.getMessage() != null ? request.getMessage() : "No additional message provided."
        );
    }
      private String buildWhatsAppMessage(OfferingRequest request) {
        // Get detailed offering information for WhatsApp
        String offeringDetails = getOfferingDetailsForWhatsApp(request.getOfferingId());
        
        return String.format(
            "🎁 *NEW OFFERING REQUEST*\n\n" +
            "👤 *Client:* %s\n" +
            "📧 *Contact:* %s\n\n" +
            "%s\n\n" +
            "💬 *Message:*\n%s\n\n" +
            "⏰ *Please respond within 24 hours*",
            request.getName() != null ? request.getName() : "Not provided",
            request.getContact() != null ? request.getContact() : "Not provided",
            offeringDetails,
            request.getMessage() != null ? request.getMessage() : "No message provided"
        );
    }
}
