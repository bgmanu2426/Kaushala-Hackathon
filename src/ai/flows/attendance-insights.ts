'use server';

/**
 * @fileOverview Provides insights on attendance improvement over time.
 *
 * - getAttendanceInsights - A function that returns insights on attendance trends.
 * - AttendanceInsightsInput - The input type for the getAttendanceInsights function.
 * - AttendanceInsightsOutput - The return type for the getAttendanceInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttendanceInsightsInputSchema = z.object({
  historicalAttendanceData: z.string().describe('Historical attendance data in JSON format.'),
  facultyName: z.string().describe('Name of the faculty member.'),
  className: z.string().describe('Name of the class.'),
});
export type AttendanceInsightsInput = z.infer<typeof AttendanceInsightsInputSchema>;

const AttendanceInsightsOutputSchema = z.object({
  hasImproved: z.boolean().describe('Whether attendance has improved over time.'),
  insights: z.string().describe('Insights on the attendance trends and potential contributing factors.'),
});
export type AttendanceInsightsOutput = z.infer<typeof AttendanceInsightsOutputSchema>;

export async function getAttendanceInsights(input: AttendanceInsightsInput): Promise<AttendanceInsightsOutput> {
  return attendanceInsightsFlow(input);
}

const attendanceInsightsPrompt = ai.definePrompt({
  name: 'attendanceInsightsPrompt',
  input: {schema: AttendanceInsightsInputSchema},
  output: {schema: AttendanceInsightsOutputSchema},
  prompt: `You are an AI assistant that analyzes historical attendance data to provide insights on attendance trends.

  Analyze the following historical attendance data for {{className}} taught by {{facultyName}}:
  {{{historicalAttendanceData}}}

  Determine if attendance has improved over time. Provide insights on potential factors contributing to these trends.
  Respond in JSON format.
  `,
});

const attendanceInsightsFlow = ai.defineFlow(
  {
    name: 'attendanceInsightsFlow',
    inputSchema: AttendanceInsightsInputSchema,
    outputSchema: AttendanceInsightsOutputSchema,
  },
  async input => {
    const {output} = await attendanceInsightsPrompt(input);
    return output!;
  }
);
