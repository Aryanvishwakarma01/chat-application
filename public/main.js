const socket = io();

// DOM elements
const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chat-messages');
const userList = document.getElementById('users');
const usernameModal = document.getElementById('username-modal');
const usernameForm = document.getElementById('username-form');
const messageInput = document.getElementById('msg');
const typingIndicator = document.getElementById('typing-indicator');

let username = '';
let typingTimeout;

// Get username and join chat
usernameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  username = document.getElementById('username').value.trim();
  if (username) {
    socket.emit('userJoined', username);
    usernameModal.classList.add('hidden');
    messageInput.focus();
    
    // Add welcome message
    addMessage({
      user: 'ChatBot',
      text: `Welcome to the chat, ${username}!`,
      time: new Date().toLocaleTimeString()
    });
  }
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Get message text
  const msg = messageInput.value.trim();
  
  if (msg) {
    // Emit message to server
    socket.emit('chatMessage', msg);
    
    // Clear input and focus
    messageInput.value = '';
    messageInput.focus();
    
    // Stop typing indicator
    socket.emit('stopTyping');
  }
});

// Typing indicator
messageInput.addEventListener('input', () => {
  socket.emit('typing');
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stopTyping');
  }, 1000);
});

// Message from server
socket.on('chatMessage', (message) => {
  addMessage(message);
  
  // Scroll down to latest message
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// User connected notification
socket.on('userConnected', (user) => {
  addMessage({
    user: 'ChatBot',
    text: `${user} has joined the chat`,
    time: new Date().toLocaleTimeString()
  });
});

// User disconnected notification
socket.on('userDisconnected', (user) => {
  addMessage({
    user: 'ChatBot',
    text: `${user} has left the chat`,
    time: new Date().toLocaleTimeString()
  });
});

// Update users list
socket.on('userList', (users) => {
  updateUserList(users);
});

// User typing indicator
socket.on('userTyping', (user) => {
  typingIndicator.textContent = `${user} is typing...`;
});

socket.on('userStoppedTyping', () => {
  typingIndicator.textContent = '';
});

// Add message to DOM
function addMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  
  if (message.user === username) {
    div.classList.add('own-message');
  }
  
  div.innerHTML = `
    <div class="meta">
      <span>${message.user}</span>
      <span>${message.time}</span>
    </div>
    <p class="text">${message.text}</p>
  `;
  chatMessages.appendChild(div);
}

// Update users in DOM
function updateUserList(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user;
    userList.appendChild(li);
  });
}