package ru.paskal.back.services;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.TopicManagementResponse;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.paskal.back.models.ChatMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirebaseService {

  private final DatabaseReference database = FirebaseDatabase.getInstance().getReference();
  private final DatabaseReference tokensRef = FirebaseDatabase.getInstance().getReference("tokens");

  private final FirebaseMessaging firebaseMessaging;

  public void saveToken(String username, String token) {
    if (username == null) {
      throw new IllegalArgumentException("userId cannot be null");
    }
    tokensRef.child(username).setValueAsync(token);
  }

  public void subscribeToTopic(String topic, String token) {
    log.info("Trying to subscribe to topic {}", topic);
    try {
      TopicManagementResponse response = FirebaseMessaging.getInstance().subscribeToTopic(
          Collections.singletonList(token), topic);
      log.info("Successfully subscribed to topic: " + response.getSuccessCount());
    } catch (FirebaseMessagingException e) {
      log.info("Failed to subscribe to topic: " + e.getMessage());
    }
  }

  public void unsubscribeFrom(String topic, String token) {
    log.info("Trying to unsubscribe from topic {}", topic);
    try {
      TopicManagementResponse response = FirebaseMessaging.getInstance().unsubscribeFromTopic(
          Collections.singletonList(token), topic);
      log.info("Successfully unsubscribed from topic: " + response.getSuccessCount());
    } catch (FirebaseMessagingException e) {
      log.info("Failed to unsubscribe from topic: " + e.getMessage());
    }
  }

  public void sendMessage(ChatMessage message) {
    try {
      String response = firebaseMessaging.send(convertChatMessageToFcmMessage(message));
      log.info("Successfully send message from {} to {}: {}", message.getSender(), message.getRoom(), response);
    } catch (FirebaseMessagingException e) {
      System.out.println("Failed to send message: " + e.getMessage());
    }
    saveMessageToDb(message);
  }

  public void saveMessageToDb(ChatMessage message) {
    Map<String, String> msg = new HashMap<>();
    msg.put("sender", message.getSender());
    msg.put("content", message.getContent());
    database.child(message.getRoom()).push().setValueAsync(msg);
  }

  private Message convertChatMessageToFcmMessage(ChatMessage message) {
    return Message.builder()
        .putData("sender", message.getSender())
        .putData("content", message.getContent())
        .putData("room", message.getRoom())
        .setTopic(message.getRoom())
        .setNotification(
            Notification.builder()
                .setTitle(String.format("%s from %s", message.getSender(), message.getRoom()))
                .setBody(message.getContent())
                .build()
        )
        .build();
  }
}
