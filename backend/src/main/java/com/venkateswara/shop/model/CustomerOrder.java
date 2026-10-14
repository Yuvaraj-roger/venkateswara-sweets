package com.venkateswara.shop.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class CustomerOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public Long userId;
    public String customerName;
    public String phone;
    @Column(length = 500) public String address;
    @Column(length = 500) public String note;
    @Column(precision = 10, scale = 2) public BigDecimal total;
    @Enumerated(EnumType.STRING) public OrderStatus status = OrderStatus.PLACED;
    public LocalDateTime createdAt = LocalDateTime.now();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_items", joinColumns = @JoinColumn(name = "order_id"))
    public List<OrderItem> items = new ArrayList<>();
}
