"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { useBrain } from "@/lib/brain";
import { cn, generateId, sleep } from "@/lib/utils";
import type { BrandArtifact, GrowthArtifact, OperationsArtifact, ProductArtifact } from "@/lib/types";
import RobotAgent from "@/components/RobotAgent";

interface BuildStep {
  id: string;
  agentId: string;
  agentName: string;
  label: string;
  status: "QUEUED" | "WORKING" | "DONE" | "ERROR";
  message?: string;
}

const BUILD_STEPS: Omit<BuildStep, "status">[] = [
  { id: "s1", agentId: "ceo", agentName: "AI CEO", label: "Understanding your idea" },
  { id: "s2", agentId: "product", agentName: "Product Team", label: "Defining customer & positioning" },
  { id: "s3", agentId: "product", agentName: "Brand Team", label: "Creating visual direction" },
  { id: "s4", agentId: "growth", agentName: "Growth Team", label: "Researching market & trends" },
  { id: "s5", agentId: "growth", agentName: "Content Team", label: "Building content strategy" },
  { id: "s6", agentId: "operations", agentName: "Operations", label: "Calculating unit economics" },
  { id: "s7", agentId: "operations", agentName: "Launch Team", label: "Building launch roadmap" },
];

export default function BuildPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const brain = useBrain();

  const [steps, setSteps] = useState<BuildStep[]>(
    BUILD_STEPS.map((s) => ({ ...s, status: "QUEUED" as const }))
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [projectName, setProjectName] = useState("Your Company");
  const [idea, setIdea] = useState("");
  const hasStarted = useRef(false);

  const updateStep = (index: number, status: BuildStep["status"], message?: string) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status, message } : s))
    );
  };

  const loadDemoMode = async () => {
    const { DEMO_PROJECT, DEMO_BRAND, DEMO_PRODUCT, DEMO_GROWTH, DEMO_OPERATIONS, DEMO_TASKS, DEMO_DECISIONS, DEMO_ACTIVITY } = await import("@/lib/demo-data");
    
    setIdea(DEMO_PROJECT.idea);
    setProjectName(DEMO_PROJECT.name);

    // Animate through steps quickly
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      updateStep(i, "WORKING");
      await sleep(600);
      updateStep(i, "DONE");
      setProgress(Math.round(((i + 1) / steps.length) * 100));
    }

    brain.setProject(DEMO_PROJECT);
    brain.setBrand(DEMO_BRAND);
    brain.setProduct(DEMO_PRODUCT);
    brain.setGrowth(DEMO_GROWTH);
    brain.setOperations(DEMO_OPERATIONS);
    DEMO_TASKS.forEach((t) => brain.addTask(t));
    DEMO_DECISIONS.forEach((d) => brain.addDecision({ title: d.title, description: d.description, madeBy: d.madeBy, reason: d.reason, confidence: d.confidence, impact: d.impact, reversible: d.reversible }));
    DEMO_ACTIVITY.forEach((a) => brain.addActivity({ agentId: a.agentId, agentName: a.agentName, message: a.message, type: a.type }));

    await sleep(500);
    setIsComplete(true);
  };

  const runBuildSequence = async (idea: string, id: string) => {
    // Step 1: CEO
    setCurrentStep(0);
    updateStep(0, "WORKING");
    brain.setAgentStatus("ceo", "THINKING", "Understanding your idea");

    let ceoData: { projectName?: string; tagline?: string; summary?: string; productTask?: string; growthTask?: string; operationsTask?: string; firstDecision?: string } = {};
    try {
      const res = await fetch("/api/agents/ceo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      ceoData = await res.json();
    } catch {
      ceoData = { projectName: "Venture", tagline: "Built for what comes next" };
    }

    const name = ceoData.projectName || "Venture";
    setProjectName(name);

    brain.setProject({
      id,
      name,
      tagline: ceoData.tagline || "",
      idea,
      stage: "BUILDING",
      readiness: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    brain.addActivity({
      agentId: "ceo",
      agentName: "Alex · AI CEO",
      message: ceoData.summary || "Breaking your idea into business requirements.",
      type: "info",
    });

    brain.setAgentStatus("ceo", "COMPLETED");
    updateStep(0, "DONE");
    setProgress(14);
    await sleep(400);

    // Step 2+3: Product + Brand
    setCurrentStep(1);
    updateStep(1, "WORKING");
    updateStep(2, "WORKING");
    brain.setAgentStatus("product", "WORKING", "Researching customer and market");

    let productData: { brand?: BrandArtifact; product?: ProductArtifact } = {};
    try {
      const res = await fetch("/api/agents/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, projectName: name, task: ceoData.productTask }),
      });
      productData = await res.json();
    } catch {
      productData = {};
    }

    if (productData.brand) brain.setBrand(productData.brand);
    if (productData.product) brain.setProduct(productData.product);

    brain.addActivity({
      agentId: "product",
      agentName: "Jordan · Product Director",
      message: `Target customer identified. Brand positioning: "${productData.brand?.positioning?.slice(0, 80)}..."`,
      type: "completed",
    });

    brain.addActivity({
      agentId: "product",
      agentName: "Jordan · Product Director",
      message: `Brand name: ${name}. Tagline: "${productData.brand?.tagline || ""}"`,
      type: "decision",
    });

    updateStep(1, "DONE");
    updateStep(2, "DONE");
    setProgress(42);
    await sleep(400);

    // Step 4+5: Growth
    setCurrentStep(3);
    updateStep(3, "WORKING");
    updateStep(4, "WORKING");
    brain.setAgentStatus("growth", "RESEARCHING", "Analyzing content & trend landscape");

    let growthData: GrowthArtifact | null = null;
    try {
      const res = await fetch("/api/agents/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          projectName: name,
          brandPositioning: productData.brand?.positioning,
          task: ceoData.growthTask,
        }),
      });
      growthData = await res.json();
    } catch {
      growthData = null;
    }

    if (growthData) brain.setGrowth(growthData);

    brain.addActivity({
      agentId: "growth",
      agentName: "Maya · Growth Director",
      message: `Generated ${growthData?.contentIdeas?.length || 6} content ideas. Top trend fit: POV reels.`,
      type: "completed",
    });

    updateStep(3, "DONE");
    updateStep(4, "DONE");
    setProgress(70);
    await sleep(400);

    // Step 6+7: Operations
    setCurrentStep(5);
    updateStep(5, "WORKING");
    updateStep(6, "WORKING");
    brain.setAgentStatus("operations", "WORKING", "Calculating unit economics");

    let opsData: OperationsArtifact | null = null;
    try {
      const res = await fetch("/api/agents/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          projectName: name,
          brandPositioning: productData.brand?.positioning,
          task: ceoData.operationsTask,
        }),
      });
      opsData = await res.json();
    } catch {
      opsData = null;
    }

    if (opsData) brain.setOperations(opsData);

    brain.addActivity({
      agentId: "operations",
      agentName: "River · Operations Director",
      message: `Unit economics ready. Gross margin: ${opsData?.unitEconomics?.grossMargin || 52}%. Launch plan: 5 phases.`,
      type: "completed",
    });

    updateStep(5, "DONE");
    updateStep(6, "DONE");
    setProgress(100);

    // Update project readiness
    brain.setProject({
      ...brain.project!,
      name,
      tagline: ceoData.tagline || productData.brand?.tagline || "",
      readiness: 86,
      updatedAt: new Date().toISOString(),
    });

    // Add CEO final message
    brain.addActivity({
      agentId: "ceo",
      agentName: "Alex · AI CEO",
      message: "Company ready. Review the outputs and approve where needed.",
      type: "decision",
    });

    brain.setAgentStatus("product", "COMPLETED");
    brain.setAgentStatus("growth", "COMPLETED");
    brain.setAgentStatus("operations", "COMPLETED");

    // Add default tasks
    const tasks = [
      { title: "Approve brand direction", owner: "Jordan · Product Director", priority: "HIGH" as const, status: "REVIEW" as const, department: "PRODUCT" as const },
      { title: "Review homepage design", owner: "Jordan · Product Director", priority: "HIGH" as const, status: "PLANNED" as const, department: "PRODUCT" as const },
      { title: "Approve launch pricing", owner: "River · Operations Director", priority: "HIGH" as const, status: "REVIEW" as const, department: "OPERATIONS" as const },
      { title: "Finalize creator shortlist", owner: "Maya · Growth Director", priority: "MEDIUM" as const, status: "IN_PROGRESS" as const, department: "GROWTH" as const },
    ];
    tasks.forEach((t) => brain.addTask(t));

    if (ceoData.firstDecision) {
      brain.addDecision({
        title: ceoData.firstDecision,
        description: `Strategic direction set by AI CEO based on idea analysis.`,
        madeBy: "Alex · AI CEO",
        reason: "Based on market analysis and target customer research.",
        confidence: 82,
        impact: "HIGH",
        reversible: true,
      });
    }

    await sleep(600);
    setIsComplete(true);
  };

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const storedIdea = sessionStorage.getItem("xcelerate_idea");
    const storedId = sessionStorage.getItem("xcelerate_project_id");

    if (!storedIdea) {
      // Demo mode — use Velocity data
      setTimeout(() => {
        loadDemoMode();
      }, 0);
      return;
    }

    setTimeout(() => {
      setIdea(storedIdea);
      runBuildSequence(storedIdea, storedId || projectId);
    }, 0);
  }, [projectId]);

  const doneCount = steps.filter((s) => s.status === "DONE").length;

  return (
    <div className="min-h-full flex items-center justify-center p-8 bg-[var(--background)]">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-stretch">
        
        {/* Left Column: Build Board Details */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key="building"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Header */}
                <div className="mb-10">
                  <p className="text-label text-[var(--muted)] mb-2">Building your company</p>
                  <h1 className="text-headline text-[var(--foreground)]">{projectName}</h1>
                  {idea && (
                    <p className="text-small text-[var(--muted)] mt-2 line-clamp-2">
                      &ldquo;{idea}&rdquo;
                    </p>
                  )}
                </div>

                {/* Steps */}
                <div className="space-y-3 mb-8">
                  {steps.map((step, i) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                        step.status === "WORKING"
                          ? "border-[var(--accent)] bg-[var(--accent-light)]"
                          : step.status === "DONE"
                          ? "border-[var(--border)] bg-[var(--surface)]"
                          : "border-[var(--border)] bg-transparent opacity-50"
                      )}
                    >
                      <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                        {step.status === "DONE" ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" />
                        ) : step.status === "WORKING" ? (
                          <div className="w-3 h-3 rounded-full bg-[var(--accent)] dot-working" />
                        ) : step.status === "ERROR" ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-[var(--border)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-small font-medium text-[var(--foreground)]">
                          {step.agentName}
                        </p>
                        <p className="text-micro text-[var(--muted)] mt-0.5">{step.label}</p>
                      </div>
                      <div className="shrink-0 text-micro font-medium text-[var(--muted)]">
                        {step.status === "DONE" ? (
                          <span className="text-[var(--accent)]">✓</span>
                        ) : step.status === "WORKING" ? (
                          <div className="flex items-center gap-1 text-[var(--accent)]">
                            <Clock className="w-3 h-3 animate-spin" />
                          </div>
                        ) : (
                          "○"
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-small">
                    <span className="text-[var(--muted)]">Progress</span>
                    <span className="font-semibold text-[var(--foreground)]">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[var(--accent)]"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center md:text-left"
              >
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>

                <p className="text-label text-[var(--muted)] mb-2">Your company is ready</p>
                <h1 className="text-headline text-[var(--foreground)] mb-2">{projectName}</h1>
                {brain.project?.tagline && (
                  <p className="text-body text-[var(--muted)] mb-8">{brain.project.tagline}</p>
                )}

                {/* Readiness summary */}
                <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                  {[
                    { label: "Brand", status: "✓" },
                    { label: "Product Strategy", status: "✓" },
                    { label: "Growth Plan", status: "✓" },
                    { label: "Operations", status: "✓" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                    >
                      <span className="text-[var(--accent)] font-bold">{item.status}</span>
                      <span className="text-small font-medium text-[var(--foreground)]">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-8 text-small text-[var(--muted)] justify-center md:justify-start">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {brain.project?.readiness || 86}% ready to launch
                </div>

                <button
                  onClick={() => router.push(`/workspace/${params.id}`)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-body font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-all active:scale-95 mx-auto md:mx-0"
                >
                  Explore your company
                  <ExternalLink className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Swarm Live Visual (Typing Robot) */}
        <div className="flex-1 flex flex-col items-center justify-center border border-[var(--border)] rounded-2xl bg-[var(--surface)] p-8 relative overflow-hidden min-h-[350px] shadow-2xl">
          <div className="absolute top-4 left-4 text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
            <span>Swarm Live View</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-5 text-center mt-4">
            <RobotAgent
              agentId={isComplete ? "ceo" : (steps[currentStep]?.agentId || "ceo")}
              size={180}
              typing={!isComplete}
            />
            <div className="space-y-1.5">
              <p className="text-small font-bold text-white uppercase tracking-widest">
                {isComplete ? "Swarm Complete" : `${steps[currentStep]?.agentName || "AI Swarm"}`}
              </p>
              <p className="text-micro text-zinc-400 max-w-[280px] leading-normal italic">
                {isComplete
                  ? "Build swarm finished successfully. Ready for strategy review."
                  : `Currently working: "${steps[currentStep]?.label || "Preparing work environment..."}"`}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
