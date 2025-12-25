package com.ticketkatum.guide.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "guide_languages", indexes = {
        @Index(name = "idx_languages_guide", columnList = "guide_id"),
        @Index(name = "idx_languages_name", columnList = "language")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuideLanguage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guide_id", nullable = false)
    private Guide guide;

    @Column(name = "language", nullable = false, length = 50)
    private String language;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency", length = 20)
    private Proficiency proficiency = Proficiency.FLUENT;

    public enum Proficiency {
        NATIVE,
        FLUENT,
        INTERMEDIATE,
        BASIC
    }
}
