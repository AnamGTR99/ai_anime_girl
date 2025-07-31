import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Conversation } from '@elevenlabs/client';

export interface CallHandle {
  startCall: () => void;
  endCall: () => void;
  isInCall: () => boolean;
}

interface CallProps {
  onTranscript: (text: string) => void;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  avatarRef?: React.RefObject<any>; // Reference to the avatar for animations
}

const Call = forwardRef<CallHandle, CallProps>(({ onTranscript, onCallStart, onCallEnd, avatarRef }, ref) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [agentStatus, setAgentStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  
  const callTimerRef = useRef<number | null>(null);
  const conversationRef = useRef<any>(null);
  const lipSyncIntervalRef = useRef<number | null>(null);
  const blinkIntervalRef = useRef<number | null>(null);
  const headMovementIntervalRef = useRef<number | null>(null);

  // ElevenLabs constants
  const elevenLabsApiKey = 'sk_bd973aede25ed97d1ee3c17deb5c4e66520360945276312d';
  const sakuraAgentId = 'agent_1301k15zp4k4ew4s5b1mvbmjg0d0';

  // Advanced animation functions
  const startLipSync = () => {
    if (lipSyncIntervalRef.current) {
      clearInterval(lipSyncIntervalRef.current);
    }
    
    lipSyncIntervalRef.current = window.setInterval(() => {
      if (avatarRef?.current) {
        // More natural mouth movement based on speech patterns
        const time = Date.now() * 0.01;
        const baseOpen = 0.2;
        const variation = Math.sin(time * 8) * 0.3; // Natural speech rhythm
        const random = (Math.random() - 0.5) * 0.1; // Small random variation
        const mouthOpen = Math.max(0, Math.min(1, baseOpen + variation + random));
        avatarRef.current.setMouthOpen(mouthOpen);
      }
    }, 50); // More frequent updates for smoother animation
  };

  const stopLipSync = () => {
    if (lipSyncIntervalRef.current) {
      clearInterval(lipSyncIntervalRef.current);
      lipSyncIntervalRef.current = null;
    }
    
    if (avatarRef?.current) {
      avatarRef.current.setMouthOpen(0);
    }
  };

  const startBlinking = () => {
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
    }
    
    blinkIntervalRef.current = window.setInterval(() => {
      if (avatarRef?.current) {
        // Natural blinking pattern
        const shouldBlink = Math.random() < 0.02; // 2% chance per frame
        if (shouldBlink) {
          // Trigger blink animation
          avatarRef.current.setExpression('blink');
          setTimeout(() => {
            if (avatarRef?.current) {
              avatarRef.current.setExpression(currentEmotion);
            }
          }, 150); // Blink duration
        }
      }
    }, 100);
  };

  const stopBlinking = () => {
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
    }
  };

  const startHeadMovement = () => {
    if (headMovementIntervalRef.current) {
      clearInterval(headMovementIntervalRef.current);
    }
    
    headMovementIntervalRef.current = window.setInterval(() => {
      if (avatarRef?.current) {
        // Subtle head movements for life-like animation
        const time = Date.now() * 0.002;
        const headY = Math.sin(time) * 0.02; // Gentle up/down movement
        const headX = Math.sin(time * 0.7) * 0.015; // Gentle left/right movement
        
        // Apply head movement (if avatar supports it)
        if (avatarRef.current.setHeadPosition) {
          avatarRef.current.setHeadPosition(headX, headY, 0);
        }
      }
    }, 100);
  };

  const stopHeadMovement = () => {
    if (headMovementIntervalRef.current) {
      clearInterval(headMovementIntervalRef.current);
      headMovementIntervalRef.current = null;
    }
  };

  const analyzeEmotion = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // Analyze text for emotional content
    if (lowerText.includes('love') || lowerText.includes('💕') || lowerText.includes('💖') || lowerText.includes('amazing')) {
      return 'love';
    } else if (lowerText.includes('happy') || lowerText.includes('✨') || lowerText.includes('wonderful') || lowerText.includes('excited')) {
      return 'joy';
    } else if (lowerText.includes('sad') || lowerText.includes('miss') || lowerText.includes('😢')) {
      return 'sadness';
    } else if (lowerText.includes('surprised') || lowerText.includes('wow') || lowerText.includes('😮')) {
      return 'surprise';
    } else if (lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('😠')) {
      return 'anger';
    } else if (lowerText.includes('confused') || lowerText.includes('hmm') || lowerText.includes('🤔')) {
      return 'confusion';
    } else if (lowerText.includes('shy') || lowerText.includes('blush') || lowerText.includes('😊')) {
      return 'blushing';
    }
    
    return 'neutral';
  };

  const setAvatarEmotion = (emotion: string) => {
    if (avatarRef?.current) {
      setCurrentEmotion(emotion);
      avatarRef.current.setExpression(emotion);
    }
  };

  const startCall = async () => {
    try {
      console.log('🎯 Starting call with Sakura agent...');
      setAgentStatus('connecting');

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      console.log('🎤 Microphone access granted');

      // Start the conversation using ElevenLabs client
      conversationRef.current = await Conversation.startSession({
        agentId: sakuraAgentId,
        connectionType: 'websocket',
        onConnect: () => {
          console.log('✅ Connected to Sakura agent');
          setAgentStatus('connected');
          setIsInCall(true);
          onCallStart?.();
          
          // Start life-like animations
          startBlinking();
          startHeadMovement();
          
          // Start call timer
          callTimerRef.current = window.setInterval(() => {
            setCallDuration(prev => prev + 1);
          }, 1000);
        },
        onDisconnect: () => {
          console.log('🔌 Disconnected from Sakura agent');
          setAgentStatus('disconnected');
          setIsInCall(false);
          setIsListening(false);
          onCallEnd?.();
          
          if (callTimerRef.current) {
            window.clearInterval(callTimerRef.current);
          }
        },
        onError: (error) => {
          console.error('❌ Conversation error:', error);
          setAgentStatus('error');
        },
        onModeChange: (mode) => {
          console.log('🔄 Mode changed:', mode.mode);
          if (mode.mode === 'speaking') {
            setIsListening(false);
            setIsProcessing(true);
            // Start all life-like animations
            startLipSync();
            startBlinking();
            startHeadMovement();
            
            // Analyze the last user message to set appropriate emotion
            if (currentTranscript) {
              const emotion = analyzeEmotion(currentTranscript);
              setAvatarEmotion(emotion);
              console.log('🎭 Setting emotion based on conversation:', emotion);
            }
          } else if (mode.mode === 'listening') {
            setIsListening(true);
            setIsProcessing(false);
            // Stop speaking animations, keep subtle movements
            stopLipSync();
            startBlinking(); // Keep blinking
            startHeadMovement(); // Keep head movement
            setAvatarEmotion('neutral');
          }
        }
      });

    } catch (error) {
      console.error('❌ Failed to start call:', error);
      setAgentStatus('error');
      alert('Failed to start call. Please check microphone permissions and try again.');
    }
  };

  const endCall = () => {
    console.log('📞 Ending call...');
    
    // Stop all animations
    stopLipSync();
    stopBlinking();
    stopHeadMovement();
    
    if (conversationRef.current) {
      conversationRef.current.endSession();
      conversationRef.current = null;
    }

    if (callTimerRef.current) {
      window.clearInterval(callTimerRef.current);
    }

    // Reset avatar to neutral state
    if (avatarRef?.current) {
      avatarRef.current.setExpression('neutral');
      avatarRef.current.setMouthOpen(0);
    }

    setIsInCall(false);
    setIsListening(false);
    setCallDuration(0);
    setCurrentTranscript('');
    setCurrentEmotion('neutral');
    setAgentStatus('disconnected');
    onCallEnd?.();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Note: The ElevenLabs client handles mute internally
    console.log('🔇 Mute toggled:', !isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Note: The ElevenLabs client handles audio output
    console.log('🔊 Speaker toggled:', !isSpeakerOn);
  };

  const formatCallDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useImperativeHandle(ref, () => ({
    startCall,
    endCall,
    isInCall: () => isInCall
  }), [isInCall]);

  useEffect(() => {
    return () => {
      if (isInCall) {
        endCall();
      }
    };
  }, []);

  return (
    <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Voice Call</h3>
        {isInCall && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{formatCallDuration(callDuration)}</span>
          </div>
        )}
      </div>

      {!isInCall ? (
        <button
          onClick={startCall}
          className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-6 rounded-full hover:bg-green-600 transition-colors"
        >
          <Phone className="w-5 h-5" />
          <span>Call Sakura</span>
        </button>
      ) : (
        <div className="space-y-4">
          {/* Call Status */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Connected'}
            </div>
            
            {/* Agent Status */}
            <div className="text-xs mb-2">
              {agentStatus === 'connecting' && (
                <span className="text-yellow-600">🔄 Connecting to Sakura...</span>
              )}
              {agentStatus === 'connected' && (
                <span className="text-green-600">✅ Sakura connected</span>
              )}
              {agentStatus === 'error' && (
                <span className="text-red-600">❌ Agent connection failed</span>
              )}
              {agentStatus === 'disconnected' && (
                <span className="text-gray-600">🔌 Agent disconnected</span>
              )}
            </div>
            
            {/* Live Transcript */}
            {currentTranscript && (
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-blue-800 italic">"{currentTranscript}"</p>
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-colors ${
                  isMuted 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button
                onClick={toggleSpeaker}
                className={`p-3 rounded-full transition-colors ${
                  isSpeakerOn 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-3 px-6 rounded-full hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>
      )}
    </div>
  );
});

export default Call; 