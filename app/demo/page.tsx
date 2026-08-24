"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBrain } from "@/lib/brain";

const DEMO_ID = "velocity-demo";

export default function DemoPage() {
  const router = useRouter();
  const brain = useBrain();

  useEffect(() => {
    async function loadDemo() {
      // Reset first
      brain.reset();

      const {
        DEMO_PROJECT,
        DEMO_BRAND,
        DEMO_PRODUCT,
        DEMO_GROWTH,
        DEMO_OPERATIONS,
        DEMO_TASKS,
        DEMO_DECISIONS,
        DEMO_ACTIVITY,
      } = await import("@/lib/demo-data");

      brain.setProject(DEMO_PROJECT);
      brain.setBrand(DEMO_BRAND);
      brain.setProduct(DEMO_PRODUCT);
      brain.setGrowth(DEMO_GROWTH);
      brain.setOperations(DEMO_OPERATIONS);
      DEMO_TASKS.forEach((t) => brain.addTask(t));
      DEMO_DECISIONS.forEach((d) =>
        brain.addDecision({
          title: d.title,
          description: d.description,
          madeBy: d.madeBy,
          reason: d.reason,
          confidence: d.confidence,
          impact: d.impact,
          reversible: d.reversible,
        })
      );
      DEMO_ACTIVITY.forEach((a) =>
        brain.addActivity({
          agentId: a.agentId,
          agentName: a.agentName,
          message: a.message,
          type: a.type,
        })
      );

      router.push(`/workspace/${DEMO_ID}`);
    }

    loadDemo();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center mx-auto mb-6 animate-pulse">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
        <p className="text-title font-semibold text-[var(--foreground)] mb-2">Loading Velocity</p>
        <p className="text-small text-[var(--muted)]">Your AI team is preparing the demo...</p>
      </div>
    </div>
  );
}
