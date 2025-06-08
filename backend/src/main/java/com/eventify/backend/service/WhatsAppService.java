package com.eventify.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppService {
    
    @Value("${twilio.account.sid:}")
    private String accountSid;
    
    @Value("${twilio.auth.token:}")
    private String authToken;
      @Value("${twilio.whatsapp.from:}")
    private String fromWhatsAppNumber;
    
    public void sendMessage(String toPhoneNumber, String messageBody) {
        try {
            if (accountSid.isEmpty() || authToken.isEmpty() || fromWhatsAppNumber.isEmpty()) {
                System.out.println("WhatsApp not configured. Would send message to " + toPhoneNumber + ": " + messageBody);
                return;
            }
            
            Twilio.init(accountSid, authToken);
            
            Message message = Message.creator(
                new PhoneNumber("whatsapp:" + toPhoneNumber),
                new PhoneNumber("whatsapp:" + fromWhatsAppNumber),
                messageBody
            ).create();
            
            System.out.println("WhatsApp message sent successfully: " + message.getSid());
        } catch (Exception e) {
            System.err.println("Failed to send WhatsApp message to " + toPhoneNumber + ": " + e.getMessage());
            // Don't throw exception - just log the error
        }
    }
}
