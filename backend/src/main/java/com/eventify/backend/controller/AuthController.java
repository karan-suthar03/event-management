package com.eventify.backend.controller;

import com.eventify.backend.model.AdminLoginRequest;
import com.eventify.backend.model.AdminResponse;
import com.eventify.backend.model.AdminRepository;
import com.eventify.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AdminRepository adminRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest request) {
        return adminRepository.findByUsername(request.getUsername())
            .map(admin -> {
                if (request.getPassword().equals(admin.getPassword())) {
                    String token = JwtUtil.generateToken(admin.getUsername());
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
                Claims claims = JwtUtil.validateToken(token);
                String username = claims.getSubject();
                return adminRepository.findByUsername(username)
                    .map(admin -> ResponseEntity.ok(new AdminResponse(admin.getUsername(), admin.getName())))
                    .<ResponseEntity<?>>map(r -> r)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.HashMap<String, String>() {{
                        put("error", "Unauthorized");
                    }}));
            } catch (Exception e) {
                // Invalid token
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.HashMap<String, String>() {{
            put("error", "Unauthorized");
        }});
    }
}
