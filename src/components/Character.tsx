import React, { useState, useEffect } from 'react';
import { Character as CharacterType, Expression, Mood, HairColor, OutfitType } from '../types';

interface CharacterProps {
  character: CharacterType;
  isTyping: boolean;
  onExpressionChange: (expression: Expression) => void;
}

const Character: React.FC<CharacterProps> = ({ character, isTyping, onExpressionChange }) => {
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [eyeBlink, setEyeBlink] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    // Blinking animation
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
    }, 3000 + Math.random() * 2000);

    // Mood-based animation changes
    const animationInterval = setInterval(() => {
      if (character.mood === 'energetic') {
        setCurrentAnimation('bounce');
      } else if (character.mood === 'shy') {
        setCurrentAnimation('sway');
      } else if (character.mood === 'playful') {
        setCurrentAnimation('wiggle');
      } else {
        setCurrentAnimation('idle');
      }
    }, 5000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(animationInterval);
    };
  }, [character.mood]);

  useEffect(() => {
    if (character.expression === 'excited' || character.expression === 'happy') {
      // Create heart particles
      const newParticles = Array.from({ length: 3 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 2000);
    }
  }, [character.expression]);

  const getHairColor = (color: HairColor): string => {
    const colors = {
      brown: '#8B4513',
      blonde: '#FFD700',
      pink: '#FF69B4',
      purple: '#9370DB',
      blue: '#4169E1',
      red: '#DC143C'
    };
    return colors[color] || colors.brown;
  };

  const getOutfitColor = (mood: Mood): string => {
    const colors = {
      cheerful: '#FFE4E1',
      shy: '#E6E6FA',
      energetic: '#FF6347',
      caring: '#98FB98',
      playful: '#FFB6C1',
      dreamy: '#B0E0E6'
    };
    return colors[mood] || colors.cheerful;
  };

  const getEyeStyle = () => {
    switch (character.expression) {
      case 'happy':
        return { transform: 'scaleY(0.7)' };
      case 'sad':
        return { transform: 'scaleY(0.8)', opacity: 0.7 };
      case 'surprised':
        return { transform: 'scale(1.3)' };
      case 'excited':
        return { transform: 'scale(1.1)', filter: 'brightness(1.2)' };
      case 'shy':
        return { transform: 'scaleY(0.6)', opacity: 0.8 };
      case 'winking':
        return { transform: 'scaleX(0.1)' };
      default:
        return {};
    }
  };

  const getMouthStyle = () => {
    switch (character.expression) {
      case 'happy':
      case 'excited':
        return { transform: 'scaleY(1.5)', borderRadius: '50%' };
      case 'sad':
        return { transform: 'scaleY(0.5) rotate(180deg)' };
      case 'surprised':
        return { transform: 'scale(1.2)', borderRadius: '50%' };
      case 'shy':
        return { transform: 'scaleY(0.7)', opacity: 0.8 };
      default:
        return {};
    }
  };

  return (
    <div className="character-container relative w-80 h-96 mx-auto">
      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute text-pink-500 animate-ping pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: 'float 2s ease-out forwards'
          }}
        >
          💕
        </div>
      ))}

      {/* Character SVG */}
      <svg 
        viewBox="0 0 200 240" 
        className={`w-full h-full ${currentAnimation} ${isTyping ? 'typing' : ''}`}
        style={{
          filter: character.expression === 'blushing' ? 'drop-shadow(0 0 10px rgba(255, 192, 203, 0.5))' : 'none'
        }}
      >
        {/* Body */}
        <ellipse cx="100" cy="200" rx="45" ry="30" fill={getOutfitColor(character.mood)} />
        
        {/* Neck */}
        <rect x="90" y="170" width="20" height="30" fill="#FDBCB4" />
        
        {/* Head */}
        <circle cx="100" cy="140" r="50" fill="#FDBCB4" />
        
        {/* Hair */}
        <path 
          d="M 50 140 Q 100 90 150 140 Q 140 100 100 100 Q 60 100 50 140" 
          fill={getHairColor(character.hairColor as HairColor)}
        />
        
        {/* Hair details */}
        <path 
          d="M 70 110 Q 80 100 90 110" 
          fill={getHairColor(character.hairColor as HairColor)}
          opacity="0.8"
        />
        <path 
          d="M 110 110 Q 120 100 130 110" 
          fill={getHairColor(character.hairColor as HairColor)}
          opacity="0.8"
        />
        
        {/* Eyes */}
        <g>
          <ellipse 
            cx="85" 
            cy="130" 
            rx="8" 
            ry={eyeBlink ? "1" : "8"} 
            fill="white"
            style={getEyeStyle()}
          />
          <ellipse 
            cx="115" 
            cy="130" 
            rx="8" 
            ry={eyeBlink ? "1" : "8"} 
            fill="white"
            style={character.expression === 'winking' ? { transform: 'scaleX(0.1)' } : getEyeStyle()}
          />
          
          {/* Pupils */}
          {!eyeBlink && (
            <>
              <circle cx="85" cy="130" r="5" fill="#4169E1" />
              <circle cx="115" cy="130" r="5" fill="#4169E1" />
              <circle cx="87" cy="128" r="2" fill="white" />
              <circle cx="117" cy="128" r="2" fill="white" />
            </>
          )}
        </g>
        
        {/* Eyebrows */}
        <path 
          d="M 78 120 Q 85 118 92 120" 
          stroke="#8B4513" 
          strokeWidth="2" 
          fill="none"
          style={{
            transform: character.expression === 'sad' ? 'rotate(10deg)' : 'none',
            transformOrigin: '85px 120px'
          }}
        />
        <path 
          d="M 108 120 Q 115 118 122 120" 
          stroke="#8B4513" 
          strokeWidth="2" 
          fill="none"
          style={{
            transform: character.expression === 'sad' ? 'rotate(-10deg)' : 'none',
            transformOrigin: '115px 120px'
          }}
        />
        
        {/* Nose */}
        <circle cx="100" cy="140" r="1" fill="#F4A460" />
        
        {/* Mouth */}
        <ellipse 
          cx="100" 
          cy="150" 
          rx="6" 
          ry="3" 
          fill="#FF69B4"
          style={getMouthStyle()}
        />
        
        {/* Blush */}
        {(character.expression === 'blushing' || character.expression === 'shy') && (
          <>
            <ellipse cx="70" cy="145" rx="8" ry="5" fill="#FFB6C1" opacity="0.6" />
            <ellipse cx="130" cy="145" rx="8" ry="5" fill="#FFB6C1" opacity="0.6" />
          </>
        )}
        
        {/* Arms */}
        <ellipse 
          cx="60" 
          cy="180" 
          rx="15" 
          ry="25" 
          fill="#FDBCB4"
          style={{
            transform: character.mood === 'energetic' ? 'rotate(-20deg)' : 'none',
            transformOrigin: '60px 180px'
          }}
        />
        <ellipse 
          cx="140" 
          cy="180" 
          rx="15" 
          ry="25" 
          fill="#FDBCB4"
          style={{
            transform: character.mood === 'energetic' ? 'rotate(20deg)' : 'none',
            transformOrigin: '140px 180px'
          }}
        />
        
        {/* Outfit details */}
        <circle cx="100" cy="190" r="3" fill="#FF1493" />
        <circle cx="85" cy="195" r="2" fill="#FF1493" />
        <circle cx="115" cy="195" r="2" fill="#FF1493" />
      </svg>
      
      {/* Character name */}
      <div className="text-center mt-4">
        <h3 className="text-xl font-bold text-gray-800">{character.name}</h3>
        <p className="text-sm text-gray-600 capitalize">{character.mood} mood</p>
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Character;