'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label"
import { Mic } from 'lucide-react';
import Image from 'next/image';
import logo from '@/images/logo-1.png';

export default function Home() {
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [bengaliResponse, setBengaliResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);

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

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[var(--custom-purple)]">
      <Card className="max-w-2xl w-full shadow-md shadow-gray-800">
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
            <Label htmlFor="message">English Translation</Label>
            <Textarea
              value={translation}
              readOnly
            />
            <Label htmlFor="message">AI Response (English)</Label>
            <Textarea
              value={assistantResponse}
              readOnly
            />
            <Label htmlFor="message">AI Response (Bangla)</Label>
            <Textarea
              value={bengaliResponse}
              readOnly
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}