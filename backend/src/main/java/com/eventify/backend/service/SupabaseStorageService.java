package com.eventify.backend.service;

import net.coobird.thumbnailator.Thumbnails;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.entity.ByteArrayEntity;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.logging.Logger;

@Service
public class SupabaseStorageService {
    
    private static final Logger logger = Logger.getLogger(SupabaseStorageService.class.getName());
    private static final long MAX_FALLBACK_SIZE = 5 * 1024 * 1024; // 5MB

    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.service.key}")
    private String supabaseServiceKey;

    /**
     * Uploads and compresses an image file to Supabase Storage.
     * Supports WebP, JPEG, PNG, GIF, BMP formats.
     * Falls back to original file if compression fails and file is under 5MB.
     * 
     * @param file The image file to upload
     * @param bucket The Supabase storage bucket name
     * @param path The file path within the bucket
     * @return The public URL of the uploaded image
     * @throws IOException If upload fails or file is too large
     */
    public String uploadCompressedImage(MultipartFile file, String bucket, String path) throws IOException {
        // Ensure the bucket exists
        try {
            createBucketIfNotExists(bucket);
        } catch (Exception e) {
            logger.warning("Could not create/verify bucket: " + e.getMessage());
        }
        
        // Compress image using Thumbnailator
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            // Convert to JPEG format for optimal compression and compatibility
            Thumbnails.of(file.getInputStream())
                    .size(1024, 1024)
                    .outputQuality(0.7)
                    .outputFormat("JPEG")
                    .toOutputStream(outputStream);
        } catch (Exception e) {
            // Fallback: use original file if compression fails and file is small enough
            if (file.getSize() <= MAX_FALLBACK_SIZE) {
                logger.info("Using original file without compression due to format issue: " + file.getOriginalFilename());
                try {
                    file.getInputStream().transferTo(outputStream);
                } catch (IOException ioE) {
                    throw new IOException("Failed to process image file: " + e.getMessage());
                }
            } else {
                throw new IOException("Image file is too large and cannot be compressed. " +
                    "Supported formats: JPEG, PNG, GIF, BMP, WebP. Maximum size for fallback: 5MB. " +
                    "File: " + file.getOriginalFilename());
            }
        }
        
        byte[] imageBytes = outputStream.toByteArray();
        
        // Determine content type
        String contentType = determineContentType(file, imageBytes);
        
        // Upload to Supabase Storage
        return uploadToSupabase(imageBytes, contentType, bucket, path);
    }

    /**
     * Determines the appropriate content type for the upload
     */
    private String determineContentType(MultipartFile file, byte[] processedBytes) {
        // If we compressed the image, it's now JPEG
        if (processedBytes.length != file.getSize()) {
            return "image/jpeg";
        }
        // Otherwise, use original content type or default to JPEG
        return file.getContentType() != null ? file.getContentType() : "image/jpeg";
    }

    /**
     * Uploads the processed image bytes to Supabase Storage
     */
    private String uploadToSupabase(byte[] imageBytes, String contentType, String bucket, String path) throws IOException {
        String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, path);
        
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(uploadUrl);
            post.setHeader("Authorization", "Bearer " + supabaseServiceKey);
            post.setHeader("Content-Type", contentType);
            post.setHeader("Cache-Control", "3600");
            post.setHeader("x-upsert", "true");
            
            ByteArrayEntity entity = new ByteArrayEntity(imageBytes, ContentType.create(contentType));
            post.setEntity(entity);
            
            return client.execute(post, response -> {
                int status = response.getCode();
                
                if (status < 200 || status >= 300) {
                    String responseBody = "";
                    HttpEntity responseEntity = response.getEntity();
                    if (responseEntity != null) {
                        try {
                            responseBody = EntityUtils.toString(responseEntity);
                        } catch (Exception e) {
                            logger.warning("Error reading response body: " + e.getMessage());
                        }
                    }
                    
                    // Log specific authentication errors
                    if (status == 403 || responseBody.contains("Unauthorized")) {
                        logger.severe("Supabase authentication failed. Check service key configuration.");
                    }
                    
                    throw new IOException("Failed to upload image to Supabase: " + status + " - " + responseBody);
                }
                
                // Return the public URL for the uploaded image
                return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucket, path);
            });
        }
    }
    
    /**
     * Creates a Supabase storage bucket if it doesn't exist
     */
    public void createBucketIfNotExists(String bucket) throws IOException {
        String createBucketUrl = String.format("%s/storage/v1/bucket", supabaseUrl);
        String bucketJson = String.format("{\"id\":\"%s\",\"name\":\"%s\",\"public\":true}", bucket, bucket);
        
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(createBucketUrl);
            post.setHeader("Authorization", "Bearer " + supabaseServiceKey);
            post.setHeader("Content-Type", "application/json");
            
            StringEntity entity = new StringEntity(bucketJson, ContentType.APPLICATION_JSON);
            post.setEntity(entity);
            
            client.execute(post, response -> {
                int status = response.getCode();
                
                if (status == 200 || status == 201) {
                    logger.info("Bucket created successfully: " + bucket);
                } else if (status == 409) {
                    // Bucket already exists - this is fine
                    logger.fine("Bucket already exists: " + bucket);
                } else {
                    logger.warning("Failed to create bucket " + bucket + ": " + status);
                }
                
                return null;
            });
        }
    }
}
