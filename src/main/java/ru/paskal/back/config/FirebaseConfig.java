package ru.paskal.back.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.messaging.FirebaseMessaging;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class FirebaseConfig {

  @Bean
  public FirebaseApp firebaseApp() throws IOException {
    String filePath = "src/main/resources/firebase_key.json";
    if (!Files.exists(Paths.get(filePath))) {
      throw new FileNotFoundException("Firebase key file not found at " + filePath);
    }
    FileInputStream serviceAccount =
        new FileInputStream(filePath);


    FirebaseOptions options = new FirebaseOptions.Builder()
        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
        .setDatabaseUrl("https://chatapp-9df70-default-rtdb.firebaseio.com/")
        .build();

    FirebaseApp app = FirebaseApp.initializeApp(options);
    try {
      FirebaseDatabase.getInstance(app).getReference().push();
      log.info("Учетные данные Firebase работают правильно");
    } catch (Exception e) {
      log.info("Ошибка при использовании учетных данных Firebase: " + e.getMessage());
    }

    return app;
  }

  @Bean
  public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
    return FirebaseMessaging.getInstance(firebaseApp);
  }

}
