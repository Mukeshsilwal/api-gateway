package com.ticketkatum.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Event Entity
 * Core entity representing events
 */
@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_events_status", columnList = "status"),
        @Index(name = "idx_events_category", columnList = "category"),
        @Index(name = "idx_events_start_date", columnList = "start_date_time"),
        @Index(name = "idx_events_slug", columnList = "slug", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE events SET deleted_at = NOW() WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Event implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    @JsonIgnore
    private Organizer organizer;

    // Transient fields for JSON serialization
    @Transient
    private Long organizerId;

    @Transient
    private String organizerName;

    @PostLoad
    private void populateOrganizerInfo() {
        if (this.organizer != null) {
            this.organizerId = this.organizer.getId();
            this.organizerName = this.organizer.getOrganizationName();
        }
    }

    @PrePersist
    private void ensureRequiredDefaults() {
        if (this.coverImage == null || this.coverImage.isBlank()) {
            this.coverImage = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4";
        }
        if (this.description == null || this.description.isBlank()) {
            this.description = this.name != null ? this.name : "Event description";
        }
    }

    @Column(name = "slug", nullable = false, unique = true, length = 255)
    private String slug;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private EventCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private EventType type;

    @Column(name = "start_date_time", nullable = false)
    private LocalDateTime startDateTime;

    @Column(name = "end_date_time", nullable = false)
    private LocalDateTime endDateTime;

    @Column(name = "timezone", length = 50)
    @Builder.Default
    private String timezone = "Asia/Kathmandu";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    @JsonIgnore
    private Venue venue;

    @Column(name = "online_link")
    private String onlineLink;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(name = "cover_image", nullable = false)
    private String coverImage;

    @Column(name = "images", columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private String images; // JSON array of image URLs

    @Column(name = "tags", columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private String tags; // JSON array of tags

    @Column(name = "language", length = 10)
    @Builder.Default
    private String language = "en";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;

    @Column(name = "total_tickets", nullable = false)
    @Builder.Default
    private Integer totalTickets = 0;

    @Column(name = "tickets_sold", nullable = false)
    @Builder.Default
    private Integer ticketsSold = 0;

    @Column(name = "revenue", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal revenue = BigDecimal.ZERO;

    @Column(name = "views", nullable = false)
    @Builder.Default
    private Long views = 0L;

    @Column(name = "likes", nullable = false)
    @Builder.Default
    private Integer likes = 0;

    @Column(name = "shares", nullable = false)
    @Builder.Default
    private Integer shares = 0;

    @Column(name = "seo_meta", columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private String seoMeta; // JSON: {title, description, keywords, ogImage}

    @Version
    @Column(name = "version")
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum EventCategory {
        MUSIC, SPORTS, CONFERENCE, WORKSHOP, FESTIVAL,
        EXHIBITION, THEATER, COMEDY, NETWORKING, OTHER
    }

    public enum EventType {
        ONLINE, OFFLINE, HYBRID
    }

    public enum EventStatus {
        DRAFT, PENDING_REVIEW, PUBLISHED, CANCELLED, COMPLETED
    }

    // Helper methods
    public Integer getAvailableTickets() {
        return totalTickets - ticketsSold;
    }

    public boolean isSoldOut() {
        return ticketsSold >= totalTickets;
    }

    public boolean isPublished() {
        return status == EventStatus.PUBLISHED;
    }
}
