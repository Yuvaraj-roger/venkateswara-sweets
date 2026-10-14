package com.venkateswara.shop.controller;

import com.venkateswara.shop.dto.Dtos.ProductRequest;
import com.venkateswara.shop.exception.ApiException;
import com.venkateswara.shop.model.Product;
import com.venkateswara.shop.repo.ProductRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProductController {
    private final ProductRepository repo;
    public ProductController(ProductRepository repo) { this.repo = repo; }

    // ---------- Public: customers see only available items ----------
    @GetMapping("/products")
    public List<Product> menu() { return repo.findByAvailableTrueOrderByCategoryAscNameAsc(); }

    // ---------- Admin only ----------
    @GetMapping("/admin/products")
    public List<Product> all() { return repo.findAll(Sort.by("category", "name")); }

    @PostMapping("/admin/products")
    public Product create(@Valid @RequestBody ProductRequest r) { return repo.save(apply(new Product(), r)); }

    @PutMapping("/admin/products/{id}")
    public Product update(@PathVariable Long id, @Valid @RequestBody ProductRequest r) {
        Product p = repo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        return repo.save(apply(p, r));
    }

    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        repo.deleteById(id); // old orders keep their own copy of name/price, so they are safe
        return ResponseEntity.noContent().build();
    }

    private Product apply(Product p, ProductRequest r) {
        p.name = r.name().trim();
        p.description = r.description() == null ? "" : r.description().trim();
        p.price = r.price();
        p.category = r.category().trim();
        p.imageUrl = r.imageUrl() == null ? "" : r.imageUrl().trim();
        p.available = r.available() == null || r.available();
        return p;
    }
}
