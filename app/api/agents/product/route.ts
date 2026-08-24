import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

const PRODUCT_SYSTEM_PROMPT = `You are Jordan, the Product & Brand Director at Xcelerate AI. You are responsible for:
- Market research and customer understanding
- Product strategy and definition
- Brand identity (name, positioning, visual system, voice)
- Website and UX direction
- Value proposition and differentiation

When given a business idea, respond with a JSON object containing the brand and product strategy:
{
  "brand": {
    "name": "Brand name",
    "tagline": "Tagline",
    "positioning": "Detailed positioning statement",
    "personality": ["trait1", "trait2", "trait3", "trait4", "trait5"],
    "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex" },
    "typography": { "display": "Font name", "body": "Font name" },
    "voice": ["voice guideline 1", "voice guideline 2", "voice guideline 3", "voice guideline 4"],
    "targetCustomer": "Detailed target customer description",
    "status": "APPROVED"
  },
  "product": {
    "definition": "What the product is",
    "targetUser": "Target user description",
    "problem": "Core problem being solved",
    "valueProp": "Value proposition",
    "differentiation": "Key differentiators",
    "mvpFeatures": ["feature1", "feature2", "feature3", "feature4", "feature5"],
    "v2Features": ["feature1", "feature2", "feature3", "feature4"],
    "status": "APPROVED"
  }
}

Be specific. Be strategic. Think like a great product director, not a generic consultant.
Respond ONLY with valid JSON. No markdown, no backticks.`;

export async function POST(request: NextRequest) {
  try {
    const { idea, projectName, task } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      // Return demo product/brand data
      return NextResponse.json(getDemoProductResponse(idea, projectName));
    }

    const response = await generateText(
      PRODUCT_SYSTEM_PROMPT,
      `Business idea: "${idea}"
      Project name: "${projectName}"
      Your task: ${task}
      
      Create a comprehensive brand and product strategy. Be specific and actionable.
      Include real brand colors that feel premium and unique to this business.
      Respond ONLY with valid JSON.`
    );

    const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanResponse);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Product agent error:", error);
    return NextResponse.json(getDemoProductResponse("", "Venture"));
  }
}

function getDemoProductResponse(idea: string, projectName: string) {
  const isSneak =
    idea?.toLowerCase().includes("sneak") || idea?.toLowerCase().includes("shoe");
  const name = projectName || (isSneak ? "Velocity" : "Venture");

  return {
    brand: {
      name,
      tagline: isSneak ? "Run your way." : "Built for what comes next.",
      positioning: isSneak
        ? "Premium minimalist running footwear for Gen Z urban runners who want style and performance without compromise."
        : `Premium ${projectName} brand built for the next generation of founders and creators.`,
      personality: ["Minimal", "Confident", "Energetic", "Modern", "Authentic"],
      colors: {
        primary: "#0B0B0C",
        secondary: "#F7F6F2",
        accent: isSneak ? "#E63946" : "#4F46E5",
        background: "#FAFAF8",
      },
      typography: { display: "Clash Display", body: "Inter" },
      voice: [
        "Speak like a friend, not a brand",
        "Short sentences. Real words.",
        "Performance with personality",
        "Never corporate, always human",
      ],
      targetCustomer: `Urban Gen Z customers aged 18–28 in metro cities who follow culture, value aesthetics, and want premium experiences at accessible prices.`,
      status: "APPROVED",
    },
    product: {
      definition: `${name} is a premium DTC brand built for Gen Z urban customers who refuse to compromise on quality or style.`,
      targetUser: "Urban Gen Z (18–28) in metro cities who follow culture and want premium without the markup.",
      problem: "The market offers either premium-but-inaccessible or affordable-but-mediocre. Gen Z wants both.",
      valueProp: `The ${name} experience: premium design, real performance, DTC pricing.`,
      differentiation: "Premium materials, minimal design language, aggressive DTC pricing, culture-first marketing.",
      mvpFeatures: [
        "Product catalog",
        "Product detail page",
        "Cart & checkout",
        "Reviews system",
        "Size/variant guide",
      ],
      v2Features: [
        "Loyalty program",
        "Personalization engine",
        "Referral system",
        "Community forum",
      ],
      status: "APPROVED",
    },
  };
}
