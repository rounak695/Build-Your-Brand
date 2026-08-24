"use client";

import { motion } from "framer-motion";
import { Palette, Package, TrendingUp, Settings, BarChart3, FolderOpen, FileText } from "lucide-react";

const CATEGORIES = [
  { id: "brand", label: "Brand", icon: Palette, color: "#4F46E5", count: 5, items: ["Brand guidelines", "Color palette", "Typography system", "Voice guide", "Logo variants"] },
  { id: "product", label: "Product", icon: Package, color: "#10B981", count: 4, items: ["Product strategy doc", "Website HTML/CSS", "Feature roadmap", "User research"] },
  { id: "growth", label: "Marketing", icon: TrendingUp, color: "#F59E0B", count: 8, items: ["Content calendar", "32 content ideas", "Creator database", "Trend report", "Launch strategy", "Campaign brief", "SEO keywords", "Ad scripts"] },
  { id: "finance", label: "Finance", icon: BarChart3, color: "#EC4899", count: 3, items: ["Unit economics model", "Launch budget", "Revenue projections"] },
  { id: "operations", label: "Operations", icon: Settings, color: "#8B5CF6", count: 4, items: ["Launch plan", "Supplier research", "Shipping setup guide", "Operations SOP"] },
  { id: "research", label: "Research", icon: FileText, color: "#06B6D4", count: 3, items: ["Market analysis", "Competitor audit", "Customer research"] },
];

export default function FilesPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-label text-[var(--muted)] mb-2">Files</p>
        <div className="flex items-end justify-between">
          <h1 className="text-headline text-[var(--foreground)]">Files</h1>
          <p className="text-small text-[var(--muted)]">27 documents generated</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] card-hover cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${cat.color}15` }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: cat.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--foreground)]">{cat.label}</h3>
                  <p className="text-micro text-[var(--muted)]">{cat.count} files</p>
                </div>
                <FolderOpen className="w-4 h-4 text-[var(--muted)]" />
              </div>
              <ul className="space-y-1.5">
                {cat.items.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-center gap-2 text-small text-[var(--muted)]">
                    <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
                    {item}
                  </li>
                ))}
                {cat.items.length > 3 && (
                  <li className="text-micro text-[var(--accent)]">+{cat.items.length - 3} more</li>
                )}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
