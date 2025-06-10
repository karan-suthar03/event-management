package com.eventify.backend.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import java.util.Date;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    private final SecretKey secretKey;
    private static final long EXPIRATION_TIME = 60 * 60 * 1000 * 24; // 24 hours

    @Autowired
    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .subject(username)
                .claim("role", "ADMIN")
                .issuedAt(new Date(now))
                .expiration(new Date(now + EXPIRATION_TIME))
                .signWith(secretKey)
                .compact();
    }

    public Claims validateToken(String token) throws ExpiredJwtException, MalformedJwtException, UnsupportedJwtException, SignatureException {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            // Additional validation: Check if token is expired
            Date expiration = claims.getExpiration();
            if (expiration.before(new Date())) {
                throw new ExpiredJwtException(null, claims, "Token has expired");
            }
            
            return claims;
        } catch (ExpiredJwtException e) {
            throw e;
        } catch (MalformedJwtException e) {
            throw new MalformedJwtException("Invalid JWT token format", e);
        } catch (UnsupportedJwtException e) {
            throw new UnsupportedJwtException("Unsupported JWT token", e);
        } catch (SignatureException e) {
            throw new SignatureException("Invalid JWT signature", e);
        } catch (Exception e) {
            throw new MalformedJwtException("Invalid JWT token", e);
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            Claims claims = validateToken(token);
            return false; // If validation succeeds, token is not expired
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            return true; // Consider invalid tokens as expired
        }
    }

    public String getUsernameFromToken(String token) {
        try {
            Claims claims = validateToken(token);
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }
}
