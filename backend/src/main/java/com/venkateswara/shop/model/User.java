package com.venkateswara.shop.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    @Column(nullable = false) public String name;
    @Column(nullable = false, unique = true) public String email;
    @JsonIgnore @Column(nullable = false) public String password;
    public String phone;
    @Enumerated(EnumType.STRING) @Column(nullable = false) public Role role;
}
