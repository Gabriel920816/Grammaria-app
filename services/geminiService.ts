
import { GoogleGenAI } from "@google/genai";
import { GrammarAnalysis, WritingTone } from "../types";

export const analyzeGrammarStream = async (
  text: string, 
  tone: WritingTone,
  onStream: (type: 'corrected' | 'diff' | 'json', content: string) => void,
  onComplete: (analysis: GrammarAnalysis) => void
) => {
  if (!text.trim()) return;

  // 由于我们在 vite.config.ts 中使用了 define，
  // process.env.API_KEY 会在构建时被替换为真实的值。
  const apiKey = process.env.API_KEY || '';
  
  if (!apiKey) {
    console.error("API Key is missing. Make sure to set API_KEY in Netlify environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const toneInstructions = {
    Standard: "Focus on clear, grammatically correct English suitable for any general situation.",
    Professional: "Enhance for a formal workplace setting. Use professional vocabulary and ensure a polite, direct tone.",
    Casual: "Keep it natural and relaxed, suitable for friends or social media. Avoid being overly stiff.",
    Academic: "Optimise for scholarly writing. Use precise language, objective tone, and formal structures."
  };

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this English text with a ${tone} tone: "${text}"
    
    TONE SPECIFICS: ${toneInstructions[tone]}

    CRITICAL INSTRUCTIONS:
    1. Maintain perfect spacing. If you replace a word, ensure there is a space before and after the correction segments.
    2. Output strictly in the defined format.
    
    OUTPUT FORMAT:
    1. Start with [[CORRECTED_START]] then the full corrected sentence.
    2. Then [[DIFF_START]] then an annotated version where removals are in [brackets] and additions are in {braces}.
    3. Then [[JSON_START]] then a JSON object for explanations and feedback.
    
    JSON Schema:
    {
      "explanations": [{"original": string, "corrected": string, "reason": string, "category": string}],
      "overallFeedback": string
    }`,
    config: {
      systemInstruction: "You are an expert English teacher specializing in ESL support. You provide instant feedback tailored to specific writing tones."
    }
  });

  let fullResponse = "";

  const stripTags = (str: string) => {
    return str.replace(/\[\[CORRECTED_START\]\]|\[\[DIFF_START\]\]|\[\[JSON_START\]\]/g, '').trim();
  };

  for await (const chunk of responseStream) {
    const chunkText = chunk.text || "";
    fullResponse += chunkText;

    const correctedMatch = fullResponse.split("[[CORRECTED_START]]")[1]?.split("[[DIFF_START]]")[0];
    if (correctedMatch !== undefined) onStream('corrected', stripTags(correctedMatch));
    
    const diffMatch = fullResponse.split("[[DIFF_START]]")[1]?.split("[[JSON_START]]")[0];
    if (diffMatch !== undefined) onStream('diff', stripTags(diffMatch));

    const jsonMatch = fullResponse.split("[[JSON_START]]")[1];
    if (jsonMatch !== undefined) onStream('json', stripTags(jsonMatch));
  }

  try {
    const parts = fullResponse.split(/\[\[.*?\]\]/);
    const correctedText = parts[1]?.trim() || "";
    const rawDiff = parts[2]?.trim() || "";
    const jsonStr = parts[3]?.trim() || "{}";
    const jsonData = JSON.parse(jsonStr);

    onComplete({
      correctedText,
      rawDiff,
      diff: [], 
      explanations: jsonData.explanations || [],
      overallFeedback: jsonData.overallFeedback || "Great improvement!"
    });
  } catch (e) {
    console.error("Final parse failed", e);
  }
};
