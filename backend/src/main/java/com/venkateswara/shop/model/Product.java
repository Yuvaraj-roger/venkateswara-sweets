package com.venkateswara.shop.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    @Column(nullable = false) public String name;
    @Column(length = 1000) public String description;
    @Column(nullable = false, precision = 10, scale = 2) public BigDecimal price;
    @Column(nullable = false) public String category;
    @Column(length = 1000) public String imageUrl;
    public boolean available = true;
}
