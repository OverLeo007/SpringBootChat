package ru.paskal.back.models;

import lombok.Data;

@Data
public class TopicSubscriptionChangeRequest {
  private String topic;
  private String token;
}
