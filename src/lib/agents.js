import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';

function isReal(key) {
    return key && !key.startsWith('your_') && key !== '';
}

/** OpenAI — GPT-4o (Context), gpt-image-1.5 (Logos), text-embedding-3-small (Vectors) */
export function getOpenAI() {
    const key = env.OPENAI_API_KEY;
    if (!isReal(key)) return null;
    return new OpenAI({ apiKey: key });
}

/** Google AI — Gemini 2.5 Pro (Chat/Names/Guidelines), nano-banana-pro (Moodboards/Social) */
export function getGoogleAI() {
    const key = env.GOOGLE_AI_API_KEY;
    if (!isReal(key)) return null;
    return new GoogleGenAI({ apiKey: key });
}

/** Anthropic — Claude Opus 4.6 (Wireframes), Claude Haiku (Decisions) */
export function getAnthropic() {
    const key = env.ANTHROPIC_API_KEY;
    if (!isReal(key)) return null;
    return new Anthropic({ apiKey: key });
}
