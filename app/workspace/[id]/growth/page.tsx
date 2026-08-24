"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import { useBrain } from "@/lib/brain";
import type { ContentIdea, Trend, Creator } from "@/lib/types";
import { Users, TrendingUp, FileText, Compass, ExternalLink } from "lucide-react";

const TABS = ["Overview", "Content", "Trends", "Creators"] as const;
type Tab = typeof TABS[number];

const FORMAT_COLORS: Record<string, string> = {
  Reel: "#4F46E5",
  Carousel: "#10B981",
  Story: "#F59E0B",
  UGC: "#EC4899",
  Founder: "#8B5CF6",
  Educational: "#06B6D4",
  Trend: "#EF4444",
};

const STATUS_COLORS: Record<string, string> = {
  IDEA: "#9CA3AF",
  IN_PROGRESS: "#F59E0B",
  READY: "#10B981",
  PUBLISHED: "#4F46E5",
};

const MOMENTUM_COLORS: Record<string, string> = {
  HIGH: "#10B981",
  MEDIUM: "#F59E0B",
  LOW: "#9CA3AF",
};

const CREATOR_STATUS_COLORS: Record<string, string> = {
  IDENTIFIED: "#9CA3AF",
  SHORTLISTED: "#4F46E5",
  CONTACTED: "#F59E0B",
  CONFIRMED: "#10B981",
};

function HealthBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-small text-[var(--foreground)]">{label}</span>
        <span className="text-small font-semibold text-[var(--foreground)]">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-[var(--accent)]"
        />
      </div>
    </div>
  );
}

function ContentCard({ idea }: { idea: ContentIdea }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] cursor-pointer card-hover"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-small font-medium text-[var(--foreground)]">{idea.title}</p>
        <span
          className="text-label px-2 py-0.5 rounded-full shrink-0"
          style={{ background: `${FORMAT_COLORS[idea.format]}18`, color: FORMAT_COLORS[idea.format] }}
        >
          {idea.format}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-micro text-[var(--muted)]">{idea.platform}</span>
        <span className="text-micro text-[var(--muted)]">·</span>
        <span className="text-micro text-[var(--muted)]">{idea.funnelStage}</span>
        <span
          className="text-label px-1.5 py-0.5 rounded ml-auto"
          style={{ background: `${STATUS_COLORS[idea.status]}18`, color: STATUS_COLORS[idea.status] }}
        >
          {idea.status.replace("_", " ")}
        </span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
              <p className="text-micro font-semibold text-[var(--muted)]">HOOK</p>
              <p className="text-small text-[var(--foreground)] italic">&ldquo;{idea.hook}&rdquo;</p>
              <p className="text-micro font-semibold text-[var(--muted)] mt-2">CTA</p>
              <p className="text-small text-[var(--foreground)]">{idea.cta}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrendCard({ trend }: { trend: Trend }) {
  const categoryColors: Record<string, string> = {
    TRENDING: "#10B981",
    EMERGING: "#4F46E5",
    EVERGREEN: "#F59E0B",
    NOT_RECOMMENDED: "#EF4444",
  };

  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-[var(--foreground)] flex-1 pr-3">{trend.name}</h3>
        <span
          className="text-label px-2 py-0.5 rounded-full shrink-0"
          style={{ background: `${categoryColors[trend.category]}18`, color: categoryColors[trend.category] }}
        >
          {trend.category.replace("_", " ")}
        </span>
      </div>
      <p className="text-micro text-[var(--muted)] mb-3">{trend.platform}</p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-micro text-[var(--muted)] mb-1">Momentum</p>
          <p className="text-small font-semibold" style={{ color: MOMENTUM_COLORS[trend.momentum] }}>
            {trend.momentum}
          </p>
        </div>
        <div>
          <p className="text-micro text-[var(--muted)] mb-1">Brand fit</p>
          <p className="text-small font-semibold text-[var(--foreground)]">{trend.brandFit}%</p>
        </div>
        <div>
          <p className="text-micro text-[var(--muted)] mb-1">Risk</p>
          <p className="text-small font-semibold text-[var(--foreground)]">{trend.risk}</p>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
        <p className="text-micro font-semibold text-[var(--accent)] mb-1">AI recommendation</p>
        <p className="text-small text-[var(--foreground)]">{trend.adaptation}</p>
      </div>
    </div>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {creator.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[var(--foreground)]">{creator.name}</h3>
            <span className="text-micro text-[var(--muted)]">{creator.handle}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-micro text-[var(--muted)]">{creator.platform}</span>
            <span className="text-micro text-[var(--muted)]">·</span>
            <span className="text-micro text-[var(--muted)]">{creator.category}</span>
          </div>
        </div>
        <span
          className="text-label px-2 py-0.5 rounded-full shrink-0"
          style={{ background: `${CREATOR_STATUS_COLORS[creator.status]}18`, color: CREATOR_STATUS_COLORS[creator.status] }}
        >
          {creator.status}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div>
          <p className="text-micro text-[var(--muted)]">Followers</p>
          <p className="text-small font-semibold text-[var(--foreground)]">
            {creator.audience >= 1000000 ? `${(creator.audience / 1000000).toFixed(1)}M` : `${Math.round(creator.audience / 1000)}K`}
          </p>
        </div>
        <div>
          <p className="text-micro text-[var(--muted)]">Engagement</p>
          <p className="text-small font-semibold text-[var(--foreground)]">{creator.engagement}%</p>
        </div>
        <div>
          <p className="text-micro text-[var(--muted)]">Brand fit</p>
          <p className="text-small font-semibold text-green-600">{creator.brandFit}%</p>
        </div>
        <div>
          <p className="text-micro text-[var(--muted)]">Est. cost</p>
          <p className="text-small font-semibold text-[var(--foreground)]">
            {formatCurrency(creator.estimatedCost)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-micro font-semibold text-[var(--muted)] mb-1">Why they fit</p>
          <p className="text-small text-[var(--foreground)]">{creator.whyFit}</p>
        </div>
        <div>
          <p className="text-micro font-semibold text-[var(--muted)] mb-1">Campaign idea</p>
          <p className="text-small text-[var(--foreground)]">{creator.campaignIdea}</p>
        </div>
      </div>
    </div>
  );
}

export default function GrowthPage() {
  const params = useParams();
  const router = useRouter();
  const brain = useBrain();
  const growth = brain.growth;
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [contentFilter, setContentFilter] = useState<string>("All");

  const CONTENT_FORMATS = ["All", "Reel", "Carousel", "Story", "UGC", "Founder", "Educational", "Trend"];

  const filteredContent = growth?.contentIdeas.filter(
    (c) => contentFilter === "All" || c.format === contentFilter
  ) || [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-label text-[var(--muted)] mb-2">Growth Studio</p>
        <h1 className="text-headline text-[var(--foreground)]">Growth</h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--background)] border border-[var(--border)] mb-8 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-small font-medium transition-all ${
              activeTab === tab
                ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm border border-[var(--border)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab === "Content" && <FileText className="w-3.5 h-3.5" />}
            {tab === "Trends" && <Compass className="w-3.5 h-3.5" />}
            {tab === "Creators" && <Users className="w-3.5 h-3.5" />}
            {tab === "Overview" && <TrendingUp className="w-3.5 h-3.5" />}
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "Overview" && (
            <div className="grid grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <h2 className="font-semibold text-[var(--foreground)] mb-6">Growth Health</h2>
                <div className="space-y-5">
                  <HealthBar label="Awareness" value={45} />
                  <HealthBar label="Content" value={75} />
                  <HealthBar label="Creators" value={60} />
                  <HealthBar label="Paid" value={20} />
                </div>
              </div>
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <h2 className="font-semibold text-[var(--foreground)] mb-4">Strategy</h2>
                <p className="text-small text-[var(--muted)] leading-relaxed mb-5">
                  {growth?.contentStrategy || "Creator-first content marketing. 80% organic, 20% paid."}
                </p>
                <div>
                  <p className="text-label text-[var(--muted)] mb-3">Channels</p>
                  <div className="flex flex-wrap gap-2">
                    {(growth?.channels || ["Instagram", "YouTube", "WhatsApp", "Email"]).map((ch) => (
                      <span
                        key={ch}
                        className="px-2.5 py-1 text-small font-medium rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-2 grid grid-cols-3 gap-4">
                {[
                  { label: "Content ideas", value: growth?.contentIdeas.length || 6, sub: "generated" },
                  { label: "Creators", value: growth?.creators.length || 4, sub: "identified" },
                  { label: "Trends", value: growth?.trends.filter(t => t.category !== "NOT_RECOMMENDED").length || 3, sub: "to use" },
                ].map((stat) => (
                  <div key={stat.label} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center">
                    <p className="text-3xl font-bold text-[var(--foreground)]">{stat.value}</p>
                    <p className="text-small text-[var(--muted)] mt-1">{stat.label} {stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Content" && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex gap-2 flex-wrap">
                {CONTENT_FORMATS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setContentFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-small font-medium transition-all",
                      contentFilter === f
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {filteredContent.map((idea) => (
                  <ContentCard key={idea.id} idea={idea} />
                ))}
              </div>

              {filteredContent.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-body text-[var(--muted)]">
                    No content in this format yet.
                  </p>
                  <button className="mt-3 text-small text-[var(--accent)] hover:underline">
                    Ask Growth to generate more
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "Trends" && (
            <div className="grid grid-cols-2 gap-4">
              {(growth?.trends || []).map((trend) => (
                <TrendCard key={trend.id} trend={trend} />
              ))}
              {(!growth?.trends || growth.trends.length === 0) && (
                <div className="col-span-2 text-center py-12">
                  <p className="text-body text-[var(--muted)]">Trend research is being generated...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Creators" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-small text-[var(--muted)]">
                  {growth?.creators.length || 0} creators identified
                </p>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-small font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity">
                  <Users className="w-3.5 h-3.5" />
                  Find more creators
                </button>
              </div>

              {(growth?.creators || []).map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}

              {(!growth?.creators || growth.creators.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-body text-[var(--muted)]">Creator research is being generated...</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
