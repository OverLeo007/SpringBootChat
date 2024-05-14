package ru.paskal.back.models;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MessageHistory {
  List<ChatMessage> messages;
}
