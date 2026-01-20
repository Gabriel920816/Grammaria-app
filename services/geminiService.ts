
import { GoogleGenAI } from "@google/genai";
import { GrammarAnalysis } from "../types";

const API_KEY = process.env.API_KEY || '';

export const analyzeGrammarStream = async (
  text: string, 
  onStream: (type: 'corrected' | 'diff' | 'json', content: string) => void,
  onComplete: (analysis: GrammarAnalysis) => void
) => {
  if (!text.trim()) return;

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this English text: "${text}"
    
    CRITICAL INSTRUCTIONS:
    1. Maintain perfect spacing. If you replace a word, ensure there is a space before and after the correction segments unless it is at the end of a sentence.
    2. Output strictly in the defined format.
    
    OUTPUT FORMAT:
    1. Start with [[CORRECTED_START]] then the full corrected sentence.
    2. Then [[DIFF_START]] then an annotated version where removals are in [brackets] and additions are in {braces}. Example: "I [goes] {go} to school."
    3. Then [[JSON_START]] then a JSON object for explanations and feedback.
    
    JSON Schema:
    {
      "explanations": [{"original": string, "corrected": string, "reason": string}],
      "overallFeedback": string
    }`,
    config: {
      systemInstruction: "You are an expert English teacher. You provide instant, word-by-word streaming feedback. You are extremely careful with punctuation and spacing."
    }
  });

  let fullResponse = "";

  const stripTags = (str: string) => {
    return str.replace(/\[\[CORRECTED_START\]\]|\[\[DIFF_START\]\]|\[\[JSON_START\]\]/g, '').trim();
  };

  for await (const chunk of responseStream) {
    const chunkText = chunk.text;
    fullResponse += chunkText;

    // Continuous extraction to prevent truncation
    const correctedMatch = fullResponse.split("[[CORRECTED_START]]")[1]?.split("[[DIFF_START]]")[0];
    if (correctedMatch !== undefined) {
      onStream('corrected', stripTags(correctedMatch));
    }
    
    const diffMatch = fullResponse.split("[[DIFF_START]]")[1]?.split("[[JSON_START]]")[0];
    if (diffMatch !== undefined) {
      onStream('diff', stripTags(diffMatch));
    }

    const jsonMatch = fullResponse.split("[[JSON_START]]")[1];
    if (jsonMatch !== undefined) {
      onStream('json', stripTags(jsonMatch));
    }
  }

  // Final Cleanup & Parse
  try {
    const parts = fullResponse.split(/\[\[.*?\]\]/);
    // index 1: corrected, index 2: diff, index 3: json
    const correctedText = parts[1]?.trim() || "";
    const jsonStr = parts[3]?.trim() || "{}";
    const jsonData = JSON.parse(jsonStr);

    onComplete({
      correctedText,
      diff: [], 
      explanations: jsonData.explanations || [],
      overallFeedback: jsonData.overallFeedback || "Great improvement!"
    });
  } catch (e) {
    console.error("Final parse failed", e);
  }
};
