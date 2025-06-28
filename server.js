// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users
const users = {};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // User joins
  socket.on('userJoined', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('userConnected', username);
    io.emit('userList', Object.values(users));
  });
  
  // New message
  socket.on('chatMessage', (message) => {
    io.emit('chatMessage', {
      user: users[socket.id],
      text: message,
      time: new Date().toLocaleTimeString()
    });
  });
  
  // Typing indicator
  socket.on('typing', () => {
    socket.broadcast.emit('userTyping', users[socket.id]);
  });
  
  socket.on('stopTyping', () => {
    socket.broadcast.emit('userStoppedTyping');
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      delete users[socket.id];
      io.emit('userDisconnected', username);
      io.emit('userList', Object.values(users));
    }
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});