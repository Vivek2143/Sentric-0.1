/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import DetectiveDashboard from "./components/DetectiveDashboard";
import BodyguardDashboard from "./components/BodyguardDashboard";
import FinOpsDashboard from "./components/FinOpsDashboard";
import GovernanceDashboard from "./components/GovernanceDashboard";
import InvestorDeck from "./components/InvestorDeck";
import ExecutiveDashboard from "./components/ExecutiveDashboard";
import LinkScannerWidget from "./components/LinkScannerWidget";
import SystemHealthModal from "./components/SystemHealthModal";
import BillingDashboard from "./components/BillingDashboard";
import FounderDashboard from "./components/FounderDashboard";
import PremiumAuth from "./components/PremiumAuth";
import SentricLogo from "./components/SentricLogo";

import { 
  ShieldCheck, 
  Search, 
  Lock, 
  Cpu, 
  BadgeDollarSign, 
  Scale, 
  Presentation, 
  Menu, 
  X, 
  ArrowRight, 
  Server, 
  Zap, 
  Layers, 
  Sparkles,
  ChevronRight,
  Database,
  User,
  Activity,
  Download,
  Sun,
  Moon,
  CreditCard,
  Crown,
  ShieldAlert,
  Volume2
} from "lucide-react";
import { generatePdfSummary } from "./utils/pdfExport";
import { playLatencyAlarm, playVoiceSummary } from "./utils/audioNotification";
import { motion, AnimatePresence } from "motion/react";
import { generateStateSignature, verifyStateIntegrity, maskEmailForUI } from "./utils/fortressCrypto";
import LockOverlay from "./components/LockOverlay";


type ActiveTab = "overview" | "detective" | "bodyguard" | "treasurer" | "governance" | "deck" | "executive" | "billing" | "founder";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [showAppConsole, setShowAppConsole] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);

  // Theme support
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("sentric_theme") as "dark" | "light") || "dark";
  });

  // Account & subscription details
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    const email = localStorage.getItem("sentric_user_email");
    const pass = localStorage.getItem("sentric_verified_pass");
    if (email === "aryan21430@gmail.com" && pass === "Rajaram09") {
      const sig = generateStateSignature(email, "active_1y");
      localStorage.setItem("sentric_state_signature", sig);
    }
    return email;
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>(() => {
    const sub = localStorage.getItem("sentric_subscription") || "none";
    const email = localStorage.getItem("sentric_user_email");
    const pass = localStorage.getItem("sentric_verified_pass");
    if (email === "aryan21430@gmail.com" && pass === "Rajaram09") {
      return "active_1y";
    }
    return sub;
  });
  const [trialScansRemaining, setTrialScansRemaining] = useState<number>(() => {
    const s = localStorage.getItem("sentric_trial_scans");
    return s !== null ? parseInt(s) : 3;
  });

  // Fortress Unified Security Firewall & Client-Tamper Shield States
  const [isSystemTampered, setIsSystemTampered] = useState<boolean>(false);
  const [tamperLogs, setTamperLogs] = useState<string[]>([]);
  const [securityStatusLevel, setSecurityStatusLevel] = useState<"SECURE" | "TAMPER_ALERT">("SECURE");

  // Real-Time Integrity Guard daemon checking active memory every 1.5 seconds
  useEffect(() => {
    const checkIntegrity = () => {
      const storedEmail = localStorage.getItem("sentric_user_email");
      const storedSub = localStorage.getItem("sentric_subscription") || "none";
      const storedSig = localStorage.getItem("sentric_state_signature");

      // Verify signature compliance
      const isValid = verifyStateIntegrity(storedEmail, storedSub, storedSig);
      if (!isValid) {
        setIsSystemTampered(true);
        setSecurityStatusLevel("TAMPER_ALERT");
        if (tamperLogs.length === 0) {
          const logLines = [
            `[FORTRESS SECURE MATRIX] THREAT EXCEPTION TRIGGERED ON CLIENT GATEWAY AT ${new Date().toISOString()}`,
            `[INTEGRITY DEFENSE] CRITICAL: Client local subscription state variable changed without a valid cryptographic signoff hash from authorized control planes.`,
            `[INTEGRITY DEFENSE] Discovered anomaly: Key "sentric_subscription" set to "${storedSub || "none"}" under authority "${storedEmail || "anonymous_gate_node"}".`,
            `[COUNTERMEASURE] Zero-Trust Intrusion Active Redirection engaged. Session runtime completely arrested.`
          ];
          setTamperLogs(logLines);
        }
      }
    };

    // Fast initial check 
    checkIntegrity();

    // Constant background monitoring interval
    const interval = setInterval(checkIntegrity, 1500);
    return () => clearInterval(interval);
  }, [userEmail, subscriptionStatus]);

  // Dynamic Theme Styling hooks for Gen Z / Millennial Light vs Dark Experience
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.style.setProperty("--color-slate-950", "#f8fafc"); // Slate 50 (Off-white)
      root.style.setProperty("--color-slate-900", "#ffffff"); // Pure white cards
      root.style.setProperty("--color-slate-800", "rgba(0, 0, 0, 0.06)"); // light borders
      root.style.setProperty("--color-slate-850", "rgba(0, 0, 0, 0.05)");
      root.style.setProperty("--color-slate-805", "rgba(0, 0, 0, 0.05)");
      root.style.setProperty("--color-slate-855", "rgba(0, 0, 0, 0.05)");
      root.style.setProperty("--color-slate-700", "rgba(0, 0, 0, 0.08)");
      root.style.setProperty("--color-slate-750", "rgba(0, 0, 0, 0.08)");
      root.classList.add("light");
      document.body.style.backgroundColor = "#f8fafc";
      document.body.style.color = "#0f172a";
    } else {
      root.style.setProperty("--color-slate-950", "#05060b"); // Cyber dark void
      root.style.setProperty("--color-slate-900", "#0c0e17"); // Dark card
      root.style.setProperty("--color-slate-800", "rgba(255, 255, 255, 0.05)");
      root.style.setProperty("--color-slate-850", "rgba(255, 255, 255, 0.05)");
      root.style.setProperty("--color-slate-805", "rgba(255, 255, 255, 0.05)");
      root.style.setProperty("--color-slate-855", "rgba(255, 255, 255, 0.05)");
      root.style.setProperty("--color-slate-700", "rgba(255, 255, 255, 0.09)");
      root.style.setProperty("--color-slate-750", "rgba(255, 255, 255, 0.09)");
      root.classList.remove("light");
      document.body.style.backgroundColor = "#05060b";
      document.body.style.color = "#f1f5f9";
    }
    localStorage.setItem("sentric_theme", theme);
  }, [theme]);

  // Auth functions
  const handleLogin = (email: string) => {
    const emailClean = email.trim().toLowerCase();
    const targetEmail = emailClean === "aryan21430@gmail.com" ? "aryan21430@gmail.com" : email;
    const targetSub = emailClean === "aryan21430@gmail.com" ? "active_1y" : (subscriptionStatus === "none" ? "trial" : subscriptionStatus);

    setUserEmail(targetEmail);
    localStorage.setItem("sentric_user_email", targetEmail);
    // If they login as admin, activate fully free Global Canopy license
    if (emailClean === "aryan21430@gmail.com") {
      setSubscriptionStatus("active_1y");
      localStorage.setItem("sentric_subscription", "active_1y");
    } else if (subscriptionStatus === "none") {
      setSubscriptionStatus("trial");
      localStorage.setItem("sentric_subscription", "trial");
      setTrialScansRemaining(3);
      localStorage.setItem("sentric_trial_scans", "3");
    }

    // Sign current validated state session
    const signature = generateStateSignature(targetEmail, targetSub);
    localStorage.setItem("sentric_state_signature", signature);
  };

  const handleLogout = () => {
    setUserEmail(null);
    setSubscriptionStatus("none");
    setTrialScansRemaining(3);
    localStorage.removeItem("sentric_user_email");
    localStorage.removeItem("sentric_subscription");
    localStorage.removeItem("sentric_trial_scans");
    localStorage.removeItem("sentric_state_signature");
  };

  const handlePurchaseSubscription = (status: string) => {
    setSubscriptionStatus(status);
    localStorage.setItem("sentric_subscription", status);

    const signature = generateStateSignature(userEmail, status);
    localStorage.setItem("sentric_state_signature", signature);
  };

  // Quick stats matching mock states
  const totalLeakedBlocked = "1,084";
  const activeUnvettedSaaS = 142;
  const corporateSavingsUSD = "$14,800";

  // Lock Overlay State
  const [lockOverlay, setLockOverlay] = useState<{
    isOpen: boolean;
    featureName: string;
    requiredPlan: "Professional" | "Enterprise";
    benefits: string[];
  }>({
    isOpen: false,
    featureName: "",
    requiredPlan: "Professional",
    benefits: []
  });

  // PDF Export and Auditory status trackers
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [pdfToast, setPdfToast] = useState<string | null>(null);

  const handlePlayVoiceSummary = () => {
    const isSuperAdmin = userEmail && userEmail.trim().toLowerCase() === "aryan21430@gmail.com";
    const hasEnterprise = subscriptionStatus === "active_1y";
    
    if (!isSuperAdmin && !hasEnterprise) {
      setLockOverlay({
        isOpen: true,
        featureName: "AI Voice Summary & Auditory Report",
        requiredPlan: "Enterprise",
        benefits: [
          "Dynamic AI-synthesized real-time security verbal briefs.",
          "Voice alerts when high-risk shadow applications run on enterprise VLANs.",
          "Interactive hands-free auditory dashboard briefings."
        ]
      });
      return;
    }

    if (isPlayingVoice) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingVoice(false);
      return;
    }

    setIsPlayingVoice(true);
    playVoiceSummary();
    
    // Set automatic off timeout for Voice Brief
    setTimeout(() => {
      setIsPlayingVoice(false);
    }, 15000);
  };

  const handleExportSummary = () => {
    const isSuperAdmin = userEmail && userEmail.trim().toLowerCase() === "aryan21430@gmail.com";
    const hasPro = subscriptionStatus === "active_6m" || subscriptionStatus === "active_1y";
    
    if (!isSuperAdmin && !hasPro) {
      setLockOverlay({
        isOpen: true,
        featureName: "PDF Report Downloads",
        requiredPlan: "Professional",
        benefits: [
          "High-resolution print-ready enterprise compliance summaries.",
          "Official reports ready to pass SOC2 Type-II corporate security reviews.",
          "Automated dynamic export with customized corporate layout branding."
        ]
      });
      return;
    }

    setIsExportingPdf(true);
    setPdfToast("COMPILING TELEMETRY...");
    try {
      playLatencyAlarm();
    } catch (e) {}

    setTimeout(() => {
      try {
        generatePdfSummary({
          shadowAppsCount: activeUnvettedSaaS,
          blockedLeaksCount: totalLeakedBlocked,
          cachedSavingsUSD: corporateSavingsUSD,
          enforcedRulesCount: 6,
          averageLatency: "11.2 ms",
          systemHealthStatus: "HEALTHY",
          complianceLevel: "SOC2 TYPE-II APPROVED",
          exportTimestamp: new Date().toLocaleString(),
          operatorEmail: "aryan21430@gmail.com"
        });
        setPdfToast("PDF EXPORTED!");
      } catch (err) {
        setPdfToast("EXPORT FAILED");
      } finally {
        setIsExportingPdf(false);
        setTimeout(() => setPdfToast(null), 3500);
      }
    }, 800);
  };


  if (isSystemTampered) {
    return (
      <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-rose-500/30 selection:text-white">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/5 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl w-full bg-[#0c0e17] border border-rose-955 rounded-2xl p-6 md:p-8 space-y-6 relative z-10 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
          
          <div className="flex flex-col items-center text-center space-y-3 border-b border-rose-950 pb-5">
            <div className="h-16 w-16 bg-rose-950/30 border border-rose-500/40 rounded-full flex items-center justify-center text-rose-500 mb-2 animate-bounce">
              <ShieldAlert className="h-8 w-8 text-rose-500" />
            </div>
            <span className="text-[10px] bg-rose-500/10 text-rose-450 border border-rose-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest leading-none">
              Firewall Exception: Tampering Breach Verified
            </span>
            <h2 className="text-xl md:text-2xl font-black text-rose-500 tracking-tight leading-tight">
              SENTRIC COGNITIVE WORKSPACE LOCKED
            </h2>
            <p className="text-xs text-slate-400 font-sans tracking-normal max-w-lg mt-1">
              Sentinel memory analyzers detected unauthorized forceful modifications to active session memory, user authority tables, or client subscription records.
            </p>
          </div>

          <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-xl border border-rose-950/20">
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-500">Intrusion Target:</span>
              <strong className="text-slate-200">localStorage Local Memory Matrix</strong>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-500">Anomaly Vector:</span>
              <strong className="text-amber-400">Subscription Status & Signature Mismatch</strong>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-500">Client Signature Checksum:</span>
              <strong className="text-rose-500 truncate max-w-[280px]">
                {localStorage.getItem("sentric_state_signature") || "NULL / CORRUPTED_TOKEN"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Access Countermeasure:</span>
              <strong className="text-rose-400">Active Workspace Execution Overload</strong>
            </div>
          </div>

          <div className="space-y-1 bg-[#05060b] p-3.5 border border-slate-900 rounded-lg text-[11px] leading-relaxed select-text font-mono max-h-40 overflow-y-auto">
            <span className="text-emerald-500 font-bold block mb-1.5">★ SECTOR THREAT VERBATIM LOGS:</span>
            {tamperLogs.map((log, idx) => (
              <div key={idx} className="text-slate-400 font-mono">
                <span className="text-slate-600">[{idx}]</span> {log}
              </div>
            ))}
          </div>

          <div className="p-4 bg-emerald-950/10 border border-emerald-950/40 rounded-xl space-y-2">
            <strong className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
              🛡 Safe Restorative Sequence Available
            </strong>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              To restore standard Zero-Trust safe factory operations and log back in legitimately, you can run an automatic system clearing sequence to restore baseline compliance signatures.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                localStorage.removeItem("sentric_user_email");
                localStorage.removeItem("sentric_subscription");
                localStorage.removeItem("sentric_trial_scans");
                localStorage.removeItem("sentric_state_signature");
                setIsSystemTampered(false);
                setSecurityStatusLevel("SECURE");
                setTamperLogs([]);
                setUserEmail(null);
                setSubscriptionStatus("none");
                setTrialScansRemaining(3);
                try {
                  playLatencyAlarm();
                } catch(e){}
              }}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white rounded-xl text-center text-xs font-bold leading-none cursor-pointer transition active:scale-95 shadow-md shadow-emerald-950/30"
            >
              ✔ Purge Anomaly & Restore Standard State
            </button>
            
            <button
              onClick={() => {
                const enteredPass = prompt("SENTINEL AUTH OVERRIDE KEY (Type admin password 'Rajaram09' to generate trusted root token):");
                if (enteredPass === "Rajaram09") {
                  const finalEmail = "aryan21430@gmail.com";
                  const finalSub = "active_1y";
                  
                  setUserEmail(finalEmail);
                  setSubscriptionStatus(finalSub);
                  localStorage.setItem("sentric_user_email", finalEmail);
                  localStorage.setItem("sentric_subscription", finalSub);
                  
                  const trustedSig = generateStateSignature(finalEmail, finalSub);
                  localStorage.setItem("sentric_state_signature", trustedSig);
                  localStorage.setItem("sentric_verified_pass", "Rajaram09");
                  localStorage.setItem("sentric_verified_code", "991005");
                  
                  setIsSystemTampered(false);
                  setSecurityStatusLevel("SECURE");
                  setTamperLogs([]);
                  setActiveTab("founder");
                  try {
                    playLatencyAlarm();
                  } catch(e){}
                  alert("ROOT KEY COMPLIANT: Trusted signature generated and synchronized with core telemetry.");
                } else {
                  alert("INCORRECT PIN: Intrusion counter-intelligence triggered secondary locks.");
                }
              }}
              className="py-3 px-5 bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-bold font-mono transition leading-none cursor-pointer active:scale-95"
            >
              🔑 Developer Override
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Mandatory premium authentication guard
  if (!userEmail) {
    return (
      <PremiumAuth 
        onLogin={handleLogin}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* BACKGROUND GRAPHIC GRADIENT LINES */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none z-0"></div>

      {!showAppConsole ? (
        /* ======================== PUBLIC LANDING PAGE (Sentric.ai) ======================== */
        <div className="relative z-10">
          
          {/* Landing Header */}
          <header className="border-b border-white/5 bg-[#0C0C0E]/90 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div 
                onClick={() => setShowAppConsole(false)}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <SentricLogo size="sm" withText={true} withTagline={false} theme="dark" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                  <User className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                  <span className="max-w-[120px] truncate">{maskEmailForUI(userEmail)}</span>
                </span>
                
                {/* Theme Toggle Button */}
                <button
                  onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
                  className="p-1.5 hover:bg-[#121214] hover:text-white text-slate-400 rounded-lg transition border border-white/5 cursor-pointer flex items-center justify-center animate-pulse"
                  title={`Toggle ${theme === "dark" ? "Light" : "Dark"} Mode`}
                >
                  {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-400" />}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("deck");
                    setShowAppConsole(true);
                  }}
                  className="px-3.5 py-1.5 hover:bg-[#121214] text-slate-400 hover:text-white rounded text-xs font-mono transition inline-flex items-center gap-1.5 border border-white/5 cursor-pointer"
                >
                  <Presentation className="h-3.5 w-3.5" />
                  Read Pitch Deck
                </button>
                <button
                  onClick={() => {
                    setActiveTab("billing");
                    setShowAppConsole(true);
                  }}
                  className="px-3.5 py-1.5 text-indigo-400 hover:text-white bg-indigo-950/40 border border-indigo-900/30 rounded text-xs font-mono transition inline-flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Subscriptions
                </button>
                <button
                  onClick={() => setShowAppConsole(true)}
                  className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white rounded text-xs font-mono font-medium shadow-lg hover:shadow-indigo-900/10 transition active:scale-95 cursor-pointer"
                >
                  Launch App Console
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-950/50 text-rose-400 hover:text-rose-350 rounded text-xs font-mono font-medium transition cursor-pointer active:scale-95"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-24">
            
            <div className="text-center max-w-3xl mx-auto space-y-6 flex flex-col items-center">
              {/* Prominent centered logo display */}
              <SentricLogo 
                size="xl" 
                center={true} 
                withText={true} 
                withTagline={true} 
                theme="dark"
                className="mb-4"
              />

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/30 border border-indigo-900/40 rounded-full text-[10px] font-mono text-indigo-300">
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-450" />
                <span>MEET THE ENTERPRISE AI OPERATING SYSTEM</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight font-sans">
                See Everything. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400">Secure Everything.</span> <br />
                Save Everything.
              </h1>
              
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto font-sans">
                Sentric is the Enterprise AI Control Plane. Discover shadow AI applications, secure prompt payloads, prevent critical IP leakage, and consolidate soaring token spending inside a unified zero-overhead proxy.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setShowAppConsole(true)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-medium shadow-xl hover:shadow-indigo-900/20 transition-all flex items-center justify-center gap-1.5 hover:translate-x-0.5"
                >
                  Enter App Platform
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab("billing");
                    setShowAppConsole(true);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-500/20 to-indigo-600 hover:text-white text-indigo-450 font-bold rounded-xl text-xs font-mono transition border border-indigo-500/30 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:bg-indigo-600 animate-bounce"
                >
                  <CreditCard className="h-4 w-4" />
                  Subscriptions !!
                </button>
                <button
                  onClick={() => {
                    setActiveTab("executive");
                    setShowAppConsole(true);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl text-xs font-mono transition border border-slate-800 flex items-center justify-center gap-1.5"
                >
                  Try ROI Calculator
                </button>
              </div>
            </div>

            {/* Simulated Live Dashboard Preview Mock */}
            <div className="bg-slate-900/20 border border-slate-805 rounded-2xl p-4 md:p-6 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
              
              {/* Fake App header */}
              <div className="flex items-center justify-between border-b border-slate-805/80 pb-4 mb-6 text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span>SENTRIC SECURE NETWORK LINK</span>
                </div>
                <div className="hidden sm:flex gap-4">
                  <span>DNS PROBES: ACTIVE</span>
                  <span>CACHE RATIO: 64.2%</span>
                </div>
              </div>

              {/* 3 Executive Pillars showcase cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                <div onClick={() => { setActiveTab("detective"); setShowAppConsole(true); }} className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-cyan-500/40 p-5 rounded-xl transition duration-200 cursor-pointer space-y-3 relative group/card">
                  <div className="p-2 h-9 w-9 bg-cyan-950/30 border border-cyan-900/35 rounded-lg text-cyan-400 flex items-center justify-center">
                    <Search className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      THE DETECTIVE
                      <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover/card:opacity-100 group-hover/card:translate-x-1 transition-all text-cyan-400" />
                    </h3>
                    <p className="text-xs text-slate-450 mt-1.5 leading-relaxed font-sans">
                      Automatically index Shadow AI products across engineering subdomains. Scan endpoints to detect unapproved code checkers.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 border-t border-slate-900 pt-2 flex justify-between">
                    <span>DNS Footprint Probe</span>
                    <strong>{activeUnvettedSaaS} tools logged</strong>
                  </div>
                </div>

                <div onClick={() => { setActiveTab("bodyguard"); setShowAppConsole(true); }} className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-rose-500/40 p-5 rounded-xl transition duration-200 cursor-pointer space-y-3 relative group/card">
                  <div className="p-2 h-9 w-9 bg-rose-950/30 border border-rose-900/35 rounded-lg text-rose-450 flex items-center justify-center">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      THE BODYGUARD
                      <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover/card:opacity-100 group-hover/card:translate-x-1 transition-all text-rose-450" />
                    </h3>
                    <p className="text-xs text-slate-450 mt-1.5 leading-relaxed font-sans">
                      Inline semantic firewall intercepts user prompts. Intercepts jailbreak prompts, masks credit card numbers, AWS secrets and SSNs.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-rose-400 border-t border-slate-900 pt-2 flex justify-between">
                    <span>Prompt Interception</span>
                    <strong>{totalLeakedBlocked} blocked</strong>
                  </div>
                </div>

                <div onClick={() => { setActiveTab("treasurer"); setShowAppConsole(true); }} className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-teal-500/40 p-5 rounded-xl transition duration-200 cursor-pointer space-y-3 relative group/card">
                  <div className="p-2 h-9 w-9 bg-teal-950/30 border border-teal-900/35 rounded-lg text-teal-400 flex items-center justify-center">
                    <BadgeDollarSign className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      THE TREASURER
                      <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover/card:opacity-100 group-hover/card:translate-x-1 transition-all text-teal-400" />
                    </h3>
                    <p className="text-xs text-slate-450 mt-1.5 leading-relaxed font-sans">
                      Optimizes corporate GPU fees. Recycles prompts with local edge cachers, blocks redundant SaaS tools, contains runaway autonomous agents.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-teal-400 border-t border-slate-900 pt-2 flex justify-between">
                    <span>Utility Spend tracker</span>
                    <strong>{corporateSavingsUSD} cached</strong>
                  </div>
                </div>

              </div>
              
              {/* Direct Landing Trigger */}
              <div className="mt-6 pt-5 border-t border-slate-805/80 text-center">
                <button
                  onClick={() => setShowAppConsole(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-mono"
                >
                  See live platform dashboard
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>

            {/* Bottom corporate vision footer */}
            <footer className="border-t border-slate-900 pt-8 flex flex-col items-center justify-center gap-4 text-center text-xs text-slate-500 font-mono">
              <SentricLogo size="xs" withText={true} withTagline={false} theme="dark" className="opacity-40 hover:opacity-80 transition" />
              <div>
                <p className="tracking-wide">© 2026 Sentric Technologies Inc. See Everything. Secure Everything. Save Everything.</p>
                <div className="mt-2 text-slate-500 flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] tracking-wide">
                  <span>Enterprise AI Control Plane and Governance OS.</span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#090a0f] border border-slate-800/50 rounded-full text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#128807] drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] font-sans animate-pulse shadow-inner">
                    BUILT IN INDIA 🇮🇳 !!
                  </span>
                </div>
              </div>
            </footer>

          </main>
        </div>
      ) : (        /* ======================== ENTERPRISE RUNTIME CONSOLE APP ======================== */
        <div className="relative z-10 flex min-h-screen">
          
          {/* Responsive Sidebar for desktop & mobile drawer */}
          <aside className={`fixed lg:sticky top-0 left-0 z-45 bg-[#0C0C0E] border-r border-white/5 w-64 h-screen flex flex-col justify-between p-4 transition-transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}>
            <div className="space-y-6">
              {/* Logo container inside sidebar */}
              <div 
                onClick={() => setShowAppConsole(false)}
                className="flex items-center gap-2.5 pb-4 border-b border-white/5 cursor-pointer"
              >
                <SentricLogo size="sm" withText={true} withTagline={false} theme="dark" />
              </div>

              {/* Nav links */}
              <nav className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block px-3 mb-2">Systems Monitor</span>
                {[
                  { id: "overview", label: "Control Center", icon: <Layers className="h-4 w-4" /> },
                  { id: "detective", label: "Shadow AI Discovery", icon: <Search className="h-4 w-4" /> },
                  { id: "bodyguard", label: "Security Intercept", icon: <Lock className="h-4 w-4" /> },
                  { id: "treasurer", label: "AI FinOps Treasurer", icon: <BadgeDollarSign className="h-4 w-4" /> },
                  { id: "governance", label: "Policy Manager", icon: <Scale className="h-4 w-4" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as ActiveTab);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs font-mono transition flex items-center gap-3 border ${
                      activeTab === item.id 
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-medium" 
                        : "bg-transparent border-transparent text-slate-400 hover:bg-[#121214] hover:text-slate-100"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}

                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block px-3 mt-4 mb-2">Boardroom Assets</span>
                {[
                  { id: "deck", label: "25-Slide Pitch Deck", icon: <Presentation className="h-4 w-4" /> },
                  { id: "executive", label: "Executive Strategy", icon: <Cpu className="h-4 w-4" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as ActiveTab);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs font-mono transition flex items-center gap-3 border ${
                      activeTab === item.id 
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-medium" 
                        : "bg-transparent border-transparent text-slate-400 hover:bg-[#121214] hover:text-slate-100"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}

                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block px-3 mt-4 mb-2">Enterprise Account</span>
                <button
                  onClick={() => {
                    setActiveTab("billing");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-mono transition flex items-center gap-3 border ${
                    activeTab === "billing" 
                      ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-medium" 
                      : "bg-transparent border-transparent text-slate-400 hover:bg-[#121214] hover:text-slate-100"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Billing & Subscriptions</span>
                </button>

                {userEmail === "aryan21430@gmail.com" && (
                  <button
                    onClick={() => {
                      setActiveTab("founder");
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs font-mono transition flex items-center gap-3 border ${
                      activeTab === "founder" 
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-medium" 
                        : "bg-transparent border-transparent text-slate-450 hover:bg-[#121214] hover:text-slate-100"
                    }`}
                  >
                    <Crown className="h-4 w-4 text-amber-400" />
                    <span>Founder Control Panel</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Operator info footer */}
            <div className="border-t border-white/5 pt-4 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8.5 w-8.5 rounded-full bg-indigo-500/[0.08] border border-indigo-505/25 flex items-center justify-center text-indigo-400 shrink-0">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-semibold text-slate-200 font-mono leading-none truncate" title={maskEmailForUI(userEmail)}>
                    {maskEmailForUI(userEmail).split("@")[0] || "Operator"}
                  </span>
                  <span className="text-[8.5px] text-slate-500 font-mono truncate mt-1">
                    {userEmail === "aryan21430@gmail.com" ? "Super Admin" : "Enterprise Operator"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-950/45 text-rose-450 hover:text-rose-350 rounded-md text-[10px] font-mono transition cursor-pointer active:scale-95 text-center mt-1 uppercase tracking-wider font-bold"
              >
                Terminate Session
              </button>
            </div>
          </aside>

          {/* Core Content Canvas */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            
            {/* Right Header Navigation */}
            <header className="border-b border-white/5 bg-[#0C0C0E]/90 sticky top-0 z-40 backdrop-blur-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                {/* Mobile sidebar toggle button */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-1.5 hover:bg-[#121214] text-slate-400 hover:text-white rounded-md transition border border-white/5 lg:hidden cursor-pointer"
                >
                  {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                {/* Mobile branding logo next to the toggle button */}
                <div className="lg:hidden flex items-center ml-2.5">
                  <SentricLogo size="xs" withText={true} withTagline={false} theme="dark" />
                </div>

                {/* Left indicators */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="hidden sm:flex items-center gap-2 text-slate-500">
                    <Database className="h-3.5 w-3.5 text-slate-600" />
                    <span>Edge Nodes: <strong>Active</strong></span>
                  </div>
                  <span className="text-slate-550 hidden md:inline">|</span>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                    <span className="text-[10px] uppercase font-semibold">Sub-15ms Network overhead verified</span>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                  {/* Theme Toggle Button */}
                  <button
                    onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
                    className="p-1.5 bg-[#121214] hover:bg-slate-800 hover:text-white border border-white/5 text-slate-300 rounded transition flex items-center justify-center scroll-pt-1.5 cursor-pointer h-[30px] w-[30px]"
                    title={`Toggle ${theme === "dark" ? "Light" : "Dark"} Mode`}
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400 animate-pulse" /> : <Moon className="h-4 w-4 text-indigo-405" />}
                  </button>

                  {/* System Health Status Indicator */}
                  <button
                    onClick={() => setIsHealthModalOpen(true)}
                    className="px-3 py-1.5 bg-[#121214] hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white rounded text-[10px] font-mono transition-all duration-150 inline-flex items-center gap-2 active:scale-95 cursor-pointer"
                    title="Open Telemetry & Metrics Desk"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    System Health: <strong className="text-emerald-400 font-bold uppercase tracking-wider">Online (Verify)</strong>
                  </button>
                  
                  {/* Exit Console Button */}
                  <button
                    onClick={() => setShowAppConsole(false)}
                    className="px-3 py-1.5 bg-[#121214] hover:bg-slate-800 text-slate-350 rounded text-[10px] font-mono border border-white/5 transition active:scale-95 cursor-pointer"
                  >
                    Exit Console
                  </button>
                </div>

              </div>
            </header>

            {/* Content Switch Panel */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {activeTab === "overview" && (
                /* ======================== DASHBOARD OVERVIEW / COMMAND CENTER ======================== */
                <div className="space-y-6">
                  
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
                    
                    {/* Header flex row containing title + description and the export button */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                          <h2 className="text-xl font-bold tracking-tight text-white leading-none">Enterprise AI Control Plane Overview</h2>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Real-time mapping of compliance, security breaches, shadow inventory risk scores, and saved funds.</p>
                      </div>
                      
                      <div className="flex items-center gap-2.5 shrink-0">
                        {/* AI Auditory Voice Summary */}
                        <button
                          onClick={handlePlayVoiceSummary}
                          className={`px-4 py-2 rounded-xl text-xs font-mono font-medium border transition-all flex items-center gap-2 active:scale-95 cursor-pointer shadow-lg ${
                            isPlayingVoice 
                              ? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                              : "bg-slate-950/40 border-purple-500/20 text-purple-400 hover:text-purple-300 hover:border-purple-500/40"
                          }`}
                          title="Listen to real-time security telemetry synthesized verbally"
                        >
                          {isPlayingVoice ? (
                            <div className="flex items-center gap-1.5">
                              {/* Pulse Waveform Visual */}
                              <div className="flex gap-0.5 items-end h-3 overflow-hidden">
                                <div className="w-0.5 bg-purple-400 h-1.5 animate-bounce" style={{ animationDuration: "0.6s" }}></div>
                                <div className="w-0.5 bg-purple-400 h-3 animate-bounce" style={{ animationDuration: "0.4s", animationDelay: "0.1s" }}></div>
                                <div className="w-0.5 bg-purple-400 h-2 animate-bounce" style={{ animationDuration: "0.5s", animationDelay: "0.2s" }}></div>
                              </div>
                              <span>Voice Active</span>
                            </div>
                          ) : (
                            <>
                              <Volume2 className="h-4 w-4 text-purple-400" />
                              <span>Voice Brief</span>
                            </>
                          )}
                        </button>

                        {pdfToast && (
                          <div className="text-[10px] uppercase font-mono font-bold bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-xl flex items-center shadow-md animate-pulse">
                            {pdfToast}
                          </div>
                        )}
                        <button
                          id="export-pdf-summary-btn"
                          onClick={handleExportSummary}
                          disabled={isExportingPdf}
                          className={`px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-mono font-medium shadow-lg hover:shadow-indigo-950/10 transition-all flex items-center gap-2 border border-indigo-500/20 active:scale-95 cursor-pointer ${
                            isExportingPdf ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          title="Generate a downloadable PDF report of the current security metrics and savings"
                        >
                          <Download className={`h-4 w-4 ${isExportingPdf ? "animate-bounce" : ""}`} />
                          <span>{isExportingPdf ? "Exporting..." : "Export Summary"}</span>
                        </button>
                      </div>
                    </div>


                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-slate-950/60 p-4 border border-slate-805 rounded-xl cursor-pointer hover:border-cyan-500/20 transition-colors" onClick={() => setActiveTab("detective")}>
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Discovered Shadow Apps</span>
                        <span className="text-xl font-mono font-bold text-white block mt-1">142</span>
                        <span className="text-[9px] text-cyan-400 font-mono mt-0.5 block flex items-center gap-1">
                          DNS Probes Active
                        </span>
                      </div>
                      <div className="bg-slate-950/60 p-4 border border-slate-805 rounded-xl cursor-pointer hover:border-rose-500/20 transition-colors" onClick={() => setActiveTab("bodyguard")}>
                        <span className="text-[10px] uppercase font-mono text-slate-550 block">Bodyguard block rate</span>
                        <span className="text-xl font-mono font-bold text-rose-500 block mt-1">{totalLeakedBlocked}</span>
                        <span className="text-[9px] text-rose-450 font-mono mt-0.5 block">Jailbreaks / Leaks Stopped</span>
                      </div>
                      <div className="bg-slate-950/60 p-4 border border-slate-805 rounded-xl cursor-pointer hover:border-teal-500/20 transition-colors" onClick={() => setActiveTab("treasurer")}>
                        <span className="text-[10px] uppercase font-mono text-slate-550 block">AI Caching Savings</span>
                        <span className="text-xl font-mono font-bold text-teal-400 block mt-1">{corporateSavingsUSD}</span>
                        <span className="text-[9px] text-teal-450 font-mono mt-0.5 block">64% Token optimization</span>
                      </div>
                      <div className="bg-slate-950/60 p-4 border border-slate-805 rounded-xl cursor-pointer hover:border-indigo-500/20 transition-colors" onClick={() => setActiveTab("governance")}>
                        <span className="text-[10px] uppercase font-mono text-slate-550 block">Enforced Directives</span>
                        <span className="text-xl font-mono font-bold text-indigo-400 block mt-1">6 Active Rules</span>
                        <span className="text-[9px] text-indigo-455 font-mono mt-0.5 block">100% Policy Sync Stable</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Traffic Link Sentinel Section */}
                  <LinkScannerWidget />

                  {/* Summary row bento */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Security Intercept sandbox quick link */}
                    <div className="lg:col-span-8 bg-slate-900/20 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-rose-450">
                          <Lock className="h-4 w-4 text-rose-500 animate-pulse" />
                          <span className="text-xs uppercase font-mono tracking-widest leading-none">Security Intercept Sandbox active</span>
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Semantic Firewall Tester</h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Experience Sentric's real-time security interception. Type credit cards, raw developer credentials, proprietary secrets, or adversarial injections to observe how Sentric filters and redacts prompts on the fly before routing payloads to LLMs.
                        </p>
                      </div>
                      <div className="pt-6 border-t border-slate-900 mt-4 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-500">Fully integrated server-side Gemini scanner</span>
                        <button
                          onClick={() => setActiveTab("bodyguard")}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          Launch Interceptor Sandbox
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick corporate board Pitch Deck summary card */}
                    <div className="lg:col-span-4 bg-indigo-950/5 border border-indigo-900/30 p-6 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="p-2 h-9 w-9 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
                          <Presentation className="h-4.5 w-4.5" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Interactive Investor Pitch Deck</h4>
                        <p className="text-xs text-slate-405 leading-relaxed font-sans">
                          Review Sentric's institutional-grade seed deck outline (TAM/SAM projections, pricing, architecture) viewable directly in Slide Player mode or as deep Grid cards.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("deck")}
                        className="w-full mt-5 py-2 hover:bg-indigo-950/20 text-indigo-400 font-mono text-xs rounded-xl border border-indigo-900/40 transition active:scale-95 cursor-pointer"
                      >
                        Review 25 Slides
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {activeTab === "detective" && <DetectiveDashboard />}

              {activeTab === "bodyguard" && (
                <BodyguardDashboard 
                  userEmail={userEmail}
                  subscriptionStatus={subscriptionStatus}
                  trialScansRemaining={trialScansRemaining}
                  onScanExecuted={() => {
                    if (!userEmail) {
                      alert("Authentication Required: Connect your standard @gmail.com email in the Billing & Subscriptions desk first to unlock custom prompt firewalls!");
                      setActiveTab("billing");
                      return false;
                    }
                    if (userEmail.trim().toLowerCase() === "aryan21430@gmail.com") {
                      return true; // Unrestricted lifetime access
                    }
                    if (subscriptionStatus === "trial") {
                      if (trialScansRemaining <= 0) {
                        alert("Free Trial Expired: You have used all 3 trial neural scans! Unlock unlimited enterprise scans with a canopy subscription plan.");
                        setActiveTab("billing");
                        return false;
                      }
                      const newCount = trialScansRemaining - 1;
                      setTrialScansRemaining(newCount);
                      localStorage.setItem("sentric_trial_scans", newCount.toString());
                      return true;
                    }
                    if (subscriptionStatus === "none") {
                      alert("Activation Required: You do not have an active coverage node. Go to Billing & Subscriptions to sign in or choose a plan!");
                      setActiveTab("billing");
                      return false;
                    }
                    return true;
                  }}
                />
              )}

              {activeTab === "treasurer" && <FinOpsDashboard />}

              {activeTab === "governance" && <GovernanceDashboard />}

              {activeTab === "deck" && <InvestorDeck />}

              {activeTab === "executive" && <ExecutiveDashboard />}

              {activeTab === "billing" && (
                <BillingDashboard 
                  userEmail={userEmail}
                  subscriptionStatus={subscriptionStatus}
                  trialScansRemaining={trialScansRemaining}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  onPurchaseSubscription={handlePurchaseSubscription}
                />
              )}

              {activeTab === "founder" && (
                <FounderDashboard 
                  userEmail={userEmail}
                  onLoginAsAdmin={() => handleLogin("aryan21430@gmail.com")}
                />
              )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

        </div>
      )}

      {/* MOBILE DRAWER CLAMP SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all"
        ></div>
      )}

      {/* System Health Desk Modal Overlay */}
      <SystemHealthModal 
        isOpen={isHealthModalOpen} 
        onClose={() => setIsHealthModalOpen(false)} 
      />

      {/* Dynamic Feature Lock Overlay Modal */}
      <LockOverlay
        isOpen={lockOverlay.isOpen}
        onClose={() => setLockOverlay(prev => ({ ...prev, isOpen: false }))}
        onRedirectToBilling={() => setActiveTab("billing")}
        featureName={lockOverlay.featureName}
        requiredPlan={lockOverlay.requiredPlan}
        benefits={lockOverlay.benefits}
      />

    </div>
  );
}
