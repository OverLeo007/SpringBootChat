'use strict';

let messageForm = document.querySelector('#messageForm');
let messageInput = document.querySelector('#message');
let messageArea = document.querySelector('#messageArea');
let connectingElement = document.querySelector('.connecting');

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
  roomItems.forEach(function(roomItem) {
    roomItem.addEventListener('click', function(event) {
      event.preventDefault();
      onJoinRoom(this.id);
    });
  });
}

function onJoinRoom(roomName) {
  // if (stompClient.subscriptions[currentRoom]) {
  // }
  stompClient.unsubscribe(currentRoom);
  stompClient.send("/app/chat.leaveUser", {},
      JSON.stringify({sender: username, type: "LEAVE", room: currentRoom}))
  console.log(stompClient.subscriptions)
  currentRoom = roomName;
  stompClient.subscribe("/topic/" + currentRoom, onMessageReceived, {id: currentRoom});

  stompClient.send("/app/chat.addUser", {},
      JSON.stringify({sender: username, type: "JOIN", room: currentRoom}));
}

function onConnected() {
  // Subscribe to the Public Topic
  stompClient.subscribe('/topic/' + currentRoom, onMessageReceived, {id: currentRoom});

  // Tell your username to the server
  stompClient.send("/app/chat.addUser",
      {},
      JSON.stringify({sender: username, type: 'JOIN', room: currentRoom})
  )

  connectingElement.classList.add('hidden');
}

function onError(error) {
  connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
  connectingElement.style.color = 'red';
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
  console.log(payload)
  let message = JSON.parse(payload.body);

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