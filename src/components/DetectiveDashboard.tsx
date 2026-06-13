/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { DECTECTIVE_SHADOW_LOGS } from "../data";
import { ShadowAILog } from "../types";
import { Search, ShieldAlert, Sparkles, Filter, Plus, Ban, CheckCircle, Flame, Server, AlertTriangle, X, RefreshCw, ShieldCheck, Activity } from "lucide-react";
import { playBreachAlarm, playLatencyAlarm } from "../utils/audioNotification";
import { motion, AnimatePresence } from "motion/react";

export default function DetectiveDashboard() {
  const [logs, setLogs] = useState<ShadowAILog[]>(DECTECTIVE_SHADOW_LOGS);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);

  const runDetectiveDeepScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs(["[INIT] Connecting to global anycast DNS nodes..."]);
    
    // Explicitly backup alarm configurations
    const breachPrev = localStorage.getItem("sentric_notify_security_breach");
    const latencyPrev = localStorage.getItem("sentric_notify_high_latency");
    localStorage.setItem("sentric_notify_security_breach", "true");
    localStorage.setItem("sentric_notify_high_latency", "true");

    try {
      playLatencyAlarm();
    } catch (e) {}

    const logsByProgress: { [key: number]: string } = {
      10: "[AUDIT] Probing non-standard SSL/TLS ports (8000, 8080, 5000)...",
      25: "[SCAN] Intercepting browser outbound API headers for unregistered wraps...",
      45: "[THREAT] Match: Unsanctioned Claude developer keys in customer-service VLAN!",
      65: "[AUDIT] Cross-checking employees Google OAuth credentials matching shadow signatures...",
      80: "[THREAT] Match: Unauthorized Local Ollama integration emitting code IP!",
      95: "[COMPILING] Synthesizing risk-profile mapping matrices for shadow tools...",
      100: "[COMPLETE] Discovery audit completed successfully."
    };

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);

      const logMilestone = Object.keys(logsByProgress)
        .map(Number)
        .find(p => progress >= p && progress < p + 2);

      if (logMilestone) {
        const text = logsByProgress[logMilestone];
        setScanLogs(prev => {
          if (!prev.includes(text)) {
            return [...prev, text];
          }
          return prev;
        });

        try {
          if (logMilestone === 45 || logMilestone === 80) {
            playBreachAlarm();
          } else if (logMilestone === 100) {
            playLatencyAlarm();
          } else {
            playLatencyAlarm();
          }
        } catch (e) {}
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          
          // Revert back settings
          if (breachPrev !== null) localStorage.setItem("sentric_notify_security_breach", breachPrev);
          if (latencyPrev !== null) localStorage.setItem("sentric_notify_high_latency", latencyPrev);

          const newApp1: ShadowAILog = {
            id: `LOG-${Math.floor(Math.random() * 900) + 3100}`,
            appName: "Unapproved-Claude-Chrome-Plugin",
            category: "Writing",
            discoverySource: "Endpoint Agent",
            riskScore: 84,
            complianceLevel: "Severe Risk",
            employeeCount: 31,
            dataTransmittedMB: 418.5,
            status: "Flagged",
            lastActive: "Just now (Discovered via Deep Scan)"
          };

          const newApp2: ShadowAILog = {
            id: `LOG-${Math.floor(Math.random() * 900) + 4100}`,
            appName: "Local-LLM-Terminal-AutoComplete",
            category: "Coding",
            discoverySource: "DNS Query",
            riskScore: 91,
            complianceLevel: "Severe Risk",
            employeeCount: 8,
            dataTransmittedMB: 1204.0,
            status: "Flagged",
            lastActive: "Just now (Discovered via Deep Scan)"
          };

          setLogs(prev => [newApp1, newApp2, ...prev]);
          triggerToast("Deep Scan Complete. Discovered 2 brand new unvetted Shadow AI tools!");
        }, 1000);
      }
    }, 70);
  };
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkScanning, setIsBulkScanning] = useState(false);
  const [bulkScanProgress, setBulkScanProgress] = useState(0);
  const [bulkScanLogs, setBulkScanLogs] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<"Flag" | "Dismiss" | null>(null);

  const runBulkScan = (action: "Flag" | "Dismiss") => {
    if (selectedIds.length === 0) return;
    setIsBulkScanning(true);
    setBulkScanProgress(0);
    setBulkActionType(action);
    setBulkScanLogs([`[INIT] Preparing consolidated threat audit sweep for ${selectedIds.length} chosen vector vectors...`]);

    const breachPrev = localStorage.getItem("sentric_notify_security_breach");
    const latencyPrev = localStorage.getItem("sentric_notify_high_latency");
    localStorage.setItem("sentric_notify_security_breach", "true");
    localStorage.setItem("sentric_notify_high_latency", "true");

    try {
      playLatencyAlarm();
    } catch (e) {}

    const selectedApps = logs.filter(l => selectedIds.includes(l.id));
    const selectedNames = selectedApps.map(a => a.appName);

    const logsByProgress: { [key: number]: string } = {
      15: `[AUDIT] Aggregating multi-node telemetry mapping for: ${selectedNames.join(", ")}...`,
      40: `[THREAT] Cross-checking credentials, TLS signatures, and SOC2 perimeter parameters...`,
      65: `[POLICY] Structuring unified ${action === "Flag" ? "Review Flags" : "Dismissed Alarms"} mapping data...`,
      90: `[SYNC] Writing changes directly to edge index logs...`,
      100: `[COMPLETE] Consolidated decision executed cleanly for all selected nodes.`
    };

    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      if (progress > 100) progress = 100;
      setBulkScanProgress(progress);

      const logMilestone = Object.keys(logsByProgress)
        .map(Number)
        .find(p => progress >= p && progress < p + 4);

      if (logMilestone) {
        const text = logsByProgress[logMilestone];
        setBulkScanLogs(prev => {
          if (!prev.includes(text)) {
            return [...prev, text];
          }
          return prev;
        });

        try {
          if (logMilestone === 40 && action === "Flag") {
            playBreachAlarm();
          } else {
            playLatencyAlarm();
          }
        } catch (e) {}
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsBulkScanning(false);
          
          // Revert back settings
          if (breachPrev !== null) localStorage.setItem("sentric_notify_security_breach", breachPrev);
          if (latencyPrev !== null) localStorage.setItem("sentric_notify_high_latency", latencyPrev);

          // All decisions updated in single state write
          const newStatus = action === "Flag" ? "Flagged" : "Approved";
          setLogs(prev => prev.map(log => {
            if (selectedIds.includes(log.id)) {
              return { ...log, status: newStatus };
            }
            return log;
          }));

          triggerToast(`Consolidated Decision Sweep: Updated ${selectedIds.length} tools to status [${newStatus.toUpperCase()}]!`);
          setSelectedIds([]);
          setBulkActionType(null);
        }, 800);
      }
    }, 60);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<string>("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleStatus = (id: string, newStatus: "Approved" | "Blocked" | "Flagged") => {
    if (newStatus === "Blocked") {
      playBreachAlarm();
    }
    setLogs(prev => prev.map(log => {
      if (log.id === id) {
        triggerToast(`Application '${log.appName}' status updated to [${newStatus.toUpperCase()}]`);
        return { ...log, status: newStatus };
      }
      return log;
    }));
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.appName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedRisk === "ALL") return matchesSearch;
    if (selectedRisk === "HIGH") return matchesSearch && (log.riskScore >= 75 || log.complianceLevel === "Severe Risk");
    if (selectedRisk === "MEDIUM") return matchesSearch && log.riskScore >= 45 && log.riskScore < 75;
    if (selectedRisk === "LOW") return matchesSearch && log.riskScore < 45;
    
    return matchesSearch;
  });

  const totalShadowApps = logs.length * 12 + 4; // Simulated multiplier representing complete company
  const severeThreatsCount = logs.filter(l => l.riskScore >= 75 && l.status !== "Blocked").length;
  const totalVolumeMB = Number(logs.reduce((sum, current) => sum + current.dataTransmittedMB, 0).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 border border-amber-500/40 text-amber-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          <span className="font-mono text-xs">{notification}</span>
        </div>
      )}

      {/* Deep Scan Modal Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0c10] border border-cyan-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            <div className="absolute right-0 top-0 w-48 h-48 bg-cyan-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
            
            <div className="p-6">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-cyan-400 animate-spin" />
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white tracking-wide uppercase">SENTRIC DEEP INTEL AUDIT</h3>
                    <p className="text-[10px] text-slate-500 font-sans">Active DNS edge-mapping sequence in progress...</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/25 px-2 py-0.5 rounded">
                  {scanProgress}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-950 border border-slate-900 rounded-full h-3 overflow-hidden mb-5">
                <div 
                  className="bg-gradient-to-r from-cyan-600 to-teal-400 h-full rounded-full transition-all duration-75"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>

              {/* Log stream console block */}
              <div className="bg-[#030406]/95 border border-slate-900 rounded-xl p-4 h-56 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 select-text shadow-inner scrollbar-none">
                {scanLogs.map((logLine, idx) => {
                  const isThreat = logLine.includes("Match:");
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-1.5 leading-normal ${
                        isThreat ? "text-rose-400 border-l-2 border-rose-600 pl-2 py-0.5" : ""
                      }`}
                    >
                      <span className="text-slate-600 shrink-0 select-none">❯</span>
                      <span className="whitespace-pre-wrap">{logLine}</span>
                    </div>
                  );
                })}
              </div>

              {/* Status and disclaimer */}
              <div className="flex items-center gap-2 text-[9px] text-slate-500 font-sans leading-normal mt-4 border-t border-slate-900 pt-3">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span>Encrypted secure session. Direct integration logs are signed using ephemeral WebAssembly keys for complete operator anonymity.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Processing Modal Overlay */}
      <AnimatePresence>
        {isBulkScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#0b0c10] border border-cyan-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative"
            >
              <div className="absolute right-0 top-0 w-48 h-48 bg-cyan-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
              
              <div className="p-6">
                <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-cyan-400 animate-spin" />
                    <div>
                      <h3 className="text-sm font-mono font-bold text-white tracking-wide uppercase">SENTRIC CONSOLIDATED DECISION SWEEP</h3>
                      <p className="text-[10px] text-slate-500 font-sans">
                        Applying bulk status: <span className="font-bold font-mono text-cyan-400 uppercase">{bulkActionType === "Flag" ? "FLAG FOR REVIEW" : "DISMISS ALARMS"}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/25 px-2 py-0.5 rounded">
                    {bulkScanProgress}%
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-slate-950 border border-slate-900 rounded-full h-3 overflow-hidden mb-5">
                  <div 
                    className="bg-gradient-to-r from-cyan-600 to-teal-400 h-full rounded-full transition-all duration-75"
                    style={{ width: `${bulkScanProgress}%` }}
                  ></div>
                </div>

                {/* Log stream console block */}
                <div className="bg-[#030406]/95 border border-slate-900 rounded-xl p-4 h-56 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 select-text shadow-inner scrollbar-none">
                  {bulkScanLogs.map((logLine, idx) => {
                    const isThreat = logLine.includes("Match:") || logLine.includes("[THREAT]");
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-1.5 leading-normal ${
                          isThreat ? "text-amber-400 border-l-2 border-amber-500 pl-2 py-0.5" : ""
                        }`}
                      >
                        <span className="text-slate-600 shrink-0 select-none">❯</span>
                        <span className="whitespace-pre-wrap">{logLine}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Status and disclaimer */}
                <div className="flex items-center gap-2 text-[9px] text-slate-500 font-sans leading-normal mt-4 border-t border-slate-900 pt-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                  <span>Encrypted combined batch session. Direct audit telemetry parameters conform strictly to NIST and ISO guidelines on a single sweep.</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">The Detective</span>
              <h2 className="text-xl font-bold tracking-tight text-white">Shadow AI Discovery</h2>
            </div>
            <p className="text-xs text-slate-400">DNS & endpoint auditing engines scanning network traffic to reveal unvetted AI utilities.</p>
          </div>
          <button 
            onClick={runDetectiveDeepScan}
            disabled={isScanning}
            className={`px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white rounded-xl text-xs font-mono font-medium shadow-lg hover:shadow-cyan-900/10 transition-all flex items-center gap-2 border border-cyan-500/20 active:scale-95 ${
              isScanning ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Server className="h-4 w-4" />
            Trigger Deep Scan
          </button>
        </div>

        {/* Aggregated KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Shadow Tools Inventory</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold tracking-tight text-white">{totalShadowApps}</span>
              <span className="text-[10px] text-amber-500 font-mono">+12 this week</span>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Active Severe Risks</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold tracking-tight text-rose-500">{severeThreatsCount}</span>
              <span className="text-[10px] text-rose-400/70 font-mono">Requires Action</span>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Data Shared with LLMs</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold tracking-tight text-cyan-400">{totalVolumeMB} MB</span>
              <span className="text-[10px] text-slate-500 font-mono">Encrypted Transit</span>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">SAML Sync Health</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold tracking-tight text-emerald-400">99.2%</span>
              <span className="text-[10px] text-emerald-500 font-mono">1.2ms latency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search discovered apps or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-805 text-white pl-10 pr-4 py-2 rounded-xl text-xs outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 font-sans"
          />
        </div>

        {/* Categories Tab */}
        <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-850 rounded-xl overflow-x-auto w-full sm:w-auto">
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRisk(risk)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all ${
                selectedRisk === risk
                  ? "bg-slate-800 text-cyan-400 border border-slate-700"
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              {risk} Risk
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action console bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-[#0b0c17]/95 border border-cyan-500/40 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_40px_rgba(34,211,238,0.15)] relative overflow-hidden"
          >
            {/* Holographic scanner laser active indicator */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)] animate-ping"></div>
              <div>
                <span className="font-mono text-[10px] text-cyan-300 uppercase font-black tracking-widest bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded shadow-[inset_0_0_8px_rgba(34,211,238,0.2)]">
                  BULK TELESCOPE CONTROL
                </span>
                <p className="text-[10px] text-slate-350 mt-1.5 font-sans leading-none">
                  <strong className="text-cyan-400 font-bold">{selectedIds.length}</strong> shadow vectors selected. Execute synchronized state update.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 z-10">
              <button
                onClick={() => setSelectedIds([])}
                className="px-3.5 py-1.5 text-slate-300 hover:text-white hover:border-slate-600 bg-slate-950/80 border border-slate-800 rounded-lg transition-all font-mono text-[9px] uppercase cursor-pointer"
              >
                Deselect All
              </button>
              {filteredLogs.some(l => l.riskScore >= 75 && !selectedIds.includes(l.id)) && (
                <button
                  onClick={() => {
                    const highRiskIds = filteredLogs.filter(l => l.riskScore >= 75).map(l => l.id);
                    setSelectedIds(prev => Array.from(new Set([...prev, ...highRiskIds])));
                  }}
                  className="px-3.5 py-1.5 text-rose-450 hover:text-rose-400 bg-rose-950/15 border border-rose-900/30 rounded-lg transition-all font-mono text-[9px] uppercase cursor-pointer"
                >
                  Select High Risk
                </button>
              )}
              <button
                id="bulk-flag-btn"
                onClick={() => runBulkScan("Flag")}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-amber-950 hover:text-white font-mono font-bold rounded-lg transition-all text-[9.5px] uppercase cursor-pointer flex items-center gap-1.5 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Flag for Review ({selectedIds.length})
              </button>
              <button
                id="bulk-dismiss-btn"
                onClick={() => runBulkScan("Dismiss")}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-emerald-950 hover:text-white font-mono font-bold rounded-lg transition-all text-[9.5px] uppercase cursor-pointer flex items-center gap-1.5 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Dismiss Threats ({selectedIds.length})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main logs list */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-805 bg-slate-950/40 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12 col-span-1">
                  <input
                    type="checkbox"
                    checked={filteredLogs.length > 0 && selectedIds.length === filteredLogs.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredLogs.map(l => l.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-400 focus:ring-cyan-500/20 cursor-pointer h-3.5 w-3.5"
                  />
                </th>
                <th className="py-3.5 px-4 font-normal">App Details</th>
                <th className="py-3.5 px-4 font-normal">Category</th>
                <th className="py-3.5 px-4 font-normal">Risk Rating</th>
                <th className="py-3.5 px-4 font-normal">Source</th>
                <th className="py-3.5 px-4 font-normal text-right">Data Exfiltrated</th>
                <th className="py-3.5 px-4 font-normal text-center">Audit Status</th>
                <th className="py-3.5 px-4 font-normal text-right">Policy Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-805/80 text-xs font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono text-xs">
                    No unvetted applications match your search query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSevere = log.riskScore >= 75;
                  const isMedium = log.riskScore >= 45 && log.riskScore < 75;
                  const isBlocked = log.status === "Blocked";
                  const isApproved = log.status === "Approved";

                  return (
                    <tr key={log.id} className={`hover:bg-slate-950/20 transition-all group ${selectedIds.includes(log.id) ? "bg-cyan-950/15" : ""}`}>
                      <td className="py-4 px-4 text-center w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(log.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, log.id]);
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== log.id));
                            }
                          }}
                          className="rounded bg-slate-950 border-slate-800 text-cyan-400 focus:ring-cyan-500/20 cursor-pointer h-3.5 w-3.5"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${
                            isBlocked ? "bg-slate-950 border-slate-800 text-slate-550" : 
                            isSevere ? "bg-rose-950/20 border-rose-900/30 text-rose-450" : "bg-cyan-950/20 border-cyan-900/30 text-cyan-450"
                          }`}>
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                              {log.appName}
                              <span className="text-[9px] text-slate-500 font-mono">{log.id}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">Last active {log.lastActive} • {log.employeeCount} active accounts</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-slate-350">{log.category}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                            <div 
                              className={`h-full rounded-full ${
                                isBlocked ? "bg-slate-700" :
                                isSevere ? "bg-gradient-to-r from-red-600 to-rose-500" :
                                isMedium ? "bg-gradient-to-r from-amber-600 to-yellow-500" :
                                "bg-gradient-to-r from-emerald-600 to-teal-500"
                              }`} 
                              style={{ width: `${log.riskScore}%` }}
                            ></div>
                          </div>
                          <span className={`font-mono text-[10px] font-bold ${
                            isBlocked ? "text-slate-500" :
                            isSevere ? "text-rose-400" : 
                            isMedium ? "text-amber-400" : "text-emerald-400"
                          }`}>{isBlocked ? "BLOCKED" : `${log.riskScore}/100`}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {log.discoverySource}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-slate-350">
                        {log.dataTransmittedMB} MB
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono leading-tight font-medium border ${
                          isBlocked ? "bg-slate-950 text-slate-500 border-slate-800" : 
                          isApproved ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/35" : 
                          "bg-amber-950/20 text-amber-400 border-amber-900/35 animate-pulse"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isBlocked ? (
                            <button
                              onClick={() => handleToggleStatus(log.id, "Flagged")}
                              className="px-2.5 py-1 bg-[#121214] hover:bg-slate-800 text-slate-300 rounded text-[9px] font-mono border border-white/5 transition duration-150 cursor-pointer"
                            >
                              REVOKE BLOCKING
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleToggleStatus(log.id, "Approved")}
                                className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold border transition duration-150 cursor-pointer ${
                                  isApproved 
                                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                                    : "bg-transparent border-white/5 text-slate-400 hover:bg-emerald-950/20 hover:text-emerald-400 hover:border-emerald-500/25"
                                }`}
                              >
                                ALLOW
                              </button>
                              <button
                                onClick={() => handleToggleStatus(log.id, "Blocked")}
                                className="px-2.5 py-1 bg-transparent border border-white/5 text-slate-400 hover:bg-rose-950/20 hover:text-rose-450 hover:border-rose-500/30 rounded text-[9px] font-mono font-bold transition duration-150 cursor-pointer"
                              >
                                BLOCK
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Threat Audit Report Insight Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-2xl">
          <h3 className="font-mono text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5 uppercase">
            <Flame className="h-4 w-4 text-rose-500" />
            Top shadow entry threats
          </h3>
          <div className="space-y-3.5">
            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-850/60">
              <div>
                <span className="text-white text-xs font-semibold">DeepSeek & unvetted developers APIs</span>
                <p className="text-[10px] text-slate-500 mt-0.5">DNS request volume spiked 400% inside engineering subdomains.</p>
              </div>
              <span className="bg-rose-950/35 text-rose-400 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-rose-900/40">Critical risk</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-850/60">
              <div>
                <span className="text-white text-xs font-semibold">Browser Translation Plugins (Chrome Store)</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Automatically parses active CRM tables, leaking customer identifiers.</p>
              </div>
              <span className="bg-amber-950/35 text-amber-400 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-amber-900/40">Medium risk</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-mono text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5 uppercase">
              <AlertTriangle className="h-4 w-4 text-cyan-400" />
              Compliance footprint overlap
            </h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              We detected <strong>3 unauthorized PDF conversion systems</strong> and <strong>2 public writing tools</strong> with conflicting SOC2 frameworks accessed using team OAuth signatures. We recommend consolidating inactive subscriptions.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">Continuous SOC2 map</span>
            <span className="text-emerald-400 flex items-center gap-1">
              Active Sync Stable
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
