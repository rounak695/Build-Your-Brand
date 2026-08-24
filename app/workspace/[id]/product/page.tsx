"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Code2,
  ExternalLink,
  Edit3,
  MessageSquare,
  CheckCircle2,
  Circle,
  HelpCircle,
  Sparkles,
  Send,
  LayoutList,
  Compass,
  Zap,
  Globe
} from "lucide-react";
import { useBrain } from "@/lib/brain";
import { cn } from "@/lib/utils";

// Tabs for Product Workspace
const TABS = ["Strategy", "UX", "Website", "Features", "Roadmap"] as const;
type Tab = typeof TABS[number];

// HTML template generator for Velocity Sneaker brand website
const getWebsiteHtml = (brand: { name?: string; tagline?: string; positioning?: string; typography?: any; colors?: { primary?: string; accent?: string; secondary?: string; background?: string } } | null | undefined) => {
  const name = brand?.name || "Velocity";
  const tagline = brand?.tagline || "Run your way.";
  const primaryColor = brand?.colors?.primary || "#0B0B0C";
  const accentColor = brand?.colors?.accent || "#E63946";
  const secondaryColor = brand?.colors?.secondary || "#F7F6F2";
  const bgColor = brand?.colors?.background || "#FAFAF8";
  const displayFont = brand?.typography?.display || "Clash Display";
  
  // Decide design layout style based on colors/fonts (Gold accent -> Luxury Editorial)
  const isEditorial = accentColor === "#B89047" || displayFont === "Outfit";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${tagline}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;700;800&family=Cinzel:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Inter', sans-serif; 
      background-color: ${bgColor}; 
      color: ${primaryColor}; 
      transition: all 0.5s ease;
    }
    
    header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: ${isEditorial ? "28px 60px" : "20px 40px"}; 
      border-bottom: 1px solid rgba(0,0,0,0.06); 
      background: rgba(255,255,255,0.02);
    }
    
    .logo { 
      font-family: '${displayFont}', sans-serif; 
      font-size: ${isEditorial ? "22px" : "18px"}; 
      font-weight: 800; 
      letter-spacing: -0.04em; 
      text-transform: uppercase;
      color: ${primaryColor};
    }
    
    .nav-links { 
      display: flex; 
      gap: 32px; 
      list-style: none; 
    }
    
    .nav-links a { 
      text-decoration: none; 
      color: ${primaryColor}; 
      opacity: 0.6;
      font-size: 13px; 
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .nav-links a:hover { opacity: 1; }
    
    .nav-cta { 
      background: ${primaryColor}; 
      color: ${secondaryColor}; 
      padding: 10px 24px; 
      border-radius: ${isEditorial ? "4px" : "8px"}; 
      font-size: 13px; 
      font-weight: 600; 
      border: none; 
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Hero section */
    .hero { 
      display: flex; 
      flex-direction: ${isEditorial ? "row" : "column"};
      align-items: center; 
      justify-content: space-between;
      min-height: 80vh; 
      padding: 60px 80px; 
      gap: 40px;
    }
    
    .hero-content {
      flex: 1;
      text-align: ${isEditorial ? "left" : "center"};
      max-width: 600px;
    }
    
    .hero-label { 
      font-size: 11px; 
      font-weight: 700; 
      letter-spacing: 0.2em; 
      text-transform: uppercase; 
      color: ${accentColor}; 
      margin-bottom: 24px; 
    }
    
    .hero h1 { 
      font-family: '${displayFont}', sans-serif;
      font-size: ${isEditorial ? "68px" : "56px"}; 
      font-weight: 800; 
      letter-spacing: -0.04em; 
      line-height: 1.05; 
      margin-bottom: 28px; 
      text-transform: uppercase;
    }
    
    .hero p { 
      font-size: 16px; 
      color: ${primaryColor}; 
      opacity: 0.7;
      max-width: ${isEditorial ? "100%" : "480px"}; 
      line-height: 1.6; 
      margin-bottom: 40px; 
      margin-left: ${isEditorial ? "0" : "auto"};
      margin-right: ${isEditorial ? "0" : "auto"};
    }
    
    .hero-cta { 
      display: flex; 
      gap: 16px; 
      justify-content: ${isEditorial ? "flex-start" : "center"};
    }
    
    .btn-primary { 
      background: ${accentColor}; 
      color: white; 
      padding: 16px 36px; 
      border-radius: ${isEditorial ? "4px" : "12px"}; 
      font-size: 14px; 
      font-weight: 700; 
      border: none; 
      cursor: pointer; 
      text-transform: uppercase;
      letter-spacing: 0.08em;
      transition: all 0.2s ease;
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    
    .btn-secondary { 
      background: transparent; 
      color: ${primaryColor}; 
      padding: 16px 36px; 
      border-radius: ${isEditorial ? "4px" : "12px"}; 
      font-size: 14px; 
      font-weight: 700; 
      border: 2px solid ${primaryColor}30; 
      cursor: pointer; 
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    /* Product graphic representation */
    .product-showcase {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    .sneaker-card {
      width: 320px;
      height: 380px;
      background: ${secondaryColor};
      border-radius: ${isEditorial ? "6px" : "24px"};
      border: 1px solid rgba(0,0,0,0.04);
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.03);
    }

    .sneaker-circle {
      position: absolute;
      top: -30px;
      right: -30px;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: ${accentColor}12;
    }

    .sneaker-img-placeholder {
      font-size: 80px;
      text-align: center;
      margin: auto 0;
      transform: rotate(-15deg);
      filter: drop-shadow(0 10px 20px rgba(0,0,0,0.08));
    }

    .sneaker-meta {
      z-index: 2;
    }

    .sneaker-title {
      font-family: '${displayFont}', sans-serif;
      font-size: 20px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .sneaker-price {
      font-weight: 700;
      color: ${accentColor};
      font-size: 16px;
      margin-top: 4px;
    }

    /* Features Grid */
    .features { 
      padding: 80px 40px; 
      max-width: 1100px; 
      margin: 0 auto; 
      border-top: 1px solid rgba(0,0,0,0.05);
    }
    
    .features h2 { 
      font-family: '${displayFont}', sans-serif;
      font-size: 32px; 
      font-weight: 800; 
      letter-spacing: -0.03em; 
      text-align: center; 
      margin-bottom: 48px;
      text-transform: uppercase;
    }
    
    .feature-grid { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 32px; 
    }
    
    .feature-card { 
      padding: 32px; 
      border: 1px solid rgba(0,0,0,0.05); 
      border-radius: ${isEditorial ? "4px" : "20px"}; 
      background: rgba(255,255,255,0.01);
    }
    
    .feature-icon { 
      width: 44px; 
      height: 44px; 
      background: ${accentColor}12; 
      border-radius: ${isEditorial ? "2px" : "10px"}; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      margin-bottom: 20px; 
      font-size: 22px; 
      color: ${accentColor};
    }
    
    .feature-card h3 { 
      font-size: 16px; 
      font-weight: 700; 
      margin-bottom: 12px; 
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .feature-card p { 
      font-size: 14px; 
      color: ${primaryColor}; 
      opacity: 0.6;
      line-height: 1.6; 
    }

    /* Footer Call to Action */
    .cta-section { 
      background: ${primaryColor}; 
      color: ${secondaryColor}; 
      text-align: center; 
      padding: 90px 40px; 
    }
    
    .cta-section h2 { 
      font-family: '${displayFont}', sans-serif;
      font-size: 40px; 
      font-weight: 800; 
      letter-spacing: -0.03em; 
      margin-bottom: 20px; 
      text-transform: uppercase;
    }
    
    .cta-section p { 
      font-size: 16px; 
      opacity: 0.7; 
      margin-bottom: 40px; 
    }
    
    .cta-white { 
      background: ${accentColor}; 
      color: white; 
      padding: 16px 40px; 
      border-radius: ${isEditorial ? "4px" : "12px"}; 
      font-size: 14px; 
      font-weight: 700; 
      border: none; 
      cursor: pointer; 
      text-transform: uppercase;
      letter-spacing: 0.08em;
      transition: all 0.2s ease;
    }
    .cta-white:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <header>
    <span class="logo">${name}</span>
    <ul class="nav-links">
      <li><a href="#">Showroom</a></li>
      <li><a href="#">Technology</a></li>
      <li><a href="#">Sizing</a></li>
    </ul>
    <button class="nav-cta">Checkout</button>
  </header>
  
  <section class="hero">
    <div class="hero-content">
      <p class="hero-label">Velocity Cushioning v2</p>
      <h1>${tagline}</h1>
      <p>${brand?.positioning || "Premium footwear engineered for performance and streetwear aesthetics."}</p>
      <div class="hero-cta">
        <button class="btn-primary">Shop Showroom</button>
        <button class="btn-secondary">Technical Specs</button>
      </div>
    </div>
    <div class="product-showcase">
      <div class="sneaker-card">
        <div class="sneaker-circle"></div>
        <span class="sneaker-img-placeholder">👟</span>
        <div class="sneaker-meta">
          <p class="sneaker-title">Velocity Gold v2</p>
          <p class="sneaker-price">${brand?.colors?.accent === "#B89047" ? "₹6,999" : "₹4,999"}</p>
        </div>
      </div>
    </div>
  </section>
  
  <section class="features">
    <h2>Performance Details</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>Ultra Cushion</h3>
        <p>Responsive foam engineered to return kinetic energy with every stride.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">✦</div>
        <h3>Luxury Details</h3>
        <p>Featuring full grain calf skins and premium concrete-grain packaging.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">◎</div>
        <h3>Sizing Fit</h3>
        <p>Anatomically shaped to provide support in the gym, track, or showroom.</p>
      </div>
    </div>
  </section>
  
  <section class="cta-section">
    <h2>Secure Your Invitation</h2>
    <p>Sign up to receive private access keys for the first sneaker drop.</p>
    <button class="cta-white">Request Invite</button>
  </section>
</body>
</html>`;
};

export default function ProductPage() {
  const brain = useBrain();
  const product = brain.product;
  const brand = brain.brand;

  const [activeTab, setActiveTab] = useState<Tab>("Strategy");
  const [websiteView, setWebsiteView] = useState<"preview" | "code">("preview");
  
  // Website Edit with AI state
  const [editInput, setEditInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editLog, setEditLog] = useState<string[]>([]);

  // Check query parameters to activate specific tabs
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam && TABS.includes(tabParam as Tab)) {
        setTimeout(() => setActiveTab(tabParam as Tab), 0);
      }
    }
  }, []);

  const handleEditWebsite = () => {
    if (!editInput.trim() || isEditing) return;
    
    setIsEditing(true);
    setEditLog([]);
    const text = editInput;
    setEditInput("");

    // Simulate Product & Brand agents working together to rebuild website layout
    const steps = [
      { log: "Mira (Product) ● Started editing homepage components...", delay: 500 },
      { log: "Mira (Brand) ◌ Updating typography styling directions...", delay: 1500 },
      { log: "Product agent applying premium grids to iframe code...", delay: 2800 },
      { log: "✓ Website homepage compiled successfully.", delay: 3800 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setEditLog((prev) => [...prev, step.log]);
        
        // Trigger status in Zustand store
        if (idx === 0) {
          brain.setAgentStatus("product", "WORKING", `Editing homepage: "${text}"`);
          brain.setAgentStatus("brand", "THINKING", "Updating brand typography rules");
        } else if (idx === steps.length - 1) {
          brain.setAgentStatus("product", "COMPLETED");
          brain.setAgentStatus("brand", "COMPLETED");
          
          // Actually update the brand styling details inside Zustand store
          const isEditorial = text.toLowerCase().includes("editorial") || text.toLowerCase().includes("premium");
          brain.setBrand({
            ...brand!,
            tagline: isEditorial ? "Velocity. Performance, refined." : "Velocity. Run your way.",
            colors: isEditorial ? {
              primary: "#121314",
              secondary: "#FAF9F6",
              accent: "#B89047", // Gold
              background: "#F4F3EF",
            } : brand?.colors || {
              primary: "#0B0B0C",
              secondary: "#F7F6F2",
              accent: "#E63946",
              background: "#FAFAF8",
            },
            typography: {
              display: isEditorial ? "Outfit" : "Clash Display",
              body: "Inter"
            }
          });

          brain.addActivity({
            agentId: "product",
            agentName: "Mira · Product & Brand Director",
            message: `Redesigned website homepage via AI edit: "${text}"`,
            type: "completed"
          });

          setIsEditing(false);
        }
      }, step.delay);
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <p className="text-label text-[var(--muted)] mb-1">Product Studio</p>
        <h1 className="text-headline text-[var(--foreground)] tracking-tight">PRODUCT</h1>
        <p className="text-small text-[var(--muted)] mt-1">Configure user roadmap, UX flows, and landing page previews.</p>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] w-fit shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2 rounded-lg text-small font-medium transition-all",
              activeTab === tab
                ? "bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] font-semibold"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {/* Strategy Tab */}
          {activeTab === "Strategy" && product && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Product Definition", value: product.definition, size: "col-span-2" },
                { label: "Target User Base", value: product.targetUser, size: "" },
                { label: "Core Market Problem", value: product.problem, size: "" },
                { label: "Strategic Value Prop", value: product.valueProp, size: "col-span-2" },
                { label: "Unique Differentiation", value: product.differentiation, size: "col-span-2" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-2",
                    item.size
                  )}
                >
                  <span className="text-label text-[var(--muted)]">{item.label}</span>
                  <p className="text-body text-[var(--foreground)] font-medium leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* UX Flow Tab */}
          {activeTab === "UX" && (
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-6">
              <h3 className="font-bold text-[var(--foreground)] text-small">USER JOURNEY MAP</h3>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                {/* Visual connectors */}
                <div className="hidden md:block absolute top-1/2 left-4 right-4 h-0.5 bg-[var(--border)] -translate-y-1/2 z-0" />

                {[
                  { step: "1", title: "Landing Page", desc: "User views tagline and collections" },
                  { step: "2", title: "Product Detail", desc: "User selects size and configures shoe" },
                  { step: "3", title: "Cart Sidebar", desc: "Slide out drawer for items checklist" },
                  { step: "4", title: "Razorpay Gateway", desc: "Redirect to checkout payment panel" }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] w-full md:w-[200px] text-center relative z-10 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold mx-auto mb-2">
                      {item.step}
                    </div>
                    <p className="text-small font-bold text-[var(--foreground)]">{item.title}</p>
                    <p className="text-micro text-[var(--muted)] mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Website Tab with Live Browser frame (Section 25 & 26) */}
          {activeTab === "Website" && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                <div className="flex gap-1.5 bg-[var(--background)] p-1 rounded-lg border border-[var(--border)] self-start">
                  {(["preview", "code"] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setWebsiteView(view)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-small font-semibold transition-all capitalize",
                        websiteView === view
                          ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm border border-[var(--border)]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      )}
                    >
                      {view === "preview" ? <Monitor className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                      {view}
                    </button>
                  ))}
                </div>

                {/* Edit with AI box */}
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      placeholder='e.g., "Make the homepage more editorial"'
                      className="w-full px-4 py-2 border border-[var(--border)] rounded-xl text-small bg-[var(--background)] outline-none focus:border-[var(--accent)]"
                    />
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] absolute right-3.5 top-3" />
                  </div>
                  <button
                    onClick={handleEditWebsite}
                    disabled={!editInput.trim() || isEditing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-white text-small font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 shrink-0"
                  >
                    Edit website
                  </button>
                </div>
              </div>

              {/* Editing logs console */}
              {editLog.length > 0 && (
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] font-mono text-micro text-[var(--muted)] space-y-1">
                  {editLog.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[var(--accent)]">●</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Browser frame */}
              <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-md">
                {/* Browser top chrome */}
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[var(--border)] bg-[var(--background)]">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4 px-3.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-micro text-[var(--muted)] flex items-center gap-1.5 font-mono select-none">
                    <Globe className="w-3 h-3" />
                    https://velocityshoes.in
                  </div>
                </div>

                {/* Rendered Preview or HTML Source */}
                {websiteView === "preview" ? (
                  <iframe
                    srcDoc={getWebsiteHtml(brand)}
                    className="w-full border-0"
                    style={{ height: "65vh" }}
                    title="Website Live Frame"
                  />
                ) : (
                  <div className="overflow-auto bg-gray-950 p-6" style={{ height: "65vh" }}>
                    <pre className="text-xs text-green-400 font-mono leading-relaxed select-all">
                      {getWebsiteHtml(brand)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features Checklist */}
          {activeTab === "Features" && product && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-4">
                <h3 className="font-bold text-[var(--foreground)] text-small flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                  MVP FEATURES (LAUNCH v1)
                </h3>
                <ul className="space-y-3">
                  {product.mvpFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-small text-[var(--foreground)] border-b border-[var(--border)] pb-2 last:border-0 last:pb-0">
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-4">
                <h3 className="font-bold text-[var(--foreground)] text-small flex items-center gap-2">
                  <Circle className="w-4 h-4 text-[var(--muted)]" />
                  POST-LAUNCH SPRINT (ROADMAP v2)
                </h3>
                <ul className="space-y-3">
                  {product.v2Features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-small text-[var(--muted)] border-b border-[var(--border)] pb-2 last:border-0 last:pb-0">
                      <Circle className="w-4 h-4 text-[var(--border)] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Sprints Roadmap Gantt timeline */}
          {activeTab === "Roadmap" && (
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-6">
              <h3 className="font-bold text-[var(--foreground)] text-small">DEVELOPMENT SPRINT ROADMAP</h3>
              <div className="space-y-4">
                {[
                  { label: "Brand Asset Setup", duration: "Week 1", progress: 100, status: "Done" },
                  { label: "MVP Page Construction", duration: "Week 2 - 3", progress: 100, status: "Done" },
                  { label: "Razorpay Checkout Integration", duration: "Week 4", progress: 65, status: "In progress" },
                  { label: "Waitlist Analytics Engine", duration: "Week 5", progress: 0, status: "Planned" }
                ].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-6 items-center gap-4 border-b border-[var(--border)] pb-3 last:border-0">
                    <span className="col-span-2 text-small font-bold text-[var(--foreground)]">{item.label}</span>
                    <span className="text-micro text-[var(--muted)]">{item.duration}</span>
                    <div className="col-span-2 h-2 rounded-full bg-[var(--background)] overflow-hidden">
                      <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                    <span className={cn(
                      "text-micro font-bold text-right",
                      item.status === "Done" ? "text-green-600" :
                      item.status === "In progress" ? "text-[var(--accent)]" : "text-[var(--muted)]"
                    )}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
