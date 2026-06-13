/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { COMPETITORS, VC_EVALUATIONS, MARKET_SIZE_DATA } from "../data";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Building2, 
  TrendingUp, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle, 
  Calculator,
  ShieldCheck,
  Scale
} from "lucide-react";

export default function ExecutiveDashboard() {
  // Competitor state
  const [competitors] = useState(COMPETITORS);
  const [vcEvaluations] = useState(VC_EVALUATIONS);

  // ROI Calculator states
  const [employeeCount, setEmployeeCount] = useState<number>(500);
  const [promptsPerDay, setPromptsPerDay] = useState<number>(15);
  const [redundantSaaSCost, setRedundantSaaSCost] = useState<number>(35); // average seat price in dollars

  // ROI computations
  const averageTokensPerPrompt = 400;
  const tokenCostPerThousand = 0.015; // compound average cost across high-pro & cheap models
  
  const dailyPromptsVolume = employeeCount * promptsPerDay;
  const annualPromptsVolume = dailyPromptsVolume * 250; // working days
  const annualDirectTokenCosts = (annualPromptsVolume * averageTokensPerPrompt * tokenCostPerThousand) / 1000;
  
  const annualRedundantSaaSExpense = employeeCount * 0.22 * redundantSaaSCost * 12; // assumes 22% of workforce has redundant active personal sub seats
  const totalAnnualAISpendNoSentric = annualDirectTokenCosts + annualRedundantSaaSExpense;

  // Sentric savings
  const cachingSavings = annualDirectTokenCosts * 0.45; // 45% prompt caching savings
  const seatDeduplicationSavings = annualRedundantSaaSExpense * 0.85; // can cull 85% of redundant unvetted logins by merging 
  const totalProjectedSavings = cachingSavings + seatDeduplicationSavings;
  const sentricCostEst = Math.max(12000, employeeCount * 24); // estimated annual licensing cost
  const netROI = totalProjectedSavings - sentricCostEst;

  return (
    <div className="space-y-6">

      {/* Intro Header */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">The Board Room</span>
              <h2 className="text-xl font-bold tracking-tight text-white">Executive Strategy & Valuation Panel</h2>
            </div>
            <p className="text-xs text-slate-400">Boardroom-ready ROI math, comprehensive competitor alignment grids, and tier-1 Venture Capital defensibility scorecards.</p>
          </div>
        </div>
      </div>

      {/* Category 1: Interactive Corporate ROI Savings Calculator */}
      <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-1.5 mb-5 border-b border-slate-800/80 pb-3">
          <Calculator className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Corporate AI Savings & ROI Estimator</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form inputs */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Organization Scale inputs</span>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-350 block mb-1">Total Active Employees using generative AI</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="10000"
                    step="50"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(Number(e.target.value))}
                    className="flex-1 accent-indigo-500 bg-slate-900"
                  />
                  <span className="text-xs font-mono font-bold text-white w-14 text-right">{employeeCount}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-350 block mb-1">Average prompts per operator per work day</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2"
                    max="100"
                    step="1"
                    value={promptsPerDay}
                    onChange={(e) => setPromptsPerDay(Number(e.target.value))}
                    className="flex-1 accent-cyan-500 bg-slate-900"
                  />
                  <span className="text-xs font-mono font-bold text-white w-14 text-right">{promptsPerDay}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-350 block mb-1">Average unapproved monthly SaaS seat cost</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={redundantSaaSCost}
                    onChange={(e) => setRedundantSaaSCost(Number(e.target.value))}
                    className="flex-1 accent-teal-500 bg-slate-900"
                  />
                  <span className="text-xs font-mono font-bold text-white w-14 text-right">${redundantSaaSCost}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-sans block mt-1 block leading-normal">
                  (Estimated seat values of unvetted Copilots, Midjourney, Grammarly accounts etc.)
                </span>
              </div>
            </div>
          </div>

          {/* Calculator Math output cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-550 block">Current AI Spend footprint</span>
                <span className="text-xl font-bold text-slate-300 font-mono mt-1.5 block">${Math.round(totalAnnualAISpendNoSentric).toLocaleString()} / yr</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                Consists of ${Math.round(annualDirectTokenCosts).toLocaleString()} direct model API tokens and ${Math.round(annualRedundantSaaSExpense).toLocaleString()} in redundant unvetted monthly software seats.
              </p>
            </div>

            <div className="bg-emerald-950/15 border border-emerald-900/35 p-4 rounded-xl flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-450 block">Deduplicated Caching savings</span>
                <span className="text-xl font-bold text-emerald-400 font-mono mt-1.5 block">${Math.round(totalProjectedSavings).toLocaleString()} / yr</span>
              </div>
              <p className="text-[10px] text-emerald-500/80 leading-relaxed font-sans">
                Sentric caches identical prompt matrices (saves ${Math.round(cachingSavings).toLocaleString()}) and optimizes unused accounts (saves ${Math.round(seatDeduplicationSavings).toLocaleString()}).
              </p>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-550 block">Sentric licensing cost (Est)</span>
                <span className="text-xl font-bold text-white font-mono mt-1.5 block">${Math.round(sentricCostEst).toLocaleString()} / yr</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                Flat corporate gateway base fees combined with per-seat discovery scaling indices.
              </p>
            </div>

            <div className="bg-indigo-950/20 border border-indigo-900/50 p-4 rounded-xl flex flex-col justify-between min-h-[140px]">
              <div>
                <div className="flex gap-1 items-center">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-indigo-400 block font-semibold">Net corporate ROI savings</span>
                  <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
                </div>
                <span className={`text-xl font-bold font-mono mt-1.5 block ${netROI > 0 ? 'text-indigo-400' : 'text-slate-450'}`}>
                  {netROI > 0 ? `+$${Math.round(netROI).toLocaleString()}` : `$${Math.round(netROI).toLocaleString()}`} / yr
                </span>
              </div>
              <p className="text-[10px] text-indigo-300/80 leading-relaxed font-sans">
                {netROI > 0 
                  ? `An instant ${Math.round((totalProjectedSavings / sentricCostEst) * 100)}% ROI recovery rate. Discovers more redundant waste in Month 1 than entire annual cost.` 
                  : "Calculation complete. Increase employee scale sliders to observe compounding scale economies."}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Category 2: Competitor Matrix */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 bg-slate-950/40 border-b border-slate-805">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="h-4.5 w-4.5 text-indigo-400" />
            Competitive Matrix: Why Sentric Wins
          </h3>
          <p className="text-[10px] text-slate-500">Comparing prompt-level context auditing, inline enforcement capabilities, and AI FinOps integration across providers.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-805 bg-slate-950/40 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 font-normal">Competitor</th>
                <th className="py-3 px-4 font-normal">Category</th>
                <th className="py-3 px-4 font-normal">Estimated market lock</th>
                <th className="py-3 px-4 font-normal">Core Strengths</th>
                <th className="py-3 px-4 font-normal">Gaps & Failures</th>
                <th className="py-3 px-4 font-normal">The Sentric Win-Edge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-805/80 text-xs font-sans">
              {competitors.map((comp, idx) => (
                <tr key={idx} className="hover:bg-slate-950/20 transition-all select-none">
                  <td className="py-4 px-4 font-bold text-white">
                    {comp.competitor}
                  </td>
                  <td className="py-4 px-4 text-indigo-400 font-mono text-[10px]">
                    {comp.category}
                  </td>
                  <td className="py-4 px-4 text-slate-350 font-semibold font-mono text-[11px]">
                    {comp.marketShareEst}
                  </td>
                  <td className="py-4 px-4">
                    <ul className="list-disc list-inside space-y-1 text-slate-450 text-[11px] leading-relaxed max-w-xs">
                      {comp.strengths.slice(0, 2).map((str, sIdx) => (
                        <li key={sIdx} className="truncate">{str}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-4 px-4">
                    <ul className="list-none space-y-1 text-rose-400/90 text-[11px] leading-relaxed max-w-xs">
                      {comp.weaknesses.slice(0, 2).map((weak, wIdx) => (
                        <li key={wIdx} className="flex gap-1 items-start">
                          <AlertTriangle className="h-3 w-3 text-rose-400 mt-0.5 flex-shrink-0" />
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-4 px-4 bg-indigo-950/5 text-indigo-300 text-[11px] leading-normal font-sans font-medium max-w-[280px]">
                    {comp.sentricWinEdge}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category 3: Market Size & Projections & Traction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Market size stats */}
        <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-teal-400" />
              TAM / SAM / SOM Market Projections (By 2028)
            </h3>
            
            <div className="space-y-4 pt-1">
              {MARKET_SIZE_DATA.map((size, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="text-xs font-semibold text-slate-300">{size.name}</span>
                    <span className="text-sm font-bold text-teal-400">${size.value} Billion</span>
                  </div>
                  <p className="text-[11px] text-slate-550 leading-relaxed font-sans">{size.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/60 p-4.5 rounded-xl border border-slate-850 text-[11px] space-y-2 mt-4 font-sans leading-relaxed text-slate-400">
            <strong>The Adoption Catalyst:</strong> As EU AI Acts, HIPAA updates, and dynamic cybersecurity mandates kick off, secure inline prompt firewalls are shift-changing from unrequested nice-to-haves into direct, legally enforced enterprise liabilities.
          </div>
        </div>

        {/* Tier-1 VC Evaluations */}
        <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <Scale className="h-4.5 w-4.5 text-indigo-400" />
            Tier-1 VC Critique & Valuation Probability
          </h3>

          <div className="space-y-4">
            {vcEvaluations.map((evalCard, idx) => {
              const isBull = evalCard.scenario === "Bull Case";
              return (
                <div key={idx} className="bg-slate-950/70 border border-slate-850 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className={`text-[10px] uppercase font-mono font-bold ${isBull ? "text-emerald-400" : "text-rose-450"}`}>
                      {evalCard.scenario}
                    </span>
                    <span className="text-[10px] font-mono text-slate-450 font-semibold">{evalCard.valuationProbability}</span>
                  </div>
                  <strong>{evalCard.thesis}</strong>
                  <ul className="space-y-1.5 pt-1">
                    {evalCard.points.slice(0, 2).map((pt, pIdx) => (
                      <li key={pIdx} className="text-[11px] text-slate-450 leading-normal flex gap-1.5 items-start font-sans">
                        <span className="text-slate-500 font-mono mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
