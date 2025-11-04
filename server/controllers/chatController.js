// controllers/chatController.js
const messages = require('../models/message');
const formatMessage = require('../utils/formatMessage');

const users = {};       // { socketId: { username, id, rooms: [] } }
const typingUsers = {}; // { socketId: username }

const chatController = (io, socket) => {

  // Handle user join
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id, rooms: [] };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
  });

  // Global message
  socket.on('send_message', (msgData, ack) => {
    const message = formatMessage({ sender: users[socket.id]?.username || 'Anonymous', ...msgData });
    messages.push(message);

    if (messages.length > 100) messages.shift(); // keep last 100 messages

    io.emit('receive_message', message);

    if (ack) ack('ok'); // delivery acknowledgment
  });

  // Room messages
  socket.on('join_room', (room) => {
    socket.join(room);
    users[socket.id].rooms.push(room);
    io.to(room).emit('system_message', `${users[socket.id].username} joined ${room}`);
  });

  socket.on('send_room_message', ({ room, message }, ack) => {
    const msg = formatMessage({ sender: users[socket.id].username, message, room });
    messages.push(msg);
    io.to(room).emit('receive_message', msg);
    if (ack) ack('ok');
  });

  // Private messages
  socket.on('private_message', ({ to, message }, ack) => {
    const msg = formatMessage({ sender: users[socket.id].username, message, isPrivate: true });
    messages.push(msg);
    socket.to(to).emit('private_message', msg);
    socket.emit('private_message', msg); // echo to sender
    if (ack) ack('ok');
  });

  // Typing indicator
  socket.on('typing', ({ room, isTyping }) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      if (isTyping) typingUsers[socket.id] = username;
      else delete typingUsers[socket.id];

      if (room) io.to(room).emit('typing_users', Object.values(typingUsers));
      else io.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Message reactions
  socket.on('message_reaction', ({ messageId, reaction }) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      msg.reactions.push({ user: users[socket.id].username, reaction });
      if (msg.isPrivate) {
        socket.to(msg.senderId).emit('message_updated', msg);
        socket.emit('message_updated', msg);
      } else {
        io.emit('message_updated', msg);
      }
    }
  });

  // Read receipts
  socket.on('message_read', (messageId) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg && !msg.readBy.includes(users[socket.id].username)) {
      msg.readBy.push(users[socket.id].username);
      io.emit('message_updated', msg);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      delete users[socket.id];
      delete typingUsers[socket.id];
      io.emit('user_list', Object.values(users));
      io.emit('typing_users', Object.values(typingUsers));
    }
  });
};

module.exports = chatController;
