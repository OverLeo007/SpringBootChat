package ru.paskal.back.controllers;

import jakarta.servlet.http.HttpSession;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import ru.paskal.back.entities.Room;
import ru.paskal.back.models.LoginRequest;
import ru.paskal.back.services.RoomService;

@Controller()
@RequestMapping("/main")
@RequiredArgsConstructor
@Slf4j
public class MainPageController {

  private final RoomService roomService;

  @GetMapping
  public String index(HttpSession session, Model model) {
    String username = (String) session.getAttribute("username");
    if (username == null) {
      return "redirect:/main/login";
    }
    model.addAttribute("username", username);
    var rooms = roomService.getAll();
    log.info(rooms.stream().map(Room::toString).collect(Collectors.joining(", ")));

    model.addAttribute("rooms", rooms);
    return "main/index";
  }

  @GetMapping("/login")
  public String login() {
    return "main/login";
  }

  @PostMapping("/logout")
  public String logout(HttpSession session) {
    session.removeAttribute("username");
    return "redirect:/main";
  }

@PostMapping("/process_login")
public String processLogin(@ModelAttribute LoginRequest request, HttpSession session) {
    log.info(request.getUsername());
    session.setAttribute("username", request.getUsername());
    return "redirect:/main";
}

}
