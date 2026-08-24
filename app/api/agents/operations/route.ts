import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

const OPERATIONS_SYSTEM_PROMPT = `You are River, the Operations Director at Xcelerate AI. You are responsible for:
- Business model and pricing strategy
- Unit economics calculation
- Launch planning and execution

Respond with valid JSON:
{
  "businessModel": "Business model description",
  "pricing": {
    "sellingPrice": 4999,
    "cogs": 1200,
    "packaging": 150,
    "shipping": 200,
    "paymentFee": 100,
    "cac": 400,
    "returns": 150,
    "otherCosts": 100
  },
  "unitEconomics": {
    "grossMargin": 52,
    "contributionMargin": 38,
    "breakEven": 420,
    "profitPerOrder": 1899,
    "requiredOrders": 100
  },
  "launchPhases": [
    {
      "id": "phase1",
      "name": "Foundation",
      "description": "Setup phase",
      "startWeek": 1,
      "endWeek": 3,
      "status": "COMPLETED",
      "tasks": []
    }
  ],
  "status": "APPROVED"
}

All amounts in Indian Rupees. Be realistic with costs for India DTC.`;

export async function POST(request: NextRequest) {
  try {
    const { idea, projectName, brandPositioning, task } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(getDemoOperationsResponse(idea, projectName));
    }

    const response = await generateText(
      OPERATIONS_SYSTEM_PROMPT,
      `Business: "${idea}"
      Brand: "${projectName}" — "${brandPositioning}"
      Task: ${task}
      
      Create realistic unit economics for India DTC. Include 5 launch phases over 24 weeks.
      Calculate all unit economics based on the pricing model.
      Respond ONLY with valid JSON.`
    );

    const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanResponse);
    
    // Auto-calculate unit economics
    const pricing = parsed.pricing;
    const totalCosts = pricing.cogs + pricing.packaging + pricing.shipping + 
                       pricing.paymentFee + pricing.cac + pricing.returns + pricing.otherCosts;
    const grossProfit = pricing.sellingPrice - pricing.cogs - pricing.packaging;
    const grossMargin = Math.round((grossProfit / pricing.sellingPrice) * 100);
    const contributionMargin = Math.round(((pricing.sellingPrice - totalCosts) / pricing.sellingPrice) * 100);
    const profitPerOrder = pricing.sellingPrice - totalCosts;
    
    parsed.unitEconomics = {
      grossMargin,
      contributionMargin,
      breakEven: Math.round(100000 / Math.max(profitPerOrder, 1)),
      profitPerOrder: Math.round(profitPerOrder),
      requiredOrders: 100,
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Operations agent error:", error);
    return NextResponse.json(getDemoOperationsResponse("", "Venture"));
  }
}

function getDemoOperationsResponse(_idea: string, _projectName: string) {
  return {
    businessModel: "Direct-to-consumer (DTC) premium brand. Revenue from product sales. Margin from premium pricing over COGS.",
    pricing: {
      sellingPrice: 4999,
      cogs: 1200,
      packaging: 150,
      shipping: 200,
      paymentFee: 100,
      cac: 400,
      returns: 150,
      otherCosts: 100,
    },
    unitEconomics: {
      grossMargin: 52,
      contributionMargin: 38,
      breakEven: 420,
      profitPerOrder: 1899,
      requiredOrders: 100,
    },
    launchPhases: [
      {
        id: "phase1",
        name: "Foundation",
        description: "Brand, product, website, and operations setup",
        startWeek: 1,
        endWeek: 3,
        status: "COMPLETED",
        tasks: [],
      },
      {
        id: "phase2",
        name: "Pre-Launch",
        description: "Creator seeding, content production, waitlist building",
        startWeek: 4,
        endWeek: 6,
        status: "IN_PROGRESS",
        tasks: [],
      },
      {
        id: "phase3",
        name: "Launch",
        description: "Go live, first 100 customers, creator content drops",
        startWeek: 7,
        endWeek: 8,
        status: "PLANNED",
        tasks: [],
      },
      {
        id: "phase4",
        name: "Optimization",
        description: "Review data, optimize CAC, improve conversion",
        startWeek: 9,
        endWeek: 12,
        status: "PLANNED",
        tasks: [],
      },
      {
        id: "phase5",
        name: "Scale",
        description: "Expand channels, add SKUs, grow to ₹10L+ MRR",
        startWeek: 13,
        endWeek: 24,
        status: "PLANNED",
        tasks: [],
      },
    ],
    status: "APPROVED",
  };
}
