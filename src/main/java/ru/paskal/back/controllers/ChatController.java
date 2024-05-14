package ru.paskal.back.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ru.paskal.back.models.ChatMessage;
import ru.paskal.back.services.MessageService;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

  private final SimpMessagingTemplate messagingTemplate;
  private final MessageService messageService;

  @MessageMapping("/chat.sendMessage")
  public void sendMessage(
      @Payload ChatMessage chatMessage
  ) {
    log.info("sent message: " + chatMessage);
    send(messageService.save(chatMessage));
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
    log.info("User connected :{}", chatMessage.getSender());
    headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
    headerAccessor.getSessionAttributes().put("room", chatMessage.getRoom());

    send(messageService.save(chatMessage));
  }

  @MessageMapping("/chat.leaveUser")
  public void leaveUser(
      @Payload ChatMessage chatMessage
  ) {
    log.info("User disconnected :{}", chatMessage.getSender());
    send(messageService.save(chatMessage));
  }

  private void send(ChatMessage chatMessage) {
    messagingTemplate.convertAndSend("/topic/" + chatMessage.getRoom(), chatMessage);
  }

}
