"use client";

import { motion } from "framer-motion";
import { useBrain } from "@/lib/brain";
import { getAgentStatusColor, getAgentStatusLabel } from "@/lib/utils";
import RobotAgent from "@/components/RobotAgent";

export default function TeamPage() {
  const brain = useBrain();

  const DEPT_INFO = {
    CEO: { color: "#4F46E5", label: "CEO Office", subroles: ["Orchestration", "Strategy", "Decisions"] },
    PRODUCT: { color: "#10B981", label: "Product", subroles: ["Research", "Brand", "UX", "UI", "Website", "CRO"] },
    GROWTH: { color: "#F59E0B", label: "Growth", subroles: ["Content", "Social", "Creators", "Ads", "SEO", "PR"] },
    OPERATIONS: { color: "#EC4899", label: "Operations", subroles: ["Finance", "Pricing", "Analytics", "Automation"] },
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-label text-[var(--muted)] mb-2">Your Company</p>
        <h1 className="text-headline text-[var(--foreground)]">AI Team</h1>
        <p className="text-body text-[var(--muted)] mt-2">
          Your team works around the clock. They research, plan, build, and iterate — you approve and direct.
        </p>
      </motion.div>

      <div className="space-y-5">
        {brain.agents.map((agent, i) => {
          const dept = DEPT_INFO[agent.department];
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  <RobotAgent agentId={agent.id} size={64} typing={agent.status === "WORKING" || agent.status === "RESEARCHING" || agent.status === "THINKING"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-title text-[var(--foreground)]">{agent.name}</h2>
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label"
                      style={{ background: `${getAgentStatusColor(agent.status)}18`, color: getAgentStatusColor(agent.status) }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: getAgentStatusColor(agent.status) }}
                      />
                      {getAgentStatusLabel(agent.status)}
                    </div>
                  </div>
                  <p className="text-small text-[var(--muted)] mb-3">{agent.role}</p>

                  {agent.currentTask && (
                    <p className="text-small text-[var(--foreground)] italic mb-3">
                      &ldquo;{agent.currentTask}&rdquo;
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {dept.subroles.map((sr) => (
                      <span
                        key={sr}
                        className="text-label px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--muted)]"
                      >
                        {sr}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-[var(--foreground)]">{agent.completedTasks}</p>
                  <p className="text-micro text-[var(--muted)]">tasks done</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
