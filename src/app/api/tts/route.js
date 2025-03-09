import { NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const formattedPrivateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';

const client = new TextToSpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: formattedPrivateKey,
    //projectId: process.env.GOOGLE_PROJECT_ID
  },

  projectId: process.env.GOOGLE_PROJECT_ID
});

export async function POST(request) {
  try {
    
    if (!formattedPrivateKey) {
      throw new Error('Missing Google Cloud credentials');
    }

    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'bn-IN',
        name: 'bn-IN-Standard-B'
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    });

    return NextResponse.json({
      audioContent: Buffer.from(response.audioContent).toString('base64')
    });
    
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Text-to-speech conversion failed: ' + error.message },
      { status: 500 }
    );
  }
}