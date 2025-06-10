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

@Service
public class SupabaseStorageService {    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.service.key}")
    private String supabaseServiceKey;    public String uploadCompressedImage(MultipartFile file, String bucket, String path) throws IOException {
        System.out.println("=== SUPABASE UPLOAD DEBUG ===");
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        System.out.println("Bucket: " + bucket);
        System.out.println("Path: " + path);
        System.out.println("Supabase URL: " + supabaseUrl);
        
        // First, ensure the bucket exists
        try {
            createBucketIfNotExists(bucket);
        } catch (Exception e) {
            System.err.println("Warning: Could not create/verify bucket: " + e.getMessage());
        }
        
        // Compress image using Thumbnailator
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Thumbnails.of(file.getInputStream())
                .size(1024, 1024)
                .outputQuality(0.7)
                .toOutputStream(outputStream);
        byte[] compressedBytes = outputStream.toByteArray();
        
        System.out.println("Compressed size: " + compressedBytes.length);

        // Prepare Supabase Storage upload URL
        String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, path);
        System.out.println("Upload URL: " + uploadUrl);        // Upload to Supabase Storage using HTTP client
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(uploadUrl);
            post.setHeader("Authorization", "Bearer " + supabaseServiceKey);
            post.setHeader("Content-Type", "image/jpeg");
            post.setHeader("Cache-Control", "3600");
            post.setHeader("x-upsert", "true");
            
            ByteArrayEntity entity = new ByteArrayEntity(compressedBytes, ContentType.IMAGE_JPEG);
            post.setEntity(entity);
            
            System.out.println("Sending request to Supabase...");
            System.out.println("Headers: ");
            System.out.println("  Authorization: Bearer " + supabaseServiceKey.substring(0, 20) + "...");
            System.out.println("  Content-Type: image/jpeg");
            System.out.println("  x-upsert: true");
            
            return client.execute(post, response -> {
                int status = response.getCode();
                System.out.println("Supabase response status: " + status);
                
                // Read response body for debugging
                HttpEntity responseEntity = response.getEntity();
                String responseBody = "";
                if (responseEntity != null) {
                    try {
                        responseBody = EntityUtils.toString(responseEntity);
                        System.out.println("Supabase response body: " + responseBody);
                    } catch (Exception e) {
                        System.err.println("Error reading response body: " + e.getMessage());
                    }
                }
                
                if (status < 200 || status >= 300) {
                    System.err.println("ERROR: Failed to upload to Supabase: " + status);
                    
                    // Provide specific error guidance
                    if (status == 403 || (responseBody.contains("Unauthorized") || responseBody.contains("signature verification failed"))) {
                        System.err.println("❌ AUTHENTICATION ERROR: Your Supabase service key is invalid or expired.");
                        System.err.println("📋 Please get a new service key from: https://supabase.com/dashboard/project/sddtrrwndrdrgnpcgupq/settings/api");
                        System.err.println("🔧 Then update the 'supabase.service.key' property in application.properties");
                    }
                    
                    throw new IOException("Failed to upload image to Supabase: " + status + " - " + responseBody);
                } else {
                    System.out.println("✅ Upload successful!");
                }
                
                // Return the public URL for the uploaded image
                String publicUrl = String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucket, path);
                System.out.println("Public URL: " + publicUrl);
                System.out.println("=== END SUPABASE DEBUG ===");
                return publicUrl;
            });
        }
    }
    
    public void createBucketIfNotExists(String bucket) throws IOException {
        System.out.println("=== CREATING BUCKET: " + bucket + " ===");
        
        String createBucketUrl = String.format("%s/storage/v1/bucket", supabaseUrl);
        String bucketJson = String.format("{\"id\":\"%s\",\"name\":\"%s\",\"public\":true}", bucket, bucket);
        
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(createBucketUrl);
            post.setHeader("Authorization", "Bearer " + supabaseServiceKey);
            post.setHeader("Content-Type", "application/json");
            
            StringEntity entity = new StringEntity(bucketJson, ContentType.APPLICATION_JSON);
            post.setEntity(entity);
            
            System.out.println("Creating bucket with URL: " + createBucketUrl);
            System.out.println("Bucket JSON: " + bucketJson);
            
            client.execute(post, response -> {
                int status = response.getCode();
                System.out.println("Create bucket response status: " + status);
                
                HttpEntity responseEntity = response.getEntity();
                if (responseEntity != null) {
                    try {
                        String responseBody = EntityUtils.toString(responseEntity);
                        System.out.println("Create bucket response: " + responseBody);
                    } catch (Exception e) {
                        System.err.println("Error reading create bucket response: " + e.getMessage());
                    }
                }
                
                if (status == 200 || status == 201) {
                    System.out.println("✅ Bucket created successfully!");
                } else if (status == 409) {
                    System.out.println("✅ Bucket already exists!");
                } else {
                    System.err.println("❌ Failed to create bucket: " + status);
                }
                
                return null;
            });
        }
        System.out.println("=== END BUCKET CREATION ===");
    }
}
