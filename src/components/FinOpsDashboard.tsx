/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DEPT_FINOPS_METRICS, AUTONOMOUS_AGENTS } from "../data";
import { AutonomousAgentState, FinOpsCostMetric } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  BadgeDollarSign, 
  ShieldAlert, 
  Flame, 
  PowerOff, 
  Percent, 
  Cpu, 
  RefreshCw, 
  Wallet, 
  Sparkles,
  HelpCircle
} from "lucide-react";

export default function FinOpsDashboard() {
  const [agents, setAgents] = useState<AutonomousAgentState[]>(AUTONOMOUS_AGENTS);
  const [departments, setDepartments] = useState<FinOpsCostMetric[]>(DEPT_FINOPS_METRICS);
  const [maxSpendLimit, setMaxSpendLimit] = useState<number>(500);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleShutdownAgent = (id: string, agentName: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === id) {
        showToast(`CRITICAL: Triggered circuit breaker! Intercepted and terminated agent '${agentName}'.`);
        return { ...agent, status: "Stopped" as const };
      }
      return agent;
    }));
  };

  const handleUpdateLimit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Enterprise budget rule updated: Maximum daily employee spend capped at $${maxSpendLimit}`);
  };

  // Aggregated financials
  const totalSpent = departments.reduce((sum, current) => sum + current.spentUSD, 0);
  const totalWaste = departments.reduce((sum, current) => sum + current.wasteUSD, 0);
  const savedByCache = totalSpent * 0.42; // Simulated savings

  // Recharts departments spend data transform
  const chartData = departments.map(d => ({
    name: d.department.length > 15 ? d.department.substring(0, 15) + "..." : d.department,
    Spent: Math.round(d.spentUSD),
    Waste: Math.round(d.wasteUSD)
  }));

  // Recharts categorization breakdown pie chart
  const pieData = [
    { name: "Direct Token Cost", value: totalSpent - totalWaste, color: "#14b8a6" },
    { name: "SaaS Subscriptions", value: 8500, color: "#06b6d4" },
    { name: "Runaway / Loop Waste", value: totalWaste, color: "#f43f5e" }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notifier */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 border border-rose-500/40 text-rose-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <ShieldAlert className="h-5 w-5 text-rose-400" />
          <span className="font-mono text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Intro Header */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono bg-teal-500/10 text-teal-400 border border-teal-500/20">The Treasurer</span>
              <h2 className="text-xl font-bold tracking-tight text-white">AI FinOps Control Center</h2>
            </div>
            <p className="text-xs text-slate-400">Monitoring real-time token volume, cloud billing loops, duplicate seats, and active recursive autonomies.</p>
          </div>
          <button 
            onClick={() => showToast("Caching buffers flushing complete... Saved an estimated $340 in tokens.")}
            className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-mono transition flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4 text-teal-400" />
            Recycle Cached Buffers
          </button>
        </div>

        {/* Aggregated KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/60 border border-slate-805 rounded-xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Total Monthly Spent</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-white">${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              <span className="text-[10px] text-teal-400 font-mono">Consolidated</span>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-805 rounded-xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-550 tracking-wider">Estimated Waste Blocked</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-rose-500">${totalWaste.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              <span className="text-[10px] text-rose-400 font-mono">24.5% ratio</span>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-805 rounded-xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-550 tracking-wider">Saved Via Prompt Cache</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-teal-400">${savedByCache.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              <span className="text-[10px] text-slate-500 font-mono">60% hit rate</span>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-805 rounded-xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-550 tracking-wider">Redundant Subscriptions</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-yellow-500">56 seats</span>
              <span className="text-[10px] text-yellow-550 font-mono">Recommendation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Row: Recharts Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Recharts Bar Chart spend */}
        <div className="lg:col-span-8 bg-slate-900/30 border border-slate-855 rounded-2xl p-5 backdrop-blur-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">Departmental Spent Breakdown</h3>
              <p className="text-[11px] text-slate-500">Comparing useful tokens consumed VS billing waste from redundant tools or redundant calls.</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
              <BadgeDollarSign className="h-3.5 w-3.5 text-teal-400" />
              USD Metric
            </span>
          </div>

          <div className="h-64 mt-4 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#101c2c" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} style={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tickLine={false} style={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b1329", borderColor: "#1e293b", borderRadius: 12, color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar dataKey="Spent" name="Useful Spent" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Waste" name="Redundant Waste" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Recharts Pie Chart Category / Distribution */}
        <div className="lg:col-span-4 bg-slate-900/30 border border-slate-855 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Aggregated Asset Distribution</h3>
            <p className="text-[11px] text-slate-500">Distribution of company spend across AI channels.</p>
          </div>

          <div className="h-44 my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b1329", borderColor: "#1e293b", borderRadius: 12, color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">AI Cost</span>
              <span className="text-xl font-bold text-white mt-1 font-mono">${Math.round(totalSpent).toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {pieData.map((data, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }}></div>
                  <span className="text-slate-400">{data.name}</span>
                </div>
                <span className="text-white font-bold">${data.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Autonomous Agent Containment suite: Live circuit breaker! */}
      <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-rose-500" />
              Autonomous Agent Containment Suite
            </h3>
            <p className="text-xs text-slate-400">Detects and neutralizes runaway recursive loops (agents stuck in multi-call loops racks up thousands of dollars).</p>
          </div>
          <span className="text-rose-400 font-mono text-[10px] bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 animate-pulse" />
            1 Runaway Detected
          </span>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {agents.map((agent) => {
            const isRunaway = agent.status === "Runaway";
            const isWarning = agent.status === "Warning";
            const isStopped = agent.status === "Stopped";

            return (
              <div 
                key={agent.id} 
                className={`bg-slate-950 border rounded-xl p-4 flex flex-col justify-between transition ${
                  isRunaway ? "border-rose-500/40 shadow-lg shadow-rose-950/10" : 
                  isWarning ? "border-amber-500/30" : 
                  isStopped ? "border-slate-850 opacity-60" : "border-slate-850"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">{agent.id}</span>
                      <span className="text-sm font-bold text-white">{agent.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono leading-none border uppercase ${
                      isRunaway ? "bg-rose-950/20 text-rose-400 border-rose-900/30 animate-pulse" : 
                      isWarning ? "bg-amber-950/20 text-amber-400 border-amber-900/30" : 
                      isStopped ? "bg-slate-900 text-slate-400 border-slate-800" : 
                      "bg-emerald-950/15 text-emerald-400 border-emerald-900/30"
                    }`}>
                      {agent.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{agent.purpose}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-500">Spent Today</span>
                      <span className="text-xs font-semibold block text-slate-300 font-mono">${agent.costUSD.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-500">Triggers Count</span>
                      <span className="text-xs font-semibold block text-slate-300 font-mono">{agent.callCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-slate-500">{agent.uptimeHours} hrs uptime</span>
                  
                  {isStopped ? (
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 font-semibold">
                      Offline Secure
                    </span>
                  ) : (
                    <button
                      onClick={() => handleShutdownAgent(agent.id, agent.name)}
                      className={`p-1.5 rounded-lg border text-[10px] font-mono font-bold transition flex items-center gap-1 active:scale-95 cursor-pointer ${
                        isRunaway 
                          ? "bg-rose-950/40 border-rose-900/50 hover:bg-rose-900/30 text-rose-400/90" 
                          : "bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-400"
                      }`}
                    >
                      <PowerOff className="h-3 w-3" />
                      {isRunaway ? "KILL AGENT" : "Kill Feed"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FinOps dynamic threshold cap setter */}
      <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center gap-1.5">
          <BadgeDollarSign className="h-4.5 w-4.5 text-teal-400" />
          ACTIVE SPENDING CAP PROTECTION
        </h3>
        <form onSubmit={handleUpdateLimit} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-[11px] text-slate-450 block font-sans">
              Enter daily individual token trigger limit threshold. When an employee crossings this aggregate budget, automatic prompts get paused until authorized by department lead.
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 text-xs font-mono">$</span>
              <input
                type="number"
                value={maxSpendLimit}
                onChange={(e) => setMaxSpendLimit(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-1.5 text-xs text-white outline-none w-full font-mono max-w-[200px]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-mono font-medium transition active:scale-95"
          >
            Apply Spend Guardrails
          </button>
        </form>
      </div>
    </div>
  );
}
