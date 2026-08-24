import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

const ASK_SYSTEM_PROMPT = `You are part of the Xcelerate AI team. Based on the user's question and the project context, provide a helpful, concise response. 

Determine which team member should respond:
- Product Director (Jordan): brand, product, website, UX, design
- Growth Director (Maya): marketing, content, creators, social, launch
- Operations Director (River): pricing, finance, operations, tech, analytics
- AI CEO (Alex): strategy, priorities, overall direction

Format your response as JSON:
{
  "respondingAgent": "product|growth|operations|ceo",
  "agentName": "Jordan|Maya|River|Alex",
  "agentRole": "Product Director|Growth Director|Operations Director|AI CEO",
  "response": "Your response here — be direct, specific, and actionable",
  "followUp": "Optional follow-up question or action",
  "relatedArtifacts": ["brand", "product", "growth", "operations"]
}

Be direct. Sound human. Max 3-4 sentences per response unless a list is needed.`;

export async function POST(request: NextRequest) {
  try {
    const { question, projectContext } = await request.json();

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(getDemoResponse(question));
    }

    const contextStr = projectContext
      ? `Project: "${projectContext.name}" — ${projectContext.idea}\nBrand positioning: ${projectContext.brand?.positioning || "not set yet"}`
      : "";

    const response = await generateText(
      ASK_SYSTEM_PROMPT,
      `${contextStr}
      
      User question: "${question}"
      
      Who should respond and what should they say? Be specific and actionable.
      Respond ONLY with valid JSON.`
    );

    const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanResponse);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Ask agent error:", error);
    return NextResponse.json(getDemoResponse(""));
  }
}

function getDemoResponse(question: string) {
  const q = question.toLowerCase();

  if (q.includes("premium") || q.includes("luxury") || q.includes("brand") || q.includes("design")) {
    return {
      respondingAgent: "product",
      agentName: "Jordan",
      agentRole: "Product Director",
      response:
        "To elevate the premium feel, I'd recommend increasing whitespace in the layout, using a heavier display font, and removing any secondary CTAs from the homepage. Less is more when communicating premium. I can update the brand guidelines now.",
      followUp: "Want me to update the website mockup to reflect this?",
      relatedArtifacts: ["brand", "product"],
    };
  }

  if (q.includes("price") || q.includes("pricing") || q.includes("cost") || q.includes("budget") || q.includes("money") || q.includes("₹")) {
    return {
      respondingAgent: "operations",
      agentName: "River",
      agentRole: "Operations Director",
      response:
        "At ₹4,999, we're running 52% gross margin and 38% contribution margin. If budget is tight, I'd suggest launching with 50 units instead of 100 to reduce inventory risk — same brand positioning, less capital tied up. Break-even drops from 420 to 210 orders.",
      followUp: "Want me to recalculate unit economics with your target budget?",
      relatedArtifacts: ["operations"],
    };
  }

  if (q.includes("creator") || q.includes("influencer") || q.includes("content") || q.includes("instagram") || q.includes("marketing") || q.includes("growth")) {
    return {
      respondingAgent: "growth",
      agentName: "Maya",
      agentRole: "Growth Director",
      response:
        "For the first 100 customers, I'd double down on micro-influencers (under 100K followers) — they're converting 3x better than macro right now. I've identified 4 high-fit creators. We could do free product seeding with 10 of them this week for under ₹5,000 total cost.",
      followUp: "Should I put together outreach messages for the top 10 creators?",
      relatedArtifacts: ["growth"],
    };
  }

  if (q.includes("launch") || q.includes("when") || q.includes("next") || q.includes("priority") || q.includes("what should")) {
    return {
      respondingAgent: "ceo",
      agentName: "Alex",
      agentRole: "AI CEO",
      response:
        "Top 3 priorities right now: (1) Approve the brand direction — this unblocks website and content. (2) Confirm launch pricing with River. (3) Give Maya the green light to start creator outreach. Everything else is downstream of these three.",
      followUp: "Which of these can you approve right now?",
      relatedArtifacts: ["brand", "operations", "growth"],
    };
  }

  // Default
  return {
    respondingAgent: "ceo",
    agentName: "Alex",
    agentRole: "AI CEO",
    response:
      "Good question. Let me route this to the right team member and get back to you with a specific answer. In the meantime, the most important thing you can do right now is review and approve the brand direction — everything flows from that.",
    followUp: "Is there something specific blocking you right now?",
    relatedArtifacts: [],
  };
}
