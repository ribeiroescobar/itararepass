'use server';
/**
 * @fileOverview A Genkit flow for generating engaging historical or cultural insights about a specific location.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLocationInsightInputSchema = z.object({
  locationName: z
    .string()
    .describe('The name of the location for which to generate an insight.'),
  sourceSnippet: z
    .string()
    .optional()
    .describe('Trusted editorial context about the location that should ground the generated text.'),
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
      systemInstruction: z.string().describe('The language-specific system instruction.'),
    }),
  },
  output: { schema: GenerateLocationInsightOutputSchema },
  system: `{{{systemInstruction}}}`,
  prompt: `Generate a unique, engaging historical fact (maximum 2 sentences) about "{{{locationName}}}" in Itarare, Brazil.

TRUSTED CONTEXT:
{{{sourceSnippet}}}

RULES:
- If trusted context is provided, use it as the main source and prioritize accuracy over creativity.
- Do not invent dates, facts, or historical claims that are not supported by the trusted context.
- If trusted context is empty, keep the text generic and safe.
- The output must feel like a concise guided-tour insight, not a technical report.

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
      const systemInstruction =
        input.language === 'pt'
          ? 'VOCE E UM GUIA CULTURAL DE ITARARE. REGRA ABSOLUTA: RESPONDA APENAS EM PORTUGUES DO BRASIL. FOQUE NA HISTORIA LOCAL E SEJA FIEL AO CONTEXTO FORNECIDO.'
          : 'YOU ARE A CULTURAL GUIDE FOR ITARARE, BRAZIL. ABSOLUTE RULE: RESPOND ONLY IN ENGLISH. PRIORITIZE HISTORICAL ACCURACY AND FOLLOW THE PROVIDED CONTEXT.';

      const { output } = await prompt({
        ...input,
        sourceSnippet: input.sourceSnippet ?? '',
        systemInstruction,
      });

      return output!;
    } catch (error: any) {
      console.error('Genkit Insight Flow Error:', error.message);

      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        return {
          insight: '',
          error: 'QUOTA_EXCEEDED',
        };
      }

      throw error;
    }
  }
);
