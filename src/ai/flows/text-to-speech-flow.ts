'use server';
/**
 * @fileOverview A Genkit flow for converting text to speech using Gemini.
 * 
 * - textToSpeech - A function that converts a given text to a base64 audio URI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import wav from 'wav';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
  language: z.enum(['pt', 'en']).optional().default('pt').describe('The language of the text.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioUri: z.string().optional().describe('A data URI containing the generated audio in WAV format.'),
  error: z.string().optional().describe('Error code if the generation failed.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    try {
      // Seleciona vozes que soam melhor em cada idioma
      const voiceName = input.language === 'en' ? 'Algenib' : 'Achernar';

      const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
        prompt: input.text,
      });

      if (!media) {
        throw new Error('No media returned from TTS model');
      }

      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );

      const wavBase64 = await toWav(audioBuffer);
      
      return {
        audioUri: 'data:audio/wav;base64,' + wavBase64,
      };
    } catch (error: any) {
      console.error("Genkit TTS Flow Error:", error.message);
      
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        return { 
          audioUri: '', 
          error: 'QUOTA_EXCEEDED' 
        };
      }

      throw error;
    }
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', function (d: Buffer) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
