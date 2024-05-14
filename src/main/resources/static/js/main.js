'use strict';

let messageForm = document.querySelector('#messageForm');
let messageInput = document.querySelector('#message');
let messageArea = document.querySelector('#messageArea');
let connectingElement = document.querySelector('.connecting');
let roomButtonDiv = document.querySelector("#rooms-buttons");
let newRoomNameInput = document.querySelector("#new-room-name-input");
let newRoomBtn = document.querySelector("#create-new-room-btn")

let stompClient = null;
let username = null;
let currentRoom = 'public';

let colors = [
  '#2196F3', '#32c787', '#00BCD4', '#ff5652',
  '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

window.onload = function () {
  username = document.getElementById('hiddenUsername').value;
  let socket = new SockJS('/ws');
  stompClient = Stomp.over(socket);

  stompClient.connect({}, onConnected, onError);

  let roomItems = document.querySelectorAll('.room-item');
  roomItems.forEach(function (roomItem) {
    roomItem.addEventListener('click', function (event) {
      event.preventDefault();
      onJoinRoom(this.id);
    });
  });
}

newRoomBtn.addEventListener('click', (event) => {
  let roomName = newRoomNameInput.value
  onJoinRoom(roomName)
  addNewRoom(roomName)
  event.preventDefault();
})

function addNewRoom(roomName) {
  let newRoom = document.createElement('a');
  // Устанавливаем атрибуты и классы для нового элемента
  newRoom.href = "#";
  newRoom.classList.add("room-item", "btn", "btn-secondary", "w-100",
      "text-start");
  newRoom.setAttribute("data-bs-dismiss", "offcanvas");
  newRoom.id = roomName
  let spanEl = document.createElement('span')
  spanEl.textContent = "Комната " + roomName
  newRoom.appendChild(spanEl)
  roomButtonDiv.appendChild(
      newRoom
  )
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
  stompClient.unsubscribe(currentRoom);
  stompClient.send("/app/chat.leaveUser", {},
      JSON.stringify({sender: username, type: "LEAVE", room: currentRoom}))
  currentRoom = roomName;
  stompClient.subscribe("/topic/" + currentRoom, onMessageReceived,
      {id: currentRoom});

  stompClient.send("/app/chat.addUser", {},
      JSON.stringify({sender: username, type: "JOIN", room: currentRoom}));
  loadHistory(currentRoom)
}

function onConnected() {
  // Subscribe to the Public Topic
  stompClient.subscribe('/topic/' + currentRoom, onMessageReceived,
      {id: currentRoom});

  // Tell your username to the server
  stompClient.send("/app/chat.addUser",
      {},
      JSON.stringify({sender: username, type: 'JOIN', room: currentRoom})
  )

  connectingElement.classList.add('hidden');
  loadHistory(currentRoom)
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