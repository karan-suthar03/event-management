package com.eventify.backend.controller;

import com.eventify.backend.dto.EventRequestDTO;
import com.eventify.backend.entity.EventRequest;
import com.eventify.backend.repository.EventRequestRepository;
import com.eventify.backend.service.EventRequestService;
import com.eventify.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/event-requests")
@CrossOrigin(origins = "http://localhost:3000")
public class EventRequestController {    @Autowired
    private EventRequestService eventRequestService;

    @Autowired
    private EventRequestRepository eventRequestRepository;

    /**
     * Submit a new event request
     * POST /api/event-requests
     */
    @PostMapping
    public ResponseEntity<?> submitRequest(@RequestBody EventRequestDTO requestDTO) {
        try {
            // Validate required fields
            if (requestDTO.getName() == null || requestDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
            }
            if (requestDTO.getEmail() == null || requestDTO.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            EventRequest savedRequest = eventRequestService.processEventRequest(requestDTO);
            return ResponseEntity.ok(Map.of(
                "message", "Request submitted successfully!",
                "requestId", savedRequest.getId()
            ));
        } catch (Exception e) {
            System.err.println("Error processing event request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to submit request. Please try again."));
        }
    }    /**
     * Get all event requests (Admin only)
     * GET /api/event-requests
     */
    @GetMapping
    public ResponseEntity<?> getAllRequests(HttpServletRequest request) {
        try {
            // Check authentication
            String token = getTokenFromRequest(request);
            if (token == null || !isValidToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
            }

            List<EventRequest> requests = eventRequestRepository.findAllByOrderByRequestDateDesc();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch requests"));
        }
    }    /**
     * Mark request as viewed
     * PUT /api/event-requests/{id}/viewed
     */
    @PutMapping("/{id}/viewed")
    public ResponseEntity<?> markAsViewed(@PathVariable Long id, HttpServletRequest request) {
        try {
            // Check authentication
            String token = getTokenFromRequest(request);
            if (token == null || !isValidToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
            }

            Optional<EventRequest> optionalRequest = eventRequestRepository.findById(id);
            if (optionalRequest.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            EventRequest eventRequest = optionalRequest.get();
            eventRequest.setViewed(true);
            eventRequestRepository.save(eventRequest);

            return ResponseEntity.ok(Map.of("message", "Request marked as viewed"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update request"));
        }
    }    /**
     * Get count of unviewed requests
     * GET /api/event-requests/unviewed-count
     */
    @GetMapping("/unviewed-count")
    public ResponseEntity<?> getUnviewedCount(HttpServletRequest request) {
        try {
            // Check authentication
            String token = getTokenFromRequest(request);
            if (token == null || !isValidToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
            }

            long count = eventRequestRepository.countByViewedFalse();
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get unviewed count"));
        }
    }    /**
     * Delete a request
     * DELETE /api/event-requests/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id, HttpServletRequest request) {
        try {
            // Check authentication
            String token = getTokenFromRequest(request);
            if (token == null || !isValidToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
            }

            if (!eventRequestRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            eventRequestRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Request deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete request"));
        }
    }    private String getTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private boolean isValidToken(String token) {
        try {
            JwtUtil.validateToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
