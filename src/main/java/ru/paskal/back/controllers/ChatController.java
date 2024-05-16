package ru.paskal.back.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ru.paskal.back.models.ChatMessage;
import ru.paskal.back.models.TopicSubscriptionChangeRequest;
import ru.paskal.back.services.FirebaseService;
import ru.paskal.back.services.MessageService;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

  private final SimpMessagingTemplate messagingTemplate;
  private final MessageService messageService;
  private final FirebaseService firebaseService;

  @MessageMapping("/users.subscribe")
  public void subscribe(
      @Payload TopicSubscriptionChangeRequest request
  ) {
    firebaseService.subscribeToTopic(request.getTopic(), request.getToken());
  }

  @MessageMapping("/users.unsubscribe")
  public void unsubscribe(
      @Payload TopicSubscriptionChangeRequest request
  ) {
    firebaseService.unsubscribeFrom(request.getTopic(), request.getToken());
  }


  @MessageMapping("/chat.sendMessage")
  public void sendMessage(
      @Payload ChatMessage chatMessage
  ) {
    log.info("sent message: " + chatMessage);
    send(messageService.save(chatMessage));
    firebaseService.sendMessage(chatMessage);
  }


  @MessageMapping("/users.loadHistory")
  public void loadHistory(
      @Payload ChatMessage chatMessage
  ) {
    messagingTemplate.convertAndSend("/user/" + chatMessage.getSender() + "/history",
        messageService.getByRoom(chatMessage.getRoom()));
  }


  @MessageMapping("/chat.addUser")
  public void addUser(
      @Payload ChatMessage chatMessage,
      SimpMessageHeaderAccessor headerAccessor
  ) {
    log.info("User {} connected to room {}", chatMessage.getSender(), chatMessage.getRoom());
    headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
    headerAccessor.getSessionAttributes().put("room", chatMessage.getRoom());

    send(chatMessage);
  }

  @MessageMapping("/chat.leaveUser")
  public void leaveUser(
      @Payload ChatMessage chatMessage
  ) {
    log.info("User {} disconnected from room {}", chatMessage.getSender(), chatMessage.getRoom());
    send(chatMessage);
  }

  private void send(ChatMessage chatMessage) {
    messagingTemplate.convertAndSend("/topic/" + chatMessage.getRoom(), chatMessage);
  }

}
