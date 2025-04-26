import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client with an API key
// API key should be provided as an environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set. AI features will not work correctly.");
}

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Main model - using the default Gemini model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

/**
 * Analyze a question paper and extract insights
 */
export async function analyzeQuestionPaper(paperContent: string, subject: string): Promise<any> {
  try {
    const prompt = `
    You are an educational content analyzer. Please analyze this ${subject} question paper and provide the following information:
    1. The main topics covered
    2. The difficulty level (Low, Medium, High)
    3. The expected time to complete in minutes
    4. Key concepts students should review
    5. Similar topics from previous years (if identifiable)
    6. Distribution of question types (e.g. multiple choice, short answer, long answer, etc.)
    7. Success strategies for this specific paper

    Format your response as a JSON object with these fields:
    {
      "topics": ["topic1", "topic2", ...],
      "difficulty": "Low|Medium|High",
      "timeEstimate": number,
      "keyConceptsToReview": ["concept1", "concept2", ...],
      "similarTopicsFromPastYears": ["topic1", "topic2", ...],
      "questionTypeDistribution": {"type1": percentage, "type2": percentage, ...},
      "recommendedStrategies": ["strategy1", "strategy2", ...]
    }

    Here is the question paper to analyze:
    ${paperContent}
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      }
    });

    const response = result.response;
    const text = response.text();
    
    // Parse the JSON from the response
    // The response might not be pure JSON, so we need to extract it
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from AI response");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error analyzing question paper:", error);
    throw new Error("Failed to analyze question paper: " + (error as Error).message);
  }
}

/**
 * Get resource recommendations based on a question paper
 */
export async function getResourceRecommendations(paperContent: string, subject: string): Promise<string[]> {
  try {
    const prompt = `
    You are an educational resource advisor. Based on this ${subject} question paper, suggest 5-7 key topics that students should study.
    Return only a JSON array of strings with the topic names.

    Question paper:
    ${paperContent}
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 256,
      }
    });

    const response = result.response;
    const text = response.text();
    
    // Parse the JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from AI response");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error getting resource recommendations:", error);
    throw new Error("Failed to get resource recommendations: " + (error as Error).message);
  }
}

/**
 * Get a response from the AI assistant
 */
export async function getChatResponse(prompt: string, history: any[] = []): Promise<string> {
  try {
    const chat = model.startChat({
      history: history.map(item => ({
        role: item.role,
        parts: [{ text: item.content }]
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error in AI chat:", error);
    throw new Error("Failed to get AI response: " + (error as Error).message);
  }
}

/**
 * Generate a study plan for a specific exam
 */
export async function generateStudyPlan(examName: string, examDate: Date, topics: string[]): Promise<any> {
  try {
    const today = new Date();
    const daysUntilExam = Math.max(1, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    const prompt = `
    You are an educational planner. Create a study plan for a student preparing for a ${examName} exam in ${daysUntilExam} days.
    The plan should cover these topics: ${topics.join(", ")}.
    
    Format your response as a JSON object with these fields:
    {
      "studyPlan": [
        {
          "day": number,
          "date": "YYYY-MM-DD",
          "topics": ["topic1", "topic2", ...],
          "duration": number (in hours),
          "activities": ["activity1", "activity2", ...],
          "resources": ["resource1", "resource2", ...]
        },
        ...
      ],
      "keyMilestones": [
        {
          "date": "YYYY-MM-DD",
          "milestone": "description"
        },
        ...
      ],
      "overallStrategy": "strategy description"
    }
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      }
    });

    const response = result.response;
    const text = response.text();
    
    // Parse the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from AI response");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw new Error("Failed to generate study plan: " + (error as Error).message);
  }
}
