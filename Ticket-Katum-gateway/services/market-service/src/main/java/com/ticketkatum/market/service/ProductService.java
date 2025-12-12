package com.ticketkatum.market.service;

import com.ticketkatum.market.domain.Product;
import com.ticketkatum.market.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final LoyaltyService loyaltyService;

    public List<Product> getMenu(UUID eventId) {
        return productRepository.findByEventId(eventId);
    }

    public void orderProduct(UUID userId, UUID productId, String seatLocation) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Ordering Logic
        // 1. Process Payment (Mocked)
        // 2. Grant Loyalty Points (10 pts per $ spent)
        loyaltyService.earnPoints(userId, product.getPrice().intValue(), "F&B_ORDER");
        
        // 3. Send to Kitchen/Bar (Mocked)
    }
    
    // Admin
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }
}
