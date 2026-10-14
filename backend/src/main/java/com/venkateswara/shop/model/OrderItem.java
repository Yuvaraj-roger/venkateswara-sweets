package com.venkateswara.shop.model;

import jakarta.persistence.Embeddable;
import java.math.BigDecimal;

@Embeddable
public class OrderItem {
    public Long productId;
    public String name;
    public BigDecimal price;
    public int quantity;
}
