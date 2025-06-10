package com.eventify.backend.controller;

import com.eventify.backend.pojo.AdminLoginRequest;
import com.eventify.backend.pojo.AdminResponse;
import com.eventify.backend.repository.AdminRepository;
import com.eventify.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Date;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest request) {
        return adminRepository.findByUsername(request.getUsername())
            .map(admin -> {
                if (request.getPassword().equals(admin.getPassword())) {
                    String token = jwtUtil.generateToken(admin.getUsername());
                    AdminResponse adminResp = new AdminResponse(admin.getUsername(), admin.getName());
                    return ResponseEntity.ok().body(new java.util.HashMap<String, Object>() {{
                        put("token", token);
                        put("admin", adminResp);
                    }});
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.HashMap<String, String>() {{
                        put("error", "Invalid credentials");
                    }});
                }
            })
            .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.HashMap<String, String>() {{
                put("error", "Invalid credentials");
            }}));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentAdmin(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Claims claims = jwtUtil.validateToken(token);
                String username = claims.getSubject();
                
                // Additional validation: Check if token is expired
                Date expiration = claims.getExpiration();
                if (expiration.before(new Date())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.HashMap<String, String>() {{
                        put("error", "Token expired");
                    }});
                }
                
                // Verify admin still exists in database
                return adminRepository.findByUsername(username)
                    .map(admin -> ResponseEntity.ok(new AdminResponse(admin.getUsername(), admin.getName())))
                    .<ResponseEntity<?>>map(r -> r)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.HashMap<String, String>() {{
                        put("error", "Admin not found");
                    }}));
            } catch (Exception e) {
                // Invalid token
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.HashMap<String, String>() {{
                    put("error", "Invalid token");
                }});
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.HashMap<String, String>() {{
            put("error", "No authorization header");
        }});
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Claims claims = jwtUtil.validateToken(token);
                String username = claims.getSubject();
                
                // Check if token is expired
                Date expiration = claims.getExpiration();
                if (expiration.before(new Date())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.HashMap<String, Object>() {{
                        put("valid", false);
                        put("error", "Token expired");
                    }});
                }
                
                // Verify admin still exists
                boolean adminExists = adminRepository.findByUsername(username).isPresent();
                if (!adminExists) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.HashMap<String, Object>() {{
                        put("valid", false);
                        put("error", "Admin not found");
                    }});
                }
                
                return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                    put("valid", true);
                    put("username", username);
                    put("expiresAt", expiration.getTime());
                }});
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.HashMap<String, Object>() {{
                    put("valid", false);
                    put("error", "Invalid token");
                }});
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.HashMap<String, Object>() {{
            put("valid", false);
            put("error", "No authorization header");
        }});
    }
}
