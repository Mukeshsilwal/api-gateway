package com.ticketkatum.timelineservice.dto;

import com.ticketkatum.timelineservice.entity.TimelineNotification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {

    private Long notificationId;
    private Long checkpointId;
    private TimelineNotification.NotificationType notificationType;
    private String title;
    private String message;
    private Boolean isRead;
    private Boolean isSent;
    private LocalDateTime scheduledFor;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
}
