package ru.paskal.back.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.paskal.back.models.SaveTokenRequest;
import ru.paskal.back.services.FirebaseService;

@RestController
@RequestMapping("/fcm")
@RequiredArgsConstructor
@Slf4j
public class FirebaseController {

  private final FirebaseService firebaseService;

  @PostMapping("/saveToken")
  public void saveToken(@RequestBody SaveTokenRequest request) {
    firebaseService.saveToken(request.getUsername(), request.getToken());
  }


}
