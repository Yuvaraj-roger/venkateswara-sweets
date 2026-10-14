package com.venkateswara.shop.config;

import com.venkateswara.shop.model.*;
import com.venkateswara.shop.repo.*;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(UserRepository users, ProductRepository products, PasswordEncoder encoder,
                           @Value("${app.admin.name}") String adminName,
                           @Value("${app.admin.email}") String adminEmail,
                           @Value("${app.admin.password}") String adminPassword,
                           @Value("${app.seed-products}") boolean seedProducts) {
        return args -> {
            if (!users.existsByEmail(adminEmail.toLowerCase())) {
                User a = new User();
                a.name = adminName; a.email = adminEmail.toLowerCase(); a.phone = "9884938890";
                a.password = encoder.encode(adminPassword); a.role = Role.ADMIN;
                users.save(a);
                System.out.println(">>> Admin created: " + a.email);
            }
            if (seedProducts && products.count() == 0) {
                add(products, "Mysore Pak", "Sweets", "720", "Ghee-rich melt-in-mouth classic (per kg)");
                add(products, "Motichoor Laddu", "Sweets", "560", "Soft boondi laddu (per kg)");
                add(products, "Adhirasam", "Sweets", "640", "Traditional jaggery sweet (per kg)");
                add(products, "Kara Murukku", "Snacks", "420", "Crispy hand-pressed murukku (per kg)");
                add(products, "Madras Mixture", "Snacks", "380", "Spicy mixture (per kg)");
                add(products, "Butter Biscuit", "Bakery", "320", "Fresh baked (per kg)");
                add(products, "Veg Puff", "Bakery", "20", "Hot puff, each");
            }
        };
    }

    private void add(ProductRepository repo, String name, String cat, String price, String desc) {
        Product p = new Product();
        p.name = name; p.category = cat; p.price = new BigDecimal(price);
        p.description = desc; p.imageUrl = ""; p.available = true;
        repo.save(p);
    }
}
