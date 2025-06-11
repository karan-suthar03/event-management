package com.eventify.backend.config;

import com.eventify.backend.util.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {
    
    @Autowired
    private JwtAuthFilter jwtAuthFilter;
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("https://eventify.karansuthar.works"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).authorizeHttpRequests(auth -> auth
                // Health check endpoint for Render
                .requestMatchers("/actuator/health").permitAll()                // Public API endpoints
                .requestMatchers(HttpMethod.POST, "/api/events/*/feedback").permitAll() // Allow users to submit feedback
                .requestMatchers(HttpMethod.GET, "/api/events/*/feedback").permitAll() // Allow users to view feedback
                .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/offerings/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/requests").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/event-requests").permitAll() // Allow public event requests
                .requestMatchers(HttpMethod.GET, "/api/global-discount").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/validate").permitAll()
                
                // Protected endpoints requiring authentication
                .requestMatchers("/api/feedbacks/**").authenticated() // Admin-only feedback management
                .requestMatchers("/api/requests/**").authenticated()
                .requestMatchers("/api/event-requests/**").authenticated() // Admin-only event request management (except POST)
                .requestMatchers(HttpMethod.POST, "/api/global-discount").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/categories").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/events/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/events/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/events/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/offerings/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/offerings/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/offerings/**").authenticated()
                .requestMatchers("/api/auth/me").authenticated()
                .anyRequest().denyAll() // Deny any other requests for security
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}
