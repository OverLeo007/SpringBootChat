package ru.paskal.back.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.paskal.back.entities.ChatMessageEnt;

@Repository
public interface MessageRepo extends JpaRepository<ChatMessageEnt, Integer> {
  @Query("SELECT DISTINCT m.room FROM ChatMessageEnt m")
  List<String> findAllRooms();

  List<ChatMessageEnt> findByRoomOrderByTime(String room);

}
