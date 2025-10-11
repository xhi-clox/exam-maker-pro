
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

// This schema should align with the `Paper` interface in `src/app/editor/page.tsx`
const QuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['passage', 'fill-in-the-blanks', 'short', 'mcq', 'essay', 'table', 'creative', 'section-header']),
  content: z.string(),
  marks: z.number().optional(),
  options: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
  numberingFormat: z.enum(['bangla-alpha', 'bangla-numeric', 'roman']).optional(),
  tableData: z.array(z.array(z.string())).optional(),
  rows: z.number().optional(),
  cols: z.number().optional(),
});

// Allow for recursive sub-questions
type Question = z.infer<typeof QuestionSchema> & {
  subQuestions?: Question[];
};

const RecursiveQuestionSchema: z.ZodType<Question> = QuestionSchema.extend({
  subQuestions: z.lazy(() => z.array(RecursiveQuestionSchema)).optional(),
});

const ImageToQuestionPaperOutputSchema = z.object({
    questions: z.array(RecursiveQuestionSchema).describe('The array of questions extracted from the image.'),
});

export type ImageToQuestionPaperOutput = z.infer<typeof ImageToQuestionPaperOutputSchema>;

export async function imageToQuestionPaper(input: ImageToQuestionPaperInput): Promise<ImageToQuestionPaperOutput> {
  return imageToQuestionPaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageToQuestionPaperPrompt',
  input: {schema: ImageToQuestionPaperInputSchema},
  output: {schema: ImageToQuestionPaperOutputSchema},
  prompt: `You are an expert in processing exam papers from images, especially for the Bangladeshi education system. Your task is to analyze the provided image, which could be anything from a polished document to a rough, unorganized, or handwritten draft of questions.

You must interpret the content and structure it into a valid JSON object that matches the output schema. Your SOLE FOCUS is on the questions themselves. DO NOT extract header information like School Name, Exam Title, Subject, etc.

Key Instructions:
1.  **Analyze and Structure**: Carefully analyze the image to identify all questions, passages (উদ্দীপক), section headers (e.g., ক-বিভাগ), and instructions. Infer the structure, including nested sub-questions (like ক, খ, গ, ঘ under a creative question).
2.  **Identify Question Types**: Determine the type for each question. Use 'creative' for questions with a main passage followed by sub-questions. Use 'passage' for passages with associated questions that are not in the 'creative' format. Use 'mcq' for multiple choice, 'short' for short answers, 'essay' for long answers, 'fill-in-the-blanks', 'table', and 'section-header' for section titles.
3.  **Extract Details**: Extract the question content, marks, and any multiple-choice options. For creative questions, marks should be on the sub-questions, not the main question.
4.  **Handle Handwriting and Poor Quality**: The image may be handwritten or messy. Do your best to decipher the text.
5.  **Generate IDs**: Create a unique 'id' for every single question, sub-question, and option (e.g., 'q1', 'sq1a', 'opt1a1').
6.  **Language**: The content is likely in Bengali. Ensure your output maintains the correct language.

Image: {{media url=photoDataUri}}

Return a single, valid JSON object containing ONLY the 'questions' array.`,
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
