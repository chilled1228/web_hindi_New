import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseAndCleanJsonOutput(text: string): string {
  try {
    // Remove any markdown code block formatting
    text = text.replace(/```json\s*|\s*```/g, '');
    
    // First attempt: Try to parse as pure JSON
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed.output === 'string') {
      return cleanText(parsed.output);
    }

    // Second attempt: Try to extract JSON from text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      if (extracted && typeof extracted.output === 'string') {
        return cleanText(extracted.output);
      }
    }

    // Fallback: Return cleaned original text
    return cleanText(text);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    // If all parsing attempts fail, try to extract any text between quotes after "output":
    const outputMatch = text.match(/"output"\s*:\s*"([^"]*)"/);
    if (outputMatch && outputMatch[1]) {
      return cleanText(outputMatch[1]);
    }
    return cleanText(text);
  }
}

function cleanText(text: string): string {
  return text
    .trim()
    .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
    .replace(/\\"/g, '"') // Unescape quotes
    .replace(/\\n/g, '\n') // Convert escaped newlines to actual newlines
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\S\r\n]+/g, ' ') // Replace multiple spaces with single space
    .replace(/^\{.*?"output":\s*"|"\s*\}$/g, '') // Remove JSON wrapper if present
    .trim();
}
