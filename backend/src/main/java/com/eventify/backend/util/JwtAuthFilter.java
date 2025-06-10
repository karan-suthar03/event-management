package com.eventify.backend.util;

import com.eventify.backend.config.JwtAuthenticationProvider;
import com.eventify.backend.config.JwtAuthenticationToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Filter for JWT authentication
 * Validates JWT tokens in requests and sets authentication in Spring Security context
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtAuthenticationProvider authProvider;    // Define public paths that don't require authentication
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
            "/api/auth/login",
            "/api/auth/validate",
            "/api/requests",
            "/api/event-requests"
    );

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
          String path = request.getServletPath();

        // Skip token validation for public paths
        boolean isPublicPath = PUBLIC_PATHS.stream()
                .anyMatch(p -> pathMatcher.match(p, path));

        // Special handling for auth endpoints - they should always be accessible
        if (path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // For other public paths, only POST requests to certain endpoints are allowed
        if (isPublicPath && request.getMethod().equals("POST")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Get authorization header
        final String authHeader = request.getHeader("Authorization");
        
        // If no auth header or not a Bearer token, continue filter chain without authentication
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Extract JWT token from header
        final String jwt = authHeader.substring(7);
        
        try {
            // Create authentication token with JWT
            JwtAuthenticationToken authToken = new JwtAuthenticationToken(jwt);
            
            // Authenticate token using provider
            Authentication authentication = authProvider.authenticate(authToken);
            
            // Set authentication in context if successful
            if (authentication != null) {
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // Token validation failed, do not set authentication
            logger.debug("JWT validation failed", e); // Change to debug to avoid filling logs
        }
        
        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}
