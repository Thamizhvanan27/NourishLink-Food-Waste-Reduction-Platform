package com.foodwaste.service;

import com.foodwaste.dto.NotificationResponse;
import com.foodwaste.dto.PagedResponse;
import com.foodwaste.entity.NotificationType;
import com.foodwaste.entity.User;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    NotificationResponse createAndSendNotification(
            User recipient,
            String title,
            String message,
            NotificationType type,
            Long referenceId);

    PagedResponse<NotificationResponse> getUserNotifications(String userEmail, Pageable pageable);

    long getUnreadCount(String userEmail);

    NotificationResponse markAsRead(String userEmail, Long notificationId);

    void markAllAsRead(String userEmail);

    void deleteNotification(String userEmail, Long notificationId);
}
