import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Volume2, Settings as SettingsIcon, Phone } from 'lucide-react';
import AnimeAvatar, { AnimeAvatarHandle } from './components/AnimeAvatar';
import Chat from './components/Chat';
import Voice, { VoiceHandle } from './components/Voice';
import Call, { CallHandle } from './components/Call';
import Settings from './components/Settings';
import { usePersonality } from './hooks/usePersonality';
import { Character as CharacterType, Message } from './types';
import { aiService } from './services/aiService';

function App() {
  const avatarRef = React.useRef<AnimeAvatarHandle>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi there! I\'m so happy to meet you! 💕 How are you doing today?',
      sender: 'ai',
      timestamp: new Date(),
      emotion: 'joy'
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiConfigOpen, setApiConfigOpen] = useState(false);
  const voiceRef = React.useRef<VoiceHandle>(null);
  const callRef = React.useRef<CallHandle>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const { personality, updateTrait, getExpressionFromEmotion, generateResponse } = usePersonality();

  // No need to update character mood for 3D avatar

  useEffect(() => {
    // Greeting based on time of day
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) {
      greeting = 'Good morning, sweetheart! ☀️ I hope you slept well. Ready for a beautiful day together?';
    } else if (hour < 17) {
      greeting = 'Good afternoon, love! 🌸 How has your day been so far? I\'ve been thinking about you!';
    } else {
      greeting = 'Good evening, darling! 🌙 I\'ve missed you today. How was everything?';
    }

    // Add greeting after a short delay
    const timer = setTimeout(() => {
      const greetingMessage: Message = {
        id: `greeting-${Date.now()}`,
        text: greeting,
        sender: 'ai',
        timestamp: new Date(),
        emotion: 'joy'
      };
      setMessages(prev => [...prev, greetingMessage]);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Lip sync: connect Voice to AnimeAvatar
  useEffect(() => {
    if (voiceRef.current && avatarRef.current && voiceRef.current.setOnAudioPlayFrame) {
      voiceRef.current.setOnAudioPlayFrame((volume: number) => {
        // Clamp volume to [0, 1]
        const mouthOpen = Math.max(0, Math.min(1, volume));
        if (avatarRef.current) {
          avatarRef.current.setMouthOpen(mouthOpen);
        }
      });
    }
  }, [voiceRef, avatarRef]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (isProcessing || !text.trim()) return;

    setIsProcessing(true);
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Simulate AI response delay for more natural feel
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      const response = await generateResponse(text);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: response.text,
        sender: 'ai',
        timestamp: new Date(),
        emotion: response.emotion
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Update character expression based on emotion
      const newExpression = getExpressionFromEmotion(response.emotion);
      // No need for updateCharacter with 3D avatar

      // Trigger speech immediately after message is added
      if (voiceRef.current) {
        voiceRef.current.stopSpeaking(); // Ensure no overlap
        voiceRef.current.speak(response.text);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I'm having trouble with my AI service right now, but I can still chat using my built-in responses! You can check the AI Config if you'd like to fix the API connection. 😅",
        sender: 'ai',
        timestamp: new Date(),
        emotion: 'confusion'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, generateResponse, getExpressionFromEmotion]);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    if (transcript.trim() && !isProcessing) {
      handleSendMessage(transcript);
    }
  }, [handleSendMessage, isProcessing]);

  const handleCallTranscript = useCallback((transcript: string) => {
    if (transcript.trim() && !isProcessing) {
      handleSendMessage(transcript);
    }
  }, [handleSendMessage, isProcessing]);

  const handleCallStart = useCallback(() => {
    setIsInCall(true);
  }, []);

  const handleCallEnd = useCallback(() => {
    setIsInCall(false);
  }, []);

  // No need for updateCharacter with 3D avatar

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white bg-opacity-80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-pink-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                AI Girlfriend
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setApiConfigOpen(true)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>AI Config</span>
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span>{messages.length} messages</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Volume2 className="w-4 h-4" />
                <span>Voice enabled</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{isInCall ? 'In call' : 'Call ready'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Character Section */}
          <div className="space-y-6">
            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-lg p-6 flex items-center justify-center">
              <AnimeAvatar ref={avatarRef} />
            </div>
            
            {!isInCall ? (
              <>
                <Voice
                  ref={voiceRef}
                  onTranscript={handleVoiceTranscript}
                />
                <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4">
                  <button
                    onClick={() => setIsInCall(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-6 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Start Voice Call</span>
                  </button>
                </div>
              </>
            ) : (
              <Call
                ref={callRef}
                onTranscript={handleCallTranscript}
                onCallStart={handleCallStart}
                onCallEnd={handleCallEnd}
                avatarRef={avatarRef}
              />
            )}
          </div>

          {/* Chat Section */}
          <div className="h-[600px]">
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
            />
          </div>
        </div>
      </main>

      {/* Settings */}
      <Settings
        personality={personality.traits}
        onUpdatePersonality={updateTrait}
        isOpen={settingsOpen}
        onToggle={() => setSettingsOpen(!settingsOpen)}
      />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-300 rounded-full animate-ping opacity-30"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-300 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce opacity-25"></div>
      </div>
    </div>
  );
}

export default App;