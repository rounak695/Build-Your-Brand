import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

const GROWTH_SYSTEM_PROMPT = `You are Maya, the Growth & Marketing Director at Xcelerate AI. You are responsible for:
- Content strategy and creation
- Social media presence
- Creator and influencer partnerships
- Trend research
- Launch strategy

Respond with valid JSON:
{
  "contentStrategy": "Overall content approach",
  "channels": ["channel1", "channel2"],
  "contentIdeas": [
    {
      "id": "c1",
      "title": "Content piece title",
      "hook": "Opening hook line",
      "format": "Reel|Carousel|Story|UGC|Founder|Educational|Trend",
      "platform": "Instagram|YouTube|TikTok|Twitter|LinkedIn",
      "funnelStage": "Awareness|Consideration|Conversion|Retention",
      "cta": "Call to action",
      "status": "IDEA|READY"
    }
  ],
  "trends": [
    {
      "id": "t1",
      "name": "Trend name",
      "platform": "Platform",
      "momentum": "HIGH|MEDIUM|LOW",
      "brandFit": 85,
      "risk": "LOW|MEDIUM|HIGH",
      "category": "TRENDING|EMERGING|EVERGREEN|NOT_RECOMMENDED",
      "adaptation": "How to use this trend"
    }
  ],
  "creators": [
    {
      "id": "cr1",
      "name": "Creator name",
      "handle": "@handle",
      "platform": "Instagram",
      "category": "Category",
      "audience": 100000,
      "engagement": 4.5,
      "estimatedCost": 25000,
      "brandFit": 88,
      "status": "IDENTIFIED",
      "whyFit": "Why they fit",
      "campaignIdea": "Campaign idea"
    }
  ],
  "status": "APPROVED"
}`;

export async function POST(request: NextRequest) {
  try {
    const { idea, projectName, brandPositioning, task } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(getDemoGrowthResponse(idea, projectName));
    }

    const response = await generateText(
      GROWTH_SYSTEM_PROMPT,
      `Business: "${idea}"
      Brand: "${projectName}" — "${brandPositioning}"
      Task: ${task}
      
      Create a realistic growth strategy. Include 6 content ideas, 4 trends, and 4 realistic Indian creator profiles.
      All costs in Indian Rupees. Focus on Instagram and YouTube.
      Respond ONLY with valid JSON.`
    );

    const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanResponse);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Growth agent error:", error);
    return NextResponse.json(getDemoGrowthResponse("", "Venture"));
  }
}

function getDemoGrowthResponse(idea: string, projectName: string) {
  const name = projectName || "Venture";
  return {
    contentStrategy: `Creator-first content marketing. 80% organic (creator UGC + founder content), 20% paid amplification of winning content.`,
    channels: ["Instagram", "YouTube", "WhatsApp", "Email"],
    contentIdeas: [
      {
        id: "c1",
        title: `POV: You found ${name} and it changed everything`,
        hook: `POV: You finally found the brand that gets it.`,
        format: "Reel",
        platform: "Instagram",
        funnelStage: "Awareness",
        cta: "Link in bio",
        status: "READY",
      },
      {
        id: "c2",
        title: `Rating every competitor (honest take)`,
        hook: `I rated every competitor so you don't have to.`,
        format: "Carousel",
        platform: "Instagram",
        funnelStage: "Consideration",
        cta: "Save this post",
        status: "READY",
      },
      {
        id: "c3",
        title: "Founder's first 100 customers story",
        hook: `How we found our first 100 customers without paid ads.`,
        format: "Founder",
        platform: "YouTube",
        funnelStage: "Awareness",
        cta: "Subscribe",
        status: "IN_PROGRESS",
      },
      {
        id: "c4",
        title: "Street interview: What do you think?",
        hook: "We asked 50 people on the street their honest opinion.",
        format: "UGC",
        platform: "Instagram",
        funnelStage: "Awareness",
        cta: "Drop your opinion",
        status: "IDEA",
      },
      {
        id: "c5",
        title: `Behind the scenes: Building ${name}`,
        hook: "Nobody shows you this part of building a brand.",
        format: "Reel",
        platform: "Instagram",
        funnelStage: "Awareness",
        cta: "Follow for more",
        status: "IDEA",
      },
      {
        id: "c6",
        title: "Why most brands get this wrong",
        hook: `This is why most brands in this space fail.`,
        format: "Educational",
        platform: "Instagram",
        funnelStage: "Consideration",
        cta: "Swipe to see the alternative",
        status: "READY",
      },
    ],
    trends: [
      {
        id: "t1",
        name: "Street interview format",
        platform: "Instagram / TikTok",
        momentum: "HIGH",
        brandFit: 92,
        risk: "LOW",
        category: "TRENDING",
        adaptation: `Ask people to rate ${name} products vs competitors`,
      },
      {
        id: "t2",
        name: "Founder storytelling",
        platform: "YouTube / Instagram",
        momentum: "HIGH",
        brandFit: 88,
        risk: "LOW",
        category: "EVERGREEN",
        adaptation: `Document the ${name} build journey — first factory, first sample, first sale`,
      },
      {
        id: "t3",
        name: "POV format",
        platform: "Instagram / TikTok",
        momentum: "HIGH",
        brandFit: 90,
        risk: "LOW",
        category: "TRENDING",
        adaptation: `POV: You found ${name} and it changed your life`,
      },
      {
        id: "t4",
        name: "AI-generated content",
        platform: "All",
        momentum: "HIGH",
        brandFit: 40,
        risk: "HIGH",
        category: "NOT_RECOMMENDED",
        adaptation: `Not recommended — ${name} is human-first brand. Use authentic UGC instead.`,
      },
    ],
    creators: [
      {
        id: "cr1",
        name: "Arjun Mehta",
        handle: "@arjunlifestyle",
        platform: "Instagram",
        category: "Lifestyle / Fashion",
        audience: 280000,
        engagement: 4.2,
        estimatedCost: 35000,
        brandFit: 94,
        status: "SHORTLISTED",
        whyFit: "Authentic creator, strong Gen Z audience in metro cities, natural storyteller",
        campaignIdea: `7-day challenge featuring ${name}`,
      },
      {
        id: "cr2",
        name: "Sneha Kapoor",
        handle: "@snehastyle",
        platform: "Instagram",
        category: "Fashion / Culture",
        audience: 145000,
        engagement: 6.8,
        estimatedCost: 22000,
        brandFit: 89,
        status: "IDENTIFIED",
        whyFit: "High engagement, fashion-forward audience",
        campaignIdea: `Styling ${name} — 5 outfit combinations`,
      },
      {
        id: "cr3",
        name: "Rohan Desai",
        handle: "@rohanfit",
        platform: "YouTube",
        category: "Fitness / Lifestyle",
        audience: 890000,
        engagement: 3.1,
        estimatedCost: 120000,
        brandFit: 82,
        status: "IDENTIFIED",
        whyFit: "Large audience, trusted voice, review content performs well",
        campaignIdea: `Honest 30-day ${name} review`,
      },
      {
        id: "cr4",
        name: "Priya Iyer",
        handle: "@priyacreates",
        platform: "Instagram",
        category: "Lifestyle / Culture",
        audience: 67000,
        engagement: 8.4,
        estimatedCost: 12000,
        brandFit: 96,
        status: "CONTACTED",
        whyFit: "Micro-influencer with extremely high engagement, very authentic",
        campaignIdea: `Month with ${name} — daily stories`,
      },
    ],
    status: "APPROVED",
  };
}
