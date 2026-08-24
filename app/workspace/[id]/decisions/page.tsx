"use client";

import { motion } from "framer-motion";
import { useBrain } from "@/lib/brain";
import { ArrowUpRight, AlertCircle } from "lucide-react";

const IMPACT_COLORS: Record<string, string> = {
  HIGH: "#EF4444",
  MEDIUM: "#F59E0B",
  LOW: "#10B981",
};

const CONFIDENCE_COLORS = (v: number) =>
  v >= 80 ? "#10B981" : v >= 60 ? "#F59E0B" : "#EF4444";

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function DecisionsPage() {
  const brain = useBrain();
  const decisions = brain.decisions;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-label text-[var(--muted)] mb-2">Decision Log</p>
        <div className="flex items-end justify-between">
          <h1 className="text-headline text-[var(--foreground)]">Decisions</h1>
          <p className="text-small text-[var(--muted)]">{decisions.length} logged</p>
        </div>
      </motion.div>

      {decisions.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 rounded-2xl bg-[var(--border)] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-[var(--muted)]" />
          </div>
          <h2 className="text-title text-[var(--foreground)] mb-2">No decisions yet</h2>
          <p className="text-small text-[var(--muted)]">
            As your AI team works, important decisions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((decision, i) => (
            <motion.div
              key={decision.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-label px-2 py-0.5 rounded-full"
                      style={{
                        background: `${IMPACT_COLORS[decision.impact]}15`,
                        color: IMPACT_COLORS[decision.impact],
                      }}
                    >
                      {decision.impact} impact
                    </span>
                    {decision.reversible && (
                      <span className="text-label px-2 py-0.5 rounded-full bg-[var(--background)] text-[var(--muted)] border border-[var(--border)]">
                        Reversible
                      </span>
                    )}
                  </div>
                  <h2 className="text-title text-[var(--foreground)]">{decision.title}</h2>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: CONFIDENCE_COLORS(decision.confidence) }}
                  >
                    {decision.confidence}%
                  </div>
                  <div className="text-micro text-[var(--muted)]">confidence</div>
                </div>
              </div>

              <p className="text-small text-[var(--muted)] mb-4">{decision.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-micro font-semibold text-[var(--muted)] mb-1.5">Made by</p>
                  <p className="text-small text-[var(--foreground)]">{decision.madeBy}</p>
                </div>
                <div>
                  <p className="text-micro font-semibold text-[var(--muted)] mb-1.5">When</p>
                  <p className="text-small text-[var(--foreground)]">
                    {formatRelativeTime(decision.createdAt)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-micro font-semibold text-[var(--muted)] mb-1.5">Reason</p>
                  <p className="text-small text-[var(--foreground)]">{decision.reason}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-3">
                <button className="text-small text-[var(--accent)] hover:underline flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Change this decision
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
