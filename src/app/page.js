//page.js
'use client';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label"
import { Mic, Volume2 } from 'lucide-react';
import Image from 'next/image';
import logo from '@/images/logo-1.png';

export default function Home() {
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [bengaliResponse, setBengaliResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'bn-BD';
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setTranscription(prev => prev + ' ' + transcript);
        };

        recognition.onerror = (event) => {
          console.error('Recognition error:', event.error);
        };

        setRecognition(recognition);
      }
    }
  }, []);

  // Handle translation and AI response chain
  useEffect(() => {
    const processQuery = async () => {
      if (transcription.trim().length > 0) {
        setIsLoading(true);
        try {
          // Translate to English
          const englishText = await translateText(transcription, 'bn|en');
          setTranslation(englishText);

          // Get AI response
          const aiResponse = await getAIResponse(englishText);
          
          // Translate back to Bengali
          const bengaliTranslation = await translateText(aiResponse, 'en|bn');
          setBengaliResponse(bengaliTranslation);
          setAssistantResponse(aiResponse);

          setTranscription('');

        } catch (error) {
          console.error('Processing error:', error);
          setAssistantResponse('Error processing request');
          setBengaliResponse('ত্রুটি ঘটেছে');
        }
        setIsLoading(false);
      }
    };

    processQuery();
  }, [transcription]);

  // Translation function
  const translateText = async (text, langPair) => {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
      );
      const data = await response.json();
      return data.responseData?.translatedText || 'Translation failed';
    } catch (error) {
      console.error('Translation error:', error);
      return 'Translation failed';
    }
  };

  // AI Response using Hugging Face Inference API (Zephyr-7b model)
  const getAIResponse = async (text) => {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HF_API_KEY}`
          },
          body: JSON.stringify({
            inputs: text,
            parameters: {
              max_new_tokens: 100,
              temperature: 0.7
            }
          })
        }
      );

      const data = await response.json();
      return data[0]?.generated_text || 'No response from AI';
    } catch (error) {
      console.error('AI API error:', error);
      return 'Error getting response';
    }
  };

  // Recording handlers
  const startRecording = () => {
    recognition?.start();
    setIsLoading(true);
  };

  const stopRecording = () => {
    recognition?.stop();
    setIsLoading(false);
  };

  const speakBengali = async (text) => {
    try {
      setIsAudioLoading(true);
      
      // Stop any currently playing audio
      if (audioElement) {
        audioElement.pause();
        setIsAudioPlaying(false);
      }
  
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS request failed');
      }
  
      const data = await response.json();
      const newAudio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      
      // Set up audio event listeners
      newAudio.addEventListener('play', () => {
        setIsAudioPlaying(true);
        setIsAudioLoading(false);
      });
      
      newAudio.addEventListener('pause', () => setIsAudioPlaying(false));
      newAudio.addEventListener('ended', () => setIsAudioPlaying(false));
      
      newAudio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setIsAudioLoading(false);
        setIsAudioPlaying(false);
        alert('Error playing audio: ' + e.message);
      });
  
      setAudioElement(newAudio);
      newAudio.play();
      
    } catch (error) {
      console.error('TTS Error:', error);
      setIsAudioLoading(false);
      setIsAudioPlaying(false);
      alert('Error: ' + error.message);
    }
  };
  
  // Add this pause function
  const toggleAudio = () => {
    if (audioElement) {
      if (isAudioPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[var(--custom-purple)] overflow-hidden">
      {/* <Script 
        src="https://code.responsivevoice.org/responsivevoice.js?key=8TCIaRDF"
        strategy="afterInteractive"
        onLoad={() => console.log('ResponsiveVoice loaded')}
      /> */}
      <Card className="max-w-2xl w-full shadow-md shadow-gray-800 overflow-hidden">
        <div className="flex justify-center mb-4">
          <Image src={logo} alt="BoloGPT Logo" className="w-72 h-40" />
        </div>
        <CardContent className="space-y-4">
          <div className="flex justify-center text-white hover:border-[var(--custom-purple)]">
            <Button
              className="bg-[var(--custom-purple)] text-white hover:shadow-xs hover:shadow-[var(--custom-purple)]"
              variant={isLoading ? 'destructive' : 'outline'}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
            >
              <Mic className="h-4 w-4 mr-2" />
              {isLoading ? 'Release to Stop' : 'Hold to Speak'}
            </Button>
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="message">Bangla Query</Label>
            <Textarea
              value={transcription}
              readOnly
            />
            <Label htmlFor="message">Query English Translation</Label>
            <Textarea
              value={translation}
              readOnly
            />
            <Label htmlFor="message">AI Response (English)</Label>
            <Textarea
              value={assistantResponse}
              readOnly
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message">AI Response (Bangla)</Label>
                <div className="flex items-center gap-2">
                  {isAudioLoading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (isAudioPlaying) {
                        toggleAudio();
                      } else if (bengaliResponse) {
                        speakBengali(bengaliResponse);
                      }
                    }}
                    disabled={!bengaliResponse || isAudioLoading}
                  >
                    {isAudioPlaying ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <rect width="4" height="16" x="6" y="4" />
                        <rect width="4" height="16" x="14" y="4" />
                      </svg>
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
              </div>
              </div>
              <Textarea
                value={bengaliResponse}
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}