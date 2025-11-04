import React from "react";

const TypingIndicator = ({ typingUsers, currentUser }) => {
  const activeTypers = typingUsers.filter((u) => u !== currentUser);
  if (activeTypers.length === 0) return null;

  return (
    <div className="typing-indicator">
      {activeTypers.join(", ")} {activeTypers.length > 1 ? "are" : "is"} typing...
    </div>
  );
};

export default TypingIndicator;
