# BoloGPT - Bengali Voice Assistant

A voice-enabled AI assistant that understands Bengali and responds in Bengali, using a pipeline of translation services and AI models.

## 🌟 Key Features
- Bengali speech-to-text conversion
- Real-time translation between Bengali and English
- AI-powered responses using open-source models
- Bengali text-to-speech synthesis

## 🔄 Workflow Flow
1. 🎤 **Voice Input** (Browser's SpeechRecognition API)
   - User speaks in Bengali
   - Converted to text using browser's built-in speech recognition

2. 🌐 **Translation to English** (MyMemory Translation API)
   - Bengali text → English using free translation service

3. 🤖 **AI Processing** (Hugging Face - Mixtral-8x7B-Instruct)
   - English query → AI generates English response

4. 🔄 **Translation to Bengali** (MyMemory Translation API)
   - English response → Converted back to Bengali

5. 🔊 **Voice Output** (Google Cloud Text-to-Speech)
   - Bengali text converted to spoken audio

## 🛠 Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **APIs**:
  - Speech: Browser SpeechRecognition API
  - Translation: MyMemory Translation API
  - AI: Hugging Face Inference API (Mixtral-8x7B)
  - TTS: Google Cloud Text-to-Speech
- **Backend**: Next.js API Routes

## 🚀 Quick Start
1. Clone repo
```bash
git clone https://github.com/yourusername/bolo-gpt.git
cd bolo-gpt
npm install

Create .env.local:
NEXT_PUBLIC_HF_API_KEY="your_huggingface_key"
GOOGLE_CLIENT_EMAIL="your_service_account_email"
GOOGLE_PRIVATE_KEY="your_private_key"
GOOGLE_PROJECT_ID="your_project_id"

Run the project: npm run dev