package ru.paskal.back.config;

import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import ru.paskal.back.models.ChatMessage;
import ru.paskal.back.models.MessageType;
import ru.paskal.back.services.MessageService;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

  private final SimpMessageSendingOperations messageTemplate;
  private final MessageService messageService;

  @EventListener
  public void handleWebSocketDisconnectListener(
      SessionDisconnectEvent event
  ) {
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
    log.info(Objects.requireNonNull(headerAccessor.getSessionAttributes()).toString());
    String username = (String) headerAccessor.getSessionAttributes().get("username");
    String roomName = (String) headerAccessor.getSessionAttributes().get("room");
    if (username != null) {
      log.info("User disconnected :{}", username);
      var chatMessage = ChatMessage.builder()
          .type(MessageType.LEAVE)
          .sender(username)
          .room(roomName)
          .build();
      messageTemplate.convertAndSend("/topic/" + roomName, messageService.save(chatMessage));
    }
  }

}
