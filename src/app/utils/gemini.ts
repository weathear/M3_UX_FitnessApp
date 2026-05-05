import { GoogleGenerativeAI } from "@google/generative-ai";

type ViteImportMeta = ImportMeta & {
  env: {
    readonly VITE_GEMINI_API_KEY?: string;
  };
};

const apiKey = (import.meta as ViteImportMeta).env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || "");

const SYSTEM_PROMPT = `You are FitAI Coach, an expert fitness trainer with knowledge from world-class athletes. 
You provide evidence-based fitness advice on training, nutrition, recovery, and motivation.
Always be concise, actionable, and encourage consistency and proper form.
Keep responses to 2-3 paragraphs max, practical and specific.`;

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: number;
  durationSec?: number;
  muscleGroups: string[];
}

export interface WorkoutPlan {
  name: string;
  type: string;
  duration: number;
  exercises: WorkoutExercise[];
  totalCalories: number;
  totalTime: number;
}

function stripCodeFences(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseJson<T>(text: string): T {
  const cleaned = stripCodeFences(text);
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Gemini response did not contain JSON.");
  }
  return JSON.parse(match[0]) as T;
}

export async function* getAIResponseStreaming(userMessage: string) {
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY not configured in .env.local");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`;
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("API key not valid") || message.includes("API_KEY_INVALID")) {
      throw new Error("Invalid Gemini API key. Generate a new key in Google AI Studio and put it into .env.local.");
    }
    throw error;
  }
}

export async function generateWorkoutPlan(params: {
  type: string;
  planType: string;
  duration: number;
  equipment: string[];
  muscleGroups: string[];
  intensity: string;
}): Promise<WorkoutPlan> {
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY not configured in .env.local");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `${SYSTEM_PROMPT}

You are generating a workout plan.
Return ONLY valid JSON, no markdown and no commentary.
The JSON must match this shape exactly:
{
  "name": string,
  "type": string,
  "duration": number,
  "exercises": [
    { "name": string, "sets"?: number, "reps"?: number, "durationSec"?: number, "muscleGroups": string[] }
  ],
  "totalCalories": number,
  "totalTime": number
}

User preferences:
- workout type: ${params.type}
- plan type: ${params.planType}
- duration minutes: ${params.duration}
- equipment: ${params.equipment.join(", ") || "none"}
- target muscle groups: ${params.muscleGroups.join(", ") || "none"}
- intensity: ${params.intensity}

Constraints:
- Make the plan practical and realistic.
- Match the requested duration closely.
- Use exercises appropriate for the available equipment.
- Prefer 5-8 exercises depending on duration.
- Keep muscle groups aligned to the goal.
- Set totalTime equal to the requested duration.
- Return numeric values as numbers, not strings.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseJson<WorkoutPlan>(text);
}

export async function refineWorkoutPlan(plan: WorkoutPlan, promptText: string): Promise<{ plan: WorkoutPlan; summary: string }> {
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY not configured in .env.local");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `${SYSTEM_PROMPT}

You are refining an existing workout plan.
Return ONLY valid JSON, no markdown and no commentary.
The JSON must match this shape exactly:
{
  "plan": {
    "name": string,
    "type": string,
    "duration": number,
    "exercises": [
      { "name": string, "sets"?: number, "reps"?: number, "durationSec"?: number, "muscleGroups": string[] }
    ],
    "totalCalories": number,
    "totalTime": number
  },
  "summary": string
}

Current plan JSON:
${JSON.stringify(plan)}

User refinement request:
${promptText}

Constraints:
- Keep the overall structure valid.
- Apply the user's request directly.
- Keep the same plan type and duration unless the request clearly changes them.
- Preserve realistic exercise ordering.
- Return concise summary text in the summary field.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseJson<{ plan: WorkoutPlan; summary: string }>(text);
}

export const expertAttribution = [
  { name: "Arnold Schwarzenegger", title: "7x Mr. Olympia Champion" },
  { name: "Rich Froning", title: "4x CrossFit Games Champion" },
  { name: "Ronnie Coleman", title: "8x Mr. Olympia Champion" },
  { name: "Simone Biles", title: "Olympic Gymnastics Champion" },
];

export function getRandomExpert() {
  return expertAttribution[Math.floor(Math.random() * expertAttribution.length)];
}
