import React from 'react';

// src/components/UserList.jsx
export default function UserList({ users, currentUser, onPrivateChat }) {
  return (
    <div className="w-60 bg-gray-100 border-r overflow-y-auto p-2">
      <h3 className="font-semibold text-lg mb-2">Online Users</h3>
      {users.map((u) => (
        <div
          key={u.id}
          onClick={() => u.username !== currentUser && onPrivateChat(u)}
          className={`cursor-pointer px-2 py-1 rounded-md ${
            u.username === currentUser
              ? "bg-blue-200"
              : "hover:bg-blue-50"
          }`}
        >
          {u.username} 🟢
        </div>
      ))}
    </div>
  );
}

