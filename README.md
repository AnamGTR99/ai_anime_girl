# AI Girlfriend App 💕

A sophisticated AI companion application featuring a 3D anime avatar with real-time voice calling, text chat, and life-like animations. Built with React, TypeScript, Three.js, and ElevenLabs Conversational AI.

![AI Girlfriend App](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Conversational%20AI-green)
![Three.js](https://img.shields.io/badge/Three.js-0.152.2-orange)

## ✨ Features

### 🎭 3D Anime Avatar
- **VRM model support** with realistic 3D anime character
- **Life-like animations** including lip-sync, blinking, and head movements
- **Emotional expressions** that respond to conversation content
- **Real-time rendering** with Three.js

### 🗣️ Voice Calling
- **Real-time voice calls** with ElevenLabs Conversational AI
- **Speech-to-text** for natural conversation
- **Text-to-speech** with natural voice synthesis
- **Agent-based responses** with personality consistency

### 💬 Text & Voice Chat
- **Multi-AI provider support** (OpenAI, Claude, Gemini)
- **Personality system** with customizable traits
- **Conversation history** with message persistence
- **Voice input/output** with Web Speech API

### 🎨 Advanced Animations
- **Natural lip-sync** based on speech patterns
- **Emotional intelligence** analyzing conversation content
- **Subtle head movements** for life-like presence
- **Blinking animations** with realistic timing
- **Expression changes** based on conversation sentiment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- ElevenLabs API key
- OpenAI/Claude/Gemini API key (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AnamGTR99/ai_anime_girl.git
cd ai_anime_girl
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_SAKURA_AGENT_ID=your_sakura_agent_id_here
VITE_KAWAII_VOICE_ID=your_kawaii_voice_id_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🔧 Configuration

### ElevenLabs Setup
1. Create an account at [ElevenLabs](https://elevenlabs.io)
2. Generate an API key in your dashboard
3. Create a Conversational AI agent for Sakura
4. Update the agent ID in `src/components/Call.tsx`

### AI Provider Setup
The app supports multiple AI providers for text responses:

- **OpenAI**: GPT-3.5/GPT-4 for natural conversations
- **Anthropic**: Claude for intelligent responses  
- **Google**: Gemini for AI-powered chat
- **Local**: Fallback responses when APIs are unavailable

## 🎮 Usage

### Voice Call
1. Click **"Call Sakura"** to start a voice call
2. Allow microphone access when prompted
3. Speak naturally - Sakura will respond with voice
4. Use mute/speaker controls as needed
5. Click **"End Call"** when finished

### Text Chat
1. Type messages in the chat interface
2. Sakura responds with AI-generated text
3. Toggle voice output for text-to-speech
4. Customize personality traits in settings

### Avatar Interactions
- **Real-time lip-sync** during voice calls
- **Emotional expressions** based on conversation
- **Natural blinking** and head movements
- **Life-like animations** throughout interaction

## 🛠️ Technical Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 5.5.3** - Type safety
- **Vite 5.4.2** - Build tool and dev server
- **Tailwind CSS 3.4.1** - Styling

### 3D Graphics
- **Three.js 0.152.2** - 3D rendering
- **@pixiv/three-vrm 3.4.2** - VRM model support
- **WebGL** - Hardware-accelerated graphics

### AI & Voice
- **ElevenLabs Conversational AI** - Voice agent
- **@elevenlabs/client** - Official client library
- **Web Speech API** - Speech recognition
- **Multi-provider AI** - OpenAI, Claude, Gemini

### Animation System
- **Real-time lip-sync** with speech patterns
- **Emotional intelligence** analyzing text content
- **Natural blinking** with random timing
- **Subtle head movements** for life-like presence

## 📁 Project Structure

```
ai-girlfriend/
├── public/
│   └── models/
│       └── my-anime-girl.vrm    # 3D avatar model
├── src/
│   ├── components/
│   │   ├── AnimeAvatar.tsx      # 3D avatar component
│   │   ├── Call.tsx            # Voice call functionality
│   │   ├── Chat.tsx            # Text chat interface
│   │   ├── Voice.tsx           # Voice input/output
│   │   └── Settings.tsx        # Personality settings
│   ├── hooks/
│   │   ├── usePersonality.ts   # Personality system
│   │   └── useVoice.ts         # Voice handling
│   ├── services/
│   │   └── aiService.ts        # AI provider integration
│   └── types/
│       └── index.ts            # TypeScript definitions
├── package.json
└── README.md
```

## 🎯 Key Features

### Real-time Voice Calling
- **ElevenLabs agent integration** for natural conversations
- **WebSocket streaming** for instant responses
- **Speech recognition** with noise suppression
- **Voice synthesis** with natural intonation

### Advanced Animation System
- **Emotion detection** from conversation content
- **Dynamic expressions** (joy, love, sadness, surprise, etc.)
- **Natural lip-sync** using speech rhythm analysis
- **Life-like micro-movements** for realism

### Personality System
- **Customizable traits** (cheerful, shy, energetic, caring, etc.)
- **Dynamic responses** based on personality settings
- **Conversation memory** for context awareness
- **Emotional intelligence** for appropriate responses

## 🔒 Privacy & Security

- **Local processing** for speech recognition
- **Secure API calls** with proper authentication
- **No data storage** of conversations
- **Privacy-focused** design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ElevenLabs** for Conversational AI platform
- **Three.js** for 3D graphics capabilities
- **VRM Consortium** for avatar format
- **React & TypeScript** communities

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/AnamGTR99/ai_anime_girl/issues) page
2. Create a new issue with detailed description
3. Include your environment details and error logs

---

**Made with ❤️ by [AnamGTR99](https://github.com/AnamGTR99)**

*Experience the future of AI companionship with realistic 3D avatars and natural voice interactions!* 