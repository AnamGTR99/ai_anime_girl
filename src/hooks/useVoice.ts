import { useState, useEffect, useRef } from 'react';
import { VoiceSettings } from '../types';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: true,
    pitch: 1.2,
    rate: 1.0,
    volume: 0.8,
    voice: ''
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognitionClass: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognitionClass && SpeechSynthesis) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognitionClass();
      synthRef.current = SpeechSynthesis;
      
      // Configure recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = SpeechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Try to find a female voice
        const femaleVoice = availableVoices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('karen')
        );
        
        if (femaleVoice && !settings.voice) {
          setSettings(prev => ({ ...prev, voice: femaleVoice.name }));
        }
      };
      
      loadVoices();
      SpeechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const elevenLabsApiKey = process.env.VITE_ELEVENLABS_API_KEY || 'your_elevenlabs_api_key_here';
  const kawaiiAerisitaVoiceId = process.env.VITE_KAWAII_VOICE_ID || 'your_kawaii_voice_id_here'; // Voice ID for Kawaii Aerisita
  let audioElement: HTMLAudioElement | null = null;

  const speak = async (text: string) => {
    if (!settings.enabled) return;
    try {
      // Always stop any current audio before playing new
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
        audioElement = null;
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
      audioElement = new Audio(audioUrl);
      audioElement.onended = () => setIsSpeaking(false);
      audioElement.onerror = () => setIsSpeaking(false);
      audioElement.play();
    } catch (err) {
      setIsSpeaking(false);
      console.error('ElevenLabs TTS error:', err);
    }
  };

  const stopSpeaking = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    isListening,
    isSupported,
    isSpeaking,
    transcript,
    voices,
    settings,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    updateSettings,
    setIsSpeaking
  };
};