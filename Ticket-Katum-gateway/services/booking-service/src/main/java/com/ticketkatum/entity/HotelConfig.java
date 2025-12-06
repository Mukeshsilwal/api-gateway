package com.ticketkatum.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "hotel_config")
@Getter
@Setter
public class HotelConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private Long id;

    private String hotelCode;
    private String hotelName;
    private String providerType;

    private BigDecimal taxRate;
    private BigDecimal serviceCharge;

    @Column(columnDefinition = "TEXT")
    private String cancellationPolicyJson;

    @Column(columnDefinition = "TEXT")
    private String roomPriceJson;
}
