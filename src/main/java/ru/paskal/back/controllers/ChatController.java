package ru.paskal.back.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import ru.paskal.back.models.ChatMessage;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

  @MessageMapping("/chat.sendMessage")
  @SendTo("/topic/public")
  public ChatMessage sendMessage(
      @Payload ChatMessage chatMessage
  ) {
    log.info("sent message: " + chatMessage);
    return chatMessage;
  }


  @MessageMapping("/chat.addUser")
  @SendTo("/topic/public")
  public ChatMessage addUser(
      @Payload ChatMessage chatMessage,
      SimpMessageHeaderAccessor headerAccessor
  ) {
    log.info("User connected :{}", chatMessage.getSender());
    headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
    return chatMessage;
  }

}
