package ru.paskal.back.models;

import lombok.Data;

@Data
public class SaveTokenRequest {
  private String username;
  private String token;

}
