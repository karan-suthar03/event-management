package com.eventify.backend.controller;

import com.eventify.backend.entity.OfferingRequest;
import com.eventify.backend.repository.OfferingRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Legacy controller for managing customer requests for offerings.
 * @deprecated Use {@link OfferingRequestController} instead.
 */
@RestController
@RequestMapping("/api/legacy-requests")
@Deprecated
public class RequestController {
    
    @Autowired
    private OfferingRequestRepository offeringRequestRepository;
    
    /**
     * Create a new offering request
     * @param request The request details
     * @return The saved request
     * @deprecated Use {@link OfferingRequestController#createRequest(Map)} instead.
     */
    @PostMapping
    @Deprecated
    public ResponseEntity<OfferingRequest> createRequest(@RequestBody OfferingRequest request) {
        request.setRequestDate(LocalDateTime.now());
        request.setViewed(false);
        OfferingRequest savedRequest = offeringRequestRepository.save(request);
        return ResponseEntity.ok(savedRequest);
    }
      /**
     * Get all offering requests (for admin)
     * @return List of all requests
     * @deprecated Use {@link OfferingRequestController#getAllRequests(jakarta.servlet.http.HttpServletRequest)} instead.
     */
    @GetMapping
    @Deprecated
    public ResponseEntity<List<OfferingRequest>> getAllRequests() {
        return ResponseEntity.ok(offeringRequestRepository.findAllByOrderByRequestDateDesc());
    }
    
    /**
     * Get count of unviewed requests
     * @return Count of unviewed requests
     * @deprecated Use {@link OfferingRequestController#getUnviewedCount(jakarta.servlet.http.HttpServletRequest)} instead.
     */
    @GetMapping("/unviewed-count")
    @Deprecated
    public ResponseEntity<Map<String, Long>> getUnviewedCount() {
        long count = offeringRequestRepository.countByViewedFalse();
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    /**
     * Mark a request as viewed
     * @param id The request ID
     * @return The updated request
     * @deprecated Use {@link OfferingRequestController#markAsViewed(Long, jakarta.servlet.http.HttpServletRequest)} instead.
     */
    @PutMapping("/{id}/mark-viewed")
    @Deprecated
    public ResponseEntity<OfferingRequest> markViewed(@PathVariable Long id) {
        return offeringRequestRepository.findById(id)
                .map(request -> {
                    request.setViewed(true);
                    return ResponseEntity.ok(offeringRequestRepository.save(request));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete a request
     * @param id The request ID
     * @return Empty response
     * @deprecated No replacement available in OfferingRequestController.
     */
    @DeleteMapping("/{id}")
    @Deprecated
    public ResponseEntity<?> deleteRequest(@PathVariable Long id) {
        if (offeringRequestRepository.existsById(id)) {
            offeringRequestRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
