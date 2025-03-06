// voice-recorder.js

'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

const VoiceRecorder = ({ onRecordingComplete }) => {
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  const handleMouseDown = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
        audioChunks.current = [];
        setIsRecording(false);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleMouseUp = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="outline"
        className="relative gap-2"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        <Mic className="h-4 w-4" />
        {isRecording ? 'Recording...' : 'Hold to Speak'}
      </Button>
    </div>
  );
};

export default VoiceRecorder;