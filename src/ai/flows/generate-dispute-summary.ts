// src/ai/flows/generate-dispute-summary.ts
'use server';
/**
 * @fileOverview Generates a summary of a dispute case for arbitrators.
 *
 * - generateDisputeSummary - A function that generates the dispute summary.
 * - GenerateDisputeSummaryInput - The input type for the generateDisputeSummary function.
 * - GenerateDisputeSummaryOutput - The return type for the generateDisputeSummary function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const EvidenceSchema = z.object({
  type: z.enum(['text', 'image', 'pdf', 'audio']),
  content: z.string().describe('The content of the evidence. For images, PDFs, and audio, this should be a data URI.'),
  description: z.string().optional().describe('A description of the evidence.'),
});

const GenerateDisputeSummaryInputSchema = z.object({
  disputeId: z.string().describe('The ID of the dispute case.'),
  buyerDescription: z.string().describe('The description of the dispute from the buyer.'),
  sellerDescription: z.string().describe('The description of the dispute from the seller.'),
  evidence: z.array(EvidenceSchema).describe('An array of evidence submitted by both parties.'),
});
export type GenerateDisputeSummaryInput = z.infer<typeof GenerateDisputeSummaryInputSchema>;

const GenerateDisputeSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the dispute case.'),
});
export type GenerateDisputeSummaryOutput = z.infer<typeof GenerateDisputeSummaryOutputSchema>;

export async function generateDisputeSummary(input: GenerateDisputeSummaryInput): Promise<GenerateDisputeSummaryOutput> {
  return generateDisputeSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDisputeSummaryPrompt',
  input: {
    schema: z.object({
      disputeId: z.string().describe('The ID of the dispute case.'),
      buyerDescription: z.string().describe('The description of the dispute from the buyer.'),
      sellerDescription: z.string().describe('The description of the dispute from the seller.'),
      evidence: z.array(EvidenceSchema).describe('An array of evidence submitted by both parties.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary of the dispute case.'),
    }),
  },
  prompt: `You are an AI assistant that summarizes disputes between a buyer and seller to help an arbitrator make a decision. Provide a neutral and objective summary of the case.

Dispute ID: {{{disputeId}}}

Buyer Description: {{{buyerDescription}}}

Seller Description: {{{sellerDescription}}}

Evidence:
{{#each evidence}}
  Type: {{{type}}}
  Description: {{{description}}}
  Content: {{#ifEquals type "image"}}{{media url=content}}{{else}}{{{content}}}{{/ifEquals}}
{{/each}}

Summary:`, // Using Handlebars 'ifEquals' helper to conditionally display media for images
  helpers: {
    ifEquals: function (arg1: any, arg2: any, options: any) {
      // @ts-ignore
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    },
  },
});

const generateDisputeSummaryFlow = ai.defineFlow<
  typeof GenerateDisputeSummaryInputSchema,
  typeof GenerateDisputeSummaryOutputSchema
>({
  name: 'generateDisputeSummaryFlow',
  inputSchema: GenerateDisputeSummaryInputSchema,
  outputSchema: GenerateDisputeSummaryOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
}
);
