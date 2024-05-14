package ru.paskal.back.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller()
@RequestMapping("/main")
@RequiredArgsConstructor
public class MainPageController {

  @GetMapping
  public String index() {
    return "main/index";
  }

}
