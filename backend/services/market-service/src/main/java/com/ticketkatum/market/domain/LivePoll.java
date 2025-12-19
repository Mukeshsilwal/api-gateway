package com.ticketkatum.market.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "live_polls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LivePoll {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID eventId;

    @Column(nullable = false)
    private String question;

    // List of options e.g. ["Song 1", "Song 2"]
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> options;

    // Map of Option -> Count
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Integer> votes = new HashMap<>();

    @Enumerated(EnumType.STRING)
    private PollStatus status;
}
