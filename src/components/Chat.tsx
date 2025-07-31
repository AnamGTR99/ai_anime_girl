import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Smile } from 'lucide-react';
import { Message } from '../types';

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  characterName?: string;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isTyping, characterName }) => {
  const [inputValue, setInputValue] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const emojis = ['😊', '😍', '🥰', '😘', '💕', '💖', '✨', '🌟', '🎉', '🤗', '😂', '🥺'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    const message = inputValue.trim();
    if (message) {
      onSendMessage(message);
      setInputValue('');
      setShowEmojis(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojis(false);
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleQuickMessage = (message: string) => {
    onSendMessage(message);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="bg-white bg-opacity-80 backdrop-blur-sm p-4 rounded-t-lg border-b border-pink-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{characterName || 'Sakura'}</h3>
            <p className="text-sm text-gray-600">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-white text-gray-800 shadow-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-pink-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-md max-w-xs lg:max-w-md px-4 py-2 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="text-sm text-gray-600">typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 bg-white bg-opacity-50">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickMessage("I love you! 💕")}
            className="px-3 py-1 bg-pink-200 text-pink-800 rounded-full text-sm hover:bg-pink-300 transition-colors"
          >
            💕 Love
          </button>
          <button
            onClick={() => handleQuickMessage("How are you feeling today?")}
            className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm hover:bg-purple-300 transition-colors"
          >
            🤗 Ask
          </button>
          <button
            onClick={() => handleQuickMessage("Want to play a game?")}
            className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm hover:bg-blue-300 transition-colors"
          >
            🎮 Play
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white bg-opacity-80 backdrop-blur-sm p-4 rounded-b-lg border-t border-pink-200">
        <div className="flex items-end space-x-2">
          <div className="relative">
            <button
              onClick={() => setShowEmojis(!showEmojis)}
              className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
              type="button"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            {showEmojis && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 z-10">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent max-h-20"
              rows={1}
              disabled={isTyping}
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            type="button"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;