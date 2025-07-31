import React, { useImperativeHandle, forwardRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

interface VoiceProps {
  onTranscript: (text: string) => void;
}

export interface VoiceHandle {
  speak: (text: string) => void;
  stopSpeaking: () => void;
  // Add a method to set a callback for audio playback frames
  setOnAudioPlayFrame?: (cb: (volume: number) => void) => void;
}

// Add these constants for ElevenLabs
const elevenLabsApiKey = 'sk_bd973aede25ed97d1ee3c17deb5c4e66520360945276312d';
const kawaiiAerisitaVoiceId = 'vGQNBgLaiM3EdZtxIiuY';

const Voice = forwardRef<VoiceHandle, VoiceProps>(({ onTranscript }, ref) => {
  const {
    isListening,
    isSupported,
    isSpeaking,
    transcript,
    settings,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    updateSettings,
    setIsSpeaking,
  } = useVoice();

  // Add a ref for the audio frame callback
  const onAudioPlayFrameRef = React.useRef<((volume: number) => void) | null>(null);
  // Use a ref for the audio element so it persists across renders
  const audioElementRef = React.useRef<HTMLAudioElement | null>(null);

  // Patch speak to support frame callback for lip sync
  const speakWithLipSync = async (text: string) => {
    if (!settings.enabled) return;
    try {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
        audioElementRef.current = null;
      }
      setIsSpeaking(true);
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${kawaiiAerisitaVoiceId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
            style: 0.7,
            use_speaker_boost: true
          }
        })
      });
      if (!response.ok) throw new Error('Failed to fetch audio from ElevenLabs');
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsSpeaking(false);
      audioElementRef.current.onerror = () => setIsSpeaking(false);
      // Lip sync: animate mouth while audio is playing
      let rafId: number;
      const animateLipSync = () => {
        if (audioElementRef.current && !audioElementRef.current.paused && onAudioPlayFrameRef.current) {
          // Simulate volume with a simple sine wave for now (real volume requires Web Audio API)
          const t = audioElementRef.current.currentTime;
          const fakeVolume = 0.5 + 0.5 * Math.abs(Math.sin(t * 8));
          onAudioPlayFrameRef.current(fakeVolume);
          rafId = requestAnimationFrame(animateLipSync);
        }
      };
      audioElementRef.current.onplay = () => {
        animateLipSync();
      };
      audioElementRef.current.onpause = () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (onAudioPlayFrameRef.current) onAudioPlayFrameRef.current(0);
      };
      audioElementRef.current.onended = () => {
        setIsSpeaking(false);
        if (rafId) cancelAnimationFrame(rafId);
        if (onAudioPlayFrameRef.current) onAudioPlayFrameRef.current(0);
      };
      audioElementRef.current.play();
    } catch (err) {
      setIsSpeaking(false);
      console.error('ElevenLabs TTS error:', err);
    }
  };

  // Expose the callback setter
  const setOnAudioPlayFrame = (cb: (volume: number) => void) => {
    onAudioPlayFrameRef.current = cb;
  };

  React.useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  useImperativeHandle(ref, () => ({
    speak: speakWithLipSync,
    stopSpeaking,
    setOnAudioPlayFrame
  }));

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800 text-sm">
          Voice features are not supported in your browser
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Voice Controls</h3>
        <button
          onClick={() => updateSettings({ enabled: !settings.enabled })}
          className={`p-2 rounded-full transition-colors ${
            settings.enabled 
              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          {settings.enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {settings.enabled && (
        <>
          {/* Voice Input */}
          <div className="flex items-center space-x-3">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                isListening 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-pink-500 text-white hover:bg-pink-600'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-sm">
                {isListening ? 'Stop' : 'Talk'}
              </span>
            </button>
            
            {isListening && (
              <div className="flex-1 bg-red-50 rounded-full px-3 py-2">
                <p className="text-sm text-red-600">Listening...</p>
              </div>
            )}
          </div>

          {/* Voice Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 w-16">Pitch:</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => updateSettings({ pitch: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 w-8">{settings.pitch.toFixed(1)}</span>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 w-16">Speed:</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 w-8">{settings.rate.toFixed(1)}</span>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 w-16">Volume:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 w-8">{Math.round(settings.volume * 100)}</span>
            </div>
          </div>

          {/* Speaking Status */}
          {isSpeaking && (
            <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-700">Speaking...</span>
              </div>
              <button
                onClick={stopSpeaking}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Stop
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default Voice;