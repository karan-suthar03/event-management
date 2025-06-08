package com.eventify.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SPAController {
    
    @RequestMapping(value = {
        "/", 
        "/login", 
        "/admin/**", 
        "/events/**", 
        "/offerings/**", 
        "/contact"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
