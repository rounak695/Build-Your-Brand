import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

const CEO_SYSTEM_PROMPT = `You are Alex, the AI CEO of Xcelerate AI. You orchestrate a team of specialist AI agents (Product Director, Growth Director, Operations Director) to turn startup ideas into complete businesses.

Your role:
- Interpret the user's idea
- Break it into business components
- Coordinate the team
- Keep everything consistent

When given a business idea, respond with a JSON object containing:
{
  "projectName": "Short brand name",
  "tagline": "One line positioning",
  "summary": "2-3 sentence CEO brief",
  "productTask": "Specific instruction for Product Director",
  "growthTask": "Specific instruction for Growth Director", 
  "operationsTask": "Specific instruction for Operations Director",
  "firstDecision": "The most important strategic decision you've made"
}

Be direct. Be concise. Think like a startup CEO, not a corporate consultant.`;

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json();
    if (!idea) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    // Check if Gemini is configured
    if (!process.env.GEMINI_API_KEY) {
      // Return demo response
      return NextResponse.json({
        projectName: extractProjectName(idea),
        tagline: generateTagline(idea),
        summary: `Got it. I'm building a complete business around your idea. I've activated the Product, Growth, and Operations teams — they're working now.`,
        productTask: `Research the market, define the target customer, create brand strategy, and design the product experience for: "${idea}"`,
        growthTask: `Identify content opportunities, research trends, find potential creators, and build a launch strategy for: "${idea}"`,
        operationsTask: `Calculate unit economics, define the business model, price the product, and create a launch plan for: "${idea}"`,
        firstDecision: "Position as premium DTC with creator-led acquisition strategy",
        demo: true,
      });
    }

    const response = await generateText(
      CEO_SYSTEM_PROMPT,
      `The user wants to build: "${idea}". 
      
      Analyze this idea and create your CEO brief. Include a business name, tagline, and specific tasks for each director.
      
      Respond ONLY with valid JSON. No markdown, no backticks.`
    );

    // Parse JSON response
    const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanResponse);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("CEO agent error:", error);
    return NextResponse.json(
      { error: "CEO is unavailable right now" },
      { status: 500 }
    );
  }
}

function extractProjectName(idea: string): string {
  const words = idea.toLowerCase().split(" ");
  const brandWords = ["sneaker", "shoe", "run", "fit", "fast", "move", "stride", "kick"];
  for (const word of words) {
    if (brandWords.some((bw) => word.includes(bw))) {
      return "Velocity";
    }
  }
  const keyWords = words.filter(
    (w) => w.length > 4 && !["build", "want", "create", "launch", "make", "start"].includes(w)
  );
  if (keyWords.length > 0) {
    return keyWords[0].charAt(0).toUpperCase() + keyWords[0].slice(1);
  }
  return "Venture";
}

function generateTagline(idea: string): string {
  if (idea.toLowerCase().includes("sneak") || idea.toLowerCase().includes("shoe")) {
    return "Premium Running Footwear";
  }
  if (idea.toLowerCase().includes("app") || idea.toLowerCase().includes("software")) {
    return "Software that works for you";
  }
  if (idea.toLowerCase().includes("food") || idea.toLowerCase().includes("restaurant")) {
    return "Food worth talking about";
  }
  return "Built for what comes next";
}
