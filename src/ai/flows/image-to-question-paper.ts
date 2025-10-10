'use server';

/**
 * @fileOverview Converts an image of an exam paper into a structured question paper format.
 *
 * - imageToQuestionPaper - A function that takes an image as input and returns a structured question paper.
 * - ImageToQuestionPaperInput - The input type for the imageToQuestionPaper function.
 * - ImageToQuestionPaperOutput - The return type for the imageToQuestionPaper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageToQuestionPaperInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of an exam paper, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'    ),
});
export type ImageToQuestionPaperInput = z.infer<typeof ImageToQuestionPaperInputSchema>;

const ImageToQuestionPaperOutputSchema = z.object({
  questionPaper: z.string().describe('The extracted question paper in JSON format.'),
});
export type ImageToQuestionPaperOutput = z.infer<typeof ImageToQuestionPaperOutputSchema>;

export async function imageToQuestionPaper(input: ImageToQuestionPaperInput): Promise<ImageToQuestionPaperOutput> {
  return imageToQuestionPaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageToQuestionPaperPrompt',
  input: {schema: ImageToQuestionPaperInputSchema},
  output: {schema: ImageToQuestionPaperOutputSchema},
  prompt: `You are an expert in processing exam papers from images. Your task is to extract questions from a given image and convert them into a structured JSON format suitable for a digital exam paper.

Analyze the image provided and identify all the questions, their types (e.g., MCQ, short answer, essay), content, and any associated options or passages. Structure the output in a JSON format that represents the question paper. Consider the structure of nested questions. Ensure Bangla language is used for the questions and relevant context. The image will be passed to you in a data URI format, use the media helper to access the content of the image.

Image: {{media url=photoDataUri}}

Return a JSON object representing the question paper.
`,
});

const imageToQuestionPaperFlow = ai.defineFlow(
  {
    name: 'imageToQuestionPaperFlow',
    inputSchema: ImageToQuestionPaperInputSchema,
    outputSchema: ImageToQuestionPaperOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
