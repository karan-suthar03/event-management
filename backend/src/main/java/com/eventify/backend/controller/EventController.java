package com.eventify.backend.controller;

import com.eventify.backend.entity.*;
import com.eventify.backend.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api")
public class EventController {
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private EventImageRepository eventImageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Example GET /api/categories response:
     * [
     *   { "id": 1, "name": "Tech", "emoji": "💻" },
     *   { "id": 2, "name": "Music", "emoji": "🎵" }
     * ]
     */
    @GetMapping("/categories")
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    /**
     * Example POST /api/categories request body:
     * {
     *   "name": "Art",
     *   "emoji": "🎨"
     * }
     *
     * Example response:
     * {
     *   "id": 3,
     *   "name": "Art",
     *   "emoji": "🎨"
     * }
     *
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
     *   {
     *     "id": 1,
     *     "title": "Tech Conference",
     *     "category": { "id": 1, "name": "Tech", "emoji": "💻" },
     *     "date": "2025-06-01",
     *     "description": "A conference about technology.",
     *     "highlights": "Keynote, Workshops",
     *     "organizerNotes": "Bring your laptop.",
     *     "descriptions": [
     *       { "title": "Keynote", "description": "Opening speech by CEO" },
     *       { "title": "Workshop", "description": "Hands-on coding session" }
     *     ],
     *     "images": [
     *       { "id": 10, "url": "/uploads/abc123_image.png" }
     *     ]
     *   }
     * ]
     */
    @GetMapping("/events")
    public List<Event> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        for (Event event : events) {
            if (event.getImages() != null) {
                event.getImages().sort(Comparator.comparing(img -> img.getOrder() != null ? img.getOrder() : Integer.MAX_VALUE));
            }
        }
        return events;
    }

    @GetMapping("/events/recent")
    public List<Event> getRecentEvents() {
        List<Event> events = eventRepository.findAll().stream()
                .sorted(Comparator.comparing(Event::getDate).reversed())
                .limit(10)
                .toList();
        for (Event event : events) {
            if (event.getImages() != null) {
                event.getImages().sort(Comparator.comparing(img -> img.getOrder() != null ? img.getOrder() : Integer.MAX_VALUE));
            }
        }
        return events;
    }

    /**
     * Example POST /api/events request (multipart/form-data):
     *
     * title: "Tech Conference"
     * category: "Tech"
     * date: "2025-06-01"
     * description: "A conference about technology."
     * highlights: "Keynote, Workshops"
     * organizerNotes: "Bring your laptop."
     * descriptions: '[{"title":"Keynote","description":"Opening speech by CEO"},{"title":"Workshop","description":"Hands-on coding session"}]'
     * location: "Conference Center, City"
     * images: (file upload, can attach multiple images)
     *
     * Example response:
     * {
     *   "id": 1,
     *   "title": "Tech Conference",
     *   "category": { "id": 1, "name": "Tech", "emoji": "💻" },
     *   "date": "2025-06-01",
     *   "description": "A conference about technology.",
     *   "highlights": "Keynote, Workshops",
     *   "organizerNotes": "Bring your laptop.",
     *   "descriptions": [
     *     { "title": "Keynote", "description": "Opening speech by CEO" },
     *     { "title": "Workshop", "description": "Hands-on coding session" }
     *   ],
     *   "location": "Conference Center, City",
     *   "images": [
     *     { "id": 10, "url": "/uploads/abc123_image.png" }
     *   ]
     * }
     *
     * Example error response:
     * { "error": "Invalid date format" }
     * { "error": "Invalid descriptions JSON" }
     */
    @PostMapping("/events")
    public ResponseEntity<?> addEvent(
            @RequestParam String title,
            @RequestParam String category,
            @RequestParam String date,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String highlights,
            @RequestParam(required = false) String organizerNotes,
            @RequestParam(required = false) String descriptions, // JSON string
            @RequestParam(required = false) String location,
            @RequestParam(required = false) MultipartFile[] images,
            HttpServletRequest request
    ) {
        // 1. Check if category exists, if not, add it with a default emoji
        Category cat = categoryRepository.findByName(category)
            .orElseGet(() -> {
                Category newCat = new Category();
                newCat.setName(category);
                newCat.setEmoji("❓"); // Default emoji if not provided
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
                descList = objectMapper.readValue(descriptions, new TypeReference<List<DescriptionSection>>(){});
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
        event = eventRepository.save(event);
        // 5. Save images
        List<EventImage> imageEntities = new ArrayList<>();
        if (images != null) {
            String uploadDir = "src/main/resources/static/uploads/";
            new File(uploadDir).mkdirs();
            for (int i = 0; i < images.length; i++) {
                MultipartFile file = images[i];
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
                        String fileName = UUID.randomUUID().toString() + extension;
                        Path filePath = Paths.get(uploadDir, fileName);
                        Files.write(filePath, file.getBytes());
                        EventImage img = new EventImage();
                        img.setUrl("/uploads/" + fileName);
                        img.setEvent(event);
                        img.setOrder(i); // Set order based on upload order
                        imageEntities.add(img);
                    } catch (IOException e) {
                        // skip this image
                    }
                }
            }
            eventImageRepository.saveAll(imageEntities);
            event.setImages(imageEntities);
        }
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
     *   "id": 1,
     *   "title": "Tech Conference",
     *   "category": { "id": 1, "name": "Tech", "emoji": "💻" },
     *   "date": "2025-06-01",
     *   "description": "A conference about technology.",
     *   "highlights": "Keynote, Workshops",
     *   "organizerNotes": "Bring your laptop.",
     *   "descriptions": [
     *     { "title": "Keynote", "description": "Opening speech by CEO" },
     *     { "title": "Workshop", "description": "Hands-on coding session" }
     *   ],
     *   "images": [
     *     { "id": 10, "url": "/api/images/abc123_image.png" }
     *   ]
     * }
     *
     * Example error response:
     * { "error": "Event not found" }
     */
    @GetMapping("/events/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(event -> {
                    if (event.getImages() != null) {
                        event.getImages().sort(Comparator.comparing(img -> img.getOrder() != null ? img.getOrder() : Integer.MAX_VALUE));
                    }
                    return ResponseEntity.ok((Object) event);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Event not found")));
    }
}
