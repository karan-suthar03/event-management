package com.eventify.backend.config;

import com.eventify.backend.entity.Admin;
import com.eventify.backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Check if admin user already exists
        if (!adminRepository.findByUsername("admin").isPresent()) {
            // Create default admin user
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword("yourpassword");
            admin.setName("System Administrator");
            
            adminRepository.save(admin);
            System.out.println("Default admin user created: username=admin, password=yourpassword");
        } else {
            System.out.println("Admin user already exists");
        }
    }
}
