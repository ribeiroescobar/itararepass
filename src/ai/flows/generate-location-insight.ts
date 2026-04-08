'use server';
/**
 * @fileOverview A Genkit flow for generating engaging historical or cultural insights about a specific location.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLocationInsightInputSchema = z.object({
  locationName: z
    .string()
    .describe('The name of the location for which to generate an insight.'),
  language: z
    .enum(['pt', 'en'])
    .describe('The language code: pt for Portuguese, en for English.'),
});
export type GenerateLocationInsightInput = z.infer<
  typeof GenerateLocationInsightInputSchema
>;

const GenerateLocationInsightOutputSchema = z.object({
  insight: z
    .string()
    .describe('A unique, engaging historical fact or cultural insight about the location.'),
  error: z
    .string()
    .optional()
    .describe('Error code if the generation failed (e.g., QUOTA_EXCEEDED).'),
});
export type GenerateLocationInsightOutput = z.infer<
  typeof GenerateLocationInsightOutputSchema
>;

export async function generateLocationInsight(
  input: GenerateLocationInsightInput
): Promise<GenerateLocationInsightOutput> {
  return generateLocationInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLocationInsightPrompt',
  input: {
    schema: GenerateLocationInsightInputSchema.extend({
      systemInstruction: z.string().describe('The language-specific system instruction.')
    })
  },
  output: {schema: GenerateLocationInsightOutputSchema},
  system: `{{{systemInstruction}}}`,
  prompt: `Generate a unique, engaging historical fact (maximum 2 sentences) about "{{{locationName}}}" in Itararé, Brazil. 
  
  CRITICAL: You must write the response exclusively in the language specified in the system instruction. 
  DO NOT use any other language.`,
});

const generateLocationInsightFlow = ai.defineFlow(
  {
    name: 'generateLocationInsightFlow',
    inputSchema: GenerateLocationInsightInputSchema,
    outputSchema: GenerateLocationInsightOutputSchema,
  },
  async input => {
    try {
      // Generate an aggressive system instruction in the target language to prime the model
      const systemInstruction = input.language === 'pt' 
        ? "VOCÊ É UM GUIA CULTURAL DE ITARARÉ. REGRA ABSOLUTA: RESPONDA APENAS EM PORTUGUÊS DO BRASIL. É PROIBIDO USAR UMA ÚNICA PALAVRA EM INGLÊS. FOQUE NA HISTÓRIA LOCAL."
        : "YOU ARE A CULTURAL GUIDE FOR ITARARÉ, BRAZIL. ABSOLUTE RULE: RESPOND ONLY IN ENGLISH. DO NOT USE PORTUGUESE WORDS EXCEPT FOR PROPER LANDMARK NAMES.";
      
      const {output} = await prompt({
        ...input,
        systemInstruction
      });
      return output!;
    } catch (error: any) {
      console.error("Genkit Insight Flow Error:", error.message);
      
      // Handle quota exhaustion specifically
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        return { 
          insight: "", 
          error: 'QUOTA_EXCEEDED' 
        };
      }

      // Re-throw other errors
      throw error;
    }
  }
);
