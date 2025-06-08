package com.eventify.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
      @Autowired(required = false)
    private JavaMailSender mailSender;
    
    public void sendEmail(String to, String subject, String body) {
        try {
            if (mailSender == null) {
                System.out.println("Email not configured. Would send email to " + to + " with subject: " + subject);
                return;
            }
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("noreply@eventify.com");
            
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            // Don't throw exception - just log the error
        }
    }
}
