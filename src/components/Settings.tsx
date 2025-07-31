import React from 'react';
import { Settings as SettingsIcon, Palette, Heart, Sparkles } from 'lucide-react';
import { Character, HairColor, OutfitType } from '../types';
import { PersonalityTrait } from '../types';

interface SettingsProps {
  character?: Character;
  onUpdateCharacter?: (updates: Partial<Character>) => void;
  personality: PersonalityTrait[];
  onUpdatePersonality: (traitId: string, value: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  character,
  onUpdateCharacter,
  personality,
  onUpdatePersonality,
  isOpen,
  onToggle
}) => {
  const hairColors: { color: HairColor; name: string }[] = [
    { color: 'brown', name: 'Brown' },
    { color: 'blonde', name: 'Blonde' },
    { color: 'pink', name: 'Pink' },
    { color: 'purple', name: 'Purple' },
    { color: 'blue', name: 'Blue' },
    { color: 'red', name: 'Red' }
  ];

  const outfitTypes: { type: OutfitType; name: string }[] = [
    { type: 'casual', name: 'Casual' },
    { type: 'formal', name: 'Formal' },
    { type: 'cute', name: 'Cute' },
    { type: 'sporty', name: 'Sporty' }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all z-50"
      >
        <SettingsIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Character Name and Appearance (only if character and onUpdateCharacter are provided) */}
          {character && onUpdateCharacter && (
            <>
              {/* Character Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Character Name
                </label>
                <input
                  type="text"
                  value={character.name}
                  onChange={(e) => onUpdateCharacter({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              {/* Appearance */}
              <div className="mb-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <Palette className="w-5 h-5 mr-2" />
                  Appearance
                </h3>
                {/* Hair Color */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hair Color
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {hairColors.map(({ color, name }) => (
                      <button
                        key={color}
                        onClick={() => onUpdateCharacter({ hairColor: color })}
                        className={`px-3 py-2 rounded-md text-sm transition-all ${
                          character.hairColor === color
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Outfit Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outfit Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {outfitTypes.map(({ type, name }) => (
                      <button
                        key={type}
                        onClick={() => onUpdateCharacter({ outfitColor: type })}
                        className={`px-3 py-2 rounded-md text-sm transition-all ${
                          character.outfitColor === type
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Personality */}
          <div>
            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <Heart className="w-5 h-5 mr-2" />
              Personality
            </h3>
            
            <div className="space-y-4">
              {personality.map((trait) => (
                <div key={trait.id}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">
                      {trait.name}
                    </label>
                    <span className="text-sm text-gray-500">{trait.value}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={trait.value}
                    onChange={(e) => onUpdatePersonality(trait.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">{trait.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Current Mood Display (only if character is provided) */}
          {character && (
            <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-pink-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Current Mood:</span>
                <span className="ml-2 text-sm text-pink-600 capitalize">{character.mood}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;