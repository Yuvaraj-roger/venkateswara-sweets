package com.venkateswara.shop.controller;

import com.venkateswara.shop.dto.Dtos.*;
import com.venkateswara.shop.exception.ApiException;
import com.venkateswara.shop.model.*;
import com.venkateswara.shop.repo.*;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class OrderController {
    private final OrderRepository orders;
    private final ProductRepository products;
    private final UserRepository users;

    public OrderController(OrderRepository orders, ProductRepository products, UserRepository users) {
        this.orders = orders; this.products = products; this.users = users;
    }

    private User me(Authentication a) {
        return users.findByEmail(a.getName()).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please login again"));
    }

    // ---------- Customer ----------
    @PostMapping("/orders")
    @Transactional
    public CustomerOrder place(@Valid @RequestBody OrderRequest r, Authentication auth) {
        User u = me(auth);
        CustomerOrder o = new CustomerOrder();
        o.userId = u.id; o.customerName = u.name; o.phone = r.phone();
        o.address = r.address().trim(); o.note = r.note();
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest i : r.items()) {
            Product p = products.findById(i.productId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "An item in your cart is no longer available"));
            if (!p.available) throw new ApiException(HttpStatus.BAD_REQUEST, p.name + " is currently unavailable");
            OrderItem oi = new OrderItem();
            oi.productId = p.id; oi.name = p.name; oi.price = p.price; oi.quantity = i.quantity();
            o.items.add(oi);
            total = total.add(p.price.multiply(BigDecimal.valueOf(i.quantity()))); // price always from DB, never from client
        }
        o.total = total;
        return orders.save(o);
    }

    @GetMapping("/orders/my")
    public List<CustomerOrder> mine(Authentication auth) {
        return orders.findByUserIdOrderByCreatedAtDesc(me(auth).id);
    }

    @GetMapping("/orders/{id}")
    public CustomerOrder track(@PathVariable Long id, Authentication auth) {
        User u = me(auth);
        CustomerOrder o = orders.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        if (u.role != Role.ADMIN && !o.userId.equals(u.id)) throw new ApiException(HttpStatus.FORBIDDEN, "This is not your order");
        return o;
    }

    @PatchMapping("/orders/{id}/cancel")
    public CustomerOrder cancel(@PathVariable Long id, Authentication auth) {
        CustomerOrder o = track(id, auth);
        if (o.status != OrderStatus.PLACED) throw new ApiException(HttpStatus.BAD_REQUEST, "Order is already being prepared. Please call the shop to cancel.");
        o.status = OrderStatus.CANCELLED;
        return orders.save(o);
    }

    // ---------- Admin ----------
    @GetMapping("/admin/orders")
    public List<CustomerOrder> all() { return orders.findAllByOrderByCreatedAtDesc(); }

    @PatchMapping("/admin/orders/{id}/status")
    public CustomerOrder setStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest r) {
        CustomerOrder o = orders.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        o.status = r.status();
        return orders.save(o);
    }
}
