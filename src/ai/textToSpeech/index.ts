import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createWriteStream } from 'fs';
import { v4 as uuid } from 'uuid';

// import * as dotenv from 'dotenv';
// dotenv.config();

// const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;

const elevenlabs = new ElevenLabsClient({
  apiKey: ""// ELEVENLABS_API_KEY,
});

export const createAudioFileFromText = async (text: string): Promise<string> => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
        modelId: 'eleven_v3',
        text,
        outputFormat: 'mp3_44100_128',
        // Optional voice settings that allow you to customize the output
        voiceSettings: {
          stability: 0,
          similarityBoost: 0,
          useSpeakerBoost: true,
          speed: 1.0,
        },
      });

      const fileName = `${uuid()}.mp3`;
      const fileStream = createWriteStream(fileName);

      audio.pipe(fileStream);
      fileStream.on('finish', () => resolve(fileName)); // Resolve with the fileName
      fileStream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};
