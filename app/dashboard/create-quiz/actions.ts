"use server";

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateQuizWithAI(prompt: string, limit: number) {
  if (!process.env.OPENAI_API_KEY) {
    return { error: "OPENAI_API_KEY is not set." };
  }

  // This system prompt is crucial for getting the correct JSON structure
  const systemPrompt = `You are a helpful assistant that generates quizzes. You will be given a topic and a number of questions.
You must respond with a JSON object in the following format:
{
  "title": "Your Quiz Title",
  "questions": [
    {
      "text": "The question text?",
      "image_suggestion": "A brief, 2-5 word description of a relevant image (e.g., 'Eiffel Tower', 'Human skeleton'). This can be null.",
      "options": [
        { "text": "Option 1" },
        { "text": "Option 2" },
        { "text": "Option 3" },
        { "text": "Option 4" }
      ],
      "correctAnswerText": "The text of the correct option"
    }
  ]
}
Ensure the number of questions in the array matches the requested limit.
Ensure there are exactly 4 options for each question.
Ensure 'correctAnswerText' exactly matches the text of one of the options.`;

  const userPrompt = `Generate a quiz about "${prompt}" with ${limit} questions.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a fast, cheap, and JSON-capable model
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { error: "AI returned no content." };
    }

    const parsedQuiz = JSON.parse(content);
    return { data: parsedQuiz };
  } catch (error) {
    // ✅ FIXED: Used 'unknown' type and checked if it's an Error instance
    let errorMessage = "Failed to generate quiz";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    console.error("OpenAI API Error:", errorMessage);
    return { error: `Failed to generate quiz: ${errorMessage}` };
  }
}