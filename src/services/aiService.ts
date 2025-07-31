// AI Service for handling API calls to various AI providers
// This service can be configured to use OpenAI, Anthropic, or other AI APIs

export interface AIResponse {
  text: string;
  emotion: 'joy' | 'sadness' | 'surprise' | 'excitement' | 'love' | 'confusion';
}

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'local';
  apiKey?: string;
  model?: string;
}

export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async generateResponse(
    userMessage: string, 
    personalityPrompt: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<AIResponse> {
    switch (this.config.provider) {
      case 'openai':
        return this.generateOpenAIResponse(userMessage, personalityPrompt, conversationHistory);
      case 'anthropic':
        return this.generateAnthropicResponse(userMessage, personalityPrompt, conversationHistory);
      case 'gemini':
        return this.generateGeminiResponse(userMessage, personalityPrompt, conversationHistory);
      default:
        return this.generateLocalResponse(userMessage);
    }
  }

  private async generateOpenAIResponse(
    userMessage: string,
    personalityPrompt: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<AIResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const messages = [
        { role: 'system' as const, content: personalityPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user' as const, content: userMessage }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model || 'gpt-3.5-turbo',
          messages,
          max_tokens: 200,
          temperature: 0.9,
          presence_penalty: 0.6,
          frequency_penalty: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', response.status, errorData);
        
        // Handle specific error types
        if (response.status === 429) {
          throw new Error('OpenAI API quota exceeded. Please check your billing or switch to local responses.');
        } else if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your configuration.');
        } else {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content || "I'm having trouble thinking right now... 😅";
      
      return {
        text: text.trim(),
        emotion: this.detectEmotion(text)
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  private async generateAnthropicResponse(
    userMessage: string,
    personalityPrompt: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<AIResponse> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const messages = [
        ...conversationHistory.slice(-10),
        { role: 'user' as const, content: userMessage }
      ];

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model || 'claude-3-haiku-20240307',
          max_tokens: 150,
          system: personalityPrompt,
          messages
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content[0]?.text || "I'm having trouble thinking right now... 😅";
      
      return {
        text: text.trim(),
        emotion: this.detectEmotion(text)
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  private async generateGeminiResponse(
    userMessage: string,
    personalityPrompt: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<AIResponse> {
    if (!this.config.apiKey) {
      throw new Error('Google Gemini API key not configured');
    }

    try {
      // Format conversation history for Gemini
      const contents = [
        {
          role: 'user',
          parts: [{ text: personalityPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I will respond as your AI girlfriend with the personality traits you described.' }]
        }
      ];

      // Add conversation history
      conversationHistory.slice(-8).forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model || 'gemini-1.5-flash'}:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
            stopSequences: []
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API error:', response.status, errorData);
        
        if (response.status === 429) {
          throw new Error('Gemini API quota exceeded. Please check your usage or try again later.');
        } else if (response.status === 400) {
          throw new Error('Invalid Gemini API key or request. Please check your configuration.');
        } else {
          throw new Error(`Gemini API error: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      const text = data.candidates[0].content.parts[0]?.text || "I'm having trouble thinking right now... 😅";
      
      return {
        text: text.trim(),
        emotion: this.detectEmotion(text)
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  private async generateLocalResponse(userMessage: string): Promise<AIResponse> {
    // Fallback local responses for when no API is configured
    const message = userMessage.toLowerCase();
    
    const responses = [
      { text: "That's really interesting! Tell me more! ✨", emotion: 'joy' as const },
      { text: "I love talking with you! You're so fun! 😊", emotion: 'joy' as const },
      { text: "Hmm, that's something to think about! 🤔", emotion: 'confusion' as const },
      { text: "You always know how to make me smile! 💕", emotion: 'love' as const },
      { text: "I'm so lucky to have you as my friend! 🌟", emotion: 'joy' as const },
      { text: "Really? That sounds amazing! Tell me more! ✨", emotion: 'excitement' as const },
      { text: "I find that so fascinating! You're really smart! 💖", emotion: 'joy' as const }
    ];

    // Simple keyword-based responses
    if (message.includes('love') || message.includes('like you')) {
      return { text: "Aww, I love you too! You're so sweet! 💖", emotion: 'love' };
    }
    
    if (message.includes('sad') || message.includes('upset')) {
      return { text: "Oh no, what's wrong? I'm here for you! *hugs* 🤗", emotion: 'sadness' };
    }
    
    if (message.includes('happy') || message.includes('excited')) {
      return { text: "Yay! Your happiness makes me happy too! ✨", emotion: 'joy' };
    }

    if (message.includes('hello') || message.includes('hi')) {
      return { text: "Hello! I'm so happy to see you! 💕", emotion: 'joy' };
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private detectEmotion(text: string): 'joy' | 'sadness' | 'surprise' | 'excitement' | 'love' | 'confusion' {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('love') || lowerText.includes('💕') || lowerText.includes('💖')) {
      return 'love';
    }
    if (lowerText.includes('excited') || lowerText.includes('amazing') || lowerText.includes('wow')) {
      return 'excitement';
    }
    if (lowerText.includes('sad') || lowerText.includes('sorry') || lowerText.includes('😢')) {
      return 'sadness';
    }
    if (lowerText.includes('?') || lowerText.includes('confused') || lowerText.includes('🤔')) {
      return 'confusion';
    }
    if (lowerText.includes('surprise') || lowerText.includes('unexpected') || lowerText.includes('😲')) {
      return 'surprise';
    }
    
    return 'joy'; // Default to joy
  }
}

// Export a configured instance
export const aiService = new AIService({
  provider: 'gemini',
  apiKey: 'AIzaSyC5tGF31QWIKSERP78sN6rQ4zuGdc2VMLI',
  model: 'gemini-1.5-flash'
});

// Function to configure the AI service with API credentials
export const configureAIService = (config: AIServiceConfig) => {
  return new AIService(config);
};