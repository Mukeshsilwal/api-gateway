package com.ticketkatum.guide.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "guide_specialties", indexes = {
        @Index(name = "idx_specialties_guide", columnList = "guide_id"),
        @Index(name = "idx_specialties_name", columnList = "specialty")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuideSpecialty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guide_id", nullable = false)
    private Guide guide;

    @Column(name = "specialty", nullable = false, length = 50)
    private String specialty;
}
