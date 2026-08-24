"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Palette,
  TrendingUp,
  Settings,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Users,
  Compass,
  FileText,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Send,
  HelpCircle
} from "lucide-react";
import { useBrain } from "@/lib/brain";
import { cn, formatCurrency } from "@/lib/utils";
import { runGlobalSyncSequence } from "@/lib/services";
import RobotAgent from "@/components/RobotAgent";

// Tickers for active agent progress
const TICKERS: Record<string, string[]> = {
  ceo: [
    "Evaluating market constraints...",
    "Routing requirements to specialists...",
    "Checking consistency thresholds...",
    "Reviewing department output..."
  ],
  product: [
    "Comparing competitor running shoes...",
    "Analyzing premium design grids...",
    "Refining custom homepage styles...",
    "Mapping target customer user personas..."
  ],
  growth: [
    "Scoping high-engagement tags on Reels...",
    "Evaluating design curators engagement ratios...",
    "Drafting hook lines for launch video...",
    "Analyzing Pinterest organic search volume..."
  ],
  operations: [
    "Simulating price elasticity scenarios...",
    "Testing variable packing box rates...",
    "Verifying payment gateway commissions...",
    "Checking profit contribution percentages..."
  ]
};

export default function OverviewPage() {
  const params = useParams();
  const router = useRouter();
  const brain = useBrain();
  const projectId = params.id as string;

  const [activeArtifact, setActiveArtifact] = useState<"brand" | "product" | "growth" | "operations" | null>(null);
  const [artifactFeedback, setArtifactFeedback] = useState("");
  const [tickerIndex, setTickerIndex] = useState(0);

  // Cycle tickers every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((idx) => (idx + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const project = brain.project;
  const brand = brain.brand;
  const operations = brain.operations;
  const product = brain.product;
  const growth = brain.growth;
  const tasks = brain.tasks;

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--border)] skeleton mx-auto mb-4" />
          <p className="text-body text-[var(--muted)] animate-pulse">Loading project workspace...</p>
        </div>
      </div>
    );
  }

  // Filter tasks that need review/approval
  const pendingTasks = tasks.filter((t) => t.status === "REVIEW");

  // Handle artifact-specific feedback submission
  const handleArtifactFeedback = async () => {
    if (!artifactFeedback.trim() || brain.agents.some(a => a.status === "WORKING")) return;
    
    const text = artifactFeedback;
    setArtifactFeedback("");
    
    // Simulate updating brand / product
    await runGlobalSyncSequence(text, brain, () => {});
  };

  return (
    <div className="relative min-h-full bg-[var(--background)]">
      <AnimatePresence mode="wait">
        {!activeArtifact ? (
          <motion.div
            key="canvas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 max-w-5xl mx-auto grid grid-cols-3 gap-8"
          >
            {/* ── Main Canvas (Col 1 & 2) ── */}
            <div className="col-span-2 space-y-6">
              {/* Header Title */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-label text-[var(--muted)] mb-1">Company Workspace</p>
                  <h1 className="text-headline text-[var(--foreground)] tracking-tight">BUILDING YOUR COMPANY</h1>
                  <p className="text-small text-[var(--muted)] mt-1">Watching live collaborations across departments.</p>
                </div>
              </div>

              {/* CEO Next Actions Recommendations (Section 33) */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="font-bold text-[var(--foreground)] text-small">What should you do next?</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: "Approve brand positioning", desc: "Review visual direction v2", action: () => setActiveArtifact("brand") },
                    { title: "Review homepage layout", desc: "Open live website preview", action: () => router.push(`/workspace/${projectId}/product?tab=Website`) },
                    { title: "Approve launch pricing", desc: "Check contribution margin specs", action: () => router.push(`/workspace/${projectId}/operations?tab=Pricing`) },
                    { title: "Begin creator outreach", desc: "Outreach templates ready", action: () => router.push(`/workspace/${projectId}/growth?tab=Creators`) }
                  ].map((rec, idx) => (
                    <div
                      key={idx}
                      onClick={rec.action}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)] cursor-pointer group transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-small font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">{rec.title}</p>
                        <p className="text-micro text-[var(--muted)] truncate mt-0.5">{rec.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] transition-all group-hover:translate-x-0.5 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Live Activity Feed */}
              <div className="space-y-4">
                <h3 className="text-label text-[var(--muted)] tracking-wider">Live Workspace Activity</h3>

                {/* Active Agent Working Cards (Section 12) */}
                {brain.agents.map((agent) => {
                  if (agent.status === "IDLE" || agent.status === "COMPLETED") return null;

                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-5 rounded-2xl border border-[var(--accent)] bg-[var(--accent-light)] shadow-sm space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
                            <RobotAgent agentId={agent.id} size={44} headOnly={true} />
                          </div>
                          <div>
                            <h4 className="text-small font-bold text-[var(--foreground)]">
                              {agent.name.toUpperCase()} · <span className="text-[var(--accent)]">{agent.role.toUpperCase()}</span>
                            </h4>
                            <div className="flex items-center gap-1.5 text-micro text-[var(--muted)] mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                              <span>{agent.status.toLowerCase()}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-micro text-[var(--accent)] font-semibold px-2 py-0.5 rounded bg-indigo-100 uppercase tracking-widest">
                          Working
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-micro">
                          <span className="text-[var(--muted)]">Current task:</span>
                          <span className="font-semibold text-[var(--foreground)]">{agent.currentTask || "Analyzing requirements"}</span>
                        </div>

                        {/* Progress Indicator Blocks (■■■■■■■□□□) */}
                        <div className="flex justify-between items-center text-micro">
                          <span className="text-[var(--muted)]">Progress:</span>
                          <span className="font-mono text-[var(--accent)] tracking-wider">
                            {"■".repeat(6) + "□".repeat(4)}
                          </span>
                        </div>

                        {/* Rotating Tickers */}
                        <p className="text-small text-[var(--foreground)] italic pl-2 border-l-2 border-[var(--accent)] py-0.5 bg-indigo-50/50 rounded-r">
                          &ldquo;{TICKERS[agent.id]?.[tickerIndex] || "Calculating business details..."}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-micro text-[var(--muted)] border-t border-indigo-100 pt-3">
                        <span>Sources analyzed: <strong className="text-[var(--foreground)]">14</strong></span>
                        <span>Decisions registered: <strong className="text-[var(--foreground)]">4</strong></span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Handoff Animation Indicator (Section 20) */}
                {brain.agents.some(a => a.status === "WORKING") && (
                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-dashed border-[var(--border)] bg-[var(--surface)] text-micro text-[var(--muted)]">
                      <span>CEO</span>
                      <ChevronRight className="w-3 h-3 text-[var(--accent)] animate-pulse" />
                      <span className="font-semibold text-[var(--accent)]">Product</span>
                      <ChevronRight className="w-3 h-3 text-[var(--muted)]" />
                      <span>Operations</span>
                    </div>
                  </div>
                )}

                {/* Artifact Cards inside Feed (Section 17) */}
                {brand && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
                      <div>
                        <span className="text-label text-[var(--muted)] font-bold">Brand Artifact</span>
                        <h4 className="text-title text-[var(--foreground)] font-bold mt-1">Brand Strategy</h4>
                      </div>
                      <span className="text-micro bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                        {brand.status}
                      </span>
                    </div>
                    <p className="text-small text-[var(--muted)] leading-relaxed">
                      &ldquo;{brand.positioning}&rdquo;
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {brand.personality.map((trait) => (
                        <span key={trait} className="text-micro px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] font-medium">
                          {trait}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                      <span className="text-micro text-[var(--muted)]">Generated by Brand Team</span>
                      <button
                        onClick={() => setActiveArtifact("brand")}
                        className="flex items-center gap-1 text-small font-semibold text-[var(--accent)] hover:underline"
                      >
                        Open strategy
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {product && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
                      <div>
                        <span className="text-label text-[var(--muted)] font-bold">Product Artifact</span>
                        <h4 className="text-title text-[var(--foreground)] font-bold mt-1">Product Blueprint</h4>
                      </div>
                      <span className="text-micro bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                        {product.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-micro font-semibold text-[var(--muted)]">VALUE PROP</p>
                      <p className="text-small text-[var(--foreground)] leading-relaxed">
                        {product.valueProp}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                      <span className="text-micro text-[var(--muted)]">Generated by Product Team</span>
                      <button
                        onClick={() => setActiveArtifact("product")}
                        className="flex items-center gap-1 text-small font-semibold text-[var(--accent)] hover:underline"
                      >
                        Open strategy
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {operations && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
                      <div>
                        <span className="text-label text-[var(--muted)] font-bold">Operations Artifact</span>
                        <h4 className="text-title text-[var(--foreground)] font-bold mt-1">Unit Economics</h4>
                      </div>
                      <span className="text-micro bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                        {operations.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2.5 rounded bg-[var(--background)] border border-[var(--border)] text-center">
                        <p className="text-micro text-[var(--muted)]">Retail Price</p>
                        <p className="font-semibold text-small text-[var(--foreground)] mt-0.5">
                          {formatCurrency(operations.pricing.sellingPrice)}
                        </p>
                      </div>
                      <div className="p-2.5 rounded bg-[var(--background)] border border-[var(--border)] text-center">
                        <p className="text-micro text-[var(--muted)]">Gross Margin</p>
                        <p className="font-semibold text-small text-green-600 mt-0.5">
                          {operations.unitEconomics.grossMargin}%
                        </p>
                      </div>
                      <div className="p-2.5 rounded bg-[var(--background)] border border-[var(--border)] text-center">
                        <p className="text-micro text-[var(--muted)]">Contribution</p>
                        <p className="font-semibold text-small text-[var(--foreground)] mt-0.5">
                          {operations.unitEconomics.contributionMargin}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                      <span className="text-micro text-[var(--muted)]">Generated by Operations Team</span>
                      <button
                        onClick={() => setActiveArtifact("operations")}
                        className="flex items-center gap-1 text-small font-semibold text-[var(--accent)] hover:underline"
                      >
                        Open economics
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {growth && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
                      <div>
                        <span className="text-label text-[var(--muted)] font-bold">Growth Artifact</span>
                        <h4 className="text-title text-[var(--foreground)] font-bold mt-1">Growth & Content Strategy</h4>
                      </div>
                      <span className="text-micro bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                        {growth.status}
                      </span>
                    </div>
                    <p className="text-small text-[var(--muted)] leading-relaxed">
                      {growth.contentStrategy}
                    </p>
                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                      <span className="text-micro text-[var(--muted)]">Generated by Growth Team</span>
                      <button
                        onClick={() => setActiveArtifact("growth")}
                        className="flex items-center gap-1 text-small font-semibold text-[var(--accent)] hover:underline"
                      >
                        Open campaign
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Activity Feed log entries */}
                <div className="space-y-3 pt-4">
                  {brain.activity.slice(0, 8).map((act) => (
                    <div key={act.id} className="flex gap-3 items-start text-small border-b border-[var(--border)] pb-2 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-2" />
                      <div className="flex-1">
                        <span className="font-semibold text-[var(--foreground)] mr-1.5">{act.agentName}</span>
                        <span className="text-[var(--muted)]">{act.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right Column: Company Brain & Live Stats ── */}
            <div className="space-y-6">
              {/* Company Brain panel (Section 21) */}
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <h3 className="font-bold text-[var(--foreground)] text-small">COMPANY BRAIN</h3>
                  <span className="text-micro text-[var(--muted)]">Active context</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-micro font-semibold uppercase tracking-wider text-[var(--muted)]">Customer</span>
                    <p className="text-small text-[var(--foreground)] font-medium mt-1">
                      {brand?.targetCustomer ? brand.targetCustomer.slice(0, 75) + "..." : "18–28 urban runners"}
                    </p>
                  </div>
                  <div>
                    <span className="text-micro font-semibold uppercase tracking-wider text-[var(--muted)]">Positioning</span>
                    <p className="text-small text-[var(--foreground)] font-medium mt-1 leading-relaxed">
                      {brand?.positioning ? brand.positioning.slice(0, 90) + "..." : "Premium performance × lifestyle"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-micro font-semibold uppercase tracking-wider text-[var(--muted)]">Price Point</span>
                      <p className="text-small font-bold text-[var(--foreground)] mt-1">
                        {operations ? formatCurrency(operations.pricing.sellingPrice) : "₹4,999"}
                      </p>
                    </div>
                    <div>
                      <span className="text-micro font-semibold uppercase tracking-wider text-[var(--muted)]">Brand Tone</span>
                      <p className="text-small text-[var(--foreground)] font-medium mt-1 truncate">
                        {brand ? brand.personality.slice(0, 3).join(" / ") : "Minimal / Confident"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-micro font-semibold uppercase tracking-wider text-[var(--muted)]">Current Goal</span>
                    <p className="text-small text-[var(--foreground)] font-medium mt-1">
                      Launch first 100 orders & seed creators.
                    </p>
                  </div>
                </div>

                <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between">
                  <button
                    onClick={() => router.push(`/workspace/${projectId}/decisions`)}
                    className="text-micro font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                  >
                    View decisions log
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Build board indicator widget (Section 23) */}
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-4">
                <h3 className="font-bold text-[var(--foreground)] text-small border-b border-[var(--border)] pb-3">COMPANY BUILD</h3>
                <div className="space-y-3.5">
                  {[
                    { dept: "PRODUCT", progress: product ? 100 : 0 },
                    { dept: "BRAND", progress: brand ? 100 : 0 },
                    { dept: "GROWTH", progress: growth ? 90 : 0 },
                    { dept: "OPERATIONS", progress: operations ? 80 : 0 }
                  ].map((b) => (
                    <div key={b.dept} className="space-y-1.5">
                      <div className="flex justify-between text-micro font-medium">
                        <span className="text-[var(--muted)]">{b.dept}</span>
                        <span className="text-[var(--foreground)]">{b.progress}%</span>
                      </div>
                      <div className="h-1 bg-[var(--background)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                          style={{ width: `${b.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System approvals system widget (Section 34) */}
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-4">
                <h3 className="font-bold text-[var(--foreground)] text-small border-b border-[var(--border)] pb-3">PENDING APPROVALS</h3>
                {pendingTasks.length > 0 ? (
                  <div className="space-y-3">
                    {pendingTasks.map((t) => (
                      <div key={t.id} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-small font-semibold text-[var(--foreground)]">{t.title}</p>
                            {t.impact && <p className="text-micro text-[var(--muted)] mt-0.5">{t.impact}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => brain.updateTask(t.id, { status: "DONE" })}
                            className="px-2.5 py-1 text-micro font-bold bg-[var(--accent)] text-white rounded hover:opacity-90 transition-opacity"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-micro text-[var(--muted)]">All strategic decisions approved!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Artifact Document Focused Viewer Overlay (Section 18) ── */
          <motion.div
            key="artifact-viewer"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="p-8 max-w-3xl mx-auto space-y-6"
          >
            {/* Back button */}
            <button
              onClick={() => setActiveArtifact(null)}
              className="flex items-center gap-2 text-small font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Live Workspace
            </button>

            {/* Artifact details box */}
            <div className="border border-[var(--border)] rounded-2xl bg-[var(--surface)] shadow-md overflow-hidden">
              {/* Document Header */}
              <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--background)] flex items-start justify-between">
                <div>
                  <span className="text-label text-[var(--muted)]">
                    {activeArtifact === "brand" ? "Brand Identity v2" :
                     activeArtifact === "product" ? "Product Blueprint v1" :
                     activeArtifact === "growth" ? "Marketing Strategy v1" : "Economics Model v2"}
                  </span>
                  <h2 className="text-headline text-[var(--foreground)] font-bold mt-1 uppercase tracking-tight">
                    {activeArtifact === "brand" ? "Brand Strategy" :
                     activeArtifact === "product" ? "Product Specifications" :
                     activeArtifact === "growth" ? "Content & Creators Plan" : "Financial Unit Economics"}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-micro px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-200 font-semibold uppercase">
                    Approved
                  </span>
                  <p className="text-micro text-[var(--muted)] mt-1.5">Created by {activeArtifact === "brand" ? "Brand Team" : activeArtifact === "product" ? "Product Team" : activeArtifact === "growth" ? "Growth Team" : "Operations Team"}</p>
                </div>
              </div>

              {/* Document Content */}
              <div className="p-8 space-y-6">
                {activeArtifact === "brand" && brand && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-label text-[var(--muted)]">Core Positioning</h4>
                      <blockquote className="text-title text-[var(--foreground)] font-medium leading-relaxed border-l-4 border-[var(--accent)] pl-4 italic">
                        &ldquo;{brand.positioning}&rdquo;
                      </blockquote>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <h5 className="text-micro font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">Display Colors</h5>
                        <div className="flex gap-2">
                          {Object.entries(brand.colors).map(([key, val]) => (
                            <div key={key} className="flex flex-col items-center gap-1 flex-1">
                              <div className="w-8 h-8 rounded-lg border border-[var(--border)]" style={{ background: val }} />
                              <span className="text-[10px] font-mono text-[var(--muted)] uppercase">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <h5 className="text-micro font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">Typography & Voice</h5>
                        <p className="text-small text-[var(--foreground)]">Display: <strong>{brand.typography.display}</strong></p>
                        <p className="text-small text-[var(--foreground)] mt-1">Body: <strong>{brand.typography.body}</strong></p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-label text-[var(--muted)]">Target Customer Profile</h4>
                      <p className="text-small text-[var(--foreground)] leading-relaxed">{brand.targetCustomer}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-label text-[var(--muted)] font-bold">Content Tone Guidelines</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {brand.voice.map((v, i) => (
                          <div key={i} className="flex items-center gap-2 text-small text-[var(--foreground)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                            {v}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeArtifact === "product" && product && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-label text-[var(--muted)]">Product Definition</h4>
                      <p className="text-body text-[var(--foreground)] font-medium leading-relaxed">{product.definition}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-label text-[var(--muted)]">Value Proposition</h4>
                      <p className="text-small text-[var(--foreground)] leading-relaxed">{product.valueProp}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <h5 className="text-micro font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">MVP Features (Launch)</h5>
                        <ul className="space-y-1.5">
                          {product.mvpFeatures.map((f, i) => (
                            <li key={i} className="text-small text-[var(--foreground)] flex items-center gap-2">
                              <span className="text-[var(--accent)] font-bold">✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <h5 className="text-micro font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">Post-Launch Roadmap V2</h5>
                        <ul className="space-y-1.5">
                          {product.v2Features.map((f, i) => (
                            <li key={i} className="text-small text-[var(--muted)] flex items-center gap-2">
                              <span className="text-[var(--border)] font-bold">•</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeArtifact === "growth" && growth && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-label text-[var(--muted)]">Content Marketing Strategy</h4>
                      <p className="text-body text-[var(--foreground)] font-medium leading-relaxed">{growth.contentStrategy}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-label text-[var(--muted)]">Content Engine Calendar Drafts</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {growth.contentIdeas.map((idea) => (
                          <div key={idea.id} className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                            <div className="flex justify-between items-center text-micro mb-1">
                              <span className="font-bold text-[var(--accent)]">{idea.format}</span>
                              <span className="text-[var(--muted)]">{idea.platform}</span>
                            </div>
                            <p className="text-small font-semibold text-[var(--foreground)]">{idea.title}</p>
                            <p className="text-micro text-[var(--muted)] mt-1.5 font-mono italic">Hook: &ldquo;{idea.hook}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-label text-[var(--muted)]">Identified Gen Z Influencers</h4>
                      <div className="space-y-2">
                        {growth.creators.map((c) => (
                          <div key={c.id} className="flex justify-between items-center p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                            <div>
                              <span className="text-small font-bold text-[var(--foreground)]">{c.name}</span>
                              <span className="text-micro text-[var(--muted)] ml-2">{c.handle} · {c.category}</span>
                            </div>
                            <span className="text-micro font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              {c.brandFit}% fit
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeArtifact === "operations" && operations && (
                  <div className="space-y-6">
                    <h4 className="text-label text-[var(--muted)]">Launch Unit Economics Overview</h4>
                    
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <span className="text-micro text-[var(--muted)]">Selling Price</span>
                        <p className="text-title font-bold text-[var(--foreground)] mt-1">{formatCurrency(operations.pricing.sellingPrice)}</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <span className="text-micro text-[var(--muted)]">Gross Margin</span>
                        <p className="text-title font-bold text-green-600 mt-1">{operations.unitEconomics.grossMargin}%</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <span className="text-micro text-[var(--muted)]">CM Profit</span>
                        <p className="text-title font-bold text-green-600 mt-1">{operations.unitEconomics.contributionMargin}%</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <span className="text-micro text-[var(--muted)]">Break-Even</span>
                        <p className="text-title font-bold text-[var(--foreground)] mt-1">{operations.unitEconomics.breakEven} ord</p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                      <h4 className="text-small font-bold text-[var(--foreground)] mb-3">Cost Breakdown Analysis</h4>
                      <div className="space-y-2 text-small">
                        <div className="flex justify-between pb-1 border-b border-[var(--border)]">
                          <span className="text-[var(--muted)]">Cost of Goods (COGS)</span>
                          <span className="text-[var(--foreground)]">{formatCurrency(operations.pricing.cogs)}</span>
                        </div>
                        <div className="flex justify-between pb-1 border-b border-[var(--border)]">
                          <span className="text-[var(--muted)]">Custom Slate Packaging</span>
                          <span className="text-[var(--foreground)]">{formatCurrency(operations.pricing.packaging)}</span>
                        </div>
                        <div className="flex justify-between pb-1 border-b border-[var(--border)]">
                          <span className="text-[var(--muted)]">Shipping (DTC Courier)</span>
                          <span className="text-[var(--foreground)]">{formatCurrency(operations.pricing.shipping)}</span>
                        </div>
                        <div className="flex justify-between pb-1 border-b border-[var(--border)]">
                          <span className="text-[var(--muted)]">Marketing CAC (Creator overhead)</span>
                          <span className="text-[var(--foreground)]">{formatCurrency(operations.pricing.cac)}</span>
                        </div>
                        <div className="flex justify-between pt-1 font-bold">
                          <span className="text-[var(--foreground)]">Total Variable Cost</span>
                          <span className="text-red-600">
                            {formatCurrency(
                              operations.pricing.cogs +
                              operations.pricing.packaging +
                              operations.pricing.shipping +
                              operations.pricing.cac
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Document Footer: Ask AI to change this (Section 18 & 19) */}
              <div className="px-8 py-5 border-t border-[var(--border)] bg-[var(--background)] space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <h4 className="font-bold text-[var(--foreground)] text-small">Ask your AI team to modify this artifact</h4>
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={artifactFeedback}
                    onChange={(e) => setArtifactFeedback(e.target.value)}
                    rows={2}
                    placeholder={`e.g. "Make the brand tone more energetic", "increase pricing to ₹5,499", "add eco-friendly features"...`}
                    className="flex-1 resize-none bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-small text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    onClick={handleArtifactFeedback}
                    disabled={!artifactFeedback.trim() || brain.agents.some(a => a.status === "WORKING")}
                    className="w-10 h-10 shrink-0 bg-[var(--accent)] text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-all active:scale-95 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
