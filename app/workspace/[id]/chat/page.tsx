"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowRight, Sparkles, Clock, Activity, Sun, Moon } from "lucide-react";
import { useBrain } from "@/lib/brain";
import { cn } from "@/lib/utils";
import { getSuggestedPrompts, getAgentReply, runGlobalSyncSequence } from "@/lib/services";
import RobotAgent from "@/components/RobotAgent";
import XcelerateLogo from "@/components/XcelerateLogo";
import Link from "next/link";

const AGENTS = [
  { id: "ceo",        name: "Nova",  shortRole: "CEO",     role: "Chief Executive Agent",   initMsg: "Hello! I'm Nova, your AI CEO. I coordinate all departments and keep strategy aligned. What are we building today?" },
  { id: "product",    name: "Mira",  shortRole: "PRODUCT", role: "Product & Brand Director", initMsg: "Hey! Mira here. I own your product roadmap, brand identity, and website. Fire away with your product questions." },
  { id: "growth",     name: "Ari",   shortRole: "GROWTH",  role: "Growth Director",          initMsg: "Ari on the line! Growth strategy, creator seeding, and campaign design — that's my lane. Let's scale this." },
  { id: "operations", name: "Noah",  shortRole: "OPS",     role: "Operations Director",      initMsg: "Noah here. Pricing models, margins, COGS, launch timelines — numbers are my thing. Ask me anything." },
];

interface Msg {
  id: string;
  role: "user" | "agent";
  agentId?: string;
  agentName?: string;
  content: string;
  ts: Date;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const brain = useBrain();
  const projectId = params.id as string;

  const [activeId, setActiveId] = useState("ceo");
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({});
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, "idle" | "active" | "typing">>({ ceo: "idle", product: "idle", growth: "idle", operations: "idle" });
  const [history, setHistory] = useState<{ agentId: string; agentName: string; userMsg: string; agentMsg: string; ts: Date }[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeAgent = AGENTS.find((a) => a.id === activeId)!;
  const projectName = brain.project?.name || "Your Company";
  const isDark = theme === "dark";

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(saved);
    if (saved === "light") document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "light") document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");
  };

  useEffect(() => {
    const init: Record<string, Msg[]> = {};
    AGENTS.forEach((a) => {
      init[a.id] = [{ id: `init-${a.id}`, role: "agent", agentId: a.id, agentName: `${a.name} · ${a.shortRole}`, content: a.initMsg, ts: new Date() }];
    });
    setMsgs(init);
    setStatuses({ ceo: "active", product: "active", growth: "active", operations: "active" });
    const t = setTimeout(() => setStatuses({ ceo: "idle", product: "idle", growth: "idle", operations: "idle" }), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, isTyping, activeId]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: msg, ts: new Date() };
    setMsgs((p) => ({ ...p, [activeId]: [...(p[activeId] || []), userMsg] }));
    setInput("");
    setIsTyping(true);
    setStatuses((p) => ({ ...p, [activeId]: "typing" }));

    const lower = msg.toLowerCase();
    const isGlobal = activeId === "ceo" && (lower.includes("premium") || lower.includes("editorial") || lower.includes("all"));
    if (isGlobal) {
      try {
        await runGlobalSyncSequence(msg, brain, (evt: { type: string; message?: string }) => {
          if (["agent.progress", "agent.handoff", "project.updated"].includes(evt.type)) {
            const m: Msg = { id: Math.random().toString(36).slice(2), role: "agent", agentId: "ceo", agentName: "Nova · CEO", content: evt.message || "", ts: new Date() };
            setMsgs((p) => ({ ...p, ceo: [...(p.ceo || []), m] }));
          }
        });
      } finally { setIsTyping(false); setStatuses((p) => ({ ...p, ceo: "idle" })); }
      return;
    }

    await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
    const result = getAgentReply(activeId, msg, projectName);
    const agentMsg: Msg = { id: crypto.randomUUID(), role: "agent", agentId: activeId, agentName: `${activeAgent.name} · ${activeAgent.shortRole}`, content: result.reply, ts: new Date() };
    setMsgs((p) => ({ ...p, [activeId]: [...(p[activeId] || []), agentMsg] }));
    setHistory((p) => [{ agentId: activeId, agentName: activeAgent.name, userMsg: msg, agentMsg: result.reply, ts: new Date() }, ...p]);
    if (result.decision) brain.addDecision({ title: result.decision, description: `Decided via chat with ${activeAgent.name}.`, madeBy: `${activeAgent.name} · ${activeAgent.role}`, reason: `User: "${msg}"`, confidence: 88, impact: "MEDIUM", reversible: true });
    setIsTyping(false);
    setStatuses((p) => ({ ...p, [activeId]: "active" }));
    setTimeout(() => setStatuses((p) => ({ ...p, [activeId]: "idle" })), 2200);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const currentMsgs = msgs[activeId] || [];
  const prompts = getSuggestedPrompts(activeId);

  // Minimal mono tokens
  const bg   = isDark ? "#0a0a0a" : "#fafafa";
  const surf = isDark ? "#111111" : "#ffffff";
  const bdr  = isDark ? "#1f1f1f" : "#e5e5e5";
  const mut  = isDark ? "#555555" : "#999999";
  const fg   = isDark ? "#e8e8e8" : "#111111";
  const fgInv= isDark ? "#0a0a0a" : "#fafafa";

  return (
    <div className="h-screen flex flex-col overflow-hidden font-chat" style={{ background: bg, color: fg }}>

      {/* ── TOP NAV ─────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center gap-4 px-5 h-[52px] border-b" style={{ borderColor: bdr, background: surf }}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <XcelerateLogo size={18} style={{ color: fg }} />
          <span className="text-sm font-bold tracking-tight">{projectName}</span>
        </Link>

        <div className="w-px h-4 shrink-0" style={{ background: bdr }} />

        {/* Agent tabs — center */}
        <div className="flex items-center gap-1 flex-1">
          {AGENTS.map((a) => {
            const isActive = activeId === a.id;
            const s = statuses[a.id];
            return (
              <button
                key={a.id}
                onClick={() => setActiveId(a.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150"
                style={{
                  background: isActive ? (isDark ? "#1a1a1a" : "#f0f0f0") : "transparent",
                  border: `1px solid ${isActive ? bdr : "transparent"}`,
                  color: isActive ? fg : mut,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <div className="relative w-5 h-5 shrink-0">
                  <RobotAgent agentId={a.id} size={20} />
                  <div className="absolute -bottom-px -right-px w-1.5 h-1.5 rounded-full border border-[var(--surface)]"
                    style={{ background: s === "typing" ? "#d4a017" : s === "active" ? "#4a9960" : isDark ? "#333" : "#ccc" }} />
                </div>
                <span>{a.name}</span>
                <span className="text-[9px] font-mono opacity-40 uppercase tracking-wider hidden sm:block">{a.shortRole}</span>
              </button>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={toggleTheme} className="w-7 h-7 rounded-md flex items-center justify-center border transition-colors" style={{ borderColor: bdr, background: "transparent", color: mut }}>
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => router.push(`/workspace/${projectId}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
            style={{ background: fg, color: fgInv, border: `1px solid ${fg}` }}
          >
            <Sparkles className="w-3 h-3" />
            Workspace
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* ── BODY ─────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── CHAT AREA ─────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Agent sub-header */}
          <div className="flex-shrink-0 px-5 py-2.5 border-b flex items-center gap-3" style={{ borderColor: bdr, background: surf }}>
            <div className="relative shrink-0">
              <RobotAgent agentId={activeId} size={36} typing={isTyping} />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: surf, background: isTyping ? "#d4a017" : "#4a9960" }} />
            </div>
            <div>
              <div className="text-sm font-semibold">{activeAgent.name}</div>
              <div className="text-[11px] mt-0.5" style={{ color: mut }}>
                {isTyping ? "Typing…" : activeAgent.role}
              </div>
            </div>
            {/* Suggestion chips */}
            <div className="ml-auto flex gap-1.5 overflow-x-auto hide-scrollbar">
              {prompts.slice(0, 2).map((p) => (
                <button key={p} onClick={() => handleSend(p)} disabled={isTyping}
                  className="shrink-0 px-2.5 py-1 rounded-md text-[11px] border transition-colors disabled:opacity-40 hidden md:block"
                  style={{ borderColor: bdr, color: mut, background: "transparent" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ scrollbarWidth: "thin", scrollbarColor: `${bdr} transparent` }}>
            <AnimatePresence initial={false}>
              {currentMsgs.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                    className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
                    {/* Avatar */}
                    {!isUser && <div className="shrink-0 mt-0.5"><RobotAgent agentId={activeId} size={30} /></div>}
                    {isUser && (
                      <div className="shrink-0 mt-0.5 w-[30px] h-[30px] rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: fg, color: fgInv }}>YOU</div>
                    )}
                    <div className={cn("flex flex-col gap-1 max-w-[75%]", isUser ? "items-end" : "items-start")}>
                      {!isUser && (
                        <span className="text-[10px] font-medium px-0.5" style={{ color: mut }}>{msg.agentName}</span>
                      )}
                      <div className="px-4 py-2.5 text-sm leading-relaxed"
                        style={isUser ? {
                          background: fg, color: fgInv,
                          borderRadius: "14px 14px 4px 14px",
                        } : {
                          background: surf, color: fg,
                          border: `1px solid ${bdr}`,
                          borderRadius: "14px 14px 14px 4px",
                        }}
                      >
                        <span className="font-chat-message">{msg.content}</span>
                      </div>
                      <span className="text-[9px] px-0.5" style={{ color: mut }}>
                        {msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex gap-3 items-end">
                  <RobotAgent agentId={activeId} size={30} typing />
                  <div className="px-4 py-3 flex gap-1.5 items-center" style={{ background: surf, border: `1px solid ${bdr}`, borderRadius: "14px 14px 14px 4px" }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: mut }}
                        animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          {/* Prompt chips — mobile */}
          <div className="flex-shrink-0 px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar md:hidden">
            {prompts.map((p) => (
              <button key={p} onClick={() => handleSend(p)} disabled={isTyping}
                className="shrink-0 px-2.5 py-1 rounded-md text-[11px] border disabled:opacity-40"
                style={{ borderColor: bdr, color: mut }}>
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 px-4 pb-4 pt-2">
            <div className="flex items-end gap-2.5 border rounded-xl px-3.5 py-2.5 transition-colors"
              style={{ background: surf, borderColor: bdr }}>
              <div className="shrink-0 mb-0.5"><RobotAgent agentId={activeId} size={18} /></div>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKey}
                disabled={isTyping}
                placeholder={`Message ${activeAgent.name}…`}
                className="flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none min-h-[20px] max-h-[120px] disabled:opacity-40 font-chat"
                style={{ color: fg, scrollbarWidth: "none" }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-25"
                style={{ background: fg, color: fgInv }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-center text-[9px] mt-1.5" style={{ color: mut }}>
              <kbd className="border rounded px-1 text-[8px]" style={{ borderColor: bdr }}>↵</kbd> to send
            </p>
          </div>
        </main>

        {/* ── RIGHT PANEL ────────────────────────────────── */}
        <aside className="w-[240px] shrink-0 flex flex-col border-l overflow-hidden" style={{ borderColor: bdr, background: surf }}>

          {/* Header */}
          <div className="shrink-0 px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: bdr }}>
            <Activity className="w-3.5 h-3.5" style={{ color: mut }} />
            <span className="text-xs font-semibold">Conversation Log</span>
            {history.length > 0 && (
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded border" style={{ borderColor: bdr, color: mut }}>
                {history.length}
              </span>
            )}
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: `${bdr} transparent` }}>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
                <Clock className="w-6 h-6" style={{ color: bdr }} />
                <p className="text-xs leading-relaxed" style={{ color: mut }}>History appears here as you chat.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {history.map((entry, i) => {
                  const a = AGENTS.find((x) => x.id === entry.agentId) || AGENTS[0];
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
                      className="px-4 py-3 border-b cursor-default" style={{ borderColor: bdr }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <RobotAgent agentId={entry.agentId} size={16} />
                        <span className="text-[10px] font-semibold" style={{ color: fg }}>{entry.agentName}</span>
                        <span className="ml-auto text-[9px]" style={{ color: mut }}>{entry.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-[10px] leading-snug line-clamp-1 mb-1" style={{ color: mut }}>
                        <span style={{ color: fg }}>You:</span> {entry.userMsg}
                      </p>
                      <p className="text-[10px] leading-snug line-clamp-2" style={{ color: mut }}>
                        <span style={{ color: fg }}>{a.name}:</span> {entry.agentMsg}
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Agent switcher */}
          <div className="shrink-0 border-t px-3 py-3" style={{ borderColor: bdr }}>
            <p className="text-[9px] uppercase tracking-widest mb-2 font-medium" style={{ color: mut }}>Switch Agent</p>
            <div className="grid grid-cols-2 gap-1">
              {AGENTS.map((a) => (
                <button key={a.id} onClick={() => setActiveId(a.id)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-medium border transition-all"
                  style={{
                    borderColor: activeId === a.id ? fg : bdr,
                    background: activeId === a.id ? (isDark ? "#1a1a1a" : "#f0f0f0") : "transparent",
                    color: activeId === a.id ? fg : mut,
                  }}>
                  <RobotAgent agentId={a.id} size={14} />
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
