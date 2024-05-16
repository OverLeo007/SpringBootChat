'use strict';

let messageForm = document.querySelector('#messageForm');
let messageInput = document.querySelector('#message');
let messageArea = document.querySelector('#messageArea');
let connectingElement = document.querySelector('.connecting');
let roomButtonDiv = document.querySelector("#rooms-buttons");
let newRoomNameInput = document.querySelector("#new-room-name-input");
let newRoomBtn = document.querySelector("#create-new-room-btn")
let curRoomTitle = document.querySelector("#roomNameTitle")

let stompClient = null;
let username = null;
let firebaseToken = null;
let currentRoom = 'public';
let messaging = null;
let database = null;

let colors = [
  '#2196F3', '#32c787', '#00BCD4', '#ff5652',
  '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

window.onload = function () {
  username = document.getElementById('hiddenUsername').value;
  let socket = new SockJS('/ws');
  stompClient = Stomp.over(socket);

  stompClient.connect({}, onConnected, onError);
  setupFirebase()
  let roomItems = document.querySelectorAll('.room-item');
  roomItems.forEach(function (roomItem) {
    roomItem.addEventListener('click', function (event) {
      event.preventDefault();
      onJoinRoom(this.id);
    });
  });

  let subToggles = document.querySelectorAll('.sub-toggle');
  subToggles.forEach(function (subToggle) {
        subToggle.addEventListener('click', function (event) {
              onToggleSubscribe(this.id.split("-")[0], event.target.checked)
            }
        )
      }
  )

}

function setupFirebase() {
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

  firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging();
  database = firebase.database();

  messaging.requestPermission()
  .then(function () {
    console.log('Notification permission granted.');
    return messaging.getToken();
  })
  .then(function (token) {
    console.log('Token: ', token);
    firebaseToken = token
    fetch('/fcm/saveToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({token: token, username: username}),
    })
    .catch(function (err) {
      console.log('Unable to send token to server.', err);
    });
  })
  .catch(function (err) {
    console.log('Unable to get permission to notify.', err);
  });

  messaging.onMessage((payload) => {
    console.log('Message received. ', payload);
    const notificationTitle = `${payload.data.sender} in ${payload.data.room}`;
    const notificationOptions = {
      body: payload.data.content,
    };

    if (Notification.permission === "granted") {
      let notification = new Notification(notificationTitle,
          notificationOptions);
    } else {
      console.error("Notification not granted, sad:(")
    }
    console.log('Displaying notification with title: ' + payload.data.sender
        + ' and body: ' + payload.data.content);
  });

  checkFirebaseConnection()
}

function checkFirebaseConnection() {
  const testRef = database.ref('testConnection')
  testRef.set({
    test: "Hello, Firebase!"
  }).then(() => {
    console.log("FIREBASE WRITE: SUCCESS")
    testRef.once('value').then((snapshot) => {
      const data = snapshot.val();
      console.log("READ: SUCCESS")

      testRef.remove().then(() => {
        console.log("FIREBASE DELETE: SUCCESS")
      }).catch((error) => {
        console.log("FIREBASE WRITE: ERROR")
        console.error(error)
      });
    }).catch((error) => {
      console.log("FIREBASE READ: ERROR")
      console.error(error)
    });
  }).catch((error) => {
    console.log("FIREBASE DELETE: ERROR")
    console.error(error)
  });
}

newRoomBtn.addEventListener('click', (event) => {
  let roomName = newRoomNameInput.value
  onJoinRoom(roomName);
  addNewRoom(roomName);
  event.preventDefault();
})

function onToggleSubscribe(roomName, state) {
  console.log();
  if (state) {
    console.log(`Активирована подписка на ${roomName}`)
    stompClient.send("/app/users.subscribe", {},
        JSON.stringify({topic: roomName, token: firebaseToken}))
  } else {
    console.log(`Деактивирована подписка на ${roomName}`)
    stompClient.send("/app/users.unsubscribe", {},
        JSON.stringify({topic: roomName, token: firebaseToken}))
  }

}

function addNewRoom(roomName) {
  let newRoom = document.createElement('div');
  newRoom.classList.add("card");

  let header = document.createElement('div');
  header.classList.add("class-header", "text-center");
  header.textContent = "Комната " + roomName;
  newRoom.appendChild(header);

  let body = document.createElement('div');
  body.classList.add("card-body");

  let link = document.createElement('a');
  link.href = "#";
  link.classList.add("room-item", "btn", "btn-secondary", "btn-sm", "w-100",
      "text-start");
  link.setAttribute("data-bs-dismiss", "offcanvas");
  link.id = roomName;
  link.textContent = "Перейти";
  body.appendChild(link);
  newRoom.appendChild(body);

  let footer = document.createElement('div');
  footer.classList.add("card-footer");

  let formCheck = document.createElement('div');
  formCheck.classList.add("form-check", "form-switch");

  let label = document.createElement('label');
  label.classList.add("form-check-label");
  label.setAttribute("for", roomName + "Check");
  label.textContent = "Подписаться";
  formCheck.appendChild(label);

  let input = document.createElement('input');
  input.classList.add("form-check-input", "sub-toggle");
  input.type = "checkbox";
  input.role = "switch";
  input.id = roomName + "-Check";
  formCheck.appendChild(input);

  footer.appendChild(formCheck);
  newRoom.appendChild(footer);

  roomButtonDiv.appendChild(newRoom);

  link.addEventListener('click', function (event) {
    event.preventDefault();
    onJoinRoom(this.id);
  })

  input.addEventListener('click', function (event) {
    onToggleSubscribe(this.id.split("-")[0])
  })
}

function loadHistory(roomName) {
  stompClient.subscribe(`/user/${username}/history`, onHistoryReceived,
      {id: username})
  stompClient.send("/app/users.loadHistory", {},
      JSON.stringify({sender: username, type: "LOAD", room: currentRoom}));
}

function onJoinRoom(roomName) {
  if (roomName === currentRoom) {
    return;
  }
  leaveFromRoom()
  currentRoom = roomName;
  connectToRoom()
  loadHistory(currentRoom)

}

function onConnected() {

  connectToRoom()
  connectingElement.classList.add('hidden');
}

function connectToRoom() {
  stompClient.subscribe('/topic/' + currentRoom, onMessageReceived,
      {id: currentRoom});
  stompClient.send("/app/chat.addUser",
      {},
      JSON.stringify({sender: username, type: 'JOIN', room: currentRoom})
  )
  curRoomTitle.innerHTML = `Текущая комната: ${currentRoom}`
  loadHistory(currentRoom)
}

function leaveFromRoom() {
  stompClient.unsubscribe(currentRoom);
  stompClient.send("/app/chat.leaveUser", {},
      JSON.stringify({sender: username, type: "LEAVE", room: currentRoom}))
}

function onError(error) {
  connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
  connectingElement.style.color = 'red';
}

function onHistoryReceived(payload) {
  let messages = JSON.parse(payload.body).messages
  messageArea.innerHTML = '';
  messages.forEach(message => appendMessage(message))
}

function sendMessage(event) {
  let messageContent = messageInput.value.trim();
  if (messageContent && stompClient) {
    let chatMessage = {
      sender: username,
      content: messageInput.value,
      type: 'CHAT',
      room: currentRoom
    };
    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
    messageInput.value = '';
  }
  event.preventDefault();
}

function onMessageReceived(payload) {
  appendMessage(JSON.parse(payload.body))

}

function appendMessage(message) {
  let messageElement = document.createElement('li');

  if (message.type === 'JOIN') {
    messageElement.classList.add('event-message');
    message.content = message.sender + ' joined on room: ' + message.room;
  } else if (message.type === 'LEAVE') {
    messageElement.classList.add('event-message');
    message.content = message.sender + ' left from room: ' + message.room;
  } else {
    messageElement.classList.add('chat-message');

    let avatarElement = document.createElement('i');
    let avatarText = document.createTextNode(message.sender[0]);
    avatarElement.appendChild(avatarText);
    avatarElement.style['background-color'] = getAvatarColor(message.sender);

    messageElement.appendChild(avatarElement);

    let usernameElement = document.createElement('span');
    let usernameText = document.createTextNode(message.sender);
    usernameElement.appendChild(usernameText);
    messageElement.appendChild(usernameElement);
  }

  let textElement = document.createElement('p');
  let messageText = document.createTextNode(message.content);
  textElement.appendChild(messageText);

  messageElement.appendChild(textElement);

  messageArea.appendChild(messageElement);
  messageArea.scrollTop = messageArea.scrollHeight;
}

function getAvatarColor(messageSender) {
  let hash = 0;
  for (let i = 0; i < messageSender.length; i++) {
    hash = 31 * hash + messageSender.charCodeAt(i);
  }
  let index = Math.abs(hash % colors.length);
  return colors[index];
}

messageForm.addEventListener('submit', sendMessage, true)