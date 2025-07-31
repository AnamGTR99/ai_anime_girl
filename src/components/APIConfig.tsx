import React, { useState } from 'react';
import { Settings, Key, Save, X } from 'lucide-react';
import { configureAIService, AIServiceConfig, AIService } from '../services/aiService';

interface APIConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigured: (service: AIService) => void;
}

const APIConfig: React.FC<APIConfigProps> = ({ isOpen, onClose, onConfigured }) => {
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'gemini' | 'local'>('local');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const config: AIServiceConfig = {
        provider,
        apiKey: apiKey || undefined,
        model: model || undefined
      };

      const newService = configureAIService(config);
      onConfigured(newService);
      onClose();
    } catch (error) {
      console.error('Error configuring AI service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultModel = () => {
    switch (provider) {
      case 'openai':
        return 'gpt-3.5-turbo';
      case 'anthropic':
        return 'claude-3-haiku-20240307';
      case 'gemini':
        return 'gemini-1.5-flash';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Key className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-800">AI Configuration</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Provider
              </label>
              <select
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value as any);
                  setModel(getDefaultModel());
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="local">Local Responses (No API needed)</option>
                <option value="openai">OpenAI (GPT)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            {/* API Key */}
            {provider !== 'local' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${provider} API key`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your API key is stored locally and never sent to our servers
                </p>
              </div>
            )}

            {/* Model Selection */}
            {provider !== 'local' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model (Optional)
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={getDefaultModel()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Setup Instructions:</h3>
              {provider === 'openai' && (
                <div className="text-sm text-blue-700 space-y-1">
                  <p>1. Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI API Keys</a></p>
                  <p>2. Create a new API key</p>
                  <p>3. Copy and paste it above</p>
                  <p className="text-orange-600 font-medium mt-2">⚠️ If you get quota errors, check your <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="underline">OpenAI usage</a> and billing</p>
                </div>
              )}
              {provider === 'anthropic' && (
                <div className="text-sm text-blue-700 space-y-1">
                  <p>1. Go to <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">Anthropic Console</a></p>
                  <p>2. Create a new API key</p>
                  <p>3. Copy and paste it above</p>
                </div>
              )}
              {provider === 'gemini' && (
                <div className="text-sm text-blue-700 space-y-1">
                  <p>1. Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></p>
                  <p>2. Create a new API key</p>
                  <p>3. Copy and paste it above</p>
                  <p className="text-green-600 font-medium mt-2">✅ Gemini has a generous free tier!</p>
                </div>
              )}
              {provider === 'local' && (
                <p className="text-sm text-blue-700">
                  Uses built-in responses. No API key required, but responses will be more limited.
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSave}
              disabled={isLoading || (provider !== 'local' && !apiKey)}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Configuration'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIConfig;