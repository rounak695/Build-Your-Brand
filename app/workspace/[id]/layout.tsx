"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Hammer,
  Package,
  Palette,
  TrendingUp,
  Settings,
  BarChart3,
  CheckSquare,
  FolderOpen,
  BookOpen,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Share2,
  MessageSquare,
  X,
  ArrowRight,
  Send,
  Sparkles,
  Command
} from "lucide-react";
import { useBrain } from "@/lib/brain";
import { cn, getAgentStatusColor, getAgentStatusLabel } from "@/lib/utils";
import { getSuggestedPrompts, getAgentReply, runGlobalSyncSequence } from "@/lib/services";
import RobotAgent from "@/components/RobotAgent";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutGrid, href: "" },
  { id: "build", label: "Build Board", icon: Hammer, href: "/build" },
  { id: "divider1", type: "divider" },
  { id: "product", label: "Product", icon: Package, href: "/product" },
  { id: "brand", label: "Brand", icon: Palette, href: "/brand" },
  { id: "growth", label: "Growth", icon: TrendingUp, href: "/growth" },
  { id: "operations", label: "Operations", icon: Settings, href: "/operations" },
  { id: "divider2", type: "divider" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
  { id: "tasks", label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { id: "decisions", label: "Decisions", icon: BookOpen, href: "/decisions" },
  { id: "files", label: "Files", icon: FolderOpen, href: "/files" },
  { id: "team", label: "AI Team", icon: Users, href: "/team" },
];

interface AskPanelMessage {
  id: string;
  role: "user" | "assistant";
  agentName?: string;
  content: string;
  sources?: string[];
  decision?: string | null;
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const projectId = params.id as string;
  const brain = useBrain();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<"ceo" | "product" | "growth" | "operations">("ceo");
  const [askInput, setAskInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  // Command palette state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Separate chat logs for each agent
  const [chatHistory, setChatHistory] = useState<Record<string, AskPanelMessage[]>>({
    ceo: [
      {
        id: "init-ceo",
        role: "assistant",
        agentName: "Nova · Chief Executive Agent",
        content: "Hello! I am Nova. I coordinate our departments and maintain consistency. Let me know what high-level changes you want to make to your business."
      }
    ],
    product: [
      {
        id: "init-prod",
        role: "assistant",
        agentName: "Mira · Product & Brand Director",
        content: "Welcome! I am Mira. I run our product definitions, MVP roadmap, and frontend website experience. Let me know if you want to alter styling or add features."
      }
    ],
    growth: [
      {
        id: "init-growth",
        role: "assistant",
        agentName: "Ari · Growth Director",
        content: "Hey there! I am Ari. I handle trend analysis, social content scripts, and creator selection. Type below to query target curators or construct campaign hooks."
      }
    ],
    operations: [
      {
        id: "init-ops",
        role: "assistant",
        agentName: "Noah · Operations Director",
        content: "Hello! Noah here. I compute pricing models, variable COGS, shipping budgets, and launch timelines. Ask me to recalculate economics or check margins."
      }
    ]
  });

  const baseHref = `/workspace/${projectId}`;
  const currentPath = pathname.replace(baseHref, "") || "";

  const activeItem = NAV_ITEMS.find((item) => {
    if ("href" in item) {
      return item.href === currentPath || (item.href === "" && currentPath === "");
    }
    return false;
  });

  const activeAgent = brain.agents.find((a) => a.id === selectedAgentId) || brain.agents[0];

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, selectedAgentId, isAsking]);

  // Bind Cmd+K command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAsk = async (textToSend?: string) => {
    const messageText = textToSend || askInput;
    if (!messageText.trim() || isAsking) return;

    const currentAgent = brain.agents.find((a) => a.id === selectedAgentId) || brain.agents[0];
    const userMsg: AskPanelMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText.trim()
    };

    // Append to current agent history
    setChatHistory((prev) => ({
      ...prev,
      [selectedAgentId]: [...prev[selectedAgentId], userMsg]
    }));
    
    if (!textToSend) setAskInput("");
    setIsAsking(true);

    // Check if it's a global sync request (Magic Moment!)
    const lowercaseText = messageText.toLowerCase();
    const isGlobalDirective = lowercaseText.includes("premium") || lowercaseText.includes("editorial");

    if (selectedAgentId === "ceo" && isGlobalDirective) {
      // Run full team simulation sequence!
      try {
        await runGlobalSyncSequence(messageText, brain, (evt: { type: string; agentId?: string; status?: string; message?: string }) => {
          if (evt.type === "agent.progress" || evt.type === "agent.handoff" || evt.type === "project.updated") {
            const systemMsg: AskPanelMessage = {
              id: Math.random().toString(36).slice(2),
              role: "assistant",
              agentName: "Nova · Chief Executive Agent",
              content: evt.message
            };
            setChatHistory((prev) => ({
              ...prev,
              ceo: [...prev.ceo, systemMsg]
            }));
          }
        });
      } catch (err) {
        console.error("Global sync failed:", err);
      } finally {
        setIsAsking(false);
      }
      return;
    }

    // Direct Agent Chat simulation
    setTimeout(() => {
      const result = getAgentReply(selectedAgentId, messageText, brain.project?.name || "Velocity");
      
      const agentMsg: AskPanelMessage = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        agentName: `${currentAgent.name} · ${currentAgent.role}`,
        content: result.reply,
        sources: result.sources,
        decision: result.decision
      };

      // If a decision was created, add it to brain decisions
      if (result.decision) {
        brain.addDecision({
          title: result.decision,
          description: `Decided in direct communication with ${currentAgent.name}.`,
          madeBy: `${currentAgent.name} · ${currentAgent.role}`,
          reason: `User requested: "${messageText}"`,
          confidence: 88,
          impact: "MEDIUM",
          reversible: true
        });
      }

      setChatHistory((prev) => ({
        ...prev,
        [selectedAgentId]: [...prev[selectedAgentId], agentMsg]
      }));
      setIsAsking(false);
    }, 1000);
  };

  const executeCommand = (cmd: string) => {
    setCommandPaletteOpen(false);
    setCommandSearch("");

    if (cmd === "premium") {
      setSelectedAgentId("ceo");
      handleAsk("Make the brand more premium");
    } else if (cmd === "product") {
      router.push(`/workspace/${projectId}/product`);
    } else if (cmd === "growth") {
      router.push(`/workspace/${projectId}/growth`);
    } else if (cmd === "operations") {
      router.push(`/workspace/[id]/operations`);
    } else if (cmd === "decisions") {
      router.push(`/workspace/${projectId}/decisions`);
    } else if (cmd === "website") {
      router.push(`/workspace/${projectId}/product?tab=Website`);
    } else if (cmd === "plan") {
      router.push(`/workspace/${projectId}/operations?tab=Launch Plan`);
    } else if (cmd === "chat") {
      setPanelOpen(true);
    }
  };

  // Commands available in Cmd+K palette
  const ALL_COMMANDS = [
    { id: "premium", label: "Make the brand more premium", desc: "Triggers global team sync across all departments" },
    { id: "product", label: "Open Product Workspace", desc: "Review user strategy and MVP features" },
    { id: "growth", label: "Open Growth Workspace", desc: "View campaigns, content, and creators" },
    { id: "operations", label: "Open Operations Workspace", desc: "Review pricing models and unit economics" },
    { id: "decisions", label: "View Decisions Log", desc: "Chronological decision tracking" },
    { id: "website", label: "Review Website Blueprint", desc: "Open live browser code/preview frame" },
    { id: "plan", label: "Check Launch Plan Roadmap", desc: "Check current launch timeline details" },
    { id: "chat", label: "Ask your AI Team", desc: "Focus cursor on right companion chat" },
  ];

  const filteredCommands = ALL_COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(commandSearch.toLowerCase()) ||
      c.desc.toLowerCase().includes(commandSearch.toLowerCase())
  );

  const project = brain.project;
  const projectName = project?.name || "Your Company";
  const projectStage = project?.stage || "BUILDING";

  // Active agents count
  const activeAgentsCount = brain.agents.filter((a) => a.status === "WORKING" || a.status === "RESEARCHING" || a.status === "THINKING").length;

  return (
    <div className={cn(
      "h-screen flex flex-col overflow-hidden bg-[var(--background)] relative",
      "workspace-layout"
    )} style={{
      display: "grid",
      gridTemplateColumns: sidebarCollapsed 
        ? (panelOpen ? "60px 1fr 380px" : "60px 1fr") 
        : (panelOpen ? "220px 1fr 380px" : "220px 1fr"),
      gridTemplateRows: "56px 1fr",
      transition: "grid-template-columns 0.25s cubic-bezier(0.16,1,0.3,1)"
    }}>
      {/* ── Top Bar ── */}
      <header
        className="border-b border-[var(--border)] flex items-center px-5 gap-4 bg-[var(--surface)] z-10"
        style={{ gridColumn: "1 / -1" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-small font-semibold text-[var(--foreground)] tracking-tight">Xcelerate</span>
          )}
        </Link>

        <div className="w-px h-5 bg-[var(--border)]" />

        {/* Project details */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="font-semibold text-[var(--foreground)] truncate" style={{ fontSize: "0.9375rem" }}>
            {projectName}
          </h1>
          <span className="text-micro font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] shrink-0">
            {projectStage === "BUILDING" ? "Building" : "Live"}
          </span>

          {project && (
            <div className="flex items-center gap-1.5 text-micro text-[var(--muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] dot-pulse" />
              {project.readiness}% ready to launch
            </div>
          )}
        </div>

        {/* Global status of active agents */}
        <div className="hidden md:flex items-center gap-1.5 text-micro text-[var(--muted)] mr-4 border border-[var(--border)] px-2.5 py-1 rounded-full bg-[var(--background)]">
          <span className={cn(
            "w-2 h-2 rounded-full",
            activeAgentsCount > 0 ? "bg-green-500 animate-pulse" : "bg-[var(--muted)]"
          )} />
          <span>{activeAgentsCount > 0 ? `${activeAgentsCount} agents active` : "team idle"}</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-small font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors border border-transparent hover:border-[var(--border)]"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden md:inline text-micro text-[var(--muted)] border border-[var(--border)] rounded px-1 py-0.5">⌘K</kbd>
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors relative border border-transparent hover:border-[var(--border)]">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
          </button>

          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-small font-semibold transition-colors border",
              panelOpen
                ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                : "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--background)]"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Companion</span>
          </button>
        </div>
      </header>

      {/* ── Left Sidebar ── */}
      <aside className="border-r border-[var(--border)] flex flex-col bg-[var(--surface)] overflow-hidden z-10">
        <div className="p-3 flex justify-end border-b border-[var(--border)]">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            if ("type" in item && item.type === "divider") {
              return <div key={item.id} className="my-2 mx-3 h-px bg-[var(--border)]" />;
            }
            if (!("href" in item)) return null;

            const Icon = item.icon as React.ElementType;
            const isActive = activeItem?.id === item.id;
            const href = `${baseHref}${item.href}`;

            return (
              <Link
                key={item.id}
                href={href}
                title={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-small transition-colors",
                  isActive
                    ? "bg-[var(--accent-light)] text-[var(--accent)] font-semibold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Agent status footer (Quiet Presence list) */}
        {!sidebarCollapsed && (
          <div className="border-t border-[var(--border)] p-4 bg-[var(--surface)]">
            <p className="text-label text-[var(--muted)] mb-3">AI Team</p>
            <div className="space-y-3">
              {brain.agents.map((agent) => (
                <div key={agent.id} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
                    <RobotAgent agentId={agent.id} size={28} headOnly={true} />
                    <div 
                      className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full border border-[var(--surface)]"
                      style={{ background: getAgentStatusColor(agent.status) }}
                    />
                  </div>
                  <span className="text-small text-[var(--foreground)] font-medium truncate">{agent.name}</span>
                  <span className="text-micro text-[var(--muted)] ml-auto truncate uppercase tracking-widest text-[9px]">
                    {getAgentStatusLabel(agent.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Canvas + Right Panel ── */}
      <div className="flex overflow-hidden relative" style={{ gridColumn: "span 2" }}>
        {/* Main canvas */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)] relative">
          {children}
        </main>

        {/* Right Panel - Persistent AI Companion */}
        <AnimatePresence>
          {panelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="shrink-0 border-l border-[var(--border)] bg-[var(--surface)] flex flex-col overflow-hidden h-full z-10"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
                <div>
                  <h2 className="font-bold text-[var(--foreground)] tracking-tight text-small flex items-center gap-1.5">
                    AI TEAM
                    <span className="text-micro bg-[var(--accent-light)] text-[var(--accent)] px-2 py-0.5 rounded-full lowercase tracking-normal font-semibold">
                      {activeAgentsCount > 0 ? `${activeAgentsCount} working` : "idle"}
                    </span>
                  </h2>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selector Tabs (Nova, Mira, Ari, Noah) */}
              <div className="grid grid-cols-4 border-b border-[var(--border)] bg-[var(--background)] p-1 gap-1">
                {brain.agents.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAgentId(a.id as "ceo" | "product" | "growth" | "operations")}
                    className={cn(
                      "py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all",
                      selectedAgentId === a.id
                        ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm border border-[var(--border)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {a.name}
                  </button>
                ))}
              </div>

              {/* Current Selected Agent Info */}
              <div className="px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
                  <RobotAgent agentId={activeAgent.id} size={48} headOnly={true} />
                  {(activeAgent.status === "WORKING" || activeAgent.status === "THINKING" || activeAgent.status === "RESEARCHING") && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[var(--surface)] animate-ping" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-small font-semibold text-[var(--foreground)] leading-tight">
                    {activeAgent.name}
                  </h4>
                  <p className="text-micro text-[var(--muted)] truncate mt-0.5">
                    {activeAgent.role} · <span className="lowercase">{getAgentStatusLabel(activeAgent.status)}</span>
                  </p>
                </div>
              </div>

              {/* Selected Agent Chat History */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background)]"
              >
                {(chatHistory[selectedAgentId] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-1.5 animate-fade-in-up",
                      msg.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <span className="text-micro font-semibold text-[var(--accent)] px-0.5">
                        {msg.agentName}
                      </span>
                    )}
                    <div
                      className={cn(
                        "text-small rounded-xl px-3.5 py-2.5 max-w-[85%] leading-relaxed shadow-sm border",
                        msg.role === "user"
                          ? "bg-[var(--accent)] text-white border-[var(--accent)] rounded-tr-none"
                          : "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)] rounded-tl-none"
                      )}
                    >
                      {msg.content}
                    </div>

                    {/* Source citation list */}
                    {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1 px-1">
                        {msg.sources.map((src, idx) => (
                          <span
                            key={idx}
                            className="text-micro text-[var(--muted)] px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] flex items-center gap-1 cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {isAsking && (
                  <div className="flex flex-col gap-1.5 animate-fade-in items-start">
                    <span className="text-micro font-semibold text-[var(--accent)] px-0.5">
                      {activeAgent.name} · typing
                    </span>
                    <div className="flex items-end gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 rounded-tl-none shadow-sm max-w-[85%]">
                      <RobotAgent agentId={activeAgent.id} size={50} typing={true} className="shrink-0" />
                      <div className="flex gap-1 pb-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]"
                            style={{ animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input & Suggestions */}
              <div className="border-t border-[var(--border)] p-4 bg-[var(--surface)]">
                {/* Suggestions chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-none">
                  {getSuggestedPrompts(selectedAgentId).map((q) => (
                    <button
                      key={q}
                      onClick={() => setAskInput(q)}
                      className="shrink-0 text-micro px-3 py-1.5 rounded-full bg-[var(--background)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="flex items-end gap-2">
                  <textarea
                    value={askInput}
                    onChange={(e) => setAskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAsk();
                      }
                    }}
                    rows={2}
                    placeholder={`Ask ${activeAgent.name} anything...`}
                    className="flex-1 resize-none bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-small text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  <button
                    onClick={() => handleAsk()}
                    disabled={!askInput.trim() || isAsking}
                    className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-[var(--accent)] text-white disabled:opacity-40 hover:opacity-90 transition-all active:scale-95 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── Command Palette Overlay ── */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandPaletteOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] bg-[var(--surface)]">
                <Command className="w-4 h-4 text-[var(--muted)] shrink-0" />
                <input
                  type="text"
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  placeholder="Type a command or search everything..."
                  className="flex-1 bg-transparent border-0 outline-none text-small text-[var(--foreground)] placeholder:text-[var(--muted)]"
                  autoFocus
                />
                <button
                  onClick={() => setCommandPaletteOpen(false)}
                  className="p-1 rounded-md text-[var(--muted)] hover:bg-[var(--background)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Commands List */}
              <div className="max-h-[300px] overflow-y-auto p-2 bg-[var(--surface)]">
                {filteredCommands.map((cmd) => (
                  <div
                    key={cmd.id}
                    onClick={() => executeCommand(cmd.id)}
                    className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl hover:bg-[var(--background)] cursor-pointer transition-colors"
                  >
                    <span className="text-small font-semibold text-[var(--foreground)] flex items-center gap-2">
                      {cmd.id === "premium" && <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />}
                      {cmd.label}
                    </span>
                    <span className="text-micro text-[var(--muted)]">{cmd.desc}</span>
                  </div>
                ))}
                {filteredCommands.length === 0 && (
                  <p className="text-small text-[var(--muted)] text-center py-8">No commands match your query</p>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-[var(--background)] border-t border-[var(--border)] flex items-center justify-between text-micro text-[var(--muted)]">
                <span>Use ↑↓ to navigate, Enter to select</span>
                <span>ESC to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
