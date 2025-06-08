package com.eventify.backend.config;

import org.springframework.security.authentication.AbstractAuthenticationToken;

import java.util.Collections;

/**
 * Custom authentication token for JWT
 * This token is used by the JwtAuthenticationProvider to validate JWT tokens
 */
public class JwtAuthenticationToken extends AbstractAuthenticationToken {
    private final String token;
    private String principal;
    
    /**
     * Create an unauthenticated token with the given JWT
     * @param token JWT token
     */
    public JwtAuthenticationToken(String token) {
        super(Collections.emptyList());
        this.token = token;
        setAuthenticated(false);
    }

    @Override
    public Object getCredentials() {
        return token;
    }

    @Override
    public Object getPrincipal() {
        return principal;
    }
    
    /**
     * Set the principal (username) extracted from the JWT
     * @param principal username
     */
    public void setPrincipal(String principal) {
        this.principal = principal;
    }
}
