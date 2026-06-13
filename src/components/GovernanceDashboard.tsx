/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { INITIAL_GOVERNANCE_POLICIES } from "../data";
import { GovernancePolicy } from "../types";
import { 
  Plus, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  ShieldAlert, 
  FileText, 
  Scale, 
  CheckCircle2, 
  Filter,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
  Speaker
} from "lucide-react";
import { playBreachAlarm, playLatencyAlarm } from "../utils/audioNotification";

export default function GovernanceDashboard() {
  const [policies, setPolicies] = useState<GovernancePolicy[]>(INITIAL_GOVERNANCE_POLICIES);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleDesc, setNewRuleDesc] = useState("");
  const [newRuleCategory, setNewRuleCategory] = useState<GovernancePolicy["category"]>("PII");
  const [newRuleAction, setNewRuleAction] = useState<GovernancePolicy["action"]>("BLOCK");
  const [newRuleScope, setNewRuleScope] = useState<GovernancePolicy["scope"]>("All Tools");
  const [toast, setToast] = useState<string | null>(null);

  const [breachAudio, setBreachAudio] = useState(() => {
    return localStorage.getItem("sentric_notify_security_breach") === "true";
  });
  const [latencyAudio, setLatencyAudio] = useState(() => {
    return localStorage.getItem("sentric_notify_high_latency") === "true";
  });

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const toggleBreachAudio = () => {
    const nextState = !breachAudio;
    setBreachAudio(nextState);
    localStorage.setItem("sentric_notify_security_breach", nextState ? "true" : "false");
    triggerToast(`Audio security breach alarms set to [${nextState ? "ENABLED" : "DISABLED"}]`);
    if (nextState) {
      setTimeout(() => {
        playBreachAlarm();
      }, 100);
    }
  };

  const toggleLatencyAudio = () => {
    const nextState = !latencyAudio;
    setLatencyAudio(nextState);
    localStorage.setItem("sentric_notify_high_latency", nextState ? "true" : "false");
    triggerToast(`Audio latency threshold alarms set to [${nextState ? "ENABLED" : "DISABLED"}]`);
    if (nextState) {
      setTimeout(() => {
        playLatencyAlarm();
      }, 100);
    }
  };

  const handleTogglePolicy = (id: string, name: string, currentState: boolean) => {
    setPolicies(prev => prev.map(policy => {
      if (policy.id === id) {
        triggerToast(`Policy '${name}' is now [${!currentState ? "ACTIVE" : "INACTIVE"}]`);
        return { ...policy, isActive: !currentState };
      }
      return policy;
    }));
  };

  const handleDeletePolicy = (id: string, name: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
    triggerToast(`Removed policy rule: '${name}'`);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRuleDesc.trim()) return;

    const newRule: GovernancePolicy = {
      id: `POL-${Math.floor(Math.random() * 900) + 10}`,
      name: newRuleName,
      description: newRuleDesc,
      scope: newRuleScope,
      action: newRuleAction,
      isActive: true,
      category: newRuleCategory
    };

    setPolicies(prev => [...prev, newRule]);
    triggerToast(`Added new enterprise directive: '${newRuleName}' successfully!`);
    
    // Clear inputs
    setNewRuleName("");
    setNewRuleDesc("");
  };

  // Compliance coverage index calculations
  const activeCount = policies.filter(p => p.isActive).length;
  const coverageRatio = Math.round((activeCount / policies.length) * 100);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 border border-teal-500/40 text-teal-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <ShieldAlert className="h-5 w-5 text-teal-400" />
          <span className="font-mono text-xs">{toast}</span>
        </div>
      )}

      {/* Intro Panel */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">The Judge</span>
              <h2 className="text-xl font-bold tracking-tight text-white">AI Governance Center</h2>
            </div>
            <p className="text-xs text-slate-400">Establish and distribute real-time semantic access control policies mapped to standard compliance regulations.</p>
          </div>
        </div>

        {/* Aggregations */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-950/60 border border-slate-805 rounded-xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Total Active Policies</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{activeCount} / {policies.length}</span>
              <span className="text-[10px] text-teal-400 font-mono">Enforced inline</span>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-805 rounded-xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Audit Coverage Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-purple-400">{coverageRatio}%</span>
              <span className="text-[10px] text-indigo-400 font-mono">Secured</span>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-805 rounded-xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Regulated Framework Mapping</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">4 Frameworks</span>
              <span className="text-[10px] text-teal-400 font-mono">SOC2, HIPAA, PCI, GDPR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Policy Builder and Active Directives List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active Directives Matrix */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Active Enterprise Directives</h3>
              <span className="text-[10px] text-slate-500 font-mono">Toggle live execution parameters</span>
            </div>

            <div className="space-y-3.5">
              {policies.map((policy) => {
                const badgeColor = 
                  policy.action === "BLOCK" ? "bg-rose-950/20 text-rose-400 border-rose-900/30" :
                  policy.action === "REDACT" ? "bg-cyan-950/20 text-cyan-400 border-cyan-900/30" :
                  policy.action === "ALERT" ? "bg-amber-950/20 text-amber-400 border-amber-900/30" :
                  "bg-slate-800 text-slate-300 border-slate-700";

                return (
                  <div 
                    key={policy.id} 
                    className={`bg-slate-950 border rounded-xl p-4 flex justify-between gap-4 transition ${
                      policy.isActive ? "border-slate-850 bg-slate-950/80" : "border-slate-900 opacity-50"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-mono font-bold text-slate-500">{policy.id}</span>
                        <h4 className="text-xs font-bold text-white font-sans">{policy.name}</h4>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-mono border ${badgeColor}`}>
                          {policy.action}
                        </span>
                        <span className="text-[9px] font-mono text-slate-550 border border-slate-850 px-1 py-0.5 rounded">
                          {policy.scope}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{policy.description}</p>
                    </div>

                    <div className="flex flex-col justify-between items-end">
                      <button
                        onClick={() => handleTogglePolicy(policy.id, policy.name, policy.isActive)}
                        className="text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        {policy.isActive ? (
                          <ToggleRight className="h-6 w-6 text-emerald-400 fill-emerald-950/30" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-slate-650" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeletePolicy(policy.id, policy.name)}
                        className="text-slate-600 hover:text-rose-400 transition hover:bg-rose-950/10 p-1 rounded-md"
                        title="Delete directive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Policy Rule Builder Form */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Auditory Alarm Controls Settings Card */}
          <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none"></div>
            
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Speaker className="h-4.5 w-4.5 text-emerald-400" />
              Auditory Telemetry Controls
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 font-sans leading-relaxed">
              Broadcast synthesised audio cues directly to active operators when threat metrics slide outside security SLA limits.
            </p>

            <div className="space-y-4">
              
              {/* Breach Alerts Sound Setting Toggle */}
              <div className="p-3 bg-[#121214] border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5 text-rose-400" />
                    Breach Alarms
                  </span>
                  <button
                    onClick={toggleBreachAudio}
                    className="text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {breachAudio ? (
                      <ToggleRight className="h-6 w-6 text-emerald-400 fill-emerald-950/30" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-slate-650" />
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 font-sans leading-normal">
                  Play saw-tooth warning sirens when critical security breaches or access policy revocations occur.
                </p>
                <div className="pt-2 border-t border-white/5 flex justify-end">
                  <button
                    onClick={playBreachAlarm}
                    disabled={!breachAudio}
                    className={`px-2.5 py-1 rounded text-[8px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                      breachAudio 
                        ? "bg-[#1d1d21] text-rose-400 hover:bg-slate-800" 
                        : "text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Volume2 className="h-2.5 w-2.5" />
                    TEST SIREN
                  </button>
                </div>
              </div>

              {/* Latency Alerts Sound Setting Toggle */}
              <div className="p-3 bg-[#121214] border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                    Latency Alarms
                  </span>
                  <button
                    onClick={toggleLatencyAudio}
                    className="text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {latencyAudio ? (
                      <ToggleRight className="h-6 w-6 text-emerald-400 fill-emerald-950/30" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-slate-650" />
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 font-sans leading-normal">
                  Chirp high-frequency warning pings when nodes report transmit times above 50ms.
                </p>
                <div className="pt-2 border-t border-white/5 flex justify-end">
                  <button
                    onClick={playLatencyAlarm}
                    disabled={!latencyAudio}
                    className={`px-2.5 py-1 rounded text-[8px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                      latencyAudio 
                        ? "bg-[#1d1d21] text-amber-400 hover:bg-slate-800" 
                        : "text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Volume2 className="h-2.5 w-2.5" />
                    TEST CHIRP
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl relative">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-indigo-400" />
              Configure Custom Rule
            </h3>

            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-sans">
              Compile a customized compliance rule and push it to production inline proxy gateways instantly.
            </p>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Rule Identifier Header</label>
                <input
                  type="text"
                  placeholder="e.g. Encrypt Proprietary Algorithm code"
                  required
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-white placeholder-slate-600 outline-none w-full"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Directive Details / Regex description</label>
                <textarea
                  placeholder="e.g. Redacts custom API header codes matching engineering keys..."
                  required
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-white placeholder-slate-600 outline-none w-full h-20 resize-none font-sans"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Policy Scope</label>
                  <select
                    value={newRuleScope}
                    onChange={(e) => setNewRuleScope(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-[11px] py-1.5 px-2 rounded-lg text-slate-300 outline-none w-full font-mono"
                  >
                    <option>All Tools</option>
                    <option>Shadow AI Only</option>
                    <option>Enterprise Models Only</option>
                    <option>Autonomous Agents</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Target Action</label>
                  <select
                    value={newRuleAction}
                    onChange={(e) => setNewRuleAction(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-[11px] py-1.5 px-2 rounded-lg text-slate-300 outline-none w-full font-mono"
                  >
                    <option>BLOCK</option>
                    <option>REDACT</option>
                    <option>ALERT</option>
                    <option>ALLOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Rule Category</label>
                <select
                  value={newRuleCategory}
                  onChange={(e) => setNewRuleCategory(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-[11px] py-1.5 px-2 rounded-lg text-slate-300 outline-none w-full font-mono"
                >
                  <option>PII</option>
                  <option>Security Attack</option>
                  <option>Financial Limit</option>
                  <option>Shadow AI Routing</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white rounded-xl text-xs font-mono font-medium transition active:scale-95"
              >
                Install Production Rule
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Compliance Framework Mapping Audits */}
      <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-2xl">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center gap-1.5">
          <Scale className="h-4.5 w-4.5 text-indigo-400" />
          Regulatory Compliance Mapping Audit
        </h3>
        <p className="text-xs text-slate-450 leading-relaxed max-w-3xl mb-4 font-sans">
          Sentric continuously translates your inline prompt directives into audit trail templates matching global data storage, payment system, and healthcare protection legislative mandates automatically.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 flex items-start gap-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 mt-0.5" />
            <div>
              <span className="text-xs text-white font-bold block">GDPR Compliance</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">SSNs, phone numbers, and location telemetry fully masked in 100% of transit loops.</p>
            </div>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 flex items-start gap-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 mt-0.5" />
            <div>
              <span className="text-xs text-white font-bold block">HIPAA Privacy Rule</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">Medical record numbers and patient names redacted before reaching OpenAI.</p>
            </div>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 flex items-start gap-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 mt-0.5" />
            <div>
              <span className="text-xs text-white font-bold block">PCI DSS 4.0</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">Raw primary account numbers parsed, redacted, and logged as blocked alerts.</p>
            </div>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 flex items-start gap-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 mt-0.5" />
            <div>
              <span className="text-xs text-white font-bold block">SOC 2 Type II Trace</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">Retrieves daily DNS & gateway requests logs into a single secure audit registry.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
