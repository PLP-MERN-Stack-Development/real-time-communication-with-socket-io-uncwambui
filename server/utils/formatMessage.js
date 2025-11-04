// utils/formatMessage.js
const formatMessage = ({ sender, message, isPrivate = false, room = null }) => ({
  id: Date.now(),
  sender,
  message,
  timestamp: new Date().toISOString(),
  isPrivate,
  room,
  reactions: [],
  readBy: [],
});

module.exports = formatMessage;
