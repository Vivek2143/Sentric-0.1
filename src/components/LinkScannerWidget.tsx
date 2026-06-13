import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  Ban, 
  CheckCircle, 
  RefreshCw, 
  Activity, 
  Wifi, 
  Globe, 
  Cpu, 
  Lock,
  Search,
  Filter,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { playBreachAlarm, playLatencyAlarm } from "../utils/audioNotification";

interface ScannedEndpoint {
  id: string;
  name: string;
  host: string;
  category: string;
  riskScore: number;
  dataTx: string;
  status: "PENDING" | "SCANNING" | "BLOCKED" | "ALLOWED" | "WARNING";
  timestamp: string;
  threatType?: string;
  userEmail: string;
}

const INITIAL_ENDPOINTS: ScannedEndpoint[] = [
  {
    id: "EP-901",
    name: "DeepSeek Core Ingress API",
    host: "api.deepseek.com/v1/chat",
    category: "Autonomous Dev Tool",
    riskScore: 88,
    dataTx: "354.2 MB",
    status: "WARNING",
    timestamp: "Just now",
    threatType: "Confidential IP uploads detected in engineer chat parameters",
    userEmail: "lead_dev_group_b@corporation.com"
  },
  {
    id: "EP-442",
    name: "Standard ChatGPT Free Writing Plugin",
    host: "chrome-store.chatgpt-helper.info",
    category: "Browser Extension",
    riskScore: 74,
    dataTx: "128.5 MB",
    status: "PENDING",
    timestamp: "2 mins ago",
    threatType: "Parsing spreadsheet tables without OAuth tokens approval",
    userEmail: "analyst_growth_6@corporation.com"
  },
  {
    id: "EP-109",
    name: "Local PDF AI Summarization Converter",
    host: "sandbox-pdf-analyser.net",
    category: "Shadow File Converter",
    riskScore: 92,
    dataTx: "812.0 MB",
    status: "BLOCKED",
    timestamp: "10 mins ago",
    threatType: "SOC2 non-compliant server caching medical customer documents",
    userEmail: "customer_billing@corporation.com"
  },
  {
    id: "EP-702",
    name: "Gemini Authorized Corporate Portal",
    host: "gemini-secure.sentric.net",
    category: "Sanctioned SSO Portal",
    riskScore: 5,
    dataTx: "1,450.9 MB",
    status: "ALLOWED",
    timestamp: "Active",
    threatType: "None - Complies fully with corporate security policy guidelines",
    userEmail: "all_staff_access@corporation.com"
  },
  {
    id: "EP-551",
    name: "Claude Team Developer Hub",
    host: "api.anthropic-proxy.cloud",
    category: "Shadow LLM Gateway",
    riskScore: 61,
    dataTx: "94.6 MB",
    status: "PENDING",
    timestamp: "1 hr ago",
    threatType: "Bypassing corporate proxy logging with personal credentials",
    userEmail: "external_contractor@corporation.com"
  }
];

export default function LinkScannerWidget() {
  const [endpoints, setEndpoints] = useState<ScannedEndpoint[]>(INITIAL_ENDPOINTS);
  const [isScanningGlobal, setIsScanningGlobal] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);
  const [scanMessage, setScanMessage] = useState("System Idle. Ready for link sweep.");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleScanGlobal = () => {
    if (isScanningGlobal) return;
    setIsScanningGlobal(true);
    setScanProgress(0);
    setScanMessage("Starting network interface link audit...");
    triggerToast("Initiating live endpoint scan sweep across all nodes...");

    // Put all non-blocked, non-allowed to SCANNING
    setEndpoints(prev => prev.map(ep => {
      if (ep.status === "PENDING" || ep.status === "WARNING") {
        return { ...ep, status: "SCANNING" };
      }
      return ep;
    }));

    const interval = setInterval(() => {
      setScanProgress(p => {
        const next = p + 8;
        if (next >= 100) {
          clearInterval(interval);
          setIsScanningGlobal(false);
          setScanProgress(100);
          setScanMessage("Network link sweep successfully finished!");
          triggerToast("Global scan completed. Review recommended actions below.");
          
          // Complete the statuses appropriately
          setEndpoints(prev => prev.map(ep => {
            if (ep.status === "SCANNING") {
              const finalStatus = ep.riskScore >= 75 ? "WARNING" : "ALLOWED";
              if (ep.riskScore >= 75) {
                playBreachAlarm();
              }
              // High risk scores default to WARNING state for review
              return { 
                ...ep, 
                status: finalStatus,
                timestamp: "Scanned just now"
              };
            }
            return ep;
          }));
          return 100;
        }
        
        if (next === 24) {
          setScanMessage("Auditing DNS route matrices...");
          playLatencyAlarm();
        }
        if (next === 56) {
          setScanMessage("Analyzing semantic payload risks...");
          playLatencyAlarm();
        }
        if (next === 80) {
          setScanMessage("Validating TLS and SOC2 attributes...");
          playLatencyAlarm();
        }
        
        return next;
      });
    }, 150);
  };

  const scanIndividualId = (id: string, name: string) => {
    setEndpoints(prev => prev.map(ep => {
      if (ep.id === id) {
        triggerToast(`Quick inspecting endpoint connection to: ${name}`);
        playLatencyAlarm();
        return { ...ep, status: "SCANNING" };
      }
      return ep;
    }));

    setTimeout(() => {
      setEndpoints(prev => prev.map(ep => {
        if (ep.id === id) {
          const updatedStatus = ep.riskScore >= 75 ? "WARNING" : "ALLOWED";
          if (ep.riskScore >= 75) {
            playBreachAlarm();
          } else {
            playLatencyAlarm();
          }
          triggerToast(`Inspection complete for ${name}: Status set to [${updatedStatus}]`);
          return { ...ep, status: updatedStatus, timestamp: "Inspected just now" };
        }
        return ep;
      }));
    }, 1200);
  };

  const updateStatus = (id: string, name: string, nextStatus: "ALLOWED" | "BLOCKED") => {
    setEndpoints(prev => prev.map(ep => {
      if (ep.id === id) {
        if (nextStatus === "BLOCKED") {
          playBreachAlarm();
        } else {
          playLatencyAlarm();
        }
        triggerToast(`Rule updated: Connection to ${name} is now [${nextStatus}]!`);
        return { ...ep, status: nextStatus };
      }
      return ep;
    }));
  };

  const filteredEndpoints = endpoints.filter(ep => {
    const matchesSearch = ep.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ep.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ep.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "ALL") return matchesSearch;
    return matchesSearch && ep.status === filterStatus;
  });

  return (
    <div className="bg-[#0C0C0E] border border-white/5 rounded-xl p-5 relative overflow-hidden shadow-2xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 bg-[#121214] border border-indigo-500/40 text-indigo-100 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fadeIn">
          <Activity className="h-4.5 w-4.5 text-indigo-400 animate-spin" />
          <span className="font-mono text-xs">{toast}</span>
        </div>
      )}

      {/* Header with real-time indicators */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-[10px] font-mono tracking-wider text-indigo-400 uppercase font-semibold">Active Traffic link sentinel</span>
          </div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-indigo-400" />
            Sentric Live Network Link Security Scanner
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-normal">
            Intercept and govern unvetted cloud API endpoints in one-click. Automatically scans background connections, highlighting blocked anomalies.
          </p>
        </div>

        {/* Global trigger buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleScanGlobal}
            disabled={isScanningGlobal}
            className={`px-4 py-2 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              isScanningGlobal 
                ? "bg-indigo-950 border border-indigo-900/50 text-indigo-400"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/20"
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanningGlobal ? "animate-spin" : ""}`} />
            {isScanningGlobal ? "Executing Link Sweep..." : "SYSTEM SCAN"}
          </button>
        </div>
      </div>

      {/* Scanning progress bar if active */}
      {isScanningGlobal && (
        <div className="mt-4 p-3 bg-[#121214] border border-white/5 rounded-lg space-y-2 animate-pulse">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400">{scanMessage}</span>
            <span className="text-indigo-400 font-bold">{scanProgress}%</span>
          </div>
          <div className="w-full bg-[#09090B] h-2 rounded overflow-hidden">
            <div 
              className="bg-indigo-500 h-full transition-all duration-150"
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Embedded Live Scanner Controller Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        <div className="bg-[#121214] border border-white/5 p-3.5 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Scanned Connections</span>
            <div className="text-lg font-bold text-white mt-0.5 font-mono">
              {endpoints.length} active links
            </div>
          </div>
          <Globe className="h-5 w-5 text-indigo-400" />
        </div>

        <div className="bg-[#121214] border border-white/5 p-3.5 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Total Blocked Links</span>
            <div className="text-lg font-bold text-rose-500 mt-0.5 font-mono">
              {endpoints.filter(e => e.status === "BLOCKED").length} blocked
            </div>
          </div>
          <Ban className="h-5 w-5 text-rose-500" />
        </div>

        <div className="bg-[#121214] border border-white/5 p-3.5 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Permitted Direct / SSO Links</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">
              {endpoints.filter(e => e.status === "ALLOWED").length} allowed
            </div>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
        </div>
      </div>

      {/* Filter and Search Bar for endpoints */}
      <div className="flex flex-col sm:flex-row gap-2 mt-5 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search API endpoints or logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121214] border border-white/5 text-xs text-white pl-9 pr-3 py-1.5 rounded outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-[#09090B] rounded border border-white/5">
          {["ALL", "PENDING", "WARNING", "ALLOWED", "BLOCKED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded text-[9px] font-mono whitespace-nowrap transition cursor-pointer ${
                filterStatus === st 
                  ? "bg-slate-800 text-indigo-400 border border-white/5" 
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoint Connection table list */}
      <div className="border border-white/5 rounded overflow-hidden mt-4 bg-[#09090B]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#121214] text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Identity / Link Source</th>
                <th className="py-2.5 px-3">Endpoint Target Host</th>
                <th className="py-2.5 px-3 text-center">Threat Level</th>
                <th className="py-2.5 px-3 text-center">Connection State</th>
                <th className="py-2.5 px-3 text-right">Interactive Guard Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px] font-sans">
              {filteredEndpoints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 font-mono">
                    No matching network links currently listed.
                  </td>
                </tr>
              ) : (
                filteredEndpoints.map((ep) => {
                  const isSevere = ep.riskScore >= 75;
                  const isBlocked = ep.status === "BLOCKED";
                  const isAllowed = ep.status === "ALLOWED";
                  const isScanning = ep.status === "SCANNING";
                  const isWarning = ep.status === "WARNING";

                  return (
                    <tr key={ep.id} className="hover:bg-[#121214]/50 transition-all">
                      <td className="py-3 px-3">
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5 uppercase font-mono text-[10px]">
                            {ep.name}
                            <span className="text-[9px] text-slate-500">[{ep.id}]</span>
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                            Last accessed by <strong>{ep.userEmail}</strong> • {ep.timestamp}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                        {ep.host}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className={`font-mono text-[10px] font-bold ${
                            isBlocked ? "text-slate-500" :
                            isSevere ? "text-rose-400" : "text-emerald-400"
                          }`}>
                            {ep.riskScore}/100 Risk
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono border ${
                          isBlocked ? "bg-rose-950/20 text-rose-400 border-rose-900/30" : 
                          isAllowed ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30" : 
                          isScanning ? "bg-indigo-950/30 text-indigo-400 border-indigo-900/30 animate-pulse" :
                          isWarning ? "bg-amber-950/20 text-amber-400 border-amber-900/35" :
                          "bg-slate-900 text-slate-500 border-white/5"
                        }`}>
                          {ep.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Easy interactive Scan / Block / Allow buttons */}
                          <button
                            onClick={() => scanIndividualId(ep.id, ep.name)}
                            disabled={isScanning || isScanningGlobal}
                            className="px-2 py-1 bg-[#121214] hover:bg-slate-800 text-[9px] rounded font-mono border border-white/5 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Inspect connection"
                          >
                            SCAN LINK
                          </button>

                          <button
                            onClick={() => updateStatus(ep.id, ep.name, "ALLOWED")}
                            disabled={isScanning}
                            className={`px-2 py-1 rounded text-[9px] font-mono font-bold border transition cursor-pointer ${
                              isAllowed 
                                ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400" 
                                : "bg-transparent border-white/5 text-slate-550 hover:bg-emerald-950/20 hover:text-emerald-400 hover:border-emerald-500/25"
                            }`}
                          >
                            ALLOW
                          </button>

                          <button
                            onClick={() => updateStatus(ep.id, ep.name, "BLOCKED")}
                            disabled={isScanning}
                            className={`px-2 py-1 rounded text-[9px] font-mono font-bold border transition cursor-pointer ${
                              isBlocked 
                                ? "bg-rose-500/15 border-rose-500/30 text-rose-400" 
                                : "bg-transparent border-white/5 text-slate-550 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-500/25"
                            }`}
                          >
                            BLOCK
                          </button>
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

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row  justify-between items-start sm:items-center text-[10px] font-mono text-slate-500 gap-2">
        <span className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          Real-time network security parameters synchronizing with SOC2 proxies
        </span>
        <span className="text-emerald-500 font-bold flex items-center gap-1 animate-pulse">
          <Wifi className="h-3.5 w-3.5" />
          GATEWAY SECURE ACTIVE
        </span>
      </div>
    </div>
  );
}
