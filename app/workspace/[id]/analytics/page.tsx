"use client";

import { motion } from "framer-motion";
import { useBrain } from "@/lib/brain";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const MOCK_REVENUE = [
  { week: "W1", revenue: 0, orders: 0 },
  { week: "W2", revenue: 0, orders: 0 },
  { week: "W3", revenue: 15000, orders: 3 },
  { week: "W4", revenue: 45000, orders: 9 },
  { week: "W5", revenue: 85000, orders: 17 },
  { week: "W6", revenue: 120000, orders: 24 },
  { week: "W7", revenue: 180000, orders: 36 },
];

const MOCK_CHANNELS = [
  { channel: "Creator", orders: 22 },
  { channel: "Organic", orders: 12 },
  { channel: "Referral", orders: 7 },
  { channel: "Direct", orders: 5 },
  { channel: "Paid", orders: 3 },
];

export default function AnalyticsPage() {
  const brain = useBrain();
  const ops = brain.operations;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-label text-[var(--muted)] mb-2">Analytics</p>
        <h1 className="text-headline text-[var(--foreground)]">Analytics</h1>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Revenue", value: "₹4.45L", change: "+34%", good: true },
          { label: "Orders", value: "89", change: "+21%", good: true },
          { label: "CAC", value: "₹420", change: "-8%", good: true },
          { label: "Conversion", value: "3.2%", change: "+0.4%", good: true },
        ].map((kpi) => (
          <div key={kpi.label} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <p className="text-small text-[var(--muted)] mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-[var(--foreground)]">{kpi.value}</p>
            <p className={`text-micro mt-1 ${kpi.good ? "text-green-600" : "text-red-600"}`}>
              {kpi.change} this week
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="col-span-2 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <h2 className="font-semibold text-[var(--foreground)] mb-5">Revenue (₹)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}
                formatter={(v: unknown) => [`₹${(v as number).toLocaleString()}`, "Revenue"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by channel */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <h2 className="font-semibold text-[var(--foreground)] mb-5">Orders by channel</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_CHANNELS} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis dataKey="channel" type="category" tick={{ fontSize: 11, fill: "var(--muted)" }} width={60} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}
              />
              <Bar dataKey="orders" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Health metrics */}
        <div className="col-span-3 grid grid-cols-3 gap-4">
          {[
            { label: "AOV", value: "₹4,999", sub: "Average order value" },
            { label: "89", value: "89", sub: "Total orders to date" },
            { label: "Break-even", value: `${ops?.unitEconomics.breakEven || 420}`, sub: "orders to break even" },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <p className="text-3xl font-bold text-[var(--foreground)]">{s.value}</p>
              <p className="text-small text-[var(--muted)] mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--accent-light)]">
        <p className="text-small font-semibold text-[var(--accent)] mb-1">Analytics note</p>
        <p className="text-small text-[var(--muted)]">
          Analytics data will populate with real numbers once your website is connected and live orders start coming in. The figures above are projections based on your Operations plan.
        </p>
      </div>
    </div>
  );
}
