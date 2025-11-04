// socket/socketHandlers.js
const Message = require('../models/messageModel');
const { addMessage, getStoredMessages } = require('../controllers/chatController');
const { formatMessage } = require('../utils/formatMessage');

const users = {};
const typingUsers = {};

function registerSocketEvents(io) {
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    

    // User joins chat
    socket.on('user_join', (username) => {
      users[socket.id] = { username, id: socket.id };
      io.emit('user_list', Object.values(users));
      io.emit('user_joined', { username, id: socket.id });
      console.log(`${username} joined the chat`);
    });

    // Public message
    socket.on('send_message', (messageData) => {
      const message = new Message({
        id: Date.now(),
        sender: users[socket.id]?.username || 'Anonymous',
        senderId: socket.id,
        message: messageData.message,
        timestamp: new Date().toISOString(),
      });

      addMessage(message);
      io.emit('receive_message', message);
    });

    // Private message
    socket.on('private_message', ({ to, message }) => {
      const msg = new Message({
        id: Date.now(),
        sender: users[socket.id]?.username || 'Anonymous',
        senderId: socket.id,
        message,
        timestamp: new Date().toISOString(),
        isPrivate: true,
      });

      socket.to(to).emit('private_message', msg);
      socket.emit('private_message', msg);
    });

    // Typing
    socket.on('typing', (isTyping) => {
      const username = users[socket.id]?.username;
      if (username) {
        if (isTyping) typingUsers[socket.id] = username;
        else delete typingUsers[socket.id];
        io.emit('typing_users', Object.values(typingUsers));
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const user = users[socket.id];
      if (user) {
        io.emit('user_left', user);
        delete users[socket.id];
        delete typingUsers[socket.id];
        io.emit('user_list', Object.values(users));
        console.log(`${user.username} disconnected`);
      }
    });
  });
}

module.exports = registerSocketEvents;
