export interface Character {
  name: string;
  hairColor: string;
  outfitColor: string;
  expression: Expression;
  mood: Mood;
  isAnimating: boolean;
}

export interface PersonalityTrait {
  id: string;
  name: string;
  value: number; // 0-100
  description: string;
}

export interface Personality {
  traits: PersonalityTrait[];
  currentMood: Mood;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  emotion?: Emotion;
}

export interface VoiceSettings {
  enabled: boolean;
  pitch: number;
  rate: number;
  volume: number;
  voice: string;
}

export type Expression = 'happy' | 'sad' | 'surprised' | 'excited' | 'neutral' | 'shy' | 'winking' | 'blushing';
export type Mood = 'cheerful' | 'shy' | 'energetic' | 'caring' | 'playful' | 'dreamy';
export type Emotion = 'joy' | 'sadness' | 'surprise' | 'excitement' | 'love' | 'confusion';
export type OutfitType = 'casual' | 'formal' | 'cute' | 'sporty';
export type HairColor = 'brown' | 'blonde' | 'pink' | 'purple' | 'blue' | 'red';