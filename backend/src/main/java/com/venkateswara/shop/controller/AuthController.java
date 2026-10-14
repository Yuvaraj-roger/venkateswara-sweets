package com.venkateswara.shop.controller;

import com.venkateswara.shop.dto.Dtos.*;
import com.venkateswara.shop.exception.ApiException;
import com.venkateswara.shop.model.Role;
import com.venkateswara.shop.model.User;
import com.venkateswara.shop.repo.UserRepository;
import com.venkateswara.shop.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtUtil jwt) {
        this.users = users; this.encoder = encoder; this.jwt = jwt;
    }

    /** Public signup always creates a CUSTOMER. Admin is created only by the server seeder. */
    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest r) {
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmail(email)) throw new ApiException(HttpStatus.CONFLICT, "This email is already registered");
        User u = new User();
        u.name = r.name().trim(); u.email = email; u.phone = r.phone();
        u.password = encoder.encode(r.password()); u.role = Role.CUSTOMER;
        users.save(u);
        return new AuthResponse(jwt.generate(u), u.name, u.email, u.role.name());
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest r) {
        User u = users.findByEmail(r.email().trim().toLowerCase())
                .filter(x -> encoder.matches(r.password(), x.password))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return new AuthResponse(jwt.generate(u), u.name, u.email, u.role.name());
    }
}
