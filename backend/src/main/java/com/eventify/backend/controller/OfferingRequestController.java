package com.eventify.backend.controller;

import com.eventify.backend.entity.OfferingRequest;
import com.eventify.backend.repository.OfferingRequestRepository;
import com.eventify.backend.service.OfferingRequestService;
import com.eventify.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class OfferingRequestController {
    @Autowired
    private OfferingRequestRepository offeringRequestRepository;
    
    @Autowired
    private OfferingRequestService offeringRequestService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Create a new offering request
     * POST /api/requests
     * {"name": "John Doe", "contact": "john@example.com", "message": "I'm interested", "offeringId": 1, "offeringTitle": "Birthday Decoration"}
     */    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody Map<String, Object> requestData) {
        try {
            // Required fields validation
            if (requestData.get("name") == null || requestData.get("contact") == null || requestData.get("offeringId") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name, contact and offeringId are required"));
            }
            
            // Use the service to process the request with notifications
            OfferingRequest savedRequest = offeringRequestService.processOfferingRequest(requestData);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedRequest);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get all offering requests (protected, admin only)
     * GET /api/requests
     */
    @GetMapping
    public ResponseEntity<?> getAllRequests(HttpServletRequest httpRequest) {
        // Validate JWT token
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        
        try {
            jwtUtil.validateToken(authHeader.substring(7));
            List<OfferingRequest> requests = offeringRequestRepository.findAllByOrderByRequestDateDesc();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
        }
    }
    
    /**
     * Mark request as viewed (protected, admin only)
     * PUT /api/requests/{id}/viewed
     */
    @PutMapping("/{id}/viewed")
    public ResponseEntity<?> markAsViewed(@PathVariable Long id, HttpServletRequest httpRequest) {
        // Validate JWT token
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        
        try {
            jwtUtil.validateToken(authHeader.substring(7));

            return offeringRequestRepository.findById(id)
                .map(request -> {
                    request.setViewed(true);
                    offeringRequestRepository.save(request);
                    return ResponseEntity.ok(request);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
        }
    }
    
    /**
     * Get unviewed requests count (protected, admin only)
     * GET /api/requests/unviewed-count
     */
    @GetMapping("/unviewed-count")
    public ResponseEntity<?> getUnviewedCount(HttpServletRequest httpRequest) {
        // Validate JWT token
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        
        try {
            jwtUtil.validateToken(authHeader.substring(7));
            long count = offeringRequestRepository.countByViewedFalse();
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
        }
    }
    
    /**
     * Delete a request (protected, admin only)
     * DELETE /api/requests/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id, HttpServletRequest httpRequest) {
        // Validate JWT token
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        
        try {
            jwtUtil.validateToken(authHeader.substring(7));

            if (offeringRequestRepository.existsById(id)) {
                offeringRequestRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
        }
    }
}
