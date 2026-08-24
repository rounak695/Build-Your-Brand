"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Type, Palette as PaletteIcon, MessageSquare, Target, Sparkles } from "lucide-react";
import { useBrain } from "@/lib/brain";

const TABS = ["Identity", "Positioning", "Colors", "Typography", "Voice", "Guidelines"] as const;
type Tab = typeof TABS[number];

export default function BrandPage() {
  const brain = useBrain();
  const brand = brain.brand;
  const [activeTab, setActiveTab] = useState<Tab>("Identity");

  if (!brand) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--border)] skeleton mx-auto mb-4" />
          <p className="text-body text-[var(--muted)]">Brand is being created...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-label text-[var(--muted)] mb-2">Brand Studio</p>
        <div className="flex items-end gap-4">
          <div>
            <h1 className="text-headline text-[var(--foreground)]">{brand.name}</h1>
            <p className="text-title text-[var(--muted)] mt-1 italic">&ldquo;{brand.tagline}&rdquo;</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-label px-2.5 py-1 rounded-full bg-green-50 text-green-700">
              {brand.status}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--background)] border border-[var(--border)] mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-small font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm border border-[var(--border)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "Identity" && (
          <div className="space-y-6">
            {/* Brand hero card */}
            <div
              className="relative h-48 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${brand.colors.primary} 0%, ${brand.colors.accent} 100%)` }}
            >
              <div className="text-center text-white">
                <h2 className="font-bold tracking-widest text-4xl">{brand.name.toUpperCase()}</h2>
                <p className="mt-2 opacity-70 text-lg">{brand.tagline}</p>
              </div>
            </div>

            {/* Target customer */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="font-semibold text-[var(--foreground)]">Target Customer</h3>
              </div>
              <p className="text-body text-[var(--muted)]">{brand.targetCustomer}</p>
            </div>

            {/* Brand personality */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="font-semibold text-[var(--foreground)]">Brand Personality</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {brand.personality.map((trait) => (
                  <span
                    key={trait}
                    className="px-3 py-1.5 text-small font-medium rounded-full border border-[var(--border)] text-[var(--foreground)]"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Positioning" && (
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="font-semibold text-[var(--foreground)]">Brand Positioning</h3>
            </div>
            <blockquote className="text-title text-[var(--foreground)] leading-relaxed border-l-2 border-[var(--accent)] pl-4">
              &ldquo;{brand.positioning}&rdquo;
            </blockquote>
          </div>
        )}

        {activeTab === "Colors" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(brand.colors).map(([name, value]) => (
                <div key={name} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                  <div
                    className="h-20 rounded-xl mb-4 border border-[var(--border)]"
                    style={{ background: value }}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-small font-semibold text-[var(--foreground)] capitalize">{name}</p>
                      <p className="text-micro text-[var(--muted)] font-mono mt-0.5">{value}</p>
                    </div>
                    <div
                      className="w-7 h-7 rounded-full border-2 border-[var(--border)]"
                      style={{ background: value }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              className="h-16 rounded-2xl overflow-hidden"
              style={{
                background: `linear-gradient(90deg, ${Object.values(brand.colors).join(", ")})`,
              }}
            />
          </div>
        )}

        {activeTab === "Typography" && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-4 h-4 text-[var(--accent)]" />
                <div>
                  <p className="text-label text-[var(--muted)]">Display font</p>
                  <p className="font-semibold text-[var(--foreground)]">{brand.typography.display}</p>
                </div>
              </div>
              <p className="text-4xl font-bold text-[var(--foreground)]" style={{ letterSpacing: "-0.03em" }}>
                {brand.name}
              </p>
              <p className="text-title text-[var(--muted)] mt-2">{brand.tagline}</p>
            </div>
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-4 h-4 text-[var(--accent)]" />
                <div>
                  <p className="text-label text-[var(--muted)]">Body font</p>
                  <p className="font-semibold text-[var(--foreground)]">{brand.typography.body}</p>
                </div>
              </div>
              <p className="text-body text-[var(--foreground)]">
                {brand.targetCustomer}
              </p>
            </div>
          </div>
        )}

        {activeTab === "Voice" && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-2 mb-5">
                <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="font-semibold text-[var(--foreground)]">Voice Guidelines</h3>
              </div>
              <div className="space-y-3">
                {brand.voice.map((guideline, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                    <p className="text-body text-[var(--foreground)]">{guideline}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice demo */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Example copy</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-micro text-red-500 mb-1.5">✗ Don&apos;t</p>
                  <p className="text-small text-[var(--muted)] p-3 rounded-lg bg-red-50 border border-red-100">
                    &ldquo;Our state-of-the-art athletic footwear solutions leverage advanced biomechanical engineering to optimize your performance potential.&rdquo;
                  </p>
                </div>
                <div>
                  <p className="text-micro text-green-600 mb-1.5">✓ Do</p>
                  <p className="text-small text-[var(--foreground)] p-3 rounded-lg bg-green-50 border border-green-100">
                    &ldquo;Built to run. Designed to wear everywhere else.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Guidelines" && (
          <div className="space-y-4">
            {[
              { label: "Use the brand gradient for hero sections only", do: true },
              { label: "Keep headlines under 8 words", do: true },
              { label: "Use photography over illustrations", do: true },
              { label: "Never use stock-looking images", do: false },
              { label: "Never use Comic Sans or decorative fonts", do: false },
              { label: "Never use more than 2 colors in a single component", do: false },
            ].map((rule, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-4 rounded-xl border ${
                  rule.do
                    ? "border-green-100 bg-green-50"
                    : "border-red-100 bg-red-50"
                }`}
              >
                {rule.do ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                )}
                <p className={`text-small ${rule.do ? "text-green-800" : "text-red-700"}`}>
                  {rule.do ? "" : "✗ "}{rule.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
