package com.foodwaste.service.impl;

import com.foodwaste.dto.NotificationResponse;
import com.foodwaste.dto.PagedResponse;
import com.foodwaste.entity.Notification;
import com.foodwaste.entity.NotificationType;
import com.foodwaste.entity.User;
import com.foodwaste.exception.ForbiddenException;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.NotificationRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public NotificationResponse createAndSendNotification(
            User recipient,
            String title,
            String message,
            NotificationType type,
            Long referenceId) {

        Notification notification = Notification.builder()
                .user(recipient)
                .title(title)
                .message(message)
                .type(type != null ? type : NotificationType.SYSTEM)
                .referenceId(referenceId)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = mapper.toNotificationResponse(saved);

        // Broadcast over WebSocket in real time
        try {
            // Send to user destination (e.g. /user/{email}/queue/notifications)
            messagingTemplate.convertAndSendToUser(
                    recipient.getEmail(),
                    "/queue/notifications",
                    response
            );
            // Also send by user ID for clients subscribed by user ID
            messagingTemplate.convertAndSendToUser(
                    recipient.getId().toString(),
                    "/queue/notifications",
                    response
            );
            // And broadcast to user-specific topic if listened directly
            messagingTemplate.convertAndSend(
                    "/topic/user." + recipient.getId() + ".notifications",
                    response
            );
            log.info("WebSocket notification sent to user {}: {}", recipient.getEmail(), title);
        } catch (Exception e) {
            log.warn("Failed to deliver WebSocket notification: {}", e.getMessage());
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getUserNotifications(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Page<Notification> page = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        List<NotificationResponse> dtoList = page.getContent().stream()
                .map(mapper::toNotificationResponse)
                .collect(Collectors.toList());

        return PagedResponse.of(page, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.countByUserAndReadFalse(user);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(String userEmail, Long notificationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Cannot modify notifications belonging to another user");
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapper.toNotificationResponse(saved);
    }

    @Override
    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.markAllAsRead(user);
    }

    @Override
    @Transactional
    public void deleteNotification(String userEmail, Long notificationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Cannot delete notifications belonging to another user");
        }

        notificationRepository.delete(notification);
    }
}
