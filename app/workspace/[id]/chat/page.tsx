"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowRight, Sparkles, Clock, MessageSquare } from "lucide-react";
import { useBrain } from "@/lib/brain";
import { cn } from "@/lib/utils";
import { getSuggestedPrompts, getAgentReply, runGlobalSyncSequence } from "@/lib/services";
import RobotAgent from "@/components/RobotAgent";
import XcelerateLogo from "@/components/XcelerateLogo";
import Link from "next/link";

// ─── Agent Config ─────────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: "ceo",
    name: "Nova",
    role: "AI CEO",
    color: "#E879F9",
    emoji: "🧠",
    initMsg:
      "Hello! I'm Nova, your AI CEO. I coordinate all departments and keep strategy aligned. What are we building today?",
  },
  {
    id: "product",
    name: "Mira",
    role: "Product",
    color: "#38BDF8",
    emoji: "📦",
    initMsg:
      "Hey! Mira here. I own your product roadmap, brand identity, and website. Fire away with your product questions.",
  },
  {
    id: "growth",
    name: "Ari",
    role: "Growth",
    color: "#4ADE80",
    emoji: "📈",
    initMsg:
      "Ari on the line! Growth strategy, creator seeding, and campaign design — that's my lane. Let's scale this.",
  },
  {
    id: "operations",
    name: "Noah",
    role: "Ops",
    color: "#FB923C",
    emoji: "⚙️",
    initMsg:
      "Noah here. Pricing models, margins, COGS, launch timelines — numbers are my thing. Ask me anything.",
  },
];

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  agentId?: string;
  agentName?: string;
  content: string;
  timestamp: Date;
}

interface HistoryEntry {
  agentId: string;
  agentName: string;
  userMsg: string;
  agentMsg: string;
  timestamp: Date;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const brain = useBrain();
  const projectId = params.id as string;

  const [activeAgentId, setActiveAgentId] = useState("ceo");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, "idle" | "active" | "typing">>({
    ceo: "idle",
    product: "idle",
    growth: "idle",
    operations: "idle",
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const project = brain.project;
  const projectName = project?.name || "Your Company";
  const activeAgent = AGENTS.find((a) => a.id === activeAgentId)!;

  // ── Initialise per-agent messages ──────────────────────────────────────────
  useEffect(() => {
    const init: Record<string, ChatMessage[]> = {};
    AGENTS.forEach((agent) => {
      init[agent.id] = [
        {
          id: `init-${agent.id}`,
          role: "agent",
          agentId: agent.id,
          agentName: `${agent.name} · ${agent.role}`,
          content: agent.initMsg,
          timestamp: new Date(),
        },
      ];
    });
    setMessages(init);

    // brief all-active flash on load
    setAgentStatuses({ ceo: "active", product: "active", growth: "active", operations: "active" });
    const t = setTimeout(() => {
      setAgentStatuses({ ceo: "idle", product: "idle", growth: "idle", operations: "idle" });
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  // ── Auto-scroll chat ───────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, activeAgentId]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeAgentId]: [...(prev[activeAgentId] || []), userMsg],
    }));
    setInput("");
    setIsTyping(true);
    setAgentStatuses((prev) => ({ ...prev, [activeAgentId]: "typing" }));

    const lower = msg.toLowerCase();
    const isGlobal =
      activeAgentId === "ceo" &&
      (lower.includes("premium") || lower.includes("editorial") || lower.includes("all"));

    if (isGlobal) {
      try {
        await runGlobalSyncSequence(msg, brain, (evt: { type: string; message?: string }) => {
          if (evt.type === "agent.progress" || evt.type === "agent.handoff" || evt.type === "project.updated") {
            const sysMsg: ChatMessage = {
              id: Math.random().toString(36).slice(2),
              role: "agent",
              agentId: "ceo",
              agentName: "Nova · AI CEO",
              content: evt.message || "",
              timestamp: new Date(),
            };
            setMessages((prev) => ({ ...prev, ceo: [...(prev.ceo || []), sysMsg] }));
          }
        });
      } finally {
        setIsTyping(false);
        setAgentStatuses((prev) => ({ ...prev, ceo: "idle" }));
      }
      return;
    }

    await new Promise((res) => setTimeout(res, 1000));
    const result = getAgentReply(activeAgentId, msg, projectName);

    const agentMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "agent",
      agentId: activeAgentId,
      agentName: `${activeAgent.name} · ${activeAgent.role}`,
      content: result.reply,
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeAgentId]: [...(prev[activeAgentId] || []), agentMsg],
    }));

    // Append to global history
    setHistory((prev) => [
      {
        agentId: activeAgentId,
        agentName: `${activeAgent.name}`,
        userMsg: msg,
        agentMsg: result.reply,
        timestamp: new Date(),
      },
      ...prev,
    ]);

    if (result.decision) {
      brain.addDecision({
        title: result.decision,
        description: `Decided via live chat with ${activeAgent.name}.`,
        madeBy: `${activeAgent.name} · ${activeAgent.role}`,
        reason: `User requested: "${msg}"`,
        confidence: 88,
        impact: "MEDIUM",
        reversible: true,
      });
    }

    setIsTyping(false);
    setAgentStatuses((prev) => ({ ...prev, [activeAgentId]: "active" }));
    setTimeout(() => setAgentStatuses((prev) => ({ ...prev, [activeAgentId]: "idle" })), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = getSuggestedPrompts(activeAgentId);
  const currentMessages = messages[activeAgentId] || [];

  const statusDot = (id: string) => {
    const s = agentStatuses[id];
    if (s === "typing") return "bg-yellow-400 animate-pulse";
    if (s === "active") return "bg-green-400 animate-pulse";
    return "bg-zinc-600";
  };


  return (
    <div
      className="h-screen overflow-hidden text-[var(--foreground)] relative"
      style={{
        display: "grid",
        gridTemplateColumns: "72px 1fr 280px",
        gridTemplateRows: "56px 1fr",
        backgroundColor: "var(--background)",
        backgroundImage:
          "radial-gradient(circle, color-mix(in srgb, var(--foreground) 12%, transparent) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >

      {/* ══════════════════════════════════════════════════════════════════════
          TOP BAR — spans all 3 columns
         ══════════════════════════════════════════════════════════════════════ */}
      <header
        className="border-b border-[var(--border)] bg-[var(--surface)] flex items-center px-4 gap-3 z-20"
        style={{ gridColumn: "1 / -1" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <XcelerateLogo size={20} className="text-[var(--foreground)]" />
          <span className="text-sm font-bold tracking-tight hidden sm:block">Xcelerate</span>
        </Link>

        <div className="w-px h-4 bg-[var(--border)]" />

        {/* Project name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-semibold truncate">{projectName}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] shrink-0">
            Chat
          </span>
        </div>

        {/* Active agent label */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[var(--muted)]">
          <span className={cn("w-1.5 h-1.5 rounded-full", statusDot(activeAgentId))} />
          Talking to <span className="text-[var(--foreground)] font-semibold ml-1">{activeAgent.name}</span>
        </div>

        {/* See Insights CTA */}
        <button
          onClick={() => router.push(`/workspace/${projectId}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 active:scale-95 transition-all shrink-0 ml-2"
        >
          <Sparkles className="w-3 h-3" />
          See Insights
          <ArrowRight className="w-3 h-3" />
        </button>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          LEFT COLUMN — Agent avatar selector (narrow, 72px)
         ══════════════════════════════════════════════════════════════════════ */}
      <aside className="border-r border-[var(--border)] bg-[var(--surface)] flex flex-col items-center py-4 gap-3 overflow-y-auto">
        {AGENTS.map((agent) => {
          const isActive = activeAgentId === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => setActiveAgentId(agent.id)}
              title={`${agent.name} · ${agent.role}`}
              className={cn(
                "relative w-11 h-11 rounded-full transition-all duration-200 flex-shrink-0",
                isActive
                  ? "ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--surface)] scale-110"
                  : "ring-1 ring-[var(--border)] hover:ring-[var(--muted)] hover:scale-105 opacity-60 hover:opacity-100"
              )}
            >
              <RobotAgent agentId={agent.id} size={44} />
              {/* Status dot */}
              <span
                className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--surface)] transition-colors",
                  statusDot(agent.id)
                )}
              />
            </button>
          );
        })}

        {/* Spacer + divider */}
        <div className="flex-1" />
        <div className="w-8 h-px bg-[var(--border)] mb-1" />
        {/* Agent count */}
        <span className="text-[9px] text-[var(--muted)] font-medium uppercase tracking-widest rotate-0 text-center leading-tight px-1">
          {AGENTS.length}<br/>agents
        </span>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          CENTER COLUMN — Live Chat
         ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex flex-col overflow-hidden border-r border-[var(--border)]">
        {/* Active agent banner */}
        <div className="shrink-0 px-5 py-2.5 border-b border-[var(--border)] bg-[var(--surface)] flex items-center gap-3">
          <div className="relative w-8 h-8 shrink-0">
            <RobotAgent agentId={activeAgentId} size={32} />
            <span className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--surface)]", statusDot(activeAgentId))} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">{activeAgent.name}</p>
            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide mt-0.5">{activeAgent.role}</p>
          </div>
          <div className="ml-auto flex gap-2">
            {suggestedPrompts.slice(0, 2).map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                disabled={isTyping}
                className="hidden lg:block shrink-0 px-2.5 py-1 rounded-full text-[10px] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-all disabled:opacity-40"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
        >
          <AnimatePresence initial={false}>
            {currentMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
                >
                  {!isUser && (
                    <div className="shrink-0 mt-0.5 w-8 h-8">
                      <RobotAgent agentId={activeAgentId} size={32} />
                    </div>
                  )}
                  {isUser && (
                    <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-[var(--foreground)] flex items-center justify-center">
                      <span className="text-[var(--background)] text-[10px] font-bold">You</span>
                    </div>
                  )}
                  <div className={cn("flex flex-col gap-1 max-w-[78%]", isUser ? "items-end" : "items-start")}>
                    {!isUser && (
                      <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide px-0.5">
                        {msg.agentName}
                      </span>
                    )}
                    <div
                      className={cn(
                        "px-4 py-2.5 text-sm leading-relaxed",
                        isUser
                          ? "bg-[var(--foreground)] text-[var(--background)] rounded-2xl rounded-tr-sm"
                          : "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl rounded-tl-sm"
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-[var(--muted)] px-0.5">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing dots */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 items-end"
              >
                <div className="w-8 h-8"><RobotAgent agentId={activeAgentId} size={32} /></div>
                <div className="bg-[var(--surface)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts (mobile — below chat) */}
        <div className="shrink-0 px-5 pb-2 flex gap-2 overflow-x-auto lg:hidden">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              disabled={isTyping}
              className="shrink-0 px-3 py-1 rounded-full text-[10px] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-all disabled:opacity-40"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="flex items-end gap-2.5 bg-[var(--background)] border border-[var(--border)] rounded-2xl px-3.5 py-2.5 focus-within:border-[var(--foreground)] transition-colors">
            <div className="shrink-0 mb-0.5 w-5 h-5">
              <RobotAgent agentId={activeAgentId} size={20} />
            </div>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              placeholder={`Message ${activeAgent.name}…`}
              className="flex-1 resize-none bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none leading-relaxed min-h-[20px] max-h-[120px]"
              style={{ scrollbarWidth: "none" }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={cn(
                "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                input.trim() && !isTyping
                  ? "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 active:scale-95"
                  : "bg-[var(--border)] text-[var(--muted)]"
              )}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-center text-[9px] text-[var(--muted)] mt-1.5">
            <kbd className="border border-[var(--border)] rounded px-1 text-[8px]">↵</kbd> to send · Select agent from left
          </p>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT COLUMN — Conversation History
         ══════════════════════════════════════════════════════════════════════ */}
      <aside className="flex flex-col overflow-hidden bg-[var(--surface)]">
        {/* Header */}
        <div className="shrink-0 px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-[var(--muted)]" />
          <span className="text-xs font-semibold text-[var(--foreground)]">Conversation Log</span>
          {history.length > 0 && (
            <span className="ml-auto text-[10px] font-medium text-[var(--muted)] bg-[var(--background)] border border-[var(--border)] px-1.5 py-0.5 rounded-full">
              {history.length}
            </span>
          )}
        </div>

        {/* History list */}
        <div
          className="flex-1 overflow-y-auto py-2"
          style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
        >
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
              <Clock className="w-8 h-8 text-[var(--border)]" />
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Your conversation history will appear here as you chat with agents.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {history.map((entry, i) => {
                const agent = AGENTS.find((a) => a.id === entry.agentId);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-3 py-3 border-b border-[var(--border)] hover:bg-[var(--background)] transition-colors cursor-default"
                  >
                    {/* Agent label */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 shrink-0">
                        <RobotAgent agentId={entry.agentId} size={20} />
                      </div>
                      <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">
                        {entry.agentName}
                      </span>
                      <span className="ml-auto text-[9px] text-[var(--muted)]">
                        {entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {/* User msg */}
                    <p className="text-[11px] text-[var(--muted)] leading-snug line-clamp-1 mb-1">
                      <span className="text-[var(--foreground)] font-medium">You:</span> {entry.userMsg}
                    </p>
                    {/* Agent reply */}
                    <p className="text-[11px] text-[var(--muted)] leading-snug line-clamp-2">
                      <span className="font-medium" style={{ color: agent?.color ?? "var(--foreground)" }}>
                        {entry.agentName}:
                      </span>{" "}
                      {entry.agentMsg}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Bottom: Switch agent quick buttons */}
        <div className="shrink-0 border-t border-[var(--border)] px-3 py-3">
          <p className="text-[9px] text-[var(--muted)] uppercase tracking-widest mb-2 font-semibold">Switch Agent</p>
          <div className="grid grid-cols-2 gap-1.5">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setActiveAgentId(agent.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all",
                  activeAgentId === agent.id
                    ? "border-[var(--foreground)] bg-[var(--background)] text-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
                )}
              >
                <div className="w-4 h-4 shrink-0"><RobotAgent agentId={agent.id} size={16} /></div>
                {agent.name}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
