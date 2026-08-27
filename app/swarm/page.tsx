"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, Brain, Activity,
  Terminal, TrendingUp, Shield, Cpu, GitBranch, Globe,
  ChevronRight, Play, RotateCcw, Layers, ArrowLeft, Zap, Network,
  Sun, Moon
} from "lucide-react";
import RobotAgent from "@/components/RobotAgent";
import XcelerateLogo from "@/components/XcelerateLogo";

// ─── Types ───────────────────────────────────────────
interface AgentLog {
  id: string;
  agentId: string;
  agentName: string;
  message: string;
  type: "thinking" | "action" | "output" | "collaborate";
  timestamp: number;
}

interface AgentState {
  id: string;
  name: string;
  role: string;
  color: string;
  glowColor: string;
  bgColor: string;
  icon: React.ReactNode;
  status: "idle" | "thinking" | "working" | "collaborating" | "done";
  progress: number;
  currentTask: string;
  tasksCompleted: number;
  specialty: string[];
}

// ─── Agent Config ─────────────────────────────────────
const AGENTS_CONFIG: Omit<AgentState, "icon">[] = [
  {
    id: "ceo", name: "Nova", role: "Chief Executive Agent",
    color: "#D36B66", glowColor: "rgba(211,107,102,0.3)", bgColor: "rgba(211,107,102,0.07)",
    status: "idle", progress: 0, currentTask: "Awaiting directive...", tasksCompleted: 0,
    specialty: ["Strategy", "Vision", "Coordination"],
  },
  {
    id: "product", name: "Mira", role: "Product & Brand Director",
    color: "#9D8EE0", glowColor: "rgba(157,142,224,0.3)", bgColor: "rgba(157,142,224,0.07)",
    status: "idle", progress: 0, currentTask: "Awaiting directive...", tasksCompleted: 0,
    specialty: ["PRD", "Design", "Brand"],
  },
  {
    id: "growth", name: "Ari", role: "Growth Director",
    color: "#3B9AB5", glowColor: "rgba(59,154,181,0.3)", bgColor: "rgba(59,154,181,0.07)",
    status: "idle", progress: 0, currentTask: "Awaiting directive...", tasksCompleted: 0,
    specialty: ["SEO", "GTM", "Outreach"],
  },
  {
    id: "operations", name: "Noah", role: "Operations Director",
    color: "#C48A20", glowColor: "rgba(196,138,32,0.3)", bgColor: "rgba(196,138,32,0.07)",
    status: "idle", progress: 0, currentTask: "Awaiting directive...", tasksCompleted: 0,
    specialty: ["Infra", "DevOps", "APIs"],
  },
];

// ─── Log Sequences ────────────────────────────────────
const LOG_SEQUENCES: Record<string, Array<{ message: string; type: AgentLog["type"]; delay: number }>> = {
  ceo: [
    { message: "Parsing startup idea — identifying core value prop", type: "thinking", delay: 0 },
    { message: "Market sizing: $42B TAM in creator monetization", type: "output", delay: 1.4 },
    { message: "Delegating MVP scope → Mira (Product)", type: "collaborate", delay: 2.8 },
    { message: "Delegating GTM strategy → Ari (Growth)", type: "collaborate", delay: 3.6 },
    { message: "Delegating infrastructure → Noah (Ops)", type: "collaborate", delay: 4.2 },
    { message: "Synthesizing agent outputs into Executive Brief...", type: "action", delay: 7.5 },
    { message: "✓ Company Blueprint v1.0 finalized", type: "output", delay: 10.5 },
  ],
  product: [
    { message: "Analyzing competitive landscape: Kajabi, Gumroad, Patreon", type: "thinking", delay: 0.5 },
    { message: "Generating 24-feature PRD across 3 sprint cycles", type: "action", delay: 2.2 },
    { message: "✓ PRD complete — 24 features scoped", type: "output", delay: 4.8 },
    { message: "Scaffolding Next.js 15 + Supabase + Stripe repo", type: "action", delay: 6.0 },
    { message: "✓ MVP scaffolded — 12 routes, 8 API endpoints", type: "output", delay: 9.0 },
    { message: "Creating brand identity: colors, typography, motion", type: "action", delay: 10.0 },
  ],
  growth: [
    { message: "Scraping 150K creator profiles across TikTok & YouTube", type: "action", delay: 0.7 },
    { message: "Running ICP scoring on dataset — engagement threshold: 8%", type: "thinking", delay: 2.5 },
    { message: "✓ 3,200 high-value targets identified", type: "output", delay: 4.2 },
    { message: "Writing 3,200 personalized DM sequences", type: "action", delay: 6.0 },
    { message: "✓ Outreach pipeline live — open rate: 34%", type: "output", delay: 8.2 },
    { message: "✓ 48 programmatic SEO pages deployed", type: "output", delay: 10.8 },
  ],
  operations: [
    { message: "Provisioning AWS us-east-1 infrastructure", type: "action", delay: 0.9 },
    { message: "Setting up GitHub Actions + Vercel CI/CD pipeline", type: "action", delay: 2.6 },
    { message: "✓ Deployment pipeline active — build time: 47s", type: "output", delay: 4.5 },
    { message: "Configuring Stripe Connect + webhook relay", type: "action", delay: 6.2 },
    { message: "✓ Payment rails live — 99.97% uptime SLA", type: "output", delay: 8.0 },
    { message: "✓ Observability stack active — zero blind spots", type: "output", delay: 10.0 },
  ],
};

// ─── Particle Background ─────────────────────────────
function ParticleField({ isDark }: { isDark: boolean }) {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; speed: number; delay: number; color: string }[]
  >([]);
  useEffect(() => {
    const colors = ["#D36B66","#9D8EE0","#3B9AB5","#C48A20","#3B82F6","#A855F7"];
    setParticles(Array.from({ length: 40 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2 + 0.5, speed: Math.random() * 20 + 15,
      delay: Math.random() * 10, color: colors[Math.floor(Math.random() * colors.length)],
    })));
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 ${p.size * 4}px ${p.color}`, opacity: isDark ? 0.25 : 0.15 }}
          animate={{ y: [0, -60, 0], opacity: isDark ? [0.1, 0.45, 0.1] : [0.05, 0.2, 0.05], scale: [1, 1.5, 1] }}
          transition={{ duration: p.speed, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Stats Ticker ─────────────────────────────────────
function StatsTicker({ logs, isRunning }: { logs: AgentLog[]; isRunning: boolean }) {
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!isRunning) { setTime(0); return; }
    const i = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [isRunning]);
  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  const stats = [
    { label: "RUNTIME", value: fmt(time), color: "#3B9AB5" },
    { label: "ACTIONS", value: logs.length.toString(), color: "#9D8EE0" },
    { label: "OUTPUTS", value: logs.filter(l => l.type === "output").length.toString(), color: "#22C55E" },
    { label: "SYNCS",   value: logs.filter(l => l.type === "collaborate").length.toString(), color: "#A855F7" },
  ];
  return (
    <div className="flex items-center gap-4 md:gap-6 px-5 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex-wrap">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-[var(--muted)] uppercase tracking-widest">{s.label}</span>
          <motion.span key={s.value} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm font-bold font-mono" style={{ color: s.color }}>{s.value}
          </motion.span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <div className="relative w-2 h-2">
          <div className="w-2 h-2 rounded-full" style={{ background: isRunning ? "#22C55E" : "var(--muted)" }} />
          {isRunning && <div className="absolute inset-0 rounded-full bg-green-400 animate-ping" />}
        </div>
        <span className="text-[10px] font-mono text-[var(--muted)]">{isRunning ? "SWARM LIVE" : "STANDBY"}</span>
      </div>
    </div>
  );
}

// ─── Agent Card ───────────────────────────────────────
function AgentCard({ agent, logs, isActive, index }: {
  agent: AgentState; logs: AgentLog[]; isActive: boolean; index: number;
}) {
  const logRef = useRef<HTMLDivElement>(null);
  const myLogs = logs.filter((l) => l.agentId === agent.id).slice(-6);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [myLogs.length]);

  const statusColors: Record<AgentState["status"], string> = {
    idle: "var(--muted)", thinking: "#F3B562", working: agent.color, collaborating: "#A855F7", done: "#22C55E",
  };
  const statusLabel: Record<AgentState["status"], string> = {
    idle: "IDLE", thinking: "THINKING", working: "WORKING", collaborating: "COLLAB", done: "DONE",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: isActive ? agent.bgColor : "var(--surface)",
        border: `1px solid ${isActive ? agent.color + "45" : "var(--border)"}`,
        boxShadow: isActive ? `0 0 24px ${agent.glowColor}` : "none",
        backdropFilter: "blur(20px)",
        transition: "all 0.5s ease",
      }}
    >
      {/* Top glow stripe */}
      <div className="h-[2px] w-full" style={{
        background: isActive ? `linear-gradient(90deg, transparent, ${agent.color}, transparent)` : "transparent",
        transition: "all 0.5s ease",
      }} />

      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <RobotAgent agentId={agent.id} size={50} typing={isActive && agent.status === "working"} />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--surface)]"
              style={{ background: statusColors[agent.status] }}>
              {agent.status === "working" && (
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: statusColors[agent.status], opacity: 0.5 }} />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-[var(--foreground)]">{agent.name}</span>
              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full" style={{
                color: statusColors[agent.status],
                background: statusColors[agent.status] === "var(--muted)" ? "var(--accent-light)" : statusColors[agent.status] + "20",
                border: `1px solid ${statusColors[agent.status] === "var(--muted)" ? "var(--border)" : statusColors[agent.status] + "40"}`,
              }}>{statusLabel[agent.status]}</span>
            </div>
            <div className="text-[10px] text-[var(--muted)] mt-0.5">{agent.role}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xl font-bold" style={{ color: agent.color }}>{agent.tasksCompleted}</div>
          <div className="text-[8px] text-[var(--muted)] uppercase tracking-wider">tasks</div>
        </div>
      </div>

      {/* Progress */}
      {isActive && (
        <div className="px-4 pb-2">
          <div className="h-[2px] bg-[var(--border)] rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${agent.color}70, ${agent.color})` }}
              initial={{ width: "0%" }} animate={{ width: `${agent.progress}%` }} transition={{ duration: 0.5 }} />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-[9px] text-[var(--muted)] font-mono truncate max-w-[72%]">{agent.currentTask}</span>
            <span className="text-[9px] font-mono font-bold" style={{ color: agent.color }}>{agent.progress}%</span>
          </div>
        </div>
      )}

      {/* Specialties */}
      <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
        {agent.specialty.map((s) => (
          <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
            style={{ color: agent.color, borderColor: agent.color + "35", background: agent.color + "10" }}>
            {s}
          </span>
        ))}
      </div>

      {/* Log Feed */}
      <div className="flex-1 border-t border-[var(--border)] bg-[var(--background)]/40">
        <div className="px-3 py-2 flex items-center gap-1.5 border-b border-[var(--border)]">
          <Terminal className="w-3 h-3 text-[var(--muted)]" />
          <span className="text-[9px] font-mono text-[var(--muted)] uppercase tracking-widest">Agent Log</span>
        </div>
        <div ref={logRef} className="h-36 overflow-y-auto px-3 py-2 space-y-1.5 hide-scrollbar">
          <AnimatePresence>
            {myLogs.length === 0
              ? <div className="text-[10px] text-[var(--muted)] font-mono opacity-50">Waiting for task...</div>
              : myLogs.map((log) => (
                <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex gap-2 items-start">
                  <span className="text-[8px] font-mono flex-shrink-0 mt-0.5" style={{
                    color: log.type === "output" ? "#22C55E" : log.type === "collaborate" ? "#A855F7" : log.type === "thinking" ? "#F3B562" : agent.color,
                  }}>
                    {log.type === "output" ? "✓" : log.type === "collaborate" ? "⇢" : log.type === "thinking" ? "⟳" : "›"}
                  </span>
                  <span className="text-[10px] text-[var(--foreground)] opacity-70 font-mono leading-snug">{log.message}</span>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Global Feed ──────────────────────────────────────
function GlobalFeed({ logs }: { logs: AgentLog[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const recent = [...logs].reverse().slice(0, 25);
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0; }, [logs.length]);
  const agentColors: Record<string, string> = { ceo: "#D36B66", product: "#9D8EE0", growth: "#3B9AB5", operations: "#C48A20" };
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-[var(--muted)]" />
        <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-widest">Global Activity</span>
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 hide-scrollbar">
        <AnimatePresence>
          {recent.length === 0
            ? <div className="text-[10px] text-[var(--muted)] font-mono text-center pt-10 opacity-60">Launch swarm to see activity...</div>
            : recent.map((log) => (
              <motion.div key={log.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: agentColors[log.agentId] || "var(--muted)" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-bold font-mono uppercase" style={{ color: agentColors[log.agentId] }}>{log.agentName}</span>
                    <span className="text-[8px] text-[var(--muted)] font-mono opacity-60">
                      {new Date(log.timestamp).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--foreground)] opacity-60 font-mono leading-snug">{log.message}</p>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Capability Cards ─────────────────────────────────
const CAPABILITIES = [
  { icon: <Brain className="w-5 h-5" />, title: "Emergent Intelligence", desc: "Agents debate, refine, and converge on optimal solutions through multi-round deliberation.", color: "#D36B66", stat: "4x faster" },
  { icon: <Network className="w-5 h-5" />, title: "Mesh Collaboration", desc: "Real-time agent-to-agent communication with shared memory and context propagation.", color: "#9D8EE0", stat: "0ms latency" },
  { icon: <GitBranch className="w-5 h-5" />, title: "Parallel Execution", desc: "All 4 departments work simultaneously — compressing weeks of work into minutes.", color: "#3B9AB5", stat: "∞ parallel" },
  { icon: <Shield className="w-5 h-5" />, title: "Decision Auditing", desc: "Every agent decision is logged, reasoned, and reversible. Full transparency stack.", color: "#C48A20", stat: "100% trace" },
  { icon: <Globe className="w-5 h-5" />, title: "Live Web Grounding", desc: "Agents search, scrape, and synthesize real-time market data for evidence-based decisions.", color: "#22C55E", stat: "Live data" },
  { icon: <Zap className="w-5 h-5" />, title: "Instant Execution", desc: "From prompt to deployed MVP in under 12 minutes. No back-and-forth, no bottlenecks.", color: "#A855F7", stat: "< 12 min" },
];

// ─── Main Page ────────────────────────────────────────
export default function SwarmPage() {
  const router = useRouter();
  const generateId = () => Math.random().toString(36).slice(2, 9);

  const makeAgents = (): AgentState[] => AGENTS_CONFIG.map((a) => ({
    ...a,
    icon: a.id === "ceo" ? <Brain className="w-4 h-4" /> : a.id === "product" ? <Layers className="w-4 h-4" /> : a.id === "growth" ? <TrendingUp className="w-4 h-4" /> : <Cpu className="w-4 h-4" />,
  }));

  const [agents, setAgents] = useState<AgentState[]>(makeAgents());
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [idea, setIdea] = useState("AI-powered creator economy platform");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Sync with localStorage + document class (same as main page)
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(saved);
    if (saved === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const isDark = theme === "dark";

  const resetSwarm = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    setAgents(makeAgents());
    setLogs([]);
    setIsRunning(false);
    setIsComplete(false);
  }, []);

  const launchSwarm = useCallback(() => {
    if (isRunning) return;
    resetSwarm();
    setTimeout(() => {
      setIsRunning(true);
      const agentIds = ["ceo", "product", "growth", "operations"];

      agentIds.forEach((agentId, idx) => {
        timerRefs.current.push(setTimeout(() => {
          setAgents((prev) => prev.map((a) => a.id === agentId ? { ...a, status: "thinking", currentTask: "Analyzing directive...", progress: 5 } : a));
        }, idx * 350));
        timerRefs.current.push(setTimeout(() => {
          setAgents((prev) => prev.map((a) => a.id === agentId ? { ...a, status: "working", currentTask: "Executing...", progress: 15 } : a));
        }, idx * 350 + 900));
      });

      agentIds.forEach((agentId) => {
        const agentCfg = AGENTS_CONFIG.find((a) => a.id === agentId)!;
        const seq = LOG_SEQUENCES[agentId] || [];
        seq.forEach(({ message, type, delay }) => {
          timerRefs.current.push(setTimeout(() => {
            setLogs((prev) => [...prev, { id: generateId(), agentId, agentName: agentCfg.name, message, type, timestamp: Date.now() }]);
            setAgents((prev) => prev.map((a) => {
              if (a.id !== agentId) return a;
              const newProgress = Math.min(95, a.progress + Math.random() * 14 + 5);
              const newTasks = type === "output" ? a.tasksCompleted + 1 : a.tasksCompleted;
              const newStatus: AgentState["status"] = type === "collaborate" ? "collaborating" : "working";
              return { ...a, progress: Math.round(newProgress), tasksCompleted: newTasks, status: newStatus, currentTask: message };
            }));
          }, delay * 1000 + 400));
        });
      });

      timerRefs.current.push(setTimeout(() => {
        setAgents((prev) => prev.map((a) => ({ ...a, status: "done", progress: 100 })));
        setIsComplete(true);
        setIsRunning(false);
      }, 12500));
    }, 80);
  }, [isRunning, resetSwarm]);

  useEffect(() => () => timerRefs.current.forEach(clearTimeout), []);

  const anyActive = agents.some((a) => a.status !== "idle");

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] relative overflow-x-hidden">
      <ParticleField isDark={isDark} />

      {/* Radial hero glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: isDark
          ? "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 60%)"
          : "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.06) 0%, transparent 60%)" }}
      />
      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")}
              className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Back</span>
            </button>
            <div className="w-px h-5 bg-[var(--border)]" />
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
              <XcelerateLogo size={24} className="text-[var(--foreground)]" />
              <span className="font-extrabold text-lg tracking-tight">Xcelerate</span>
            </div>
          </div>

          {/* Center badge */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[var(--muted)]">AI Swarm Protocol v3.4</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--accent-light)] transition-all text-[var(--muted)] hover:text-[var(--foreground)] flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {isDark
                ? <Sun className="w-4 h-4 text-yellow-400" />
                : <Moon className="w-4 h-4 text-blue-500" />}
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded-full text-sm font-bold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-all"
            >
              Start Building
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-36 pb-16 px-6 max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs font-mono mb-8 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[var(--muted)]">Xcelerate Swarm — Multi-Agent Architecture</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-[1.05]">
            <span className="text-[var(--foreground)]">Four agents.</span><br />
            <span style={{
              background: "linear-gradient(135deg, #D36B66 0%, #9D8EE0 35%, #3B9AB5 70%, #C48A20 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>One company.</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Watch Nova, Mira, Ari, and Noah work in parallel — debating trade-offs, sharing context, and building your entire startup simultaneously.
          </p>

          {/* Input + Launch */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input type="text" value={idea} onChange={(e) => { if (!isRunning) setIdea(e.target.value); }}
                className="w-full h-12 pl-10 pr-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm font-mono text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--muted)] transition-all"
                placeholder="Describe your startup idea..." />
            </div>
            <div className="flex gap-2">
              <motion.button onClick={isRunning ? undefined : launchSwarm} disabled={isRunning}
                whileHover={{ scale: isRunning ? 1 : 1.02 }} whileTap={{ scale: isRunning ? 1 : 0.97 }}
                className="flex items-center gap-2 px-6 h-12 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed"
                style={{
                  background: isRunning ? "var(--surface)" : "linear-gradient(135deg, #D36B66, #9D8EE0)",
                  color: isRunning ? "var(--muted)" : "white",
                  border: isRunning ? "1px solid var(--border)" : "none",
                }}>
                {isRunning
                  ? <><div className="w-3.5 h-3.5 border-2 border-[var(--muted)] border-t-[var(--foreground)] rounded-full animate-spin" />Running...</>
                  : <><Play className="w-3.5 h-3.5" />Launch Swarm</>}
              </motion.button>
              <button onClick={resetSwarm}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--accent-light)] transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Completion Banner ── */}
      <AnimatePresence>
        {isComplete && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full border border-green-500/40 bg-green-500/10 backdrop-blur-xl flex items-center gap-3 text-sm font-bold text-green-600 shadow-2xl whitespace-nowrap"
            style={{ boxShadow: "0 0 40px rgba(34,197,94,0.15)" }}>
            <Sparkles className="w-4 h-4" />Swarm complete — Blueprint ready in 12.3s<ChevronRight className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Live Dashboard ── */}
      <section className="relative z-10 px-4 md:px-6 max-w-7xl mx-auto pb-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            backdropFilter: "blur(30px)",
            boxShadow: isDark ? "0 0 80px rgba(0,0,0,0.6)" : "0 8px 60px rgba(0,0,0,0.08)",
          }}>
          {/* Terminal bar */}
          <div className="h-12 border-b border-[var(--border)] flex items-center px-5 gap-3 bg-[var(--background)]/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-[var(--accent-light)] text-[11px] text-[var(--muted)] font-mono border border-[var(--border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                xcelerate-swarm.local — {idea || "AI Creator Platform"}
              </div>
            </div>
            <div className="text-[10px] font-mono text-[var(--muted)] opacity-50">v3.4.0</div>
          </div>

          <StatsTicker logs={logs} isRunning={isRunning} />

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
            {/* Agents */}
            <div className="p-5 relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
                {agents.map((agent, i) => (
                  <AgentCard key={agent.id} agent={agent} logs={logs} isActive={agent.status !== "idle"} index={i} />
                ))}
              </div>
              {!anyActive && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
                      <Play className="w-7 h-7 text-[var(--muted)]" />
                    </div>
                    <p className="text-[var(--muted)] font-mono text-sm">Press Launch Swarm to begin</p>
                  </div>
                </motion.div>
              )}
            </div>
            {/* Feed */}
            <div className="lg:max-h-[680px]"><GlobalFeed logs={logs} /></div>
          </div>
        </motion.div>
      </section>

      {/* ── Architecture ── */}
      <section className="relative z-10 px-4 md:px-6 max-w-7xl mx-auto pb-24">
        <div className="text-center mb-14">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)] font-bold mb-3 block">Swarm Architecture</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-[var(--foreground)]">
            Built different.<br />
            <span style={{
              background: "linear-gradient(135deg, #9D8EE0, #3B9AB5)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>Built for speed.</span>
          </h2>
          <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">Not a chatbot. Not a co-pilot. A fully autonomous multi-agent company that executes end-to-end.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPABILITIES.map((cap, i) => (
            <motion.div key={cap.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }} whileHover={{ scale: 1.02, y: -4 }}
              className="relative p-6 rounded-2xl overflow-hidden group cursor-default bg-[var(--surface)] border border-[var(--border)]"
              style={{ backdropFilter: "blur(20px)" }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 30% 30%, ${cap.color}12 0%, transparent 60%)` }} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: cap.color + "15", border: `1px solid ${cap.color}30`, color: cap.color }}>
                    {cap.icon}
                  </div>
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full"
                    style={{ background: cap.color + "15", color: cap.color, border: `1px solid ${cap.color}30` }}>
                    {cap.stat}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)] mb-2 tracking-tight">{cap.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{cap.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Agent Profiles ── */}
      <section className="relative z-10 px-4 md:px-6 max-w-7xl mx-auto pb-24 border-t border-[var(--border)] pt-20">
        <div className="text-center mb-14">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)] font-bold mb-3 block">Meet the Swarm</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-[var(--foreground)]">Your AI executive team.</h2>
          <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">Each agent is a domain expert with deep specialization, long-term memory, and a relentless drive to ship.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { agent: AGENTS_CONFIG[0], description: "Nova orchestrates the entire operation. She synthesizes agent outputs, resolves conflicts, and maintains the company vision — your AI co-founder who never sleeps.", tools: ["Vision Planning","Agent Orchestration","Investor Comms","OKR Tracking"], metric: { label: "Decisions/hour", value: "340+" } },
            { agent: AGENTS_CONFIG[1], description: "Mira owns product and brand from zero to launch. She writes PRDs, architects systems, scaffolds code, and designs the brand identity — all in one coherent pass.", tools: ["PRD Generation","Next.js Scaffolding","UI Design","Brand Systems"], metric: { label: "Lines of code", value: "10K+" } },
            { agent: AGENTS_CONFIG[2], description: "Ari is obsessed with distribution. She maps your ICP, writes personalized outreach at scale, builds SEO content engines, and launches your GTM before the MVP is done.", tools: ["ICP Mapping","SEO Clusters","DM Campaigns","Creator Outreach"], metric: { label: "Leads generated", value: "3,200+" } },
            { agent: AGENTS_CONFIG[3], description: "Noah keeps the machine running. He provisions infrastructure, sets up CI/CD, configures payments, and monitors everything — so you never touch a server.", tools: ["AWS Provisioning","CI/CD Pipelines","Stripe Setup","Observability"], metric: { label: "Uptime SLA", value: "99.97%" } },
          ].map(({ agent, description, tools, metric }, i) => (
            <motion.div key={agent.id} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative p-7 rounded-2xl overflow-hidden bg-[var(--surface)]"
              style={{ border: `1px solid ${agent.color}25` }}>
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${agent.color}60, transparent)` }} />
              <div className="absolute inset-0 opacity-20"
                style={{ background: `radial-gradient(circle at 80% 20%, ${agent.color}12 0%, transparent 50%)` }} />
              <div className="relative z-10">
                <div className="flex items-start gap-5 mb-6">
                  <div className="flex-shrink-0"><RobotAgent agentId={agent.id} size={68} typing={false} /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">{agent.name}</h3>
                      <div className="text-center px-3 py-1.5 rounded-xl"
                        style={{ background: agent.color + "15", border: `1px solid ${agent.color}30` }}>
                        <div className="text-lg font-bold" style={{ color: agent.color }}>{metric.value}</div>
                        <div className="text-[8px] text-[var(--muted)] uppercase tracking-wider">{metric.label}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: agent.color }}>{agent.role}</div>
                    <p className="text-sm text-[var(--muted)] mt-3 leading-relaxed">{description}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {tools.map((tool) => (
                    <span key={tool} className="text-[10px] font-mono px-2.5 py-1 rounded-lg"
                      style={{ background: agent.color + "12", color: agent.color, border: `1px solid ${agent.color}25` }}>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 pb-32 max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="p-12 rounded-3xl relative overflow-hidden bg-[var(--surface)] border border-[var(--border)]"
          style={{ backdropFilter: "blur(30px)", boxShadow: isDark ? "0 0 60px rgba(157,142,224,0.1)" : "0 8px 40px rgba(0,0,0,0.06)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(157,142,224,0.08) 0%, transparent 60%)" }} />
          <div className="relative z-10">
            <div className="flex justify-center gap-4 mb-8">
              {AGENTS_CONFIG.map((a) => <RobotAgent key={a.id} agentId={a.id} size={52} typing={true} />)}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--foreground)] mb-4">Ready to deploy your swarm?</h2>
            <p className="text-[var(--muted)] text-lg mb-8">One prompt. Four agents. Your entire company — built in minutes.</p>
            <motion.button onClick={() => router.push("/")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-bold text-white"
              style={{ background: "linear-gradient(135deg, #D36B66, #9D8EE0, #3B9AB5)", boxShadow: "0 0 40px rgba(157,142,224,0.25)" }}>
              Start Building Now<ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XcelerateLogo size={20} className="text-[var(--foreground)]" />
            <span className="font-bold text-sm text-[var(--muted)]">Xcelerate</span>
          </div>
          <span className="text-xs text-[var(--muted)] opacity-50 font-mono">AI Swarm Protocol — All agents operational</span>
        </div>
      </footer>
    </div>
  );
}
