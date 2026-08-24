"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBrain } from "@/lib/brain";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";
import { Plus, LayoutGrid, List } from "lucide-react";

const COLUMNS = [
  { id: "BACKLOG", label: "Backlog", color: "#9CA3AF" },
  { id: "PLANNED", label: "Planned", color: "#6366F1" },
  { id: "IN_PROGRESS", label: "In progress", color: "#F59E0B" },
  { id: "REVIEW", label: "Review", color: "#EC4899" },
  { id: "DONE", label: "Done", color: "#10B981" },
] as const;

const DEPT_COLORS: Record<string, string> = {
  PRODUCT: "#4F46E5",
  GROWTH: "#10B981",
  OPERATIONS: "#F59E0B",
  CEO: "#8B5CF6",
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#EF4444",
  MEDIUM: "#F59E0B",
  LOW: "#9CA3AF",
};

function TaskCard({ task }: { task: Task }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] cursor-pointer card-hover"
    >
      <p className="text-small font-medium text-[var(--foreground)] mb-2">{task.title}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-label px-1.5 py-0.5 rounded"
          style={{ background: `${DEPT_COLORS[task.department]}15`, color: DEPT_COLORS[task.department] }}
        >
          {task.department}
        </span>
        <span
          className="text-label px-1.5 py-0.5 rounded"
          style={{ color: PRIORITY_COLORS[task.priority] }}
        >
          {task.priority}
        </span>
        {task.owner && (
          <span className="text-micro text-[var(--muted)] ml-auto truncate max-w-[90px]">
            {task.owner.split("·")[0].trim()}
          </span>
        )}
      </div>
      {task.dependency && (
        <p className="text-micro text-[var(--muted)] mt-2">→ Needs: {task.dependency}</p>
      )}
    </motion.div>
  );
}

export default function TasksPage() {
  const brain = useBrain();
  const [view, setView] = useState<"board" | "list">("board");
  const [filter, setFilter] = useState<string>("All");

  const tasks = brain.tasks;

  const filteredTasks = filter === "All"
    ? tasks
    : tasks.filter((t) => t.department === filter);

  const tasksByColumn = (colId: string) =>
    filteredTasks.filter((t) => t.status === colId);

  return (
    <div className="p-8 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 shrink-0"
      >
        <p className="text-label text-[var(--muted)] mb-2">Task Board</p>
        <div className="flex items-center justify-between">
          <h1 className="text-headline text-[var(--foreground)]">Tasks</h1>
          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="flex gap-1.5">
              {["All", "PRODUCT", "GROWTH", "OPERATIONS"].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setFilter(dept)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-small font-medium transition-all",
                    filter === dept
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--foreground)]"
                  )}
                >
                  {dept === "All" ? "All" : dept.charAt(0) + dept.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            {/* View toggle */}
            <div className="flex gap-1 p-1 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <button
                onClick={() => setView("board")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  view === "board" ? "bg-[var(--surface)] text-[var(--foreground)]" : "text-[var(--muted)]"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  view === "list" ? "bg-[var(--surface)] text-[var(--foreground)]" : "text-[var(--muted)]"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-small font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Add task
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === "board" ? (
          <motion.div
            key="board"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-4 overflow-x-auto flex-1 pb-4"
          >
            {COLUMNS.map((col) => {
              const colTasks = tasksByColumn(col.id);
              return (
                <div key={col.id} className="kanban-col flex flex-col gap-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-small font-semibold text-[var(--foreground)]">{col.label}</span>
                    <span className="text-micro text-[var(--muted)] ml-1 px-1.5 py-0.5 bg-[var(--background)] rounded">
                      {colTasks.length}
                    </span>
                  </div>
                  <div className="space-y-2 flex-1">
                    {colTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="h-20 rounded-xl border border-dashed border-[var(--border)] flex items-center justify-center">
                        <span className="text-micro text-[var(--muted)]">Empty</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-body text-[var(--muted)]">No tasks yet. Your AI team will add them as they work.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] card-hover cursor-pointer"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: PRIORITY_COLORS[task.priority] }}
                  />
                  <span className="text-small font-medium text-[var(--foreground)] flex-1">{task.title}</span>
                  <span
                    className="text-label px-2 py-0.5 rounded shrink-0"
                    style={{ background: `${DEPT_COLORS[task.department]}15`, color: DEPT_COLORS[task.department] }}
                  >
                    {task.department.charAt(0) + task.department.slice(1).toLowerCase()}
                  </span>
                  <span className="text-small text-[var(--muted)] shrink-0">{task.owner?.split("·")[0].trim()}</span>
                  <span
                    className="text-label px-2 py-0.5 rounded shrink-0"
                    style={{
                      background: `${COLUMNS.find(c => c.id === task.status)?.color}15`,
                      color: COLUMNS.find(c => c.id === task.status)?.color,
                    }}
                  >
                    {COLUMNS.find(c => c.id === task.status)?.label}
                  </span>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
