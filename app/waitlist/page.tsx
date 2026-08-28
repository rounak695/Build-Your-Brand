"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  Sun,
  Moon,
  Copy,
  Check,
  Share2,
  Bot,
  Code2,
  Layers,
  TrendingUp,
  ArrowLeft,
  Sparkles,
  Zap,
  Shield,
  Terminal,
  Activity,
  ChevronRight,
  Boxes,
  Cpu,
  Globe
} from "lucide-react";
import XcelerateLogo from "@/components/XcelerateLogo";
import RobotAgent from "@/components/RobotAgent";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"agents" | "code" | "brand" | "growth">("agents");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to join waitlist. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setQueuePosition(data.position || 428);
      setIsSubmitted(true);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReferral = () => {
    if (typeof window !== "undefined") {
      const refLink = `${window.location.origin}/waitlist?ref=${queuePosition || 428}`;
      navigator.clipboard.writeText(refLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div
      className={`min-h-screen relative flex flex-col justify-between overflow-x-hidden font-sans transition-colors duration-300 ${
        theme === "light"
          ? "bg-[#FFFFFF] text-zinc-950"
          : "bg-[#08080A] text-zinc-50"
      }`}
    >
      {/* Subtle Micro-Grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage:
            theme === "light"
              ? "radial-gradient(#e4e4e7 1px, transparent 1px), linear-gradient(to right, rgba(228, 228, 231, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(228, 228, 231, 0.3) 1px, transparent 1px)"
              : "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
          backgroundSize: "32px 32px, 128px 128px, 128px 128px",
          backgroundPosition: "center center",
        }}
      />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
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
              EARLY ACCESS
            </span>
          </span>
        </Link>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              theme === "light"
                ? "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Main Website</span>
          </Link>
          <Link
            href="/swarm"
            className={`hidden md:flex px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              theme === "light"
                ? "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            AI Swarm Simulator
          </Link>

          {/* Theme Switcher */}
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

      {/* Main Dual-Panel Split Layout */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8 max-w-7xl mx-auto w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* LEFT PANEL: Founder's Registration Portal (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col text-left">
            
            {/* Status Pill */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full mb-6 text-xs font-mono tracking-wider uppercase border w-fit ${
                theme === "light"
                  ? "bg-zinc-100 text-zinc-900 border-zinc-200"
                  : "bg-zinc-900 text-zinc-200 border-zinc-800"
              }`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${theme === "light" ? "bg-zinc-950" : "bg-white"}`} />
              <span>BATCH #1 OPEN • 500 VIP SPOTS</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 leading-[1.04]"
            >
              Build out{" "}
              <span
                className={
                  theme === "light"
                    ? "text-zinc-950 underline decoration-zinc-300 decoration-2 underline-offset-8"
                    : "text-white underline decoration-zinc-700 decoration-2 underline-offset-8"
                }
              >
                loud.
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`text-base sm:text-lg mb-8 leading-relaxed font-normal max-w-lg ${
                theme === "light" ? "text-zinc-600" : "text-zinc-400"
              }`}
            >
              An autonomous <strong className={theme === "light" ? "text-zinc-950 font-semibold" : "text-white font-semibold"}>AI Swarm Engine</strong> working alongside you. Turn raw prompts into production code, design systems, and viral launch campaigns.
            </motion.p>

            {/* Registration Form Box */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full max-w-md"
            >
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="space-y-4"
                  >
                    {/* Email Input Bar */}
                    <div
                      className={`flex flex-col sm:flex-row items-stretch gap-2 p-1.5 rounded-2xl border transition-all duration-200 ${
                        theme === "light"
                          ? "bg-white border-zinc-300 shadow-xl shadow-zinc-200/60 focus-within:border-zinc-950 focus-within:ring-1 focus-within:ring-zinc-950"
                          : "bg-zinc-900/90 border-zinc-800 shadow-2xl shadow-black/80 focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400"
                      }`}
                    >
                      <div className="relative flex-1 flex items-center pl-4 pr-2 py-2">
                        <Mail
                          className={`w-4.5 h-4.5 mr-3 shrink-0 ${
                            theme === "light" ? "text-zinc-400" : "text-zinc-500"
                          }`}
                        />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your work email..."
                          className={`w-full bg-transparent border-none outline-none text-sm font-medium placeholder:font-normal transition-colors ${
                            theme === "light"
                              ? "text-zinc-950 placeholder:text-zinc-400"
                              : "text-white placeholder:text-zinc-500"
                          }`}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-7 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shrink-0 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${
                          theme === "light"
                            ? "bg-zinc-950 hover:bg-zinc-800 active:bg-black text-white shadow-md"
                            : "bg-white hover:bg-zinc-200 active:bg-zinc-100 text-zinc-950 shadow-md"
                        }`}
                      >
                        {isSubmitting ? (
                          <span
                            className={`inline-block w-4 h-4 border-2 rounded-full animate-spin ${
                              theme === "light"
                                ? "border-white/30 border-t-white"
                                : "border-black/30 border-t-black"
                            }`}
                          />
                        ) : (
                          <>
                            <span>Join waitlist</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </div>

                    {errorMessage && (
                      <p className="text-xs text-rose-500 text-left pl-3 font-medium">
                        {errorMessage}
                      </p>
                    )}

                    {/* Social Proof */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex -space-x-2">
                        <img
                          className={`inline-block h-6 w-6 rounded-full ring-2 object-cover ${
                            theme === "light" ? "ring-white" : "ring-zinc-900"
                          }`}
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                          alt="User avatar"
                        />
                        <img
                          className={`inline-block h-6 w-6 rounded-full ring-2 object-cover ${
                            theme === "light" ? "ring-white" : "ring-zinc-900"
                          }`}
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                          alt="User avatar"
                        />
                        <img
                          className={`inline-block h-6 w-6 rounded-full ring-2 object-cover ${
                            theme === "light" ? "ring-white" : "ring-zinc-900"
                          }`}
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                          alt="User avatar"
                        />
                      </div>
                      <p className={`text-xs font-medium ${theme === "light" ? "text-zinc-700" : "text-zinc-300"}`}>
                        <strong className={theme === "light" ? "text-zinc-950 font-bold" : "text-white font-bold"}>
                          4,820+ founders
                        </strong>{" "}
                        in line
                        <span className="inline-block mx-2 text-zinc-300 dark:text-zinc-700">•</span>
                        <span className={`font-semibold ${theme === "light" ? "text-emerald-700" : "text-emerald-400"}`}>
                          12 VIP spots left
                        </span>
                      </p>
                    </div>
                  </motion.form>
                ) : (
                  /* Success State Card */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-2xl border text-center space-y-4 ${
                      theme === "light"
                        ? "bg-white border-zinc-200 shadow-2xl text-zinc-950"
                        : "bg-zinc-900 border-zinc-800 shadow-2xl text-zinc-100"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto border ${
                        theme === "light"
                          ? "bg-zinc-100 border-zinc-200 text-zinc-950"
                          : "bg-zinc-800 border-zinc-700 text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold tracking-tight">You&apos;re on the waitlist! 🎉</h3>
                      <p className={`text-xs mt-1 ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
                        We sent confirmation to <strong className={theme === "light" ? "text-zinc-950" : "text-white"}>{email}</strong>
                      </p>
                    </div>

                    <div
                      className={`p-3.5 rounded-xl border font-mono text-sm flex items-center justify-between ${
                        theme === "light"
                          ? "bg-zinc-50 border-zinc-200"
                          : "bg-zinc-950 border-zinc-800"
                      }`}
                    >
                      <span className={`text-xs ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>Queue Position:</span>
                      <span className={`font-bold text-base ${theme === "light" ? "text-zinc-950" : "text-white"}`}>
                        #{queuePosition} in line
                      </span>
                    </div>

                    {/* Referral Link */}
                    <div className="space-y-3 pt-1">
                      <p className={`text-xs text-left font-medium ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
                        Move up 10 spots for every friend who joins:
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <button
                          onClick={handleCopyReferral}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                            theme === "light"
                              ? "bg-zinc-950 hover:bg-zinc-800 text-white"
                              : "bg-white hover:bg-zinc-200 text-zinc-950"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied referral link!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy referral link</span>
                            </>
                          )}
                        </button>
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            "I just joined the early access waitlist for @XcelerateAI! Turn ideas into full-stack SaaS apps automatically. Join me here: "
                          )}&url=${encodeURIComponent(
                            typeof window !== "undefined"
                              ? `${window.location.origin}/waitlist?ref=${queuePosition || 428}`
                              : "https://xcelerate.ai"
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full sm:w-auto py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                            theme === "light"
                              ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800"
                              : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200"
                          }`}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share on X</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* RIGHT PANEL: Interactive Live Swarm Terminal Showcase (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            
            {/* Interactive Showcase Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full relative"
            >
              <div
                className={`rounded-2xl border p-1 shadow-2xl transition-all duration-300 ${
                  theme === "light"
                    ? "bg-white border-zinc-200 shadow-zinc-300/50"
                    : "bg-zinc-900 border-zinc-800 shadow-black/80"
                }`}
              >
                {/* Header Window Bar */}
                <div className="bg-[#0A0A0C] text-zinc-100 rounded-xl overflow-hidden border border-zinc-800/90 p-4 text-left font-sans">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                      </div>
                      <div className="h-3.5 w-px bg-zinc-800 mx-1.5" />
                      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                        <XcelerateLogo size={14} className="text-zinc-200" />
                        xcelerate-swarm-v3.0
                      </span>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                      <button
                        onClick={() => setActiveTab("agents")}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                          activeTab === "agents"
                            ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Agents
                      </button>
                      <button
                        onClick={() => setActiveTab("code")}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                          activeTab === "code"
                            ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Code
                      </button>
                      <button
                        onClick={() => setActiveTab("brand")}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                          activeTab === "brand"
                            ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Brand
                      </button>
                      <button
                        onClick={() => setActiveTab("growth")}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                          activeTab === "growth"
                            ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Growth
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Tab Visual Content */}
                  <div className="min-h-[220px] flex flex-col justify-center">
                    {activeTab === "agents" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-2.5"
                      >
                        <div className="flex items-center justify-between bg-zinc-900/90 p-3 rounded-lg border border-zinc-800">
                          <div className="flex items-center gap-3">
                            <RobotAgent agentId="product" size={32} typing={true} />
                            <div>
                              <p className="text-xs font-semibold text-white flex items-center gap-2">
                                Product Architect
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-200 animate-pulse" />
                              </p>
                              <p className="text-[10px] text-zinc-400">Scaffolding Next.js 16 PRD & features...</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                            ACTIVE
                          </span>
                        </div>

                        <div className="flex items-center justify-between bg-zinc-900/90 p-3 rounded-lg border border-zinc-800">
                          <div className="flex items-center gap-3">
                            <RobotAgent agentId="tech" size={32} typing={true} />
                            <div>
                              <p className="text-xs font-semibold text-white flex items-center gap-2">
                                Tech Lead Agent
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-200 animate-pulse" />
                              </p>
                              <p className="text-[10px] text-zinc-400">Compiling TypeScript API & Tailwind CSS...</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                            BUILDING
                          </span>
                        </div>

                        <div className="flex items-center justify-between bg-zinc-900/90 p-3 rounded-lg border border-zinc-800">
                          <div className="flex items-center gap-3">
                            <RobotAgent agentId="growth" size={32} typing={true} />
                            <div>
                              <p className="text-xs font-semibold text-white flex items-center gap-2">
                                Growth Director
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-200 animate-pulse" />
                              </p>
                              <p className="text-[10px] text-zinc-400">Targeting 3,200 creator leads for launch...</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                            SYNCING
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "code" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-mono text-[11px] leading-relaxed text-zinc-300 space-y-1.5 bg-zinc-950 p-4 rounded-lg border border-zinc-800"
                      >
                        <p className="text-zinc-100"><span className="text-zinc-500">1</span> import <span className="text-zinc-300">{"{ XcelerateSwarm }"}</span> from <span className="text-zinc-400">&apos;@xcelerate/ai&apos;</span>;</p>
                        <p className="text-zinc-100"><span className="text-zinc-500">2</span> const <span className="text-zinc-300">startup</span> = new XcelerateSwarm(&#123;</p>
                        <p className="text-zinc-100 pl-4"><span className="text-zinc-400">idea</span>: <span className="text-zinc-300">&quot;AI OS for Creators&quot;</span>,</p>
                        <p className="text-zinc-100 pl-4"><span className="text-zinc-400">stack</span>: [<span className="text-zinc-300">&quot;Next.js 16&quot;</span>, <span className="text-zinc-300">&quot;Tailwind CSS&quot;</span>]</p>
                        <p className="text-zinc-100">&#125;);</p>
                        <p className="text-zinc-100"><span className="text-zinc-500">5</span> await <span className="text-zinc-300">startup</span>.launchVenture();</p>
                      </motion.div>
                    )}

                    {activeTab === "brand" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                          <span>Brand Palette System</span>
                          <span className="font-mono text-[10px] text-zinc-400">Outfit Geometric Sans</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="h-12 rounded bg-black border border-zinc-700 flex items-center justify-center text-[10px] font-mono text-white">#000000</div>
                          <div className="h-12 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-mono text-zinc-200">#27272A</div>
                          <div className="h-12 rounded bg-zinc-300 border border-zinc-200 flex items-center justify-center text-[10px] font-mono text-zinc-900">#E4E4E7</div>
                          <div className="h-12 rounded bg-white border border-zinc-300 flex items-center justify-center text-[10px] font-mono text-zinc-950">#FFFFFF</div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "growth" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3 p-2"
                      >
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span>Waitlist Conversion Funnel</span>
                          <span className="text-white font-bold font-mono">+148% growth</span>
                        </div>
                        <div className="h-28 w-full flex items-end justify-between gap-2 pt-2">
                          {[35, 45, 60, 50, 75, 90, 110, 130, 160].map((h, i) => (
                            <div
                              key={i}
                              style={{ height: `${(h / 160) * 100}%` }}
                              className="w-full bg-zinc-200 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Horizontal Editorial Feature Strip Below Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left"
        >
          <div
            className={`p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${
              theme === "light"
                ? "bg-white border-zinc-200 shadow-sm hover:border-zinc-400"
                : "bg-zinc-900/60 border-zinc-800/90 hover:border-zinc-700"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${
                theme === "light"
                  ? "bg-zinc-100 border-zinc-200 text-zinc-950"
                  : "bg-zinc-800 border-zinc-700 text-zinc-100"
              }`}
            >
              <Bot className="w-4.5 h-4.5" />
            </div>
            <h4 className={`text-sm font-bold mb-1 ${theme === "light" ? "text-zinc-950" : "text-white"}`}>
              Multi-Agent Swarm
            </h4>
            <p className={`text-xs leading-relaxed ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
              Product, Tech, Design & Growth AI agents collaborating live to build your startup.
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${
              theme === "light"
                ? "bg-white border-zinc-200 shadow-sm hover:border-zinc-400"
                : "bg-zinc-900/60 border-zinc-800/90 hover:border-zinc-700"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${
                theme === "light"
                  ? "bg-zinc-100 border-zinc-200 text-zinc-950"
                  : "bg-zinc-800 border-zinc-700 text-zinc-100"
              }`}
            >
              <Code2 className="w-4.5 h-4.5" />
            </div>
            <h4 className={`text-sm font-bold mb-1 ${theme === "light" ? "text-zinc-950" : "text-white"}`}>
              Production Codebase
            </h4>
            <p className={`text-xs leading-relaxed ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
              Generates clean Next.js 16, Tailwind CSS, and TypeScript code ready for GitHub.
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${
              theme === "light"
                ? "bg-white border-zinc-200 shadow-sm hover:border-zinc-400"
                : "bg-zinc-900/60 border-zinc-800/90 hover:border-zinc-700"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${
                theme === "light"
                  ? "bg-zinc-100 border-zinc-200 text-zinc-950"
                  : "bg-zinc-800 border-zinc-700 text-zinc-100"
              }`}
            >
              <Zap className="w-4.5 h-4.5" />
            </div>
            <h4 className={`text-sm font-bold mb-1 ${theme === "light" ? "text-zinc-950" : "text-white"}`}>
              Instant Deployment
            </h4>
            <p className={`text-xs leading-relaxed ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
              Launch your MVP landing page and backend live on Vercel with a single click.
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${
              theme === "light"
                ? "bg-white border-zinc-200 shadow-sm hover:border-zinc-400"
                : "bg-zinc-900/60 border-zinc-800/90 hover:border-zinc-700"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${
                theme === "light"
                  ? "bg-zinc-100 border-zinc-200 text-zinc-950"
                  : "bg-zinc-800 border-zinc-700 text-zinc-100"
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <h4 className={`text-sm font-bold mb-1 ${theme === "light" ? "text-zinc-950" : "text-white"}`}>
              Built-in Analytics
            </h4>
            <p className={`text-xs leading-relaxed ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
              Track waitlist conversions, visitor metrics, and financial projections automatically.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        className={`relative z-20 w-full max-w-7xl mx-auto px-6 py-8 text-center text-xs border-t transition-colors ${
          theme === "light"
            ? "border-zinc-200 text-zinc-500"
            : "border-zinc-800/80 text-zinc-500"
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className={`w-2 h-2 rounded-full animate-pulse ${theme === "light" ? "bg-zinc-950" : "bg-white"}`} />
            <span>XCELERATE SWARM OS • ACCESS BATCH #1</span>
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
