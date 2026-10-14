package com.venkateswara.shop.dto;

import com.venkateswara.shop.model.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class Dtos {
    public record RegisterRequest(
            @NotBlank(message = "Name is required") String name,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email") String email,
            @NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters") String password,
            @NotBlank(message = "Phone is required") @Pattern(regexp = "\\d{10}", message = "Phone must be 10 digits") String phone) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required") String email,
            @NotBlank(message = "Password is required") String password) {}

    public record AuthResponse(String token, String name, String email, String role) {}

    public record ProductRequest(
            @NotBlank(message = "Product name is required") String name,
            String description,
            @NotNull(message = "Price is required") @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0") BigDecimal price,
            @NotBlank(message = "Category is required") String category,
            String imageUrl,
            Boolean available) {}

    public record OrderItemRequest(
            @NotNull(message = "Product is required") Long productId,
            @Min(value = 1, message = "Quantity must be at least 1") @Max(value = 50, message = "Max 50 per item") int quantity) {}

    public record OrderRequest(
            @NotEmpty(message = "Cart is empty") List<@Valid OrderItemRequest> items,
            @NotBlank(message = "Delivery address is required") String address,
            @NotBlank(message = "Phone is required") @Pattern(regexp = "\\d{10}", message = "Phone must be 10 digits") String phone,
            String note) {}

    public record StatusRequest(@NotNull(message = "Status is required") OrderStatus status) {}
}
