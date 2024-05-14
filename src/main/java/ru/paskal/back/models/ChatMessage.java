package ru.paskal.back.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {
  private String content;

  private String sender;

  private MessageType type;

  @Override
  public String toString() {
    return "ChatMessage{" +
        "content='" + content + '\'' +
        ", sender='" + sender + '\'' +
        ", messageType=" + type +
        '}';
  }
}
