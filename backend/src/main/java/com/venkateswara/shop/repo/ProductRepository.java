package com.venkateswara.shop.repo;

import com.venkateswara.shop.model.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByAvailableTrueOrderByCategoryAscNameAsc();
}
