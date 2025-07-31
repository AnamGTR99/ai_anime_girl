import { useState, useEffect } from 'react';
import { Personality, PersonalityTrait, Mood, Expression, Emotion } from '../types';
import { aiService, AIService } from '../services/aiService';

const defaultTraits: PersonalityTrait[] = [
  { id: 'cheerful', name: 'Cheerful', value: 80, description: 'How happy and optimistic she is' },
  { id: 'shy', name: 'Shy', value: 30, description: 'How reserved and timid she is' },
  { id: 'energetic', name: 'Energetic', value: 70, description: 'How active and enthusiastic she is' },
  { id: 'caring', name: 'Caring', value: 90, description: 'How nurturing and supportive she is' },
  { id: 'playful', name: 'Playful', value: 60, description: 'How fun-loving and mischievous she is' },
  { id: 'intelligent', name: 'Intelligent', value: 85, description: 'How smart and knowledgeable she is' }
];

export const usePersonality = (customAIService?: any) => {
  const [personality, setPersonality] = useState<Personality>({
    traits: defaultTraits,
    currentMood: 'cheerful'
  });

  const updateTrait = (traitId: string, value: number) => {
    setPersonality(prev => ({
      ...prev,
      traits: prev.traits.map(trait => 
        trait.id === traitId ? { ...trait, value: Math.max(0, Math.min(100, value)) } : trait
      )
    }));
  };

  const getExpressionFromEmotion = (emotion: Emotion): Expression => {
    switch (emotion) {
      case 'joy': return 'happy';
      case 'sadness': return 'sad';
      case 'surprise': return 'surprised';
      case 'excitement': return 'excited';
      case 'love': return 'blushing';
      case 'confusion': return 'neutral';
      default: return 'neutral';
    }
  };

  const getMoodFromTraits = (): Mood => {
    const { traits } = personality;
    const cheerful = traits.find(t => t.id === 'cheerful')?.value || 0;
    const shy = traits.find(t => t.id === 'shy')?.value || 0;
    const energetic = traits.find(t => t.id === 'energetic')?.value || 0;
    const caring = traits.find(t => t.id === 'caring')?.value || 0;
    const playful = traits.find(t => t.id === 'playful')?.value || 0;

    if (energetic > 70) return 'energetic';
    if (shy > 60) return 'shy';
    if (caring > 80) return 'caring';
    if (playful > 70) return 'playful';
    if (cheerful > 60) return 'cheerful';
    return 'dreamy';
  };

  const generatePersonalityPrompt = (): string => {
    const { traits } = personality;
    const traitDescriptions = traits.map(trait => `${trait.name}: ${trait.value}%`).join(', ');
    
    return `You are a cute anime girlfriend AI named Sakura with the following personality traits: ${traitDescriptions}. 
    
    Character Guidelines:
    - Respond as a loving, caring girlfriend who genuinely cares about the user
    - Keep responses conversational, warm, and under 150 words
    - Use emojis occasionally (1-2 per message) but don't overdo it
    - Be affectionate but natural, not overly dramatic or clingy
    - Show interest in the user's day, feelings, and thoughts
    - Adapt your personality based on the trait values - if shy is high, be more reserved; if energetic is high, be more enthusiastic
    - Remember you're in a romantic relationship context but keep it sweet and wholesome
    - Ask questions to keep the conversation engaging
    - React appropriately to the user's emotions and topics`;
  };

  const generateResponse = async (userMessage: string): Promise<{ text: string; emotion: Emotion }> => {
    const personalityPrompt = generatePersonalityPrompt();
    const serviceToUse = customAIService || aiService;
    try {
      const response = await serviceToUse.generateResponse(userMessage, personalityPrompt, []);
      return {
        text: response.text,
        emotion: response.emotion
      };
    } catch (error) {
      console.error('Error generating response:', error);
      // Fall back to local response on API errors
      const fallbackService = new AIService({ provider: 'local' });
      const fallbackResponse = await fallbackService.generateResponse(userMessage, personalityPrompt, []);
      return {
        ...fallbackResponse,
        text: `${fallbackResponse.text}\n\n*Note: Using local responses due to API issue. Check AI Config to resolve.*`
      };
    }
  };

  useEffect(() => {
    const newMood = getMoodFromTraits();
    setPersonality(prev => ({ ...prev, currentMood: newMood }));
  }, [personality.traits]);

  return {
    personality,
    updateTrait,
    getExpressionFromEmotion,
    generateResponse,
    getMoodFromTraits,
    generatePersonalityPrompt
  };
};