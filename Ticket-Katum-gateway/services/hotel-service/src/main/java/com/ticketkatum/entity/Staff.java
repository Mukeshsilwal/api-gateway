package com.ticketkatum.entity;

import com.ticketkatum.enums.StaffStatus;
import com.ticketkatum.enums.StaffType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "staff")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @Enumerated(EnumType.STRING)
    private StaffType staffType;  // HOUSEKEEPING, MAINTENANCE

    @Enumerated(EnumType.STRING)
    private StaffStatus status;   // AVAILABLE, BUSY, OFFLINE

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;
}
