package ru.paskal.back.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import ru.paskal.back.models.MessageType;

@Data
@Entity
@Table(name = "messages")
public class ChatMessageEnt {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "content")
  private String content;

  @Column(name = "time")
  private LocalDateTime time;

  @Column(name = "type")
  @Enumerated(EnumType.STRING)
  private MessageType type;

  @Column(name = "username")
  private String sender;

  @Column(name = "room")
  private String room;
}
