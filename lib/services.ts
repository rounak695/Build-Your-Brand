// ─────────────────────────────────────────────────────────────────
// ACCELERATE AI — Services and Agent Simulation Engine
// ─────────────────────────────────────────────────────────────────

import { sleep } from "@/lib/utils";
import type { 
  BrandArtifact, 
  ProductArtifact, 
  GrowthArtifact, 
  OperationsArtifact, 
  Task, 
  Decision,
  ContentIdea,
  Creator,
  Trend
} from "@/lib/types";

// Suggested questions based on active agent/context
export function getSuggestedPrompts(agentId: string): string[] {
  switch (agentId) {
    case "ceo":
      return [
        "Make the brand more premium",
        "Change focus to college runners in India",
        "What should we do next?",
        "Show current company roadmap"
      ];
    case "product":
      return [
        "Make the homepage more editorial",
        "Add a loyalty program to V2 features",
        "Change primary typography to Outfit",
        "Target aesthetic-focused sneakerheads"
      ];
    case "growth":
      return [
        "Find fashion and streetwear creators",
        "Create an Reels campaign idea",
        "Review short-form content ideas",
        "Suggest a waitlist strategy"
      ];
    case "operations":
      return [
        "Increase selling price by 20%",
        "Reduce launch CAC to ₹500",
        "Show break-even scenarios",
        "Compare Razorpay vs Stripe fee impact"
      ];
    default:
      return [
        "Make this more premium",
        "Why did you choose this price?",
        "What is our core differentiation?"
      ];
  }
}

// Simulated replies for direct agent chat
export function getAgentReply(agentId: string, message: string, brandName: string) {
  const msg = message.toLowerCase();
  
  if (agentId === "ceo") {
    if (msg.includes("premium")) {
      return {
        reply: "Making the brand more premium is a solid strategic move. I am routing this request to Mira (Product/Brand) to elevate the visual tone and positioning, Noah (Operations) to adjust the pricing model, and Ari (Growth) to recalibrate our creator list.",
        sources: ["Premium Sneaker Market Analysis", "DTC Unit Economics Framework"],
        decision: "Position as a luxury/lifestyle running brand"
      };
    }
    if (msg.includes("next")) {
      return {
        reply: "Our primary objective is validating launch metrics. I recommend: 1. Review and approve brand positioning, 2. Approve launch pricing of ₹4,999, 3. Review the homepage structure. These will unblock creator seeding.",
        sources: ["Velocity Launch Plan v1"],
        decision: "Focus initial efforts on organic creator outreach"
      };
    }
    return {
      reply: `As CEO of ${brandName}, I'm focused on coordination. Let's make sure our departments are aligned. What aspect of ${brandName} do you want to modify?`,
      sources: [`${brandName} Strategy Deck`],
      decision: null
    };
  }
  
  if (agentId === "product") {
    if (msg.includes("premium") || msg.includes("editorial")) {
      return {
        reply: "To make the product/homepage more premium and editorial, we should switch to asymmetrical grid layouts, increase letter-spacing on display headers, and adopt a muted, high-contrast monochrome palette. I will update the homepage blueprint.",
        sources: ["Vogue Runway UI Patterns", "On Running Typography Specs"],
        decision: "Adopt high-fashion editorial grid for homepage"
      };
    }
    if (msg.includes("target") || msg.includes("customer") || msg.includes("gen z")) {
      return {
        reply: "Gen Z urban runners value aesthetics as much as performance. They feel mainstream running brands are too corporate and technical. We're designing Velocity to look like a lifestyle sneaker while keeping technical cushioning intact.",
        sources: ["Gen Z Sneaker Culture Survey", "Metropolitan Runner Profile"],
        decision: "Position at intersection of streetwear and running performance"
      };
    }
    return {
      reply: "I'm refining our product details. The homepage has been constructed, and our MVP features are locked in. Let me know if you want to modify the design system, copy, or roadmap.",
      sources: ["Velocity Product Definition"],
      decision: null
    };
  }

  if (agentId === "growth") {
    if (msg.includes("premium")) {
      return {
        reply: "With a more premium positioning, we must shift creator outreach from general fitness influencers to design curators, sneaker collectors, and high-street runners. This will elevate the brand's cultural cachet.",
        sources: ["Highsnobiety Creator Ecosystem", "Instagram Sneaker Influence Index"],
        decision: "Target culture-first design curators instead of gym influencers"
      };
    }
    if (msg.includes("creator") || msg.includes("outreach")) {
      return {
        reply: "I have identified creators (Priya, Arjun) with 90%+ brand fit. We have ready outreach templates. Seeded product costs will be ₹0 since we're giving shoes for reviews. Ready to send messages?",
        sources: ["Micro-influencer Seeding Strategy"],
        decision: "Deploy organic seeding campaign"
      };
    }
    return {
      reply: "We are focusing on organic loops. I've prepared a content engine draft with Instagram Reels concepts and creator shortlists. Let me know what changes you want to make to the marketing strategy.",
      sources: ["Velocity Growth Strategy"],
      decision: null
    };
  }

  if (agentId === "operations") {
    if (msg.includes("premium") || msg.includes("price") || msg.includes("economics")) {
      return {
        reply: "A premium shift allows us to increase price from ₹4,999 to ₹6,999. COGS will slightly increase to ₹1,500 due to premium packaging. Gross margin rises to 76%, and contribution margin is 59%, significantly reducing our break-even threshold.",
        sources: ["Premium Sneaker COGS Breakdown", "DTC Profit Margin Matrix"],
        decision: "Increase selling price to ₹6,999 to capture high-margin demand"
      };
    }
    if (msg.includes("Razorpay") || msg.includes("fee") || msg.includes("cost")) {
      return {
        reply: "We are factoring a 2% payment gateway fee (₹140) and a returns allowance. Total logistics shipping is ₹200. This keeps our total variable costs well controlled, leaving healthy margin per order.",
        sources: ["Razorpay Pricing Sheet", "Delhivery DTC Rate Sheet"],
        decision: "Razorpay integration for checkout payments"
      };
    }
    return {
      reply: "Our financial simulator is active. With ₹4,999 selling price and ₹1,200 COGS, our unit economics are highly sound (52% gross margin). Let me know if you want to test pricing or variable cost overrides.",
      sources: ["Velocity Financial Model v1"],
      decision: null
    };
  }

  return {
    reply: "I'm on it. Give me a moment to verify.",
    sources: [],
    decision: null
  };
}

// The "Magic Moment" global sync sequence
export async function runGlobalSyncSequence(
  prompt: string, 
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  brain: any,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  onEvent: (event: any) => void
) {
  const idea = brain.project?.idea || "Premium sneaker brand for Gen Z";
  const name = brain.project?.name || "Velocity";

  // Step 1: CEO intercepts and plans routing
  onEvent({
    type: "agent.started",
    agent: "ceo",
    message: "Updating the company direction based on your request..."
  });
  
  brain.setAgentStatus("ceo", "WORKING", `Routing change: "${prompt}"`);
  
  await sleep(1200);

  onEvent({
    type: "agent.progress",
    agent: "ceo",
    message: "I am sending this request to Product and Brand to elevate visual direction, Operations to check economics, and Growth to adjust creators.",
    progress: 0.3
  });
  
  brain.addActivity({
    agentId: "ceo",
    agentName: "Alex · AI CEO",
    message: `Received directive: "${prompt}". Re-routing tasks to Mira (Product) and Noah (Operations).`,
    type: "info"
  });

  await sleep(1000);

  // Step 2: Handoff to Product/Brand
  onEvent({
    type: "agent.handoff",
    agent: "ceo",
    message: "Handoff to Mira (Product & Brand Director)",
    data: { from: "ceo", to: "product", action: "Refining visual identity & typography" }
  });

  brain.setAgentStatus("ceo", "WAITING", "Waiting for Product and Brand updates");
  brain.setAgentStatus("product", "WORKING", "Refining brand positioning and homepage design");
  
  await sleep(1500);

  // Brand details updated (more premium)
  const isPremium = prompt.toLowerCase().includes("premium") || prompt.toLowerCase().includes("editorial");
  
  const updatedBrand: BrandArtifact = {
    name,
    tagline: isPremium ? "Velocity. Performance, refined." : "Velocity. Run your way.",
    positioning: isPremium 
      ? "Luxury minimalist running footwear for Gen Z urban athletes who want high-fashion aesthetics and technical performance without compromise."
      : "Premium minimalist running footwear for Gen Z urban runners who want style and performance without compromise.",
    personality: isPremium 
      ? ["Luxurious", "Confident", "Understated", "Artistic", "Authentic"]
      : ["Minimal", "Confident", "Energetic", "Modern", "Authentic"],
    colors: isPremium 
      ? {
          primary: "#121314",
          secondary: "#FAF9F6",
          accent: "#B89047", // Luxury gold color
          background: "#F4F3EF",
        }
      : {
          primary: "#0B0B0C",
          secondary: "#F7F6F2",
          accent: "#E63946", // Energetic red
          background: "#FAFAF8",
        },
    typography: {
      display: isPremium ? "Outfit" : "Clash Display",
      body: "Inter"
    },
    voice: isPremium
      ? [
          "Quiet luxury. Never loud.",
          "Short, high-impact statements.",
          "Emphasis on aesthetic details.",
          "Artistic yet authentic."
        ]
      : [
          "Speak like a friend, not a brand",
          "Short sentences. Real words.",
          "Performance with personality",
          "Never corporate, always human"
        ],
    targetCustomer: isPremium
      ? "Gen Z design curators, sneaker collectors, and urban runners (18-30) who want fashion-forward footwear that transitions seamlessly from premium workspaces to running trails."
      : "Gen Z urban runners aged 18–28 who follow sneaker culture, value aesthetics, and want running shoes that don't look like running shoes.",
    status: "APPROVED"
  };

  brain.setBrand(updatedBrand);
  
  // Product details updated
  const updatedProduct: ProductArtifact = {
    definition: isPremium 
      ? "Velocity is an ultra-premium DTC lifestyle running shoe brand built for Gen Z design curators."
      : "Velocity is a premium DTC running footwear brand built for Gen Z urban athletes.",
    targetUser: isPremium
      ? "Urban Gen Z creators and designers (18-30) who value aesthetic details and high-street fashion."
      : "Urban Gen Z runners (18–28) in metro cities who follow sneaker culture.",
    problem: isPremium
      ? "Running shoes lack high-fashion design. Gen Z design curators refuse to wear ugly performance shoes in premium spaces."
      : "Running shoes are either high-performance-but-ugly or stylish-but-uncomfortable. Gen Z wants both.",
    valueProp: isPremium
      ? "A running shoe that fits perfectly on the runway, the creative studio, and the running trail."
      : "The only running shoe that you'd wear to the gym, the street, and a coffee shop — and still perform in.",
    differentiation: isPremium
      ? "Gold accents, premium leather details, bespoke colorways, culture-first gallery showrooms."
      : "Premium materials, minimal design language, aggressive DTC pricing, culture-first marketing.",
    mvpFeatures: [
      "Product catalog (3 colorways)",
      "Product detail page",
      "Cart & checkout",
      "Size guide",
      "Reviews system",
    ],
    v2Features: [
      "Bespoke customizable colors",
      "Premium club access",
      "Loyalty program",
      "Referral system",
    ],
    status: "APPROVED"
  };

  brain.setProduct(updatedProduct);

  onEvent({
    type: "agent.artifact_updated",
    agent: "product",
    message: "Mira (Product) updated Brand Strategy and Homepage Blueprint to v2.",
    data: { artifactType: "brand_strategy" }
  });

  brain.addActivity({
    agentId: "product",
    agentName: "Jordan · Product Director",
    message: isPremium 
      ? `Brand direction elevated. Palette changed to Slate & Gold. Tagline updated to: "Velocity. Performance, refined."`
      : `Brand direction updated. Tagline updated to: "Velocity. Run your way."`,
    type: "completed"
  });

  brain.setAgentStatus("product", "COMPLETED");

  await sleep(1000);

  // Step 3: Handoff to Operations
  onEvent({
    type: "agent.handoff",
    agent: "product",
    message: "Handoff to River (Operations Director)",
    data: { from: "product", to: "operations", action: "Recalculating unit economics based on premium positioning" }
  });

  brain.setAgentStatus("operations", "WORKING", "Recalculating price thresholds and margins");
  
  await sleep(1500);

  const updatedOps: OperationsArtifact = {
    businessModel: isPremium 
      ? "Direct-to-consumer (DTC) luxury brand. High gross margins through prestige pricing, leveraging creator seeding to maintain CAC."
      : "Direct-to-consumer (DTC) premium running footwear. Revenue from product sales. Margin from premium pricing over COGS.",
    pricing: isPremium
      ? {
          sellingPrice: 6999, // Elevated price point
          cogs: 1500, // Higher material costs
          packaging: 200,
          shipping: 200,
          paymentFee: 140,
          cac: 600,
          returns: 200,
          otherCosts: 160
        }
      : {
          sellingPrice: 4999,
          cogs: 1200,
          packaging: 150,
          shipping: 200,
          paymentFee: 100,
          cac: 400,
          returns: 150,
          otherCosts: 100
        },
    unitEconomics: isPremium
      ? {
          grossMargin: 76,
          contributionMargin: 59,
          breakEven: 120, // Lower orders needed because of high profit
          profitPerOrder: 3999,
          requiredOrders: 100
        }
      : {
          grossMargin: 73,
          contributionMargin: 54,
          breakEven: 185,
          profitPerOrder: 2699,
          requiredOrders: 100
        },
    launchPhases: operationsLaunchPhases(isPremium),
    status: "APPROVED"
  };

  brain.setOperations(updatedOps);

  // Add Operations decision
  const opsDecision: Omit<Decision, "id" | "createdAt"> = {
    title: isPremium ? "Set retail price to ₹6,999" : "Set retail price to ₹4,999",
    description: isPremium
      ? "Increased target retail price to maintain luxury brand positioning and accommodate premium packaging materials."
      : "Set entry-level premium price point of ₹4,999 to appeal to Gen Z urban runners.",
    madeBy: "River · Operations Director",
    reason: isPremium
      ? "Gen Z designers show high price elasticity for high-street sneaker drops. Higher margins absorb shipping and returns costs."
      : "Maximizes entry-point market share while retaining safe 50%+ gross margins.",
    confidence: 85,
    impact: "HIGH",
    reversible: true
  };
  brain.addDecision(opsDecision);

  onEvent({
    type: "agent.artifact_updated",
    agent: "operations",
    message: "River (Operations) recalculated unit economics and set new pricing.",
    data: { artifactType: "pricing_model" }
  });

  brain.addActivity({
    agentId: "operations",
    agentName: "River · Operations Director",
    message: isPremium
      ? `Pricing adjusted to ₹6,999. Gross margin elevated to 76%. Break-even reduced to 120 orders.`
      : `Pricing adjusted to ₹4,999. Gross margin optimized at 73%. Break-even adjusted to 185 orders.`,
    type: "completed"
  });

  brain.setAgentStatus("operations", "COMPLETED");

  await sleep(1000);

  // Step 4: Handoff to Growth
  onEvent({
    type: "agent.handoff",
    agent: "operations",
    message: "Handoff to Maya (Growth Director)",
    data: { from: "operations", to: "growth", action: "Adjusting content hooks and creator list" }
  });

  brain.setAgentStatus("growth", "WORKING", "Updating target curators and ad strategies");
  
  await sleep(1500);

  const updatedGrowth: GrowthArtifact = {
    contentStrategy: isPremium
      ? "Curator-first aesthetics seeding. Focus on slow-living reels, minimal flatlays, and unboxing typography. 90% organic seeding, 10% micro-boosts."
      : "Creator-first content marketing. 80% organic (creator UGC + founder content), 20% paid amplification of winning content.",
    channels: isPremium
      ? ["Instagram", "Pinterest", "WhatsApp", "Substack"]
      : ["Instagram", "YouTube", "WhatsApp", "Email"],
    contentIdeas: growthContentIdeas(isPremium),
    trends: growthTrends(isPremium),
    creators: growthCreators(isPremium),
    status: "APPROVED"
  };

  brain.setGrowth(updatedGrowth);

  onEvent({
    type: "agent.artifact_updated",
    agent: "growth",
    message: "Maya (Growth) updated Content Calendar and Creator Shortlist.",
    data: { artifactType: "content_strategy" }
  });

  brain.addActivity({
    agentId: "growth",
    agentName: "Maya · Growth Director",
    message: isPremium
      ? "Creator outreach list aligned with premium design tastemakers. Content hooks shifted to quiet luxury themes."
      : "Creator list updated with metropolitan runners. Content engine loaded with run routine hooks.",
    type: "completed"
  });

  brain.setAgentStatus("growth", "COMPLETED");

  await sleep(1000);

  // Step 5: CEO finishes and syncs project
  onEvent({
    type: "agent.completed",
    agent: "ceo",
    message: "All departments are aligned. Company synced!"
  });

  brain.setAgentStatus("ceo", "COMPLETED");

  // Update project readiness and tagline
  brain.setProject({
    ...brain.project,
    tagline: isPremium ? "Performance, refined." : "Premium Running Footwear",
    readiness: 94,
    updatedAt: new Date().toISOString()
  });

  onEvent({
    type: "project.updated",
    message: "✓ COMPANY SYNCED"
  });

  brain.addActivity({
    agentId: "ceo",
    agentName: "Alex · AI CEO",
    message: "Company sync completed. Brand v2, Website v2, Pricing model, and Creator lists are fully updated and synchronized.",
    type: "decision"
  });
}

// Helpers for mock lists
function operationsLaunchPhases(isPremium: boolean) {
  return [
    {
      id: "phase1",
      name: "Brand Alignment",
      description: isPremium 
        ? "Complete luxury brand design guide, custom colorway assets, and editorial landing page"
        : "Complete brand guidelines, color palettes, and standard MVP page layouts",
      startWeek: 1,
      endWeek: 2,
      status: "COMPLETED" as const,
      tasks: []
    },
    {
      id: "phase2",
      name: "Tastemaker Seeding",
      description: isPremium
        ? "Reach out to top 15 design and sneaker curators; deliver bespoke Velocity Gold boxes"
        : "Reach out to top 20 metropolitan running creators for raw unboxing UGC",
      startWeek: 3,
      endWeek: 5,
      status: "IN_PROGRESS" as const,
      tasks: []
    },
    {
      id: "phase3",
      name: "Showroom Pre-Launch",
      description: isPremium
        ? "Deploy invite-only checkout access and editorial showroom website"
        : "Deploy open waitlist form and running challenge sign-ups",
      startWeek: 6,
      endWeek: 7,
      status: "PLANNED" as const,
      tasks: []
    }
  ];
}

function growthContentIdeas(isPremium: boolean): ContentIdea[] {
  if (isPremium) {
    return [
      {
        id: "c1",
        title: "POV: You appreciate architecture and sneaker cushioning",
        hook: "POV: Sneakers designed like architecture, built for the urban trail.",
        format: "Reel",
        platform: "Instagram",
        funnelStage: "Awareness",
        cta: "Request invite code",
        status: "READY"
      },
      {
        id: "c2",
        title: "Unboxing the Velocity Gold (unspoken review)",
        hook: "No words. Just the sound of premium leather and slate packaging.",
        format: "UGC",
        platform: "Instagram",
        funnelStage: "Awareness",
        cta: "Link in bio",
        status: "READY"
      },
      {
        id: "c3",
        title: "5 architectural colors that inspired our design",
        hook: "How minimal concrete and gold detailing formed the Velocity silhouette.",
        format: "Carousel",
        platform: "Instagram",
        funnelStage: "Consideration",
        cta: "Save this gallery",
        status: "READY"
      }
    ];
  }
  return [
    {
      id: "c1",
      title: "POV: You found running shoes that don't look like running shoes",
      hook: "POV: You finally found running shoes that don't look like running shoes.",
      format: "Reel",
      platform: "Instagram",
      funnelStage: "Awareness",
      cta: "Link in bio",
      status: "READY"
    },
    {
      id: "c2",
      title: "Rating every Gen Z running shoe (honest review)",
      hook: "I rated every 'Gen Z running shoe' so you don't have to.",
      format: "Carousel",
      platform: "Instagram",
      funnelStage: "Consideration",
      cta: "Save this post",
      status: "READY"
    }
  ];
}

function growthTrends(isPremium: boolean): Trend[] {
  if (isPremium) {
    return [
      {
        id: "t1",
        name: "Quiet luxury unboxing",
        platform: "TikTok / Reels",
        momentum: "HIGH",
        brandFit: 96,
        risk: "LOW",
        category: "TRENDING",
        adaptation: "Showcase the concrete-finished Velocity drawer box sliding open slowly. Focus on raw textures and minimal typography overlays."
      },
      {
        id: "t2",
        name: "Studio flatlays",
        platform: "Pinterest",
        momentum: "HIGH",
        brandFit: 94,
        risk: "LOW",
        category: "EVERGREEN",
        adaptation: "Style Velocity sneakers next to concrete blocks, Leica cameras, and design journals. Focus on architects and creative directors."
      }
    ];
  }
  return [
    {
      id: "t1",
      name: "Street interview format",
      platform: "Instagram / TikTok",
      momentum: "HIGH",
      brandFit: 92,
      risk: "LOW",
      category: "TRENDING",
      adaptation: "Rate these running fits — ask people on the street to rate different sneakers on style/performance"
    }
  ];
}

function growthCreators(isPremium: boolean): Creator[] {
  if (isPremium) {
    return [
      {
        id: "cr1",
        name: "Kabir Sengupta",
        handle: "@kabirstudio",
        platform: "Instagram",
        category: "Design / Architecture / Fashion",
        audience: 180000,
        engagement: 5.4,
        estimatedCost: 45000,
        brandFit: 95,
        status: "SHORTLISTED",
        whyFit: "Architect who runs, extremely premium grid design, high Gen Z design follower base",
        campaignIdea: "Structuring Velocity — analyzing the sneaker from a design blueprint angle"
      },
      {
        id: "cr2",
        name: "Ananya Roy",
        handle: "@ananyacurates",
        platform: "Instagram",
        category: "Quiet Luxury / Fashion",
        audience: 95000,
        engagement: 7.2,
        estimatedCost: 28000,
        brandFit: 93,
        status: "IDENTIFIED",
        whyFit: "Minimalist fashion pioneer in Mumbai, highly curated lifestyle imagery",
        campaignIdea: "Styling the Gold — 3 studio-to-road outfits"
      }
    ];
  }
  return [
    {
      id: "cr1",
      name: "Arjun Mehta",
      handle: "@arjunruns",
      platform: "Instagram",
      category: "Running / Fitness",
      audience: 280000,
      engagement: 4.2,
      estimatedCost: 35000,
      brandFit: 94,
      status: "SHORTLISTED",
      whyFit: "Authentic runner, strong Gen Z audience in metro cities, natural storyteller",
      campaignIdea: "Week with Velocity — 7-day running challenge in Velocity shoes"
    }
  ];
}
