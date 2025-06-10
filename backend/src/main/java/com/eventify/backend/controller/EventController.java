package com.eventify.backend.controller;

import com.eventify.backend.entity.*;
import com.eventify.backend.repository.*;
import com.eventify.backend.service.EventNotificationService;
import com.eventify.backend.service.SupabaseStorageService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
public class EventController {
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private EventImageRepository eventImageRepository;
    @Autowired
    private FeedbackRepository feedbackRepository;
    @Autowired
    private GlobalSettingRepository globalSettingRepository;
    @Autowired
    private EventNotificationService eventNotificationService;
    @Autowired
    private SupabaseStorageService supabaseStorageService;

    /**
     * Example GET /api/categories response:
     * [
     * { "id": 1, "name": "Tech", "emoji": "💻" },
     * { "id": 2, "name": "Music", "emoji": "🎵" }
     * ]
     */
    @GetMapping("/categories")
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    /**
     * Example POST /api/categories request body:
     * {
     * "name": "Art",
     * "emoji": "🎨"
     * }
     * <p>
     * Example response:
     * {
     * "id": 3,
     * "name": "Art",
     * "emoji": "🎨"
     * }
     * <p>
     * Example error response:
     * { "error": "Category already exists" }
     */
    @PostMapping("/categories")
    public ResponseEntity<?> addCategory(@RequestBody Category category) {
        if (category.getName() == null || category.getEmoji() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Missing name or emoji"));
        }
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Category already exists"));
        }
        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(saved);
    }

    /**
     * Example GET /api/events response:
     * [
     * {
     * "id": 1,
     * "title": "Tech Conference",
     * "category": { "id": 1, "name": "Tech", "emoji": "💻" },
     * "date": "2025-06-01",
     * "description": "A conference about technology.",
     * "highlights": "Keynote, Workshops",
     * "organizerNotes": "Bring your laptop.",
     * "descriptions": [
     * { "title": "Keynote", "description": "Opening speech by CEO" },
     * { "title": "Workshop", "description": "Hands-on coding session" }
     * ],
     * "location": "Conference Center, City",
     * "featured": false,
     * "images": [
     * { "id": 10, "url": "/uploads/abc123_image.png" }
     * ]
     * }
     * ]
     * <p>
     * Each event object now includes a boolean "featured" property indicating if the event is featured.
     */
    @GetMapping("/events")
    public List<Event> getAllEvents() {
        // Fetch events with all relationships in a single query
        // This assumes you have a method in EventRepository that uses JOIN FETCH
        List<Event> events = eventRepository.findAllWithImages();
        for (Event event : events) {
            if (event.getImages() != null) {
                event.getImages().sort(Comparator.comparing(img -> img.getOrder() != null ? img.getOrder() : Integer.MAX_VALUE));
            }
        }
        return events;
    }

    /**
     * Example GET /api/events/recent response:
     * [
     * {
     * "id": 2,
     * "title": "Music Festival",
     * "category": { "id": 2, "name": "Music", "emoji": "🎵" },
     * "date": "2025-07-10",
     * "description": "A festival of music.",
     * "highlights": "Live Bands, Food Trucks",
     * "organizerNotes": "Outdoor event.",
     * "descriptions": [
     * { "title": "Main Stage", "description": "Live performances all day" }
     * ],
     * "location": "Central Park",
     * "featured": true,
     * "images": [
     * { "id": 12, "url": "/uploads/musicfest.png" }
     * ]
     * }
     * ]
     * <p>
     * Each event object now includes a boolean "featured" property indicating if the event is featured.
     */
    @GetMapping("/events/recent")
    public List<Event> getRecentEvents() {
        // Use optimized repository method to fetch recent events with images in a single query
        List<Event> events = eventRepository.findRecentEventsWithImages().stream()
                .limit(10)
                .toList();

        // Sort images by order for consistent display
        for (Event event : events) {
            if (event.getImages() != null) {
                event.getImages().sort(Comparator.comparing(img -> img.getOrder() != null ? img.getOrder() : Integer.MAX_VALUE));
            }
        }
        return events;
    }

    /**
     * Example POST /api/events request (multipart/form-data):
     * <p>
     * title: "Tech Conference"
     * category: "Tech"
     * date: "2025-06-01"
     * description: "A conference about technology."
     * highlights: "Keynote, Workshops"
     * organizerNotes: "Bring your laptop."
     * descriptions: '[{"title":"Keynote","description":"Opening speech by CEO"},{"title":"Workshop","description":"Hands-on coding session"}]'
     * location: "Conference Center, City"
     * featured: true
     * images: (file upload, can attach multiple images)
     * <p>
     * Example response:
     * {
     * "id": 1,
     * "title": "Tech Conference",
     * "category": { "id": 1, "name": "Tech", "emoji": "💻" },
     * "date": "2025-06-01",
     * "description": "A conference about technology.",
     * "highlights": "Keynote, Workshops",
     * "organizerNotes": "Bring your laptop.",
     * "descriptions": [
     * { "title": "Keynote", "description": "Opening speech by CEO" },
     * { "title": "Workshop", "description": "Hands-on coding session" }
     * ],
     * "location": "Conference Center, City",
     * "featured": true,
     * "images": [
     * { "id": 10, "url": "/uploads/abc123_image.png" }
     * ]
     * }
     * <p>
     * Example error response:
     * { "error": "Invalid date format" }
     * { "error": "Invalid descriptions JSON" }
     * <p>
     * The response now includes a boolean "featured" property in the event object.
     */
    @PostMapping("/events")
    public ResponseEntity<?> addEvent(
            @RequestParam String title,
            @RequestParam String category,
            @RequestParam(required = false) String categoryEmoji,
            @RequestParam String date,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String highlights,
            @RequestParam(required = false) String organizerNotes,
            @RequestParam(required = false) String descriptions, // JSON string
            @RequestParam(required = false) String location,
            @RequestParam(required = false) MultipartFile[] images,
            @RequestParam(required = false, defaultValue = "false") boolean featured,
            HttpServletRequest request
    ) {
        // 1. Check if category exists, if not, add it with provided emoji or default
        Category cat = categoryRepository.findByName(category)
                .orElseGet(() -> {
                    Category newCat = new Category();
                    newCat.setName(category);
                    newCat.setEmoji(categoryEmoji != null ? categoryEmoji : "❓"); // Use provided emoji or default
                    return categoryRepository.save(newCat);
                });
        // 2. Parse date
        LocalDate eventDate;
        try {
            eventDate = LocalDate.parse(date);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid date format"));
        }
        // 3. Parse descriptions JSON
        List<DescriptionSection> descList = new ArrayList<>();
        if (descriptions != null && !descriptions.isBlank()) {
            try {
                descList = objectMapper.readValue(descriptions, new TypeReference<List<DescriptionSection>>() {
                });
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid descriptions JSON"));
            }
        }
        // 4. Save event
        Event event = new Event();
        event.setTitle(title);
        event.setCategory(cat);
        event.setDate(eventDate);
        event.setDescription(description);
        event.setHighlights(highlights);
        event.setOrganizerNotes(organizerNotes);
        event.setDescriptions(descList);
        event.setLocation(location);
        event.setFeatured(featured);
        event = eventRepository.save(event);

        // Send notification for new event creation
        try {
            eventNotificationService.sendEventCreatedNotification(event.getId(), event.getTitle());
        } catch (Exception e) {
            System.err.println("Failed to send event created notification: " + e.getMessage());
        }

        // 5. Save images to Supabase Storage
        System.out.println("=== IMAGE UPLOAD DEBUG ===");
        System.out.println("Images parameter: " + (images != null ? images.length : "null"));
        if (images != null) {
            for (int i = 0; i < images.length; i++) {
                System.out.println("Image " + i + ": " + images[i].getOriginalFilename() + " (" + images[i].getSize() + " bytes)");
            }
        }

        List<EventImage> imageEntities = new ArrayList<>();
        if (images != null) {
            String bucket = "images"; // Changed from "event-files" to "images"
            for (int i = 0; i < images.length; i++) {
                MultipartFile file = images[i];
                System.out.println("Processing image " + i + ": " + file.getOriginalFilename() + ", empty: " + file.isEmpty());
                if (!file.isEmpty()) {
                    try {
                        String extension = "";
                        String originalName = file.getOriginalFilename();
                        if (originalName != null) {
                            int dotIdx = originalName.lastIndexOf('.');
                            if (dotIdx != -1) {
                                extension = originalName.substring(dotIdx);
                            }
                        }
                        String fileName = UUID.randomUUID() + extension;
                        String supabasePath = event.getId() + "/" + fileName;
                        System.out.println("Uploading to Supabase: " + supabasePath);
                        String supabaseUrl = supabaseStorageService.uploadCompressedImage(file, bucket, supabasePath);
                        System.out.println("Got URL back: " + supabaseUrl);
                        EventImage img = new EventImage();
                        img.setUrl(supabaseUrl);
                        img.setEvent(event);
                        img.setOrder(i);
                        imageEntities.add(img);
                        System.out.println("✅ Image entity created successfully");
                    } catch (IOException e) {
                        System.err.println("❌ Error uploading image: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }
            System.out.println("Saving " + imageEntities.size() + " image entities to database");
            eventImageRepository.saveAll(imageEntities);
            event.setImages(imageEntities);
        }
        System.out.println("Final event has " + (event.getImages() != null ? event.getImages().size() : 0) + " images");
        System.out.println("=== END IMAGE UPLOAD DEBUG ===");

        // 6. Return event info
        // Ensure images are sorted by order in the response
        if (event.getImages() != null) {
            event.getImages().sort(Comparator.comparing(EventImage::getOrder));
        }
        return ResponseEntity.ok(event);
    }

    /**
     * Example GET /api/events/{id} response:
     * {
     * "id": 1,
     * "title": "Tech Conference",
     * "category": { "id": 1, "name": "Tech", "emoji": "💻" },
     * "date": "2025-06-01",
     * "description": "A conference about technology.",
     * "highlights": "Keynote, Workshops",
     * "organizerNotes": "Bring your laptop.",
     * "descriptions": [
     * { "title": "Keynote", "description": "Opening speech by CEO" },
     * { "title": "Workshop", "description": "Hands-on coding session" }
     * ],
     * "location": "Conference Center, City",
     * "featured": false,
     * "images": [
     * { "id": 10, "url": "/api/images/abc123_image.png" }
     * ]
     * }
     * <p>
     * Example error response:
     * { "error": "Event not found" }
     * <p>
     * The response now includes a boolean "featured" property in the event object.
     */
    @GetMapping("/events/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        // Use optimized repository method that fetches event with images in a single query
        return eventRepository.findByIdWithImages(id)
                .map(event -> {
                    if (event.getImages() != null) {
                        event.getImages().sort(Comparator.comparing(img -> img.getOrder() != null ? img.getOrder() : Integer.MAX_VALUE));
                    }
                    return ResponseEntity.ok((Object) event);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Event not found")));
    }

    /**
     * Example PUT /api/events/{id} request body:
     * {
     * "title": "Updated Tech Conference",
     * "category": { "id": 1, "name": "Tech", "emoji": "💻" },
     * "date": "2025-07-01",
     * "description": "An updated conference about technology.",
     * "highlights": "Keynote, Advanced Workshops",
     * "organizerNotes": "Bring your laptop and charger.",
     * "descriptions": [
     * { "title": "Keynote", "description": "Opening speech by CTO" },
     * { "title": "Advanced Workshop", "description": "Deep dive into coding" }
     * ],
     * "location": "Conference Center, City",
     * "featured": true,
     * "images": [
     * { "id": 10, "url": "/uploads/abc123_image.png" },
     * { "id": 11, "url": "/uploads/def456_image.png" }
     * ]
     * }
     * <p>
     * Example response:
     * {
     * "id": 1,
     * "title": "Updated Tech Conference",
     * "category": { "id": 1, "name": "Tech", "emoji": "💻" },
     * "date": "2025-07-01",
     * "description": "An updated conference about technology.",
     * "highlights": "Keynote, Advanced Workshops",
     * "organizerNotes": "Bring your laptop and charger.",
     * "descriptions": [
     * { "title": "Keynote", "description": "Opening speech by CTO" },
     * { "title": "Advanced Workshop", "description": "Deep dive into coding" }
     * ],
     * "location": "Conference Center, City",
     * "featured": true,
     * "images": [
     * { "id": 10, "url": "/uploads/abc123_image.png" },
     * { "id": 11, "url": "/uploads/def456_image.png" }
     * ]
     * }
     * <p>
     * Example error response:
     * { "error": "Event not found" }
     * <p>
     * The request and response now include a boolean "featured" property in the event object.
     */
    @PutMapping("/events/{id}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long id,
            @RequestParam("eventData") String eventDataJson,
            @RequestParam(value = "newImages", required = false) MultipartFile[] newImages
    ) {
        try {
            // Parse event data JSON
            Event updatedEvent = objectMapper.readValue(eventDataJson, Event.class);
            return eventRepository.findById(id)
                    .map(event -> {                        // Check if featured status is changing
                        boolean featuredChanged = event.isFeatured() != updatedEvent.isFeatured();
                        boolean newFeaturedStatus = updatedEvent.isFeatured();

                        // Update all fields
                        event.setTitle(updatedEvent.getTitle());
                        event.setDate(updatedEvent.getDate());
                        event.setLocation(updatedEvent.getLocation());
                        event.setDescription(updatedEvent.getDescription());
                        event.setCategory(updatedEvent.getCategory());
                        event.setHighlights(updatedEvent.getHighlights());
                        event.setDescriptions(updatedEvent.getDescriptions());
                        event.setOrganizerNotes(updatedEvent.getOrganizerNotes());
                        event.setFeatured(updatedEvent.isFeatured());

                        // --- IMAGES: update in-place for JPA orphanRemoval ---
                        List<EventImage> existingImages = event.getImages();
                        List<EventImage> newImageList = updatedEvent.getImages() != null ? updatedEvent.getImages() : new ArrayList<>();

                        // 1. Remove images not in new list (by id)
                        Iterator<EventImage> it = existingImages.iterator();
                        while (it.hasNext()) {
                            EventImage img = it.next();
                            boolean stillPresent = newImageList.stream().anyMatch(ni -> ni.getId() != null && ni.getId().equals(img.getId()));
                            if (!stillPresent) {
                                it.remove(); // triggers orphanRemoval
                            }
                        }

                        // 2. Update existing and add new images (from client)
                        for (int i = 0; i < newImageList.size(); i++) {
                            EventImage newImg = newImageList.get(i);
                            if (newImg.getId() != null) {
                                // Update order/url for existing image
                                for (EventImage existing : existingImages) {
                                    if (existing.getId() != null && existing.getId().equals(newImg.getId())) {
                                        existing.setOrder(newImg.getOrder() != null ? newImg.getOrder() : i);
                                        existing.setUrl(newImg.getUrl());
                                        break;
                                    }
                                }
                            } // else: skip, new images will be handled below
                        }

                        // 3. Handle new image uploads
                        if (newImages != null) {
                            String bucket = "event-files";
                            int startOrder = existingImages.size();
                            for (int i = 0; i < newImages.length; i++) {
                                MultipartFile file = newImages[i];
                                if (!file.isEmpty()) {
                                    try {
                                        String extension = "";
                                        String originalName = file.getOriginalFilename();
                                        if (originalName != null) {
                                            int dotIdx = originalName.lastIndexOf('.');
                                            if (dotIdx != -1) {
                                                extension = originalName.substring(dotIdx);
                                            }
                                        }
                                        String fileName = UUID.randomUUID() + extension;
                                        String supabasePath = event.getId() + "/" + fileName;
                                        String supabaseUrl = supabaseStorageService.uploadCompressedImage(file, bucket, supabasePath);
                                        EventImage img = new EventImage();
                                        img.setUrl(supabaseUrl);
                                        img.setEvent(event);
                                        img.setOrder(startOrder + i);
                                        existingImages.add(img);
                                    } catch (IOException e) {
                                        // skip this image
                                    }
                                }
                            }
                        }

                        // --- Ensure images are always ordered by their position in the list after update ---
                        existingImages.sort(Comparator.comparing(img -> {
                            // Try to find the index in newImageList (which is the intended order from the client)
                            if (img.getId() != null) {
                                for (int i = 0; i < newImageList.size(); i++) {
                                    EventImage ni = newImageList.get(i);
                                    if (ni.getId() != null && ni.getId().equals(img.getId())) {
                                        return i;
                                    }
                                }
                            }
                            // If not found, put at the end
                            return Integer.MAX_VALUE;
                        }));
                        for (int i = 0; i < existingImages.size(); i++) {
                            existingImages.get(i).setOrder(i);
                        }
                        eventRepository.save(event);

                        // Send notifications based on what changed
                        try {
                            if (featuredChanged) {
                                // Send specific featured/unfeatured notification
                                eventNotificationService.sendEventFeaturedNotification(event.getId(), event.getTitle(), newFeaturedStatus);
                            } else {
                                // Send general update notification
                                eventNotificationService.sendEventUpdatedNotification(event.getId(), event.getTitle());
                            }
                        } catch (Exception e) {
                            System.err.println("Failed to send event notification: " + e.getMessage());
                        }

                        // Ensure images are sorted by order if present
                        if (event.getImages() != null) {
                            event.getImages().sort(Comparator.comparing(img -> img.getOrder() != null ? img.getOrder() : Integer.MAX_VALUE));
                        }
                        return ResponseEntity.ok((Object) event);
                    })
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Event not found")));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid event data: " + e.getMessage()));
        }
    }

    /**
     * POST /api/events/{id}/feedback
     * Request body: { "name": "User", "text": "Feedback message" }
     * Response: saved Feedback object or error
     */
    @PostMapping("/events/{id}/feedback")
    public ResponseEntity<?> addFeedback(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String text = payload.get("text");
        if (name == null || name.isBlank() || text == null || text.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Name and text are required"));
        }
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Event not found"));
        }
        Feedback feedback = new Feedback();
        feedback.setName(name);
        feedback.setText(text);
        feedback.setEvent(eventOpt.get());
        Feedback saved = feedbackRepository.save(feedback);

        // Send notification for new feedback
        try {
            Event event = eventOpt.get();
            eventNotificationService.sendEventFeedbackNotification(
                    event.getId(),
                    event.getTitle(),
                    saved.getName(),
                    saved.getText()
            );
        } catch (Exception e) {
            System.err.println("Failed to send event feedback notification: " + e.getMessage());
        }

        // Return feedback without event to avoid recursion
        Map<String, Object> resp = new HashMap<>();
        resp.put("id", saved.getId());
        resp.put("name", saved.getName());
        resp.put("text", saved.getText());
        return ResponseEntity.ok(resp);
    }

    /**
     * GET /api/events/{id}/feedback
     * Returns a list of feedback for the event (id)
     */
    @GetMapping("/events/{id}/feedback")
    public ResponseEntity<?> getFeedbackForEvent(@PathVariable Long id) {
        // First check if the event exists
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Event not found"));
        }

        // Use optimized repository method to fetch feedback for event in a single query
        List<Feedback> feedbacks = feedbackRepository.findAllByEventId(id);

        // Map to the response format without querying for events again
        List<Map<String, Object>> result = new ArrayList<>();
        for (Feedback fb : feedbacks) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", fb.getId());
            map.put("name", fb.getName());
            map.put("text", fb.getText());
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/feedbacks/recent
     * Returns the last 10 feedbacks across all events, sorted by id descending (most recent first)
     */
    @GetMapping("/feedbacks/recent")
    public ResponseEntity<?> getRecentFeedbacks() {
        // Use optimized repository method that fetches feedback with event details in a single query
        List<Feedback> feedbacks = feedbackRepository.findRecentFeedbackWithEvents();

        // Map to response format and limit to 10 results
        List<Map<String, Object>> result = new ArrayList<>();
        int count = 0;
        for (Feedback fb : feedbacks) {
            if (count >= 10) break;

            Map<String, Object> map = new HashMap<>();
            map.put("id", fb.getId());
            map.put("name", fb.getName());
            map.put("text", fb.getText());
            if (fb.getEvent() != null) {
                map.put("eventId", fb.getEvent().getId());
                map.put("eventTitle", fb.getEvent().getTitle());
            }
            result.add(map);
            count++;
        }

        return ResponseEntity.ok(result);
    }

    /**
     * DELETE /api/feedbacks/{id}
     * Deletes a feedback by its ID
     */
    @DeleteMapping("/feedbacks/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        if (!feedbackRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Feedback not found"));
        }
        feedbackRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * DELETE /api/events/{id}
     * Deletes an event by its ID (admin only, requires authentication)
     */
    @DeleteMapping("/events/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        // Check if event exists
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Event not found"));
        }

        // Delete the event (this will also cascade delete related images and feedbacks)
        eventRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Event deleted successfully"));
    }

    /**
     * GET /api/global-discount
     * Returns the current global discount percentage (as a number, e.g. 10 for 10%)
     */
    @GetMapping("/global-discount")
    public ResponseEntity<?> getGlobalDiscount() {
        return ResponseEntity.ok(Map.of(
                "discount", globalSettingRepository.findByKey("global_discount")
                        .map(gs -> gs.getValue())
                        .orElse("0")
        ));
    }

    /**
     * POST /api/global-discount
     * Sets the global discount percentage (expects {"discount": 10})
     */
    @PostMapping("/global-discount")
    public ResponseEntity<?> setGlobalDiscount(@RequestBody Map<String, Object> payload) {
        Object discountObj = payload.get("discount");
        if (discountObj == null) return ResponseEntity.badRequest().body(Map.of("error", "Missing discount"));
        String discountStr = discountObj.toString();
        try {
            double val = Double.parseDouble(discountStr);
            if (val < 0 || val > 100)
                return ResponseEntity.badRequest().body(Map.of("error", "Discount must be 0-100"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid discount value"));
        }
        GlobalSetting setting = globalSettingRepository.findByKey("global_discount").orElse(new GlobalSetting("global_discount", discountStr));
        setting.setValue(discountStr);
        globalSettingRepository.save(setting);
        return ResponseEntity.ok(Map.of("discount", discountStr));
    }

    /**
     * GET /api/events/sorted
     * Retrieve all events with robust server-side sorting.
     * Query params:
     * - sort (field name, e.g. 'title', 'date', 'id', 'category', 'featured')
     * - order ('asc' or 'desc', default 'asc')
     * Example: /api/events/sorted?sort=date&order=desc
     */
    @GetMapping("/events/sorted")
    public List<Event> getAllEventsSorted(
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String order
    ) {
        List<Event> events = eventRepository.findAllWithImages();
        events.sort((a, b) -> {
            int cmp = 0;
            switch (sort) {
                case "title":
                    cmp = a.getTitle().compareToIgnoreCase(b.getTitle());
                    break;
                case "date":
                    cmp = a.getDate() != null && b.getDate() != null ?
                            a.getDate().compareTo(b.getDate()) : 0;
                    break;
                case "category":
                    String aCat = a.getCategory() != null ? a.getCategory().getName() : "";
                    String bCat = b.getCategory() != null ? b.getCategory().getName() : "";
                    cmp = aCat.compareToIgnoreCase(bCat);
                    break;
                case "featured":
                    cmp = Boolean.compare(a.isFeatured(), b.isFeatured());
                    break;
                case "id":
                    cmp = Long.compare(a.getId(), b.getId());
                    break;
                default:
                    cmp = 0;
            }
            return "desc".equalsIgnoreCase(order) ? -cmp : cmp;
        });

        // Sort images by order for consistent display
        for (Event event : events) {
            if (event.getImages() != null) {
                event.getImages().sort(Comparator.comparing(img -> img.getOrder() != null ? img.getOrder() : Integer.MAX_VALUE));
            }
        }

        return events;
    }
}
