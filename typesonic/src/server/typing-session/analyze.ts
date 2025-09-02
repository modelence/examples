import { generateText } from '@modelence/ai';
import { openai } from '@ai-sdk/openai';

export async function analyzeSession(text: string, speed: number) {
  const { text: analysis } = await generateText({
    provider: 'openai',
    model: 'gpt-4o',
    prompt: `Analyze this typing test result:
  
Text typed: "${text}"
Typing speed: ${speed} WPM

Please provide:
1. An assessment of the typing speed
2. Suggestions for improvement
3. Any patterns or observations about the text content

Keep the analysis concise but informative.`
  });

  return analysis;
}
