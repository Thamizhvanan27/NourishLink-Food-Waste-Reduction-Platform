package com.foodwaste.service;

import com.foodwaste.dto.NotificationResponse;
import com.foodwaste.entity.Notification;
import com.foodwaste.entity.NotificationType;
import com.foodwaste.entity.User;
import com.foodwaste.exception.ForbiddenException;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.NotificationRepository;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EntityMapper mapper;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User recipient;
    private User otherUser;
    private Notification notification;

    @BeforeEach
    void setUp() {
        recipient = User.builder().id(1L).email("user@test.com").fullName("User Test").build();
        otherUser = User.builder().id(2L).email("intruder@test.com").fullName("Intruder").build();

        notification = Notification.builder()
                .id(10L)
                .user(recipient)
                .title("Donation Request")
                .message("NGO requested your food")
                .type(NotificationType.DONATION_REQUEST)
                .referenceId(100L)
                .read(false)
                .build();
    }

    @Test
    void testCreateAndSendNotification() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(mapper.toNotificationResponse(notification)).thenReturn(
                NotificationResponse.builder().id(10L).title("Donation Request").build()
        );

        NotificationResponse response = notificationService.createAndSendNotification(
                recipient,
                "Donation Request",
                "NGO requested your food",
                NotificationType.DONATION_REQUEST,
                100L
        );

        assertNotNull(response);
        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(messagingTemplate, times(1)).convertAndSendToUser(
                eq(recipient.getEmail()),
                eq("/queue/notifications"),
                any(NotificationResponse.class)
        );
    }

    @Test
    void testMarkAsReadSuccess() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(recipient));
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(notification)).thenReturn(notification);
        when(mapper.toNotificationResponse(notification)).thenReturn(
                NotificationResponse.builder().id(10L).read(true).build()
        );

        NotificationResponse response = notificationService.markAsRead("user@test.com", 10L);
        assertNotNull(response);
        assertTrue(notification.getRead());
    }

    @Test
    void testMarkAsReadForbiddenForOtherUser() {
        when(userRepository.findByEmail("intruder@test.com")).thenReturn(Optional.of(otherUser));
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

        assertThrows(ForbiddenException.class, () -> notificationService.markAsRead("intruder@test.com", 10L));
    }
}
