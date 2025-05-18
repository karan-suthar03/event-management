package com.eventify.backend.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import java.util.Date;
import javax.crypto.SecretKey;

public class JwtUtil {
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor("mera naam karan hai aur me karan suthar hu".getBytes());
    private static final long EXPIRATION_TIME = 60 * 60 * 1000 * 24; // 24 hours

    public static String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .claim("role", "ADMIN")
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    public static Claims validateToken(String token) {
        return Jwts.parser().verifyWith(SECRET_KEY).build().parseSignedClaims(token).getPayload();
    }
}
