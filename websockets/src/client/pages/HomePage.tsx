import { useState } from 'react';
import logo from '@/client/assets/modelence.svg';

export default function HomePage() {
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', userName: 'System', message: 'Welcome to the chat room!', timestamp: Date.now() }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState(['You']);

  const handleJoinChat = () => {
    if (userName.trim()) {
      setIsJoined(true);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        userName: userName,
        message: newMessage,
        timestamp: Date.now()
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Modelence Logo" className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Chat Room</h1>
          <p className="text-gray-600 mb-6">Enter your name to start chatting with others</p>

          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyUp={(e) => e.key === 'Enter' && handleJoinChat()}
          />

          <button
            onClick={handleJoinChat}
            disabled={!userName.trim()}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center mb-6">
          <img src={logo} alt="Modelence Logo" className="w-8 h-8 mr-2" />
          <h2 className="font-bold text-gray-900">Chat Room</h2>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Online Users ({users.length})</h3>
          <div className="space-y-2">
            {users.map((user, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">{user}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-900">General Chat</h1>
          <p className="text-sm text-gray-500">Welcome, {userName}!</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.userName === userName ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.userName === userName
                  ? 'bg-blue-600 text-white'
                  : message.userName === 'System'
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-white border border-gray-200'
              }`}>
                {message.userName !== userName && message.userName !== 'System' && (
                  <p className="text-xs font-semibold text-gray-600 mb-1">{message.userName}</p>
                )}
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.userName === userName ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyUp={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
