const firebaseConfig = {
  apiKey: "AIzaSyD51WF9SzwDfD1yElIC6QnBlemU6b8P_Rg",
  authDomain: "chatapp-9df70.firebaseapp.com",
  databaseURL: "https://chatapp-9df70-default-rtdb.firebaseio.com",
  projectId: "chatapp-9df70",
  storageBucket: "chatapp-9df70.appspot.com",
  messagingSenderId: "234718666984",
  appId: "1:234718666984:web:51dba660cf01b18bb1a95d",
  measurementId: "G-Y6J6NFFRB5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const messaging = app.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});