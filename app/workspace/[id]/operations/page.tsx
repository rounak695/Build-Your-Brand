"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { useBrain } from "@/lib/brain";
import { CheckCircle2, Clock } from "lucide-react";

const TABS = ["Business Model", "Pricing", "Unit Economics", "Launch Plan"] as const;
type Tab = typeof TABS[number];

function InputRow({
  label,
  value,
  onChange,
  prefix = "₹",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[var(--border)] last:border-0">
      <label className="text-small text-[var(--foreground)]">{label}</label>
      <div className="flex items-center gap-1 border border-[var(--border)] rounded-lg overflow-hidden">
        <span className="px-2.5 py-1.5 text-small text-[var(--muted)] bg-[var(--background)] border-r border-[var(--border)]">
          {prefix}
        </span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 px-2.5 py-1.5 text-small text-[var(--foreground)] bg-transparent outline-none text-right"
        />
      </div>
    </div>
  );
}

const PHASE_COLORS: Record<string, string> = {
  COMPLETED: "#10B981",
  IN_PROGRESS: "#4F46E5",
  PLANNED: "#9CA3AF",
};

export default function OperationsPage() {
  const brain = useBrain();
  const operations = brain.operations;
  const [activeTab, setActiveTab] = useState<Tab>("Business Model");

  // Local pricing state for calculator
  const [pricing, setPricing] = useState(
    operations?.pricing || {
      sellingPrice: 4999,
      cogs: 1200,
      packaging: 150,
      shipping: 200,
      paymentFee: 100,
      cac: 400,
      returns: 150,
      otherCosts: 100,
    }
  );

  // Synchronize local state with store when operations object updates from sync sequence
  useEffect(() => {
    if (operations?.pricing) {
      setPricing(operations.pricing);
    }
  }, [operations]);

  const totalCosts =
    pricing.cogs +
    pricing.packaging +
    pricing.shipping +
    pricing.paymentFee +
    pricing.cac +
    pricing.returns +
    pricing.otherCosts;

  const grossProfit = pricing.sellingPrice - pricing.cogs - pricing.packaging;
  const grossMargin = pricing.sellingPrice > 0
    ? Math.round((grossProfit / pricing.sellingPrice) * 100)
    : 0;
  const profitPerOrder = pricing.sellingPrice - totalCosts;
  const contributionMargin = pricing.sellingPrice > 0
    ? Math.round((profitPerOrder / pricing.sellingPrice) * 100)
    : 0;
  const breakEven = profitPerOrder > 0 ? Math.ceil(500000 / profitPerOrder) : 0;

  const updateField = (field: string, value: number) => {
    const updatedPricing = { ...pricing, [field]: value };
    setPricing(updatedPricing);

    // Also update operations artifact in Zustand store to propagate calculations globally
    if (operations) {
      const computedCosts =
        updatedPricing.cogs +
        updatedPricing.packaging +
        updatedPricing.shipping +
        updatedPricing.paymentFee +
        updatedPricing.cac +
        updatedPricing.returns +
        updatedPricing.otherCosts;

      const computedGrossProfit = updatedPricing.sellingPrice - updatedPricing.cogs - updatedPricing.packaging;
      const computedGrossMargin = updatedPricing.sellingPrice > 0 ? Math.round((computedGrossProfit / updatedPricing.sellingPrice) * 100) : 0;
      const computedProfitPerOrder = updatedPricing.sellingPrice - computedCosts;
      const computedContributionMargin = updatedPricing.sellingPrice > 0 ? Math.round((computedProfitPerOrder / updatedPricing.sellingPrice) * 100) : 0;
      const computedBreakEven = computedProfitPerOrder > 0 ? Math.ceil(500000 / computedProfitPerOrder) : 0;

      brain.setOperations({
        ...operations,
        pricing: updatedPricing,
        unitEconomics: {
          grossMargin: computedGrossMargin,
          contributionMargin: computedContributionMargin,
          breakEven: computedBreakEven,
          profitPerOrder: computedProfitPerOrder,
          requiredOrders: operations.unitEconomics.requiredOrders
        }
      });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-label text-[var(--muted)] mb-2">Operations Studio</p>
        <h1 className="text-headline text-[var(--foreground)]">Operations</h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--background)] border border-[var(--border)] mb-8 overflow-x-auto w-fit">
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "Business Model" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <p className="text-label text-[var(--muted)] mb-3">Business Model</p>
                <p className="text-body text-[var(--foreground)]">
                  {operations?.businessModel ||
                    "Direct-to-consumer (DTC) premium brand. Revenue from product sales. Margin from premium pricing over COGS."}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Revenue model", value: "Product sales" },
                  { label: "Channel", value: "DTC (Direct)" },
                  { label: "Target market", value: "India" },
                  { label: "Pricing strategy", value: "Premium-accessible" },
                  { label: "Launch model", value: "Creator-led" },
                  { label: "Phase 1 goal", value: "First 100 orders" },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                    <p className="text-micro text-[var(--muted)] mb-1">{item.label}</p>
                    <p className="text-small font-semibold text-[var(--foreground)]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Pricing" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <h2 className="font-semibold text-[var(--foreground)] mb-4">Cost inputs</h2>
                <div>
                  <InputRow label="Selling price" value={pricing.sellingPrice} onChange={(v) => updateField("sellingPrice", v)} />
                  <InputRow label="Cost of goods (COGS)" value={pricing.cogs} onChange={(v) => updateField("cogs", v)} />
                  <InputRow label="Packaging" value={pricing.packaging} onChange={(v) => updateField("packaging", v)} />
                  <InputRow label="Shipping" value={pricing.shipping} onChange={(v) => updateField("shipping", v)} />
                  <InputRow label="Payment fee" value={pricing.paymentFee} onChange={(v) => updateField("paymentFee", v)} />
                  <InputRow label="Marketing CAC" value={pricing.cac} onChange={(v) => updateField("cac", v)} />
                  <InputRow label="Returns allowance" value={pricing.returns} onChange={(v) => updateField("returns", v)} />
                  <InputRow label="Other costs" value={pricing.otherCosts} onChange={(v) => updateField("otherCosts", v)} />
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between">
                  <span className="text-small font-semibold text-[var(--foreground)]">Total costs</span>
                  <span className="text-small font-bold text-red-600">{formatCurrency(totalCosts)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="font-semibold text-[var(--foreground)]">Outputs</h2>
                {[
                  { label: "Selling price", value: formatCurrency(pricing.sellingPrice), highlight: false },
                  { label: "Gross profit", value: formatCurrency(grossProfit), highlight: false },
                  { label: "Gross margin", value: `${grossMargin}%`, highlight: grossMargin > 40, isGood: grossMargin > 40 },
                  { label: "Contribution margin", value: `${contributionMargin}%`, highlight: contributionMargin > 20, isGood: contributionMargin > 20 },
                  { label: "Profit per order", value: formatCurrency(profitPerOrder), highlight: profitPerOrder > 0, isGood: profitPerOrder > 0 },
                  { label: "Break-even (orders)", value: breakEven > 0 ? breakEven.toLocaleString() : "∞", highlight: false },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    animate={{ scale: [1, 1.01, 1] }}
                    transition={{ duration: 0.3 }}
                    className={`flex justify-between items-center p-4 rounded-xl border ${
                      item.highlight
                        ? item.isGood
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                        : "border-[var(--border)] bg-[var(--surface)]"
                    }`}
                  >
                    <span className={`text-small ${item.highlight && item.isGood ? "text-green-700" : item.highlight ? "text-red-700" : "text-[var(--muted)]"}`}>
                      {item.label}
                    </span>
                    <span className={`text-small font-bold ${item.highlight && item.isGood ? "text-green-700" : item.highlight ? "text-red-700" : "text-[var(--foreground)]"}`}>
                      {item.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Unit Economics" && (
            <div className="grid grid-cols-2 gap-5">
              {[
                {
                  label: "Gross Margin",
                  value: `${operations?.unitEconomics.grossMargin || grossMargin}%`,
                  description: "Revenue after COGS and packaging",
                  good: (operations?.unitEconomics.grossMargin || grossMargin) > 40,
                },
                {
                  label: "Contribution Margin",
                  value: `${operations?.unitEconomics.contributionMargin || contributionMargin}%`,
                  description: "Revenue after all variable costs",
                  good: (operations?.unitEconomics.contributionMargin || contributionMargin) > 20,
                },
                {
                  label: "Profit Per Order",
                  value: formatCurrency(operations?.unitEconomics.profitPerOrder || profitPerOrder),
                  description: "Net profit after all costs",
                  good: (operations?.unitEconomics.profitPerOrder || profitPerOrder) > 0,
                },
                {
                  label: "Break-Even Orders",
                  value: (operations?.unitEconomics.breakEven || breakEven).toLocaleString(),
                  description: "Orders needed to break even",
                  good: true,
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className={`p-6 rounded-2xl border ${
                    metric.good ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  <p className="text-small text-[var(--muted)] mb-2">{metric.label}</p>
                  <p className={`text-4xl font-bold mb-2 ${metric.good ? "text-green-700" : "text-red-600"}`}>
                    {metric.value}
                  </p>
                  <p className="text-micro text-[var(--muted)]">{metric.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Launch Plan" && (
            <div className="space-y-3">
              {(operations?.launchPhases || []).map((phase, i) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                      style={{ background: `${PHASE_COLORS[phase.status]}15`, color: PHASE_COLORS[phase.status] }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[var(--foreground)]">
                          Phase {i + 1}: {phase.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-micro text-[var(--muted)]">
                            Week {phase.startWeek}–{phase.endWeek}
                          </span>
                          <span
                            className="text-label px-2 py-0.5 rounded-full"
                            style={{
                              background: `${PHASE_COLORS[phase.status]}15`,
                              color: PHASE_COLORS[phase.status],
                            }}
                          >
                            {phase.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <p className="text-small text-[var(--muted)]">{phase.description}</p>
                    </div>
                    {phase.status === "COMPLETED" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : phase.status === "IN_PROGRESS" ? (
                      <div className="w-3 h-3 rounded-full bg-[var(--accent)] dot-working shrink-0 mt-1" />
                    ) : (
                      <Clock className="w-5 h-5 text-[var(--muted)] shrink-0" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
