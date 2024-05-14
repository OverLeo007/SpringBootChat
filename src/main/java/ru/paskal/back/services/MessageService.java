package ru.paskal.back.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.paskal.back.entities.ChatMessageEnt;
import ru.paskal.back.models.ChatMessage;
import ru.paskal.back.models.MessageHistory;
import ru.paskal.back.repo.MessageRepo;

@Service
@RequiredArgsConstructor
public class MessageService {

  private final MessageRepo messageRepo;
  private final ModelMapper mm;

  public List<String> getRooms() {
    var rooms = messageRepo.findAllRooms();
    if (!rooms.contains("public")) {
      rooms.add("public");
    }
    return rooms;
  }

  public MessageHistory getByRoom(String room) {
    return MessageHistory
        .builder()
        .messages(
            messageRepo.findByRoomOrderByTime(room).stream()
                .map(msg -> mm.map(msg, ChatMessage.class)
                ).toList()).build();
  }

  @Transactional
  public ChatMessage save(ChatMessage chatMessage) {
    var newMsg = new ChatMessageEnt();
    mm.map(chatMessage, newMsg);
    newMsg.setTime(LocalDateTime.now());
    return mm.map(messageRepo.save(newMsg), ChatMessage.class);
  }
}
