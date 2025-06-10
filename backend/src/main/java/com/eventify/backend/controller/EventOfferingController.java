package com.eventify.backend.controller;

import com.eventify.backend.entity.EventOffering;
import com.eventify.backend.entity.Category;
import com.eventify.backend.repository.EventOfferingRepository;
import com.eventify.backend.repository.CategoryRepository;
import com.eventify.backend.pojo.CategoryWithCount;
import com.eventify.backend.service.SupabaseStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.util.*;

/**
 * Controller for managing event offerings (decor packages Ananya can organize)
 */
@RestController
@RequestMapping("/api/offerings")
public class EventOfferingController {
    // Injects the repository for event offerings
    @Autowired
    private EventOfferingRepository eventOfferingRepository;

    // Injects the repository for categories
    @Autowired
    private CategoryRepository categoryRepository;

    // Injects the Supabase storage service
    @Autowired
    private SupabaseStorageService supabaseStorageService;

    /**
     * POST /api/offerings
     * Request (application/json):
     * {
     *   "title": "Birthday Balloon Decor",
     *   "decorationImageUrl": "/uploads/abc123_image.png",
     *   "approximatePrice": 2500.0,
     *   "description": "Colorful balloon decorations for birthdays",
     *   "inclusions": "Happy Birthday Rose Gold Cursive Bunting; 2 Led Warm White Lights; ...",
     *   "categories": [
     *     { "name": "Music", "emoji": "🎵" },
     *     { "name": "Birthday", "emoji": "🎂" }
     *   ],
     *   "mainCategory": { "name": "Music", "emoji": "🎵" }
     * }
     * Response:
     * {
     *   "id": 1,
     *   "title": "Birthday Balloon Decor",
     *   "decorationImageUrl": "/uploads/abc123_image.png",
     *   "approximatePrice": 2500.0,
     *   "description": "Colorful balloon decorations for birthdays",
     *   "inclusions": "Happy Birthday Rose Gold Cursive Bunting; 2 Led Warm White Lights; ...",
     *   "categories": [
     *     { "id": 1, "name": "Birthday", "emoji": "🎂" },
     *     { "id": 2, "name": "Music", "emoji": "🎵" }
     *   },
     *   "mainCategory": { "id": 1, "name": "Birthday", "emoji": "🎂" }
     * }
     */
    @PostMapping
    public ResponseEntity<EventOffering> addOffering(@RequestBody Map<String, Object> payload) {
        EventOffering offering = new EventOffering();
        offering.setTitle((String) payload.get("title"));
        offering.setDecorationImageUrl((String) payload.get("decorationImageUrl"));
        offering.setApproximatePrice(Double.valueOf(payload.get("approximatePrice").toString()));
        offering.setDescription((String) payload.get("description"));
        offering.setInclusions((String) payload.get("inclusions"));
        // Handle categories as list of {name, emoji}
        ArrayList<Category> categories = new ArrayList<>();
        if (payload.get("categories") instanceof List<?> catList) {
            for (Object catObj : catList) {
                if (catObj instanceof Map<?,?> catMap) {
                    String name = (String) catMap.get("name");
                    String emoji = (String) catMap.get("emoji");
                    if (name != null && emoji != null) {
                        Category cat = categoryRepository.findByName(name).orElseGet(() -> {
                            Category c = new Category();
                            c.setName(name);
                            c.setEmoji(emoji);
                            return categoryRepository.save(c);
                        });
                        categories.add(cat);
                    }
                }
            }
        }
        offering.setCategories(categories);
        // Handle mainCategory as {name, emoji}
        if (payload.get("mainCategory") instanceof Map<?,?> mainCatMap) {
            String name = (String) mainCatMap.get("name");
            String emoji = (String) mainCatMap.get("emoji");
            if (name != null && emoji != null) {
                Category mainCat = categoryRepository.findByName(name).orElseGet(() -> {
                    Category c = new Category();
                    c.setName(name);
                    c.setEmoji(emoji);
                    return categoryRepository.save(c);
                });
                offering.setMainCategory(mainCat);
            }
        }        EventOffering saved = eventOfferingRepository.save(offering);
        return ResponseEntity.ok(saved);
    }

    /**
     * GET /api/offerings
     * Retrieve all event offerings.
     * Response: List of EventOffering objects.
     */
    @GetMapping
    public List<EventOffering> getAllOfferings() {
        return eventOfferingRepository.findAllWithCategories();
    }

    /**
     * GET /api/offerings/{id}
     * Retrieve a single event offering by its ID.
     * Response: EventOffering object if found, 404 otherwise.
     */
    @GetMapping("/{id}")
    public ResponseEntity<EventOffering> getOfferingById(@PathVariable Long id) {
        return eventOfferingRepository.findByIdWithCategories(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/offerings/{id}
     * Delete an event offering by its ID.
     * Response: 200 OK if deleted, 404 if not found.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOffering(@PathVariable Long id) {
        if (!eventOfferingRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eventOfferingRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/offerings (multipart/form-data)
     * Create a new event offering with optional image upload.
     * Form params:
     *   - title (required)
     *   - approximatePrice (required)
     *   - description (optional)
     *   - inclusions (optional, semicolon-separated)
     *   - image (optional file)
     *   - decorationImageUrl (optional, used if no image uploaded)
     *   - categories (required, JSON array of {name, emoji})
     *   - mainCategory (required, JSON object {name, emoji})
     * Response: The created EventOffering object.
     */
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<EventOffering> addOfferingMultipart(
            @RequestParam String title,
            @RequestParam Double approximatePrice,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String inclusions,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) String decorationImageUrl,
            @RequestParam String categories,
            @RequestParam String mainCategory
    ) {
        String imageUrl = decorationImageUrl;
        if (image != null && !image.isEmpty()) {
            try {
                String extension = StringUtils.getFilenameExtension(image.getOriginalFilename());
                String fileName = UUID.randomUUID().toString() + (extension != null ? "." + extension : "");
                String bucket = "offerings";
                String supabasePath = fileName;
                imageUrl = supabaseStorageService.uploadCompressedImage(image, bucket, supabasePath);
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        }
        EventOffering offering = new EventOffering();
        offering.setTitle(title);
        offering.setApproximatePrice(approximatePrice);
        offering.setDescription(description);
        offering.setDecorationImageUrl(imageUrl);
        offering.setInclusions(inclusions);
        // Parse categories JSON
        List<Category> categoryEntities = new ArrayList<>();
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<?> catListRaw = mapper.readValue(categories, List.class);
            for (Object catObj : catListRaw) {
                if (catObj instanceof Map<?,?> catMap) {
                    String name = (String) catMap.get("name");
                    String emoji = (String) catMap.get("emoji");
                    if (name != null && emoji != null) {
                        Category cat = categoryRepository.findByName(name).orElseGet(() -> {
                            Category c = new Category();
                            c.setName(name);
                            c.setEmoji(emoji);
                            return categoryRepository.save(c);
                        });
                        categoryEntities.add(cat);
                    }
                }
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        offering.setCategories(categoryEntities);
        // Parse mainCategory JSON
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Object mainCatRaw = mapper.readValue(mainCategory, Object.class);
            if (mainCatRaw instanceof Map<?,?> mainCatMap) {
                String name = (String) mainCatMap.get("name");
                String emoji = (String) mainCatMap.get("emoji");
                if (name != null && emoji != null) {
                    Category mainCat = categoryRepository.findByName(name).orElseGet(() -> {
                        Category c = new Category();
                        c.setName(name);
                        c.setEmoji(emoji);
                        return categoryRepository.save(c);
                    });
                    offering.setMainCategory(mainCat);
                }
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        EventOffering saved = eventOfferingRepository.save(offering);
        return ResponseEntity.ok(saved);
    }

    /**
     * PUT /api/offerings/{id} (multipart/form-data)
     * Update an existing event offering, with optional image upload.
     * Form params:
     *   - title (required)
     *   - approximatePrice (required)
     *   - description (optional)
     *   - inclusions (optional, semicolon-separated)
     *   - image (optional file)
     *   - decorationImageUrl (optional, used if no image uploaded)
     * Response: The updated EventOffering object, or 404 if not found.
     */
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<EventOffering> updateOffering(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam Double approximatePrice,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String inclusions,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) String decorationImageUrl,
            @RequestParam(required = false) String categories,
            @RequestParam(required = false) String mainCategory,
            @RequestParam(required = false) String discountType,
            @RequestParam(required = false) Double discount,
            @RequestParam(required = false) Double specificDiscountedPrice
    ) {
        return eventOfferingRepository.findById(id).map(offering -> {
            String imageUrl = decorationImageUrl;
            if (image != null && !image.isEmpty()) {
                try {
                    String extension = StringUtils.getFilenameExtension(image.getOriginalFilename());
                    String fileName = UUID.randomUUID().toString() + (extension != null ? "." + extension : "");
                    String bucket = "offerings";
                    String supabasePath = fileName;
                    imageUrl = supabaseStorageService.uploadCompressedImage(image, bucket, supabasePath);
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body((EventOffering) null);
                }
            }
            offering.setTitle(title);
            offering.setApproximatePrice(approximatePrice);
            offering.setDescription(description);
            offering.setDecorationImageUrl(imageUrl);
            offering.setInclusions(inclusions);
            // --- Handle categories update ---
            if (categories != null) {
                try {
                    var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    java.util.List<?> catListRaw = mapper.readValue(categories, java.util.List.class);
                    java.util.List<Category> categoryEntities = new java.util.ArrayList<>();
                    for (Object catObj : catListRaw) {
                        if (catObj instanceof java.util.Map<?,?> catMap) {
                            String name = (String) catMap.get("name");
                            String emoji = (String) catMap.get("emoji");
                            if (name != null && emoji != null) {
                                Category cat = categoryRepository.findByName(name).orElseGet(() -> {
                                    Category c = new Category();
                                    c.setName(name);
                                    c.setEmoji(emoji);
                                    return categoryRepository.save(c);
                                });
                                categoryEntities.add(cat);
                            }
                        }
                    }
                    offering.setCategories(categoryEntities);
                } catch (Exception e) {
                    // ignore, keep old categories if parse fails
                }
            }
            // --- Handle mainCategory update ---
            if (mainCategory != null) {
                try {
                    var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    Object mainCatRaw = mapper.readValue(mainCategory, Object.class);
                    if (mainCatRaw instanceof java.util.Map<?,?> mainCatMap) {
                        String name = (String) mainCatMap.get("name");
                        String emoji = (String) mainCatMap.get("emoji");
                        if (name != null && emoji != null) {
                            Category mainCat = categoryRepository.findByName(name).orElseGet(() -> {
                                Category c = new Category();
                                c.setName(name);
                                c.setEmoji(emoji);
                                return categoryRepository.save(c);
                            });
                            offering.setMainCategory(mainCat);
                        }
                    }
                } catch (Exception e) {
                    // ignore, keep old mainCategory if parse fails
                }
            }
            // --- Handle discount fields update ---
            if (discountType == null || discountType.isEmpty()) {
                offering.setDiscountType(null);
                offering.setSpecificDiscountedPrice(null);
            } else if ("GLOBAL".equals(discountType)) {
                offering.setDiscountType("GLOBAL");
                offering.setSpecificDiscountedPrice(null);
            } else if ("SPECIAL".equals(discountType)) {
                offering.setDiscountType("SPECIAL");
                if (specificDiscountedPrice != null) {
                    offering.setSpecificDiscountedPrice(specificDiscountedPrice);
                }
            }
            EventOffering saved = eventOfferingRepository.save(offering);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * GET /api/categories-with-count
     * Returns all categories with the number of offerings in each.
     * Response:
     * [
     *   { "id": 1, "name": "Birthday", "emoji": "🎂", "offeringCount": 5 },
     *   ...
     * ]
     */
    @GetMapping("/categories-with-count")
    public List<CategoryWithCount> getCategoriesWithOfferingCount() {
        List<Object[]> rows = categoryRepository.findCategoriesWithOfferingCount();
        List<CategoryWithCount> result = new ArrayList<>();
        for (Object[] row : rows) {
            Long id = ((Number) row[0]).longValue();
            String name = (String) row[1];
            String emoji = (String) row[2];
            Long count = ((Number) row[3]).longValue();
            result.add(new CategoryWithCount(id, name, emoji, count));
        }
        return result;
    }

    /**
     * GET /api/offerings/by-main-category
     * Retrieve all event offerings with the given main category name.
     * Example: /api/offerings/by-main-category?name=Birthday
     * Response: List of EventOffering objects.
     */
    @GetMapping("/by-main-category")
    public ResponseEntity<List<EventOffering>> getOfferingsByMainCategory(@RequestParam String name) {
        Category mainCategory = categoryRepository.findByName(name).orElse(null);
        if (mainCategory == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }
        List<EventOffering> offerings = eventOfferingRepository.findByMainCategory(mainCategory);
        return ResponseEntity.ok(offerings);
    }

    /**
     * GET /api/offerings/sorted
     * Retrieve all offerings with robust server-side sorting.
     * Query params:
     *   - sort (field name, e.g. 'title', 'approximatePrice', 'id', 'mainCategory', 'category', 'created', 'updated')
     *   - order ('asc' or 'desc', default 'asc')
     * Example: /api/offerings/sorted?sort=approximatePrice&order=desc
     */
    @GetMapping("/sorted")
    public List<EventOffering> getAllOfferingsSorted(
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String order
    ) {
        // Use findAllWithCategories() to fetch all offerings and their categories in a single query
        List<EventOffering> offerings = eventOfferingRepository.findAllWithCategories();
        offerings.sort((a, b) -> {
            int cmp = 0;
            switch (sort) {
                case "title":
                    cmp = a.getTitle().compareToIgnoreCase(b.getTitle());
                    break;
                case "approximatePrice":
                    cmp = Double.compare(
                        a.getApproximatePrice() != null ? a.getApproximatePrice() : 0.0,
                        b.getApproximatePrice() != null ? b.getApproximatePrice() : 0.0
                    );
                    break;
                case "mainCategory":
                    cmp = a.getMainCategory() != null && b.getMainCategory() != null ?
                        a.getMainCategory().getName().compareToIgnoreCase(b.getMainCategory().getName()) : 0;
                    break;
                case "category":
                    String aCat = a.getCategories() != null && !a.getCategories().isEmpty() ? a.getCategories().get(0).getName() : "";
                    String bCat = b.getCategories() != null && !b.getCategories().isEmpty() ? b.getCategories().get(0).getName() : "";
                    cmp = aCat.compareToIgnoreCase(bCat);
                    break;
                case "id":
                    cmp = Long.compare(a.getId(), b.getId());
                    break;
                default:
                    cmp = 0;
            }
            return "desc".equalsIgnoreCase(order) ? -cmp : cmp;
        });
        return offerings;
    }

    /**
     * GET /api/offerings/search
     * Search, filter, and sort offerings for the frontend UI.
     * Query params:
     *   - search (string, optional)
     *   - priceRange (e.g. "10000-19999", optional)
     *   - sort ("low" or "high", optional)
     *   - category (category name, optional)
     * Returns: List<EventOffering> matching filters
     */
    @GetMapping("/search")
    public List<EventOffering> searchOfferings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String priceRange,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String category
    ) {
        // Parse price range if provided
        Double minPrice = null;
        Double maxPrice = null;
        if (priceRange != null && priceRange.matches("\\d+-\\d+")) {
            String[] parts = priceRange.split("-");
            minPrice = Double.parseDouble(parts[0]);
            maxPrice = Double.parseDouble(parts[1]);
        }

        // Make a single database request with filters applied
        List<EventOffering> results = eventOfferingRepository.searchOfferings(search, category, minPrice, maxPrice, sort);

        // Apply sorting in memory since we can't use ORDER BY with DISTINCT in PostgreSQL for non-selected fields
        if (sort != null) {
            if (sort.equals("low")) {
                results.sort(Comparator.comparingDouble(a -> a.getApproximatePrice() != null ? a.getApproximatePrice() : 0.0));
            } else if (sort.equals("high")) {
                results.sort((a, b) -> Double.compare(
                    b.getApproximatePrice() != null ? b.getApproximatePrice() : 0.0,
                    a.getApproximatePrice() != null ? a.getApproximatePrice() : 0.0
                ));
            }
        }

        return results;
    }

    /**
     * The 'inclusions' field (semicolon-separated string) is supported in all offering APIs.
     * Example: "Happy Birthday Rose Gold Cursive Bunting; 2 Led Warm White Lights; ..."
     * To add or update, include the 'inclusions' field in the JSON or as a form param.
     */
    /**
     * GET /api/offerings/grouped-by-main-category
     * Returns all offerings grouped by main category, sorted by number of offerings in each category (descending).
     * Response:
     * [
     *   {
     *     id: 1,
     *     name: "Birthday",
     *     emoji: "🎂",
     *     offerings: [ ... ]
     *   },
     *   ...
     * ]
     */
    @GetMapping("/grouped-by-main-category")
    public List<Map<String, Object>> getOfferingsGroupedByMainCategory() {
        // Use findAllWithCategories to fetch all offerings and their related data in a single query
        List<EventOffering> offerings = eventOfferingRepository.findAllWithCategories();
        Map<Long, Map<String, Object>> grouped = new java.util.HashMap<>();
        for (EventOffering offering : offerings) {
            Category mainCat = offering.getMainCategory();
            if (mainCat == null) continue;
            Long catId = mainCat.getId();
            if (!grouped.containsKey(catId)) {
                Map<String, Object> group = new java.util.HashMap<>();
                group.put("id", mainCat.getId());
                group.put("name", mainCat.getName());
                group.put("emoji", mainCat.getEmoji());
                group.put("offerings", new java.util.ArrayList<EventOffering>());
                grouped.put(catId, group);
            }
            ((List<EventOffering>) grouped.get(catId).get("offerings")).add(offering);
        }
        // Sort groups by number of offerings descending
        List<Map<String, Object>> result = new java.util.ArrayList<>(grouped.values());
        result.sort((a, b) -> ((List<?>)b.get("offerings")).size() - ((List<?>)a.get("offerings")).size());
        return result;
    }
}

