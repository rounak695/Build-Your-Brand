// ─────────────────────────────────────────────────────────────────
// ACCELERATE AI — Types
// ─────────────────────────────────────────────────────────────────

export type AgentStatus =
  | "IDLE"
  | "THINKING"
  | "RESEARCHING"
  | "WORKING"
  | "WAITING"
  | "NEEDS_INPUT"
  | "COMPLETED"
  | "FAILED";

export type ProjectStage = "IDEA" | "BUILDING" | "LAUNCHED" | "GROWING";

export interface Project {
  id: string;
  name: string;
  tagline: string;
  idea: string;
  stage: ProjectStage;
  readiness: number;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  department: "PRODUCT" | "GROWTH" | "OPERATIONS" | "CEO";
  status: AgentStatus;
  currentTask?: string;
  completedTasks: number;
  avatar: string;
}

export interface ActivityItem {
  id: string;
  agentId: string;
  agentName: string;
  message: string;
  timestamp: string;
  type: "info" | "completed" | "warning" | "decision";
}

export interface BrandArtifact {
  name: string;
  tagline: string;
  positioning: string;
  personality: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    display: string;
    body: string;
  };
  voice: string[];
  targetCustomer: string;
  status: "DRAFT" | "READY" | "APPROVED";
}

export interface ProductArtifact {
  definition: string;
  targetUser: string;
  problem: string;
  valueProp: string;
  differentiation: string;
  mvpFeatures: string[];
  v2Features: string[];
  status: "DRAFT" | "READY" | "APPROVED";
}

export interface GrowthArtifact {
  contentStrategy: string;
  channels: string[];
  contentIdeas: ContentIdea[];
  trends: Trend[];
  creators: Creator[];
  status: "DRAFT" | "READY" | "APPROVED";
}

export interface OperationsArtifact {
  businessModel: string;
  pricing: PricingModel;
  unitEconomics: UnitEconomics;
  launchPhases: LaunchPhase[];
  status: "DRAFT" | "READY" | "APPROVED";
}

export interface ContentIdea {
  id: string;
  title: string;
  hook: string;
  format: "Reel" | "Carousel" | "Story" | "UGC" | "Founder" | "Educational" | "Trend";
  platform: "Instagram" | "YouTube" | "TikTok" | "Twitter" | "LinkedIn";
  funnelStage: "Awareness" | "Consideration" | "Conversion" | "Retention";
  cta: string;
  status: "IDEA" | "IN_PROGRESS" | "READY" | "PUBLISHED";
}

export interface Trend {
  id: string;
  name: string;
  platform: string;
  momentum: "HIGH" | "MEDIUM" | "LOW";
  brandFit: number;
  risk: "HIGH" | "MEDIUM" | "LOW";
  category: "TRENDING" | "EMERGING" | "EVERGREEN" | "NOT_RECOMMENDED";
  adaptation: string;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: string;
  category: string;
  audience: number;
  engagement: number;
  estimatedCost: number;
  brandFit: number;
  status: "IDENTIFIED" | "SHORTLISTED" | "CONTACTED" | "CONFIRMED";
  whyFit: string;
  campaignIdea: string;
}

export interface PricingModel {
  sellingPrice: number;
  cogs: number;
  packaging: number;
  shipping: number;
  paymentFee: number;
  cac: number;
  returns: number;
  otherCosts: number;
}

export interface UnitEconomics {
  grossMargin: number;
  contributionMargin: number;
  breakEven: number;
  profitPerOrder: number;
  requiredOrders: number;
}

export interface LaunchPhase {
  id: string;
  name: string;
  description: string;
  startWeek: number;
  endWeek: number;
  tasks: Task[];
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  owner: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dependency?: string;
  status: "BACKLOG" | "PLANNED" | "IN_PROGRESS" | "REVIEW" | "DONE";
  impact?: string;
  department: "PRODUCT" | "GROWTH" | "OPERATIONS" | "CEO";
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  madeBy: string;
  reason: string;
  confidence: number;
  impact: "HIGH" | "MEDIUM" | "LOW";
  reversible: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  agentId?: string;
  agentName?: string;
  content: string;
  timestamp: string;
}

export interface BusinessBrain {
  project: Project | null;
  brand: BrandArtifact | null;
  product: ProductArtifact | null;
  growth: GrowthArtifact | null;
  operations: OperationsArtifact | null;
  agents: Agent[];
  activity: ActivityItem[];
  tasks: Task[];
  decisions: Decision[];
  messages: Message[];
  buildProgress: number;
  currentBuildStep: string;
}
