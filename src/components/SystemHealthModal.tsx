import { useState, useEffect } from "react";
import { 
  X, 
  Activity, 
  Server, 
  Key, 
  RefreshCw, 
  Wifi, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Globe, 
  Sliders, 
  RotateCw,
  Cpu,
  Power,
  Layers,
  FileCheck
} from "lucide-react";
import { playBreachAlarm, playLatencyAlarm } from "../utils/audioNotification";

interface NodeStatus {
  id: string;
  name: string;
  region: string;
  latency: number;
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  weight: number;
}

interface ApiAuth {
  id: string;
  service: string;
  status: "VALIDATED" | "EXPIRING_SOON" | "REVOKED";
  expiresIn: string;
  lastUsed: string;
}

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SystemHealthModal({ isOpen, onClose }: SystemHealthModalProps) {
  const [nodes, setNodes] = useState<NodeStatus[]>([
    { id: "node-us-east", name: "Sentric Edge: Cloud Run US-East", region: "Iowa, USA", latency: 12, status: "ONLINE", weight: 35 },
    { id: "node-us-west", name: "Sentric Edge: Cloud Run US-West", region: "Oregon, USA", latency: 8, status: "ONLINE", weight: 40 },
    { id: "node-eu-west", name: "Sentric Edge: Frankfurt Node", region: "Frankfurt, DE", latency: 38, status: "ONLINE", weight: 15 },
    { id: "node-apac-sg", name: "Sentric Edge: Singapore Gateway", region: "Singapore, SG", latency: 82, status: "ONLINE", weight: 10 },
  ]);

  const [apiConnections, setApiConnections] = useState<ApiAuth[]>([
    { id: "api-gemini", service: "Google Gemini v1.5 / v2.0 API Key", status: "VALIDATED", expiresIn: "Infinite (Persistent)", lastUsed: "4 seconds ago" },
    { id: "api-soc2", service: "SOC2 Live Audit Compliant Logger Proxy", status: "VALIDATED", expiresIn: "24 hrs remaining", lastUsed: "Just now" },
    { id: "api-sentric", service: "Sentric Core Federated Identity Token", status: "VALIDATED", expiresIn: "11 hrs remaining", lastUsed: "12 seconds ago" }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"metrics" | "nodes" | "apis">("metrics");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Auto fluctuating metrics and latency
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => {
        if (n.status === "OFFLINE") return n;
        // Small fluctuation
        const change = Math.floor(Math.random() * 5) - 2;
        const nextLatency = Math.max(2, n.latency + change);
        return { ...n, latency: nextLatency };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Ping Nodes Diagnostic sweep
  const runDiagnostic = () => {
    setIsRefreshing(true);
    triggerToast("Initiating packet verification on global edge rings...");
    playLatencyAlarm();
    
    setTimeout(() => {
      setNodes(prev => prev.map(n => {
        if (n.status === "OFFLINE") return n;
        // Shift metrics
        const baseLatency = n.id === "node-us-west" ? 6 : n.id === "node-us-east" ? 11 : n.id === "node-eu-west" ? 22 : 74;
        const randomized = baseLatency + Math.floor(Math.random() * 4);
        
        if (randomized > 50) {
          playLatencyAlarm();
        }

        return {
          ...n,
          latency: randomized,
          status: randomized > 100 ? "DEGRADED" : "ONLINE"
        };
      }));
      setIsRefreshing(false);
      triggerToast("Telemetry diagnostic sweep completed!");
    }, 1500);
  };

  // Rotate credentials action
  const rotateCredentials = (id: string, serviceName: string) => {
    triggerToast(`Rotated Secure Token block for: ${serviceName}`);
    setApiConnections(prev => prev.map(api => {
      if (api.id === id) {
        return {
          ...api,
          lastUsed: "Just now",
          expiresIn: id === "api-gemini" ? "Infinite (Persistent)" : "24 hrs remaining (Rotated)"
        };
      }
      return api;
    }));
  };

  // Toggle active node status to test failover
  const toggleNodeState = (id: string) => {
    setNodes(prev => {
      const target = prev.find(n => n.id === id);
      if (!target) return prev;
      const willBeOffline = target.status !== "OFFLINE";
      
      triggerToast(
        willBeOffline 
          ? `Temporarily isolated ${target.name}. Traffic failing over...`
          : `Restored ${target.name} network interfaces into load balancer.`
      );

      if (willBeOffline) {
        playBreachAlarm();
      } else {
        playLatencyAlarm();
      }

      return prev.map(n => {
        if (n.id === id) {
          return {
            ...n,
            status: willBeOffline ? "OFFLINE" : "ONLINE",
            latency: willBeOffline ? 999 : 12,
            weight: willBeOffline ? 0 : 25
          };
        }
        return n;
      });
    });
  };

  // Calculate totals
  const activeCount = nodes.filter(n => n.status !== "OFFLINE").length;
  const avgLatency = Math.round(
    nodes.filter(n => n.status !== "OFFLINE").reduce((acc, current) => acc + current.latency, 0) / (activeCount || 1)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      {/* Toast Alert Inside Modal */}
      {successToast && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-55 bg-[#121214] border border-emerald-505/30 px-4 py-2.5 rounded shadow-xl text-xs font-mono text-emerald-400 flex items-center gap-2 animate-bounce">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-2xl bg-[#09090B] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#0C0C0E]">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-tight">Sentric System Health Desk</h3>
              <p className="text-[10px] text-slate-500 font-mono">SOC2 Compliant Gateway Telemetry Log</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-white/5 bg-[#0C0C0E]/50 px-5 gap-1">
          {[
            { id: "metrics", label: "REAL-TIME METRICS", icon: <Sliders className="h-3 w-3" /> },
            { id: "nodes", label: "ACTIVE PROXY NODES", icon: <Globe className="h-3 w-3" /> },
            { id: "apis", label: "API SECURITY AUTH", icon: <Key className="h-3 w-3" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 text-[10px] font-mono tracking-wider font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === tab.id 
                  ? "border-emerald-500 text-emerald-400" 
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Panel Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 max-h-[480px]">
          
          {activeTab === "metrics" && (
            <div className="space-y-4">
              
              {/* Three Stat Cards block */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#121214] border border-white/5 p-3 rounded text-left">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">NETWORK OVERHEAD</span>
                  <span className="text-xl font-mono font-bold text-white block mt-0.5">{avgLatency} ms</span>
                  <span className="text-[9px] font-mono text-emerald-400 mt-1 block">✔ Within SLA limits ({avgLatency < 20 ? "Perfect" : "Normal"})</span>
                </div>
                
                <div className="bg-[#121214] border border-white/5 p-3 rounded text-left">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">LOAD BALANCERS</span>
                  <span className="text-xl font-mono font-bold text-white block mt-0.5">{activeCount} / {nodes.length} Up</span>
                  <span className="text-[9px] font-mono text-indigo-400 mt-1 block">🌐 High Availability active</span>
                </div>

                <div className="bg-[#121214] border border-white/5 p-3 rounded text-left">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">API AUTH HEALTH</span>
                  <span className="text-xl font-mono font-bold text-emerald-400 block mt-0.5">100% Compliant</span>
                  <span className="text-[9px] font-mono text-slate-500 mt-1 block">🔐 SOC2 Proxies Active</span>
                </div>
              </div>

              {/* Graphical Latency Simulator Chart */}
              <div className="bg-[#121214]/60 border border-white/5 rounded p-4 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span className="uppercase font-semibold text-slate-550 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    Network Transmission Latency Simulation
                  </span>
                  <span className="text-slate-550">Buffer range: 5ms - 100ms</span>
                </div>

                <div className="h-24 flex items-end gap-1 px-2 border-b border-white/5 pt-4">
                  {/* Mimic small bar chart */}
                  {nodes.map((n, i) => {
                    const pct = Math.min(100, Math.max(8, (n.latency / 100) * 100));
                    return (
                      <div key={n.id} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        <div 
                          className={`w-full rounded-t transition-all duration-300 ${
                            n.status === "OFFLINE" ? "bg-rose-950/20 h-[5%]" :
                            n.latency > 50 ? "bg-amber-500/80 hover:bg-amber-400" : "bg-emerald-500/80 hover:bg-emerald-400"
                          }`}
                          style={{ height: `${n.status === "OFFLINE" ? 4 : pct}%` }}
                        ></div>
                        <span className="text-[8px] font-mono text-slate-500 mt-1">{n.id.replace("node-", "").toUpperCase()}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>🟢 USW (Lowest latency)</span>
                  <span>🟠 APACSG (Highest latency)</span>
                </div>
              </div>

              {/* Diagnostic Button */}
              <div className="flex justify-between items-center p-3 bg-[#121214] border border-white/5 rounded">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-white font-semibold">Ready for network ping tests</span>
                  <p className="text-[9px] text-slate-500">Triggers safe mock ICMP requests across edge networks to update load index metrics.</p>
                </div>
                <button
                  onClick={runDiagnostic}
                  disabled={isRefreshing}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono text-[10px] font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                  PING SWEEP
                </button>
              </div>

            </div>
          )}

          {activeTab === "nodes" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-450">
                <span>MANAGE ACTIVE LOGICAL GATEWAY NODES</span>
                <span>Click the power icon to test instant traffic failover routing</span>
              </div>

              <div className="space-y-2">
                {nodes.map(n => {
                  const isOffline = n.status === "OFFLINE";
                  const isDegraded = n.status === "DEGRADED";

                  return (
                    <div 
                      key={n.id} 
                      className={`p-3 border rounded flex items-center justify-between transition-colors ${
                        isOffline ? "border-rose-900/30 bg-rose-950/5 text-slate-500" : "border-white/5 bg-[#121214]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded flex items-center justify-center ${
                          isOffline ? "bg-rose-950/20 text-rose-500" : "bg-emerald-950/20 text-emerald-400"
                        }`}>
                          <Server className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                            {n.name}
                            <span className="text-[10px] text-slate-500">({n.region})</span>
                          </div>
                          <div className="text-[9px] font-mono text-slate-500 mt-1 flex items-center gap-2">
                            <span>Ping: <strong className={isOffline ? "text-rose-400" : "text-slate-350"}>{isOffline ? "Disconnected" : `${n.latency}ms`}</strong></span>
                            <span>•</span>
                            <span>Allocated Weight: <strong>{n.weight}%</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border ${
                          isOffline ? "bg-rose-950/20 text-rose-450 border-rose-900/30" : 
                          isDegraded ? "bg-amber-950/20 text-amber-400 border-amber-900/30" : 
                          "bg-emerald-950/20 text-emerald-400 border-emerald-900/30"
                        }`}>
                          {n.status}
                        </span>

                        <button
                          onClick={() => toggleNodeState(n.id)}
                          className={`p-1.5 rounded border transition-colors cursor-pointer ${
                            isOffline
                              ? "bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/35"
                              : "bg-transparent border-white/5 text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 hover:border-rose-500/25"
                          }`}
                          title={isOffline ? "Restore Node" : "Disconnect/Simulate Failover"}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "apis" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-450">
                <span>IDENTITY PROVIDER & API CREDENTIAL KEYS</span>
                <span>Audit security tokens used within the backends securely</span>
              </div>

              <div className="space-y-2.5">
                {apiConnections.map(api => (
                  <div key={api.id} className="p-3 border border-white/5 bg-[#121214] rounded space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <Key className="h-4 w-4 text-indigo-400 mt-0.5" />
                        <div>
                          <div className="text-xs font-mono font-bold text-white uppercase">{api.service}</div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">Last query authenticated: {api.lastUsed}</div>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 rounded text-[8px] font-mono font-bold">
                        {api.status}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[9px] font-mono">
                      <span className="text-slate-500">
                        Token Expiry: <strong className="text-slate-350">{api.expiresIn}</strong>
                      </span>
                      <button
                        onClick={() => rotateCredentials(api.id, api.service)}
                        className="px-2 py-1 bg-[#09090B] hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-white/10 transition flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCw className="h-2.5 w-2.5" />
                        ROTATE KEY
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer banner */}
        <div className="px-5 py-3.5 bg-[#0C0C0E] border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] font-mono text-slate-500 gap-2">
          <span className="flex items-center gap-1">
            <FileCheck className="h-3 w-3 text-slate-600" />
            Security posture certified fully complaint with SOC2 Typ-II metrics.
          </span>
          <span className="text-emerald-500 font-bold tracking-wider">
            ● SECURE OVERLAY INTERFACE ACTIVE
          </span>
        </div>

      </div>
    </div>
  );
}
