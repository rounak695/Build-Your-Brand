"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, Brain, Activity,
  Terminal, TrendingUp, Shield, Cpu, GitBranch, Globe,
  ChevronRight, Play, RotateCcw, Layers, ArrowLeft, Zap, Network,
  Sun, Moon, CheckCircle2, Bot, Code2, Copy, Check
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
  status: "idle" | "thinking" | "working" | "collaborating" | "done";
  progress: number;
  currentTask: string;
  tasksCompleted: number;
  specialty: string[];
}

// ─── Agent Config ─────────────────────────────────────
const AGENTS_CONFIG: AgentState[] = [
  {
    id: "ceo", name: "Nova", role: "Chief Executive Agent",
    status: "idle", progress: 0, currentTask: "Awaiting directive...", tasksCompleted: 0,
    specialty: ["Strategy", "Vision", "Coordination"],
  },
  {
    id: "product", name: "Mira", role: "Product & Brand Director",
    status: "idle", progress: 0, currentTask: "Awaiting directive...", tasksCompleted: 0,
    specialty: ["PRD", "UI/UX", "Brand"],
  },
  {
    id: "growth", name: "Ari", role: "Growth Director",
    status: "idle", progress: 0, currentTask: "Awaiting directive...", tasksCompleted: 0,
    specialty: ["SEO", "GTM", "Outreach"],
  },
  {
    id: "operations", name: "Noah", role: "Operations Director",
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
    { message: "Analyzing competitive landscape & user personas", type: "thinking", delay: 0.5 },
    { message: "Generating 24-feature PRD across 3 sprint cycles", type: "action", delay: 2.2 },
    { message: "✓ PRD complete — 24 features scoped", type: "output", delay: 4.8 },
    { message: "Scaffolding Next.js 16 + Supabase + Stripe repo", type: "action", delay: 6.0 },
    { message: "✓ MVP scaffolded — 12 routes, 8 API endpoints", type: "output", delay: 9.0 },
    { message: "Creating brand identity: colors, typography, motion", type: "action", delay: 10.0 },
  ],
  growth: [
    { message: "Scraping 150K creator profiles across platforms", type: "action", delay: 0.7 },
    { message: "Running ICP scoring on dataset — threshold: 8%", type: "thinking", delay: 2.5 },
    { message: "✓ 3,200 high-value targets identified", type: "output", delay: 4.2 },
    { message: "Writing 3,200 personalized DM sequences", type: "action", delay: 6.0 },
    { message: "✓ Outreach pipeline live — open rate: 34%", type: "output", delay: 8.2 },
    { message: "✓ 48 programmatic SEO pages deployed", type: "output", delay: 10.8 },
  ],
  operations: [
    { message: "Provisioning cloud infrastructure & database clusters", type: "action", delay: 0.9 },
    { message: "Setting up GitHub Actions + Vercel CI/CD pipeline", type: "action", delay: 2.6 },
    { message: "✓ Deployment pipeline active — build time: 47s", type: "output", delay: 4.5 },
    { message: "Configuring Stripe Connect + webhook relay", type: "action", delay: 6.2 },
    { message: "✓ Payment rails live — 99.97% uptime SLA", type: "output", delay: 8.0 },
    { message: "✓ Observability stack active — zero blind spots", type: "output", delay: 10.0 },
  ],
};

const PRESETS = [
  "Build an AI video repurposing SaaS for creators",
  "Launch a zero-sugar hydration brand for gamers",
  "Create an automated tax OS for remote freelancers",
  "Multi-agent customer success bot for e-commerce",
];

export default function SwarmSimulatorPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [prompt, setPrompt] = useState("Build an AI video repurposing SaaS for creators");
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [agents, setAgents] = useState<AgentState[]>(AGENTS_CONFIG);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "ceo" | "product" | "growth" | "operations">("all");
  const [timeElapsed, setTimeElapsed] = useState(0);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Synchronize theme state with document class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Timer ticker
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeElapsed((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const resetSwarm = useCallback(() => {
    clearTimers();
    setIsRunning(false);
    setIsDone(false);
    setTimeElapsed(0);
    setLogs([]);
    setAgents(AGENTS_CONFIG.map(a => ({ ...a, status: "idle", progress: 0, currentTask: "Awaiting directive...", tasksCompleted: 0 })));
  }, []);

  const runSimulation = () => {
    if (isRunning) return;
    resetSwarm();
    setIsRunning(true);

    const startTime = Date.now();

    AGENTS_CONFIG.forEach((agent) => {
      const seq = LOG_SEQUENCES[agent.id] || [];
      seq.forEach((item, index) => {
        const timer = setTimeout(() => {
          const newLog: AgentLog = {
            id: `${agent.id}-${index}-${Date.now()}`,
            agentId: agent.id,
            agentName: agent.name,
            message: item.message,
            type: item.type,
            timestamp: Date.now() - startTime,
          };

          setLogs((prev) => [...prev, newLog]);

          const progress = Math.round(((index + 1) / seq.length) * 100);
          const isLast = index === seq.length - 1;

          setAgents((prev) =>
            prev.map((a) => {
              if (a.id !== agent.id) return a;
              return {
                ...a,
                status: isLast ? "done" : item.type === "thinking" ? "thinking" : item.type === "collaborate" ? "collaborating" : "working",
                progress,
                currentTask: item.message,
                tasksCompleted: isLast ? seq.length : index + 1,
              };
            })
          );
        }, item.delay * 1000);

        timersRef.current.push(timer);
      });
    });

    const completionTimer = setTimeout(() => {
      setIsRunning(false);
      setIsDone(true);
    }, 12000);

    timersRef.current.push(completionTimer);
  };

  const filteredLogs = activeTab === "all" ? logs : logs.filter((l) => l.agentId === activeTab);

  return (
    <div
      className={`min-h-screen relative flex flex-col justify-between overflow-x-hidden font-sans transition-colors duration-300 ${
        theme === "light"
          ? "bg-[#FFFFFF] text-zinc-950"
          : "bg-[#09090B] text-zinc-50"
      }`}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage:
            theme === "light"
              ? "radial-gradient(#e4e4e7 1px, transparent 1px), linear-gradient(to right, rgba(228, 228, 231, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(228, 228, 231, 0.4) 1px, transparent 1px)"
              : "radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px, 128px 128px, 128px 128px",
          backgroundPosition: "center center",
        }}
      />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className={`p-2 rounded-xl border transition-colors ${
              theme === "light"
                ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            }`}
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-80">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                theme === "light"
                  ? "bg-zinc-950 text-white border-zinc-900 shadow-sm"
                  : "bg-white text-zinc-950 border-white shadow-sm"
              }`}
            >
              <XcelerateLogo size={20} className={theme === "light" ? "text-white" : "text-zinc-950"} />
            </div>
            <span className="font-bold text-lg tracking-tight flex items-center gap-2">
              xcelerate{" "}
              <span
                className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border ${
                  theme === "light"
                    ? "bg-zinc-100 text-zinc-700 border-zinc-200"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800"
                }`}
              >
                SWARM SIMULATOR
              </span>
            </span>
          </Link>
        </div>

        {/* Header Right Nav */}
        <div className="flex items-center gap-3">
          <Link
            href="/waitlist"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              theme === "light"
                ? "bg-zinc-950 text-white hover:bg-zinc-800 shadow-sm"
                : "bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Waitlist</span>
          </Link>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              theme === "light"
                ? "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 shadow-sm"
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 shadow-sm"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Simulator Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-8 max-w-7xl mx-auto w-full">
        
        {/* Title & Prompt Bar Container */}
        <div className="w-full max-w-4xl text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full mb-4 text-xs font-mono uppercase tracking-wider border ${
              theme === "light"
                ? "bg-zinc-100 text-zinc-800 border-zinc-200"
                : "bg-zinc-900 text-zinc-300 border-zinc-800"
            }`}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${isRunning ? "bg-emerald-500" : "bg-zinc-400"}`} />
            <span>{isRunning ? "SWARM SIMULATION ACTIVE" : "SIMULATOR READY"}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3"
          >
            Multi-Agent Swarm Simulator
          </motion.h1>

          <p className={`text-sm sm:text-base max-w-xl mx-auto mb-6 ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
            Watch four specialized AI agents collaborate live in parallel to build a company blueprint, code, brand, and growth engine.
          </p>

          {/* Interactive Prompt Form */}
          <div className="w-full max-w-2xl mx-auto space-y-3">
            <div
              className={`flex flex-col sm:flex-row items-stretch gap-2 p-1.5 rounded-2xl border transition-all duration-200 ${
                theme === "light"
                  ? "bg-white border-zinc-300 shadow-xl focus-within:border-zinc-950 focus-within:ring-1 focus-within:ring-zinc-950"
                  : "bg-zinc-900/90 border-zinc-800 shadow-2xl focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400"
              }`}
            >
              <div className="relative flex-1 flex items-center pl-4 pr-2 py-2">
                <Brain
                  className={`w-4 h-4 mr-3 shrink-0 ${
                    theme === "light" ? "text-zinc-400" : "text-zinc-500"
                  }`}
                />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your startup idea..."
                  className={`w-full bg-transparent border-none outline-none text-sm font-medium transition-colors ${
                    theme === "light"
                      ? "text-zinc-950 placeholder:text-zinc-400"
                      : "text-white placeholder:text-zinc-500"
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isRunning ? (
                  <button
                    onClick={resetSwarm}
                    className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                ) : (
                  <button
                    onClick={runSimulation}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                      theme === "light"
                        ? "bg-zinc-950 hover:bg-zinc-800 text-white"
                        : "bg-white hover:bg-zinc-200 text-zinc-950"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Swarm</span>
                  </button>
                )}
              </div>
            </div>

            {/* Presets List */}
            <div className="flex items-center justify-center gap-2 flex-wrap text-left">
              <span className={`text-[11px] font-mono ${theme === "light" ? "text-zinc-500" : "text-zinc-500"}`}>Try idea:</span>
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                    theme === "light"
                      ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700"
                      : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                  }`}
                >
                  {p.slice(0, 30)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-Time Metrics Header Bar */}
        <div className={`w-full max-w-6xl p-3.5 rounded-2xl border mb-6 font-mono text-xs flex items-center justify-between flex-wrap gap-4 ${
          theme === "light"
            ? "bg-white border-zinc-200 shadow-sm text-zinc-700"
            : "bg-zinc-900/90 border-zinc-800 text-zinc-300"
        }`}>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">STATUS:</span>
              <span className="font-bold text-zinc-900 dark:text-white">{isRunning ? "RUNNING" : isDone ? "COMPLETED" : "IDLE"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">RUNTIME:</span>
              <span className="font-bold text-zinc-900 dark:text-white">00:{timeElapsed.toString().padStart(2, "0")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">LOGS:</span>
              <span className="font-bold text-zinc-900 dark:text-white">{logs.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>4 AGENTS SYNCHRONIZED</span>
          </div>
        </div>

        {/* 4 Agent Cards Grid */}
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`p-4 rounded-2xl border transition-all ${
                theme === "light"
                  ? "bg-white border-zinc-200 shadow-sm hover:border-zinc-400"
                  : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <RobotAgent agentId={agent.id} size={30} typing={agent.status === "working"} />
                  <div>
                    <h3 className={`text-xs font-bold ${theme === "light" ? "text-zinc-950" : "text-white"}`}>{agent.name}</h3>
                    <p className={`text-[10px] ${theme === "light" ? "text-zinc-500" : "text-zinc-400"}`}>{agent.role}</p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase ${
                    agent.status === "done"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : agent.status === "working" || agent.status === "thinking"
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent animate-pulse"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              <div className="space-y-2 mt-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className={theme === "light" ? "text-zinc-500" : "text-zinc-400"}>Progress</span>
                  <span className={`font-mono font-bold ${theme === "light" ? "text-zinc-950" : "text-white"}`}>{agent.progress}%</span>
                </div>

                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      theme === "light" ? "bg-zinc-950" : "bg-white"
                    }`}
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>

                <p className={`text-[10px] truncate pt-1 font-mono ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
                  {agent.currentTask}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Streaming Console / Logs Section */}
        <div className={`w-full max-w-6xl rounded-2xl border p-4 font-mono text-xs text-left ${
          theme === "light"
            ? "bg-slate-950 text-slate-200 border-slate-900 shadow-2xl"
            : "bg-black text-zinc-200 border-zinc-800 shadow-2xl"
        }`}>
          {/* Console Header & Tabs */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-[11px] text-zinc-400 ml-2">swarm-execution.log</span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              {(["all", "ceo", "product", "growth", "operations"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-white text-black font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Logs Feed Container */}
          <div
            ref={logContainerRef}
            className="h-64 overflow-y-auto space-y-2 pr-2 font-mono text-[11px] leading-relaxed"
          >
            {filteredLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                Click &ldquo;Launch Swarm&rdquo; to simulate live AI agent execution...
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 hover:bg-white/5 p-1 rounded transition-colors">
                  <span className="text-zinc-500 text-[10px] shrink-0">
                    +{(log.timestamp / 1000).toFixed(1)}s
                  </span>
                  <span className="text-zinc-300 font-bold uppercase shrink-0 w-20">
                    [{log.agentName}]
                  </span>
                  <span
                    className={
                      log.type === "output"
                        ? "text-emerald-400 font-semibold"
                        : log.type === "collaborate"
                        ? "text-purple-400"
                        : "text-zinc-300"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="w-full max-w-6xl mt-12 text-center p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 flex flex-col items-center">
          <h3 className="text-2xl font-bold mb-2">Ready to launch your own AI startup?</h3>
          <p className={`text-sm mb-6 max-w-md ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
            Join 4,820+ founders on the Early Access Waitlist and be the first to access Xcelerate Swarm OS.
          </p>
          <button
            onClick={() => router.push("/waitlist")}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
              theme === "light"
                ? "bg-zinc-950 hover:bg-zinc-800 text-white"
                : "bg-white hover:bg-zinc-200 text-zinc-950"
            }`}
          >
            <span>Get Early Access</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`relative z-20 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs border-t transition-colors ${
          theme === "light"
            ? "border-zinc-200 text-zinc-500"
            : "border-zinc-800/80 text-zinc-500"
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className={`w-2 h-2 rounded-full animate-pulse ${theme === "light" ? "bg-zinc-950" : "bg-white"}`} />
            <span>XCELERATE SWARM SIMULATOR ENGINE</span>
          </div>
          <p className="flex items-center gap-2">
            <span>Questions?</span>
            <a
              href="mailto:hello@xcelerate.ai"
              className={`hover:underline font-medium ${theme === "light" ? "text-zinc-800" : "text-zinc-300"}`}
            >
              hello@xcelerate.ai
            </a>
            <span>·</span>
            <span>© 2026 Xcelerate AI</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
