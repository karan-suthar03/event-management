package com.eventify.backend.config;

import com.eventify.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * Custom authentication provider for JWT tokens
 * This provider validates JWT tokens and creates authentication objects
 */
@Component
public class JwtAuthenticationProvider implements AuthenticationProvider {

    private final JwtUtil jwtUtil;

    @Autowired
    public JwtAuthenticationProvider(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String token = (String) authentication.getCredentials();
        try {
            // Validate token
            Claims claims = jwtUtil.validateToken(token);
            String username = claims.getSubject();
            String role = claims.get("role", String.class);
            
            // Create authentication with authorities
            return new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
            );
        } catch (Exception e) {
            // If token validation fails
            throw new JwtAuthenticationException("Invalid token", e);
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return JwtAuthenticationToken.class.isAssignableFrom(authentication);
    }
    
    /**
     * Custom authentication exception for JWT authentication failures
     */
    public static class JwtAuthenticationException extends AuthenticationException {
        public JwtAuthenticationException(String msg, Throwable cause) {
            super(msg, cause);
        }
    }
}
