import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert,
  Users, 
  TrendingUp, 
  Building2, 
  Brain, 
  AlertOctagon, 
  BadgeDollarSign, 
  Heart,
  Globe2,
  Calendar,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  Computer,
  Smartphone,
  Tablet,
  Chrome,
  Compass,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  Info,
  Server,
  Zap,
  Power,
  Volume2,
  HelpCircle,
  Clock
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { playBreachAlarm, playLatencyAlarm } from "../utils/audioNotification";

interface FounderDashboardProps {
  userEmail: string | null;
  onLoginAsAdmin?: () => void;
}

// Visual color theme constants matching system
const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#ec4899", "#f59e0b", "#3b82f6"];

export default function FounderDashboard({ userEmail, onLoginAsAdmin }: FounderDashboardProps) {
  // Configured Super Admin email
  const ADMIN_EMAIL = "aryan21430@gmail.com";
  const isAdmin = userEmail === ADMIN_EMAIL;

  // Simulate active session analytics state
  const [totalUsers, setTotalUsers] = useState(18452);
  const [dailyActive, setDailyActive] = useState(2840);
  const [weeklyActive, setWeeklyActive] = useState(9140);
  const [monthlyActive, setMonthlyActive] = useState(14800);
  const [totalSecurityEvents, setTotalSecurityEvents] = useState(1084);
  const [totalSavings, setTotalSavings] = useState(14800);
  const [totalSpendTracked, setTotalSpendTracked] = useState(42500);

  // Active simulator alerts stack
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: "info" | "warning" | "critical" | "success";
    title: string;
    description: string;
    timestamp: string;
  }>>([
    {
      id: "alert-1",
      type: "success",
      title: "New Organization Onboarded",
      description: "Apex Labs India integrated 24 new developer nodes into Sentric Core Proxy.",
      timestamp: "5 minutes ago"
    },
    {
      id: "alert-2",
      type: "warning",
      title: "Security Incidents Warning",
      description: "Shadow AI activity spike detected on engineering subdomain 'sandbox-beta'.",
      timestamp: "12 minutes ago"
    },
    {
      id: "alert-3",
      type: "critical",
      title: "FinOps Threshold Breached",
      description: "Developer team 'automations-bot' exceeded daily $100 model query allotment with un-cached cycles.",
      timestamp: "1 hour ago"
    }
  ]);

  // Selected analytical window for reports and trends
  const [selectedReportPeriod, setSelectedReportPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [reportLog, setReportLog] = useState<string>("");
  const [isCompilingReport, setIsCompilingReport] = useState<boolean>(false);

  // Interactive Analytics Stack recommendations selection
  const [comparisonKey, setComparisonKey] = useState<"posthog" | "plausible" | "umami">("umami");

  // Growth & timeline metrics (Mocked data perfectly formatted for Recharts)
  const growthTrendData = [
    { day: "Jun 06", "New Users": 210, "Daily Active": 1800, "Blocked Hazards": 45 },
    { day: "Jun 07", "New Users": 285, "Daily Active": 1950, "Blocked Hazards": 58 },
    { day: "Jun 08", "New Users": 320, "Daily Active": 2100, "Blocked Hazards": 64 },
    { day: "Jun 09", "New Users": 490, "Daily Active": 2400, "Blocked Hazards": 92 },
    { day: "Jun 10", "New Users": 580, "Daily Active": 2650, "Blocked Hazards": 110 },
    { day: "Jun 11", "New Users": 740, "Daily Active": 2780, "Blocked Hazards": 142 },
    { day: "Jun 12", "New Users": 912, "Daily Active": 2840, "Blocked Hazards": 184 },
  ];

  const deviceDistributionData = [
    { name: "Web / Desktop Chrome", value: 12450, percentage: "67.4%" },
    { name: "Safari Mobile Node", value: 4122, percentage: "22.3%" },
    { name: "Firefox Linux client", value: 1480, percentage: "8.0%" },
    { name: "Edge Corporate Sandbox", value: 400, percentage: "2.3%" },
  ];

  const trafficSourcesData = [
    { source: "Google Search Engine", users: 8400, percentage: "45.5%" },
    { source: "Developer GitHub / README", users: 5120, percentage: "27.7%" },
    { source: "Twitter / X Developer Spaces", users: 2940, percentage: "15.9%" },
    { source: "Word of Mouth / Referrals", users: 1992, percentage: "10.9%" },
  ];

  const countryUsageData = [
    { country: "India 🇮🇳", users: 7850, orgs: 142, trend: "+45% WoW" },
    { country: "United States 🇺🇸", users: 5210, orgs: 88, trend: "+28% WoW" },
    { country: "United Kingdom 🇬🇧", users: 2450, orgs: 34, trend: "+12% WoW" },
    { country: "Germany 🇩🇪", users: 1840, orgs: 18, trend: "+8% WoW" },
    { country: "Singapore 🇸🇬", users: 1102, orgs: 12, trend: "+22% WoW" },
  ];

  // Feature usage index tracker
  const productAdoptionData = [
    { feature: "Shadow AI Detective Scan", activeHits: 14200, rating: "94%" },
    { feature: "Bodyguard Prompt Firewall", activeHits: 28450, rating: "88%" },
    { feature: "FinOps Cash Ring", activeHits: 9400, rating: "81%" },
    { feature: "Policy Directives Sync", activeHits: 1600, rating: "99%" },
  ];

  // Simulator actions to test live triggers
  const triggerGrowthSpike = () => {
    setTotalUsers(prev => prev + 185);
    setDailyActive(prev => prev + 45);
    try { playLatencyAlarm(); } catch(e){}
    
    const newAlert = {
      id: `alert-${Date.now()}`,
      type: "success" as const,
      title: "Growth Spike Detected",
      description: "Viral referral sequence triggered. +185 new signups registered on Bangalore gateways in past 4 minutes.",
      timestamp: "Just now"
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const triggerSecurityBreach = () => {
    setTotalSecurityEvents(prev => prev + 12);
    try { playBreachAlarm(); } catch(e){}
    
    const newAlert = {
      id: `alert-${Date.now()}`,
      type: "critical" as const,
      title: "Security Fire Wall Active",
      description: "12 distinct credit-card leakage attempts filtered and blocked on neural nodes.",
      timestamp: "Just now"
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const triggerRunawayBudgetBuster = () => {
    setTotalSpendTracked(prev => prev + 340);
    try { playBreachAlarm(); } catch(e) {}
    
    const newAlert = {
      id: `alert-${Date.now()}`,
      type: "warning" as const,
      title: "Budget Warning Threshold",
      description: "FinOps automated monitor alert: daily non-cached API spend tracking exceeded safe ceiling warnings.",
      timestamp: "Just now"
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const triggerNewOrgSignup = () => {
    const newAlert = {
      id: `alert-${Date.now()}`,
      type: "info" as const,
      title: "Brand New Enterprise Joined",
      description: "NVIDIA-Inception developer partner nodes joined Sentric. Zero Trust proxy initialized.",
      timestamp: "Just now"
    };
    setAlerts(prev => [newAlert, ...prev]);
    try { playLatencyAlarm(); } catch(e){}
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Compile compliance report log builder
  const handleCompileReport = (period: "daily" | "weekly" | "monthly") => {
    setIsCompilingReport(true);
    setSelectedReportPeriod(period);
    
    setTimeout(() => {
      let dataLog = "";
      const stamp = new Date().toLocaleString();
      if (period === "daily") {
        dataLog = `SENTRIC COGNITIVE REPORT // DAILY SUMMARY COMPLIANCE // LOG-A21\n` +
                  `TIMESTAMP: ${stamp}\n` +
                  `---------------------------------------------------------------\n` +
                  `GROWTH METRIC: +912 New users registered in past 24 hours.\n` +
                  `ENGAGEMENT STATISTICS: DAU at 2,840. Weekly Retention index is 84.1%.\n` +
                  `SECURITY PROFILE: ${totalSecurityEvents} firewall redactions executed. No unvetted SaaS proxy bypass detected.\n` +
                  `FINOPS REPORT: $14,800 Cached savings. Total Spend Under Management: $${totalSpendTracked}.\n` +
                  `COMPLIANCE STANDARDS: GDPR Guard certified. Zero PII storage in analytical servers.\n` +
                  `STATUS: OPERATIONAL NOMINAL.`;
      } else if (period === "weekly") {
        dataLog = `SENTRIC COGNITIVE REPORT // WEEKLY CONSOLIDATED SUMMARY // LOG-W08\n` +
                  `TIMESTAMP: ${stamp}\n` +
                  `---------------------------------------------------------------\n` +
                  `GROWTH METRIC: +5,420 Active registered nodes weekly. Growth velocity trend is +24.4%.\n` +
                  `ENGAGEMENT STATISTICS: 9,140 unique WAU. Global retention trends healthy.\n` +
                  `SECURITY PROFILE: Weekly malicious vulnerability detections decreased by 4.2%.\n` +
                  `FINOPS REPORT: Secured cacher efficiency at 64.2%. Cost containment rules synced to 294 organizations.\n` +
                  `COMPLIANCE STANDARDS: SOC2 Compliance Verified. All records aggregated globally.\n` +
                  `STATUS: OPERATIONAL NOMINAL.`;
      } else {
        dataLog = `SENTRIC COGNITIVE REPORT // MONTHLY COMPLIANCE AUDIT CERTIFICATE // LOG-M12\n` +
                  `TIMESTAMP: ${stamp}\n` +
                  `---------------------------------------------------------------\n` +
                  `GROWTH METRIC: +18,452 Cumulative users registered. Onboarding pipeline healthy.\n` +
                  `ENGAGEMENT STATISTICS: Active users peak at 14,800 monthly MAU.\n` +
                  `SECURITY PROFILE: Zero leaks compromised. Global compliance is at 100% capacity.\n` +
                  `FINOPS REPORT: Secured total cost overhead reduction to 64% token recycling rates.\n` +
                  `COMPLIANCE STANDARDS: Fully vetted India, US & EU data residency protocols verified.\n` +
                  `STATUS: REGISTERED COMPLIANT SECURE OVERLAY IS ACTIVE.`;
      }
      setReportLog(dataLog);
      setIsCompilingReport(false);
      try { playLatencyAlarm(); } catch(e){}
    }, 1200);
  };

  // Run initial state load
  useEffect(() => {
    // Compile first default daily report on component load
    handleCompileReport("daily");
  }, []);

  // Strict Authentication Guard layout if not Super Admin
  if (!isAdmin) {
    return (
      <div className="bg-[#05060b] min-h-[500px] flex flex-col items-center justify-center text-center p-8 border border-slate-850 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="h-16 w-16 rounded-full bg-rose-950/20 border border-rose-550/30 flex items-center justify-center text-rose-500 mb-6 animate-pulse">
          <ShieldAlert className="h-8 w-8 text-rose-450" />
        </div>

        <h3 className="text-xl font-mono text-white tracking-tight font-bold">Access Restricted: Super Admin Gate</h3>
        
        <p className="text-sm text-slate-400 max-w-md mt-3 leading-relaxed font-sans">
          This secure telemetry operational desk is calibrated exclusively for Super Admin authority: 
          <strong className="text-indigo-400 font-bold block mt-1">superadmin@sentric.io</strong>
        </p>

        {/* Demo trigger override enabling direct interactive testing */}
        <div className="mt-8 p-4 bg-slate-900/40 border border-slate-800 rounded-xl max-w-sm w-full space-y-3">
          <span className="text-[10px] font-mono font-bold text-indigo-400 block uppercase tracking-wider">💻 Tester / Investor Sandbox Emulator</span>
          <p className="text-[11px] text-slate-500 leading-normal font-sans">
            You are currently signed in as <span className="font-mono text-slate-350 font-bold">{userEmail || "anonymous_gate_node"}</span>. Press the bypass simulation switch to review the entire analytics architecture.
          </p>
          <button
            onClick={onLoginAsAdmin}
            className="w-full py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white font-mono font-bold rounded-lg text-xs transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-950/40"
          >
            Simulate Super Admin Session ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* BRAND FOUNDER DASHBOARD HERO HEADER */}
      <div className="bg-gradient-to-r from-indigo-950/20 to-slate-900/30 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-450 animate-ping"></span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-black">SUPER ADMIN ACTIVE TERMINAL</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
              👑 Sentric Founder Operations Command
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
              Privacy-first global governance oversight. Monitoring aggregate operations, user acquisition pipelines, regional telemetry performance indexes, and proactive compliance alerts.
            </p>
          </div>

          <div className="bg-[#05060b] border border-slate-800 p-3 rounded-xl space-y-1 text-xs font-mono min-w-[200px]">
            <span className="text-slate-500 text-[9px] block uppercase font-bold">Authenticated Admin:</span>
            <div className="text-white font-black truncate">{ADMIN_EMAIL}</div>
            <div className="text-indigo-400 text-[10px] font-bold flex items-center gap-1.5 mt-1">
              <Lock className="h-3 w-3" /> Root Control Plane Enabled
            </div>
          </div>
        </div>
      </div>

      {/* COMPLIANCE WARNING CARD (No sensitive data) */}
      <div className="bg-emerald-950/10 border border-emerald-900/30 p-4 rounded-xl flex gap-3.5 items-start">
        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Privacy-First Architecture Policy Compliance</h4>
          <p className="text-xs text-slate-350 leading-relaxed font-sans">
            <strong>Zero Personal Identifiable Data (PII) is cached or logged.</strong> Passwords, raw developer credentials, visual system attachments, exact location boundaries, and user prompt text values are completely blocked from landing logs. All graphs represent aggregated metrics mapped to anonymized request origins.
          </p>
        </div>
      </div>

      {/* ALERTS CONTROL AND NOTIFICATION HUB */}
      <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wide border-b border-white/5 pb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-indigo-400" />
            🚨 Real-Time Event & Alert Controller
          </span>
          <span className="text-[10px] text-slate-550 font-normal font-sans">Interactive Test Harness</span>
        </h3>

        {/* Live trigger controls for demonstration testing */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={triggerGrowthSpike}
            className="px-3.5 py-2.5 bg-indigo-950/30 hover:bg-indigo-950/70 border border-indigo-900/40 hover:border-indigo-500/50 text-indigo-300 hover:text-white rounded-xl text-xs font-mono font-semibold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            title="Simulate a massive influx of user registrations"
          >
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
            Trigger Growth Spike !!
          </button>
          
          <button
            onClick={triggerSecurityBreach}
            className="px-3.5 py-2.5 bg-rose-950/30 hover:bg-rose-950/70 border border-rose-900/40 hover:border-rose-500/50 text-rose-300 hover:text-white rounded-xl text-xs font-mono font-semibold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            title="Simulate security firewall blocks"
          >
            <AlertOctagon className="h-3.5 w-3.5 text-rose-550" />
            Simulate Security Breach !!
          </button>

          <button
            onClick={triggerRunawayBudgetBuster}
            className="px-3.5 py-2.5 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-900/40 hover:border-amber-500/50 text-amber-300 hover:text-white rounded-xl text-xs font-mono font-semibold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            title="Simulate FinOps budget model overflow alerts"
          >
            <BadgeDollarSign className="h-3.5 w-3.5 text-amber-500" />
            Budget Threshold Warn !!
          </button>

          <button
            onClick={triggerNewOrgSignup}
            className="px-3.5 py-2.5 bg-cyan-950/30 hover:bg-cyan-950/70 border border-cyan-900/40 hover:border-cyan-500/50 text-cyan-300 hover:text-white rounded-xl text-xs font-mono font-semibold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            title="Simulate a new corporate customer onboarding"
          >
            <Building2 className="h-3.5 w-3.5 text-cyan-400" />
            Trigger Org Joined !!
          </button>
        </div>

        {/* Live active alerts stream panel */}
        <div className="space-y-2 mt-4">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">Active Notification Buffer Stream ({alerts.length})</span>
          {alerts.length === 0 ? (
            <div className="p-5 border border-slate-850 bg-slate-950/30 text-center rounded-xl text-xs text-slate-500 font-mono">
              ✔ No active alarms in stack buffer. All thresholds locked completely safe.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {alerts.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-4 transition-colors ${
                    item.type === "critical" ? "bg-rose-950/20 border-rose-900/30 text-rose-200" :
                    item.type === "warning" ? "bg-amber-950/10 border-amber-900/30 text-amber-200" :
                    item.type === "success" ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-200" :
                    "bg-[#0a0d17] border-slate-850 text-slate-300"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {item.type === "critical" && <AlertTriangle className="h-4 w-4 text-rose-500 animate-bounce" />}
                      {item.type === "warning" && <AlertOctagon className="h-4 w-4 text-amber-400" />}
                      {item.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      {item.type === "info" && <Info className="h-4 w-4 text-cyan-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                        {item.title}
                        <span className="text-[9px] font-normal text-slate-500">{item.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">{item.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => dismissAlert(item.id)}
                    className="p-1 hover:bg-white/5 text-slate-500 hover:text-white rounded transition text-[10px] cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CORE PRIVACY TELEMETRY BLOCKS (Collect only aggregates) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-[#0c0e17] border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Total registered users</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <strong className="text-2xl font-mono text-white tracking-tight block">
            {totalUsers.toLocaleString()}
          </strong>
          <span className="text-[9.5px] font-mono text-emerald-400 block">+24% MoM User Onboarding Vel.</span>
        </div>

        <div className="bg-[#0c0e17] border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-550 font-bold">Daily Active (DAU)</span>
            <span className="h-3 w-3 rounded-full bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center text-[8px] font-mono text-indigo-405 font-bold">D</span>
          </div>
          <strong className="text-2xl font-mono text-white tracking-tight block">
            {dailyActive.toLocaleString()}
          </strong>
          <span className="text-[9.5px] font-mono text-slate-500 block">Peak tracking intervals nominal</span>
        </div>

        <div className="bg-[#0c0e17] border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-550 font-bold">Weekly / Monthly Active</span>
            <span className="h-3 w-3 rounded-full bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center text-[8px] font-mono text-indigo-405 font-bold">W</span>
          </div>
          <strong className="text-2xl font-mono text-white tracking-tight block">
            {weeklyActive.toLocaleString()} <span className="text-xs text-slate-500">/ {monthlyActive.toLocaleString()}</span>
          </strong>
          <span className="text-[9.5px] font-mono text-indigo-400 block">Healthy 17.5% retention curve</span>
        </div>

        <div className="bg-[#0c0e17] border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-550 font-bold">Total Corporations</span>
            <Building2 className="h-4 w-4 text-cyan-405" />
          </div>
          <strong className="text-2xl font-mono text-white tracking-tight block">
            294 <span className="text-xs text-slate-550">Orgs active</span>
          </strong>
          <span className="text-[9.5px] font-mono text-cyan-450 block">+14 partner channels pending</span>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-[#0c0e17] border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">AI Tools Discovered</span>
          <strong className="text-xl font-mono text-white tracking-tight block">
            142 unique services
          </strong>
          <span className="text-[9.5px] font-mono text-indigo-450">Through global DNS probing</span>
        </div>

        <div className="bg-[#0c0e17] border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Security Events Prevented</span>
          <strong className="text-xl font-mono text-rose-500 tracking-tight block">
            🧬 {totalSecurityEvents.toLocaleString()} blocks
          </strong>
          <span className="text-[9.5px] font-mono text-rose-450">SSN / API secret leaks saved</span>
        </div>

        <div className="bg-[#0c0e17] border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Prevented cost savings</span>
          <strong className="text-xl font-mono text-emerald-400 tracking-tight block">
            ${totalSavings.toLocaleString()} USD
          </strong>
          <span className="text-[9.5px] font-mono text-emerald-450">Via neural prompt cash buffers</span>
        </div>

        <div className="bg-[#0c0e17] border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-550 block font-bold">AI Spend Under Tracker</span>
          <strong className="text-xl font-mono text-indigo-400 tracking-tight block">
            ${totalSpendTracked.toLocaleString()} USD
          </strong>
          <span className="text-[9.5px] font-mono text-indigo-455">100% cloud ledger accountability</span>
        </div>

      </div>


      {/* VISUAL CHARTS BENTO BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dynamic Growth Timeline Chart */}
        <div className="lg:col-span-8 bg-slate-900/20 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div>
              <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">📈 Cumulative User Acquisition & Engagement Trend</h4>
              <p className="text-[11px] text-slate-450">Anonymized tracking analytics spanning standard daily active loops</p>
            </div>
            <span className="px-3.5 py-1.5 bg-[#05060b] border border-slate-850 rounded text-[9.5px] font-mono text-indigo-400 font-bold block">
              MAPPED REAL-TIME (UTC)
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="110%" height="100%">
              <AreaChart 
                data={growthTrendData} 
                margin={{ top: 10, right: 40, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.25} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0c0e17", borderColor: "#334155", color: "#f1f5f9", fontFamily: "monospace", fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: "monospace", paddingTop: 10 }} />
                <Area type="monotone" dataKey="New Users" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="Daily Active" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browser & Device Distribution aggregates */}
        <div className="lg:col-span-4 bg-[#0a0d17] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">📱 Device & Browser Nodes</h4>
            <span className="text-[11px] text-slate-500 block leading-tight font-sans">Compliant zero-cookie request client signature distribution metrics</span>
          </div>

          <div className="space-y-3.5 my-4">
            {deviceDistributionData.map((item, index) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-350 font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {item.name}
                  </span>
                  <span className="text-white font-bold">{item.percentage}</span>
                </div>
                <div className="w-full bg-[#05060b] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-305"
                    style={{ 
                      width: item.percentage, 
                      backgroundColor: COLORS[index % COLORS.length] 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-950 pt-3 text-[9.5px] font-mono leading-normal text-slate-500">
            *Aggregated based on HTTPS headers from reverse proxy layers. Exact device telemetry details are discarded on active ingest gateways.
          </div>
        </div>

      </div>


      {/* REGIONAL / COUNTRY LEVEL ENGAGEMENT METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        <div className="lg:col-span-6 bg-slate-900/20 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-indigo-400 rotate-12" />
              🌍 Country-Level Usage Metrics
            </h4>
            <p className="text-[11px] text-slate-450 mt-1 leading-normal font-sans">
              Anonymized tracking analytics segmented strictly at the sovereign DNS region border level.
            </p>
          </div>

          <div className="border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#0c0e17] text-slate-500">
                <tr className="border-b border-white/5">
                  <th className="p-3">Country Nodes</th>
                  <th className="p-3 text-right">Anonymized Users</th>
                  <th className="p-3 text-right">Organizations</th>
                  <th className="p-3 text-right">Acquisition Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#05060b]/40">
                {countryUsageData.map((row) => (
                  <tr key={row.country} className="hover:bg-slate-950/40 transition">
                    <td className="p-3 text-white font-medium">{row.country}</td>
                    <td className="p-3 text-right text-slate-300 font-bold">{row.users.toLocaleString()}</td>
                    <td className="p-3 text-right text-indigo-300 font-bold">{row.orgs}</td>
                    <td className="p-3 text-right text-emerald-450 font-bold">{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-indigo-950/10 border border-indigo-900/30 text-[10px] text-slate-400 font-sans rounded-xl">
            💡 <strong>Indian Region Leads Deployment</strong> - Bengaluru and Mumbai edge routers handle 43% of active DNS probe requests.
          </div>
        </div>

        {/* Traffic sources & session channels */}
        <div className="lg:col-span-6 bg-slate-900/20 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-4 w-4 text-cyan-400" />
              🌐 Traffic & Event Acquisition Sources
            </h4>
            <p className="text-[11px] text-slate-450 mt-1 leading-normal font-sans">
              Origins of developers linking secure systems into Sentric cloud controllers.
            </p>
          </div>

          <div className="space-y-3">
            {trafficSourcesData.map((row, index) => (
              <div key={row.source} className="p-3 bg-[#05060b] border border-slate-900 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded bg-[#0c0e17] border border-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-400 font-bold">
                    {index + 1}
                  </div>
                  <span className="text-xs font-mono text-white font-medium">{row.source}</span>
                </div>
                <div className="text-right text-xs font-mono">
                  <strong className="text-slate-350">{row.users.toLocaleString()} sessions</strong>
                  <span className="text-[9.5px] text-indigo-400 block font-bold">{row.percentage} weight</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-white/5 rounded-xl p-3 flex gap-2.5 items-center bg-[#0c0e17]/50">
            <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-mono text-slate-400">
              Weekly Retention Score: <strong className="text-white font-bold">84% developer cohort</strong> still active at Day 14 sync intervals.
            </span>
          </div>
        </div>

      </div>


      {/* COMPLIANCE REPORT COMPILER DESK */}
      <div className="bg-[#0c0e17] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-indigo-400" />
              📑 Automatic Operations & Governance Report Compiler
            </h4>
            <p className="text-[11px] text-slate-450">Produce instant SOC2 exportable audits mapping growth, security, and FinOps statistics.</p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            {(["daily", "weekly", "monthly"] as const).map((period) => (
              <button
                key={period}
                onClick={() => handleCompileReport(period)}
                className={`px-3 py-1 bg-slate-950 border text-[10px] font-mono rounded-lg transition uppercase font-bold cursor-pointer ${
                  selectedReportPeriod === period 
                    ? "border-indigo-500 text-indigo-400"
                    : "border-slate-850 text-slate-500 hover:text-slate-350"
                }`}
              >
                {period} report
              </button>
            ))}
          </div>
        </div>

        {/* Live dynamic document viewer */}
        <div className="bg-[#05060b] border border-slate-850 rounded-xl p-4 font-mono text-xs leading-relaxed relative text-slate-300">
          {isCompilingReport ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3.5">
              <Zap className="h-6 w-6 text-indigo-400 animate-spin" />
              <span className="text-[10px] text-slate-500 bg-[#090a0f] border border-slate-800/40 px-3 py-1 rounded-full text-xs font-medium tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400">BUILDING SECURED CIPHER STATEMENT...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <pre className="whitespace-pre-wrap text-slate-300 overflow-x-auto text-[10.5px] leading-relaxed max-w-full">
                {reportLog}
              </pre>
              <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[9.5px]">
                <span className="text-emerald-450 font-bold tracking-wider uppercase flex items-center gap-1">
                  ✔ CIPHER INTEGRITY SEAL FOR: Mapped Global SOC2 Log Server
                </span>
                <button
                  onClick={() => {
                    alert("Audit document text copied cleanly to operator clipboard.");
                    navigator.clipboard.writeText(reportLog);
                  }}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white rounded text-[9.5px] transition cursor-pointer font-bold uppercase"
                >
                  Copy Log Certificate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* RECOMMENDATION TOOL: PRIVACY-FRIENDLY ANALYTICS STACK */}
      <div className="bg-slate-900/10 border border-slate-800 rounded-2xl p-5 space-y-4">
        
        <div className="border-b border-white/5 pb-3">
          <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
            🏆 Privacy-Friendly Analytics Stack Evaluator
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
            Evaluation metrics comparing popular production trackers. Determine which software configuration suits your organization's compliance standard.
          </p>
        </div>

        {/* Dynamic selector comparing three technologies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div 
            onClick={() => setComparisonKey("posthog")}
            className={`p-4 border rounded-xl transition cursor-pointer flex flex-col justify-between h-36 ${
              comparisonKey === "posthog" 
                ? "bg-indigo-950/20 border-indigo-500/50 text-white shadow-lg" 
                : "bg-[#05060b] border-slate-900 text-slate-400 hover:border-slate-800"
            }`}
          >
            <div className="space-y-1">
              <strong className="text-white text-sm font-mono block">🦔 PostHog Node Config</strong>
              <p className="text-[11px] leading-relaxed font-sans">Funnel analyses & session replays. Extremely powerful but carries script file size footprint overhead.</p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/5 pt-2">
              <span className="text-indigo-455">GDPR Complex</span>
              <span className="font-bold text-amber-400">Score: 8.5/10</span>
            </div>
          </div>

          <div 
            onClick={() => setComparisonKey("plausible")}
            className={`p-4 border rounded-xl transition cursor-pointer flex flex-col justify-between h-36 ${
              comparisonKey === "plausible" 
                ? "bg-indigo-950/20 border-indigo-500/50 text-white shadow-lg" 
                : "bg-[#05060b] border-slate-900 text-slate-400 hover:border-slate-800"
            }`}
          >
            <div className="space-y-1">
              <strong className="text-white text-sm font-mono block">⚡ Plausible Analytics</strong>
              <p className="text-[11px] leading-relaxed font-sans">Lightweight, GDPR compliant out of the box, simple page counters. Premium hosted model only.</p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/5 pt-2">
              <span className="text-indigo-455">Zero-Cookie Web</span>
              <span className="font-bold text-emerald-400">Score: 9.2/10</span>
            </div>
          </div>

          <div 
            onClick={() => setComparisonKey("umami")}
            className={`p-4 border rounded-xl transition cursor-pointer flex flex-col justify-between h-36 ${
              comparisonKey === "umami" 
                ? "bg-indigo-950/20 border-indigo-500/50 text-white shadow-lg" 
                : "bg-[#05060b] border-slate-900 text-slate-400 hover:border-slate-800"
            }`}
          >
            <div className="space-y-1">
              <strong className="text-white text-sm font-mono block">🐈 Umami Analytics (Winner 🏆)</strong>
              <p className="text-[11px] leading-relaxed font-sans">Self-hostable, open-source compliance favorite. Lightweight 2kb footprint, infinite custom actions.</p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/5 pt-2">
              <span className="text-indigo-450">Federated Self-Host</span>
              <span className="font-bold text-emerald-450 font-black">Score: 9.8/10</span>
            </div>
          </div>

        </div>

        {/* Multi-tier itemized analytical rating checklist card */}
        <div className="bg-[#05060b] border border-slate-850 rounded-xl p-4 space-y-3 font-sans">
          
          <div className="flex items-center gap-2 text-white border-b border-white/5 pb-2">
            <Info className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Sentric Engineering Recommendation Details for: <span className="text-indigo-400 font-extrabold">{comparisonKey.toUpperCase()}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-slate-950 pb-1">
                <span className="text-slate-400">Self-Hosting Capability:</span>
                <strong className="text-white font-mono uppercase">
                  {comparisonKey === "umami" ? "Yes (Docker / Postgres / MySQL)" : comparisonKey === "posthog" ? "Yes (Self-Hosted Cloud)" : "No (Premium Cloud Only)"}
                </strong>
              </div>
              <div className="flex justify-between border-b border-slate-950 pb-1">
                <span className="text-slate-400">Script footprint bundle weight:</span>
                <strong className="text-white font-mono">
                  {comparisonKey === "umami" ? "2.1 KB" : comparisonKey === "plausible" ? "1.2 KB" : "185 KB (Large feature buffer)"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GDPR / CCPA / SOC2 Compliance:</span>
                <strong className="text-emerald-450 font-mono font-bold">100% COMPLIANTAPPROVED</strong>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between border-b border-slate-950 pb-1">
                <span className="text-slate-400">Identity isolation protection:</span>
                <strong className="text-white font-mono">Aggregation Nodes (Zero client fingerprint)</strong>
              </div>
              <div className="flex justify-between border-b border-slate-950 pb-1">
                <span className="text-slate-400">Event actions supported:</span>
                <strong className="text-white font-mono">
                  {comparisonKey === "umami" ? "Unlimited dynamic actions" : comparisonKey === "plausible" ? "Custom Goal conversions" : "Deep cohort funnels + Sessions"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Best application focus:</span>
                <strong className="text-indigo-400 font-mono">
                  {comparisonKey === "umami" ? "General corporate site security tracking" : comparisonKey === "plausible" ? "Minimal dashboard telemetry" : "Funnel activation engineering analytics"}
                </strong>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 border border-slate-900 rounded text-[11px] leading-relaxed text-slate-400 font-mono mt-2">
            ⭐ <strong>Sentric Decision Architecture Recommended</strong>: We use and integrate <strong>Umami Analytics</strong> internally for general marketing and landing views, ensuring zero-cookie tracking rules, fast pings, and complete alignment with European and Indian privacy enforcement agencies.
          </div>

        </div>

      </div>

    </div>
  );
}
