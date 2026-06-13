/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Lock, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LockOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onRedirectToBilling: () => void;
  featureName: string;
  requiredPlan: "Professional" | "Enterprise";
  benefits: string[];
}

export default function LockOverlay({
  isOpen,
  onClose,
  onRedirectToBilling,
  featureName,
  requiredPlan,
  benefits
}: LockOverlayProps) {
  if (!isOpen) return null;

  const planColor = requiredPlan === "Enterprise" ? "text-purple-400 border-purple-500/20 bg-purple-950/20" : "text-indigo-400 border-indigo-505/20 bg-indigo-950/20";
  const buttonGradient = requiredPlan === "Enterprise" ? "from-purple-600 to-indigo-600" : "from-indigo-600 to-indigo-500";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden z-10"
        >
          {/* Subtle glowing orb in background */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-indigo-400 relative">
              <Lock className="h-5 w-5" />
              <div className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-indigo-500 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950">
                !
              </div>
            </div>

            <div className="space-y-1">
              <span className={`inline-block px-2.5 py-0.5 text-[9px] font-mono font-bold border rounded uppercase ${planColor}`}>
                Requires {requiredPlan} Plan
              </span>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mt-2">
                🔒 {featureName} is Gated
              </h3>
              <p className="text-xs text-slate-400 max-w-xs leading-normal">
                Upgrade your coverage tier to activate continuous sync, decrypt advanced telemetry and audit metrics.
              </p>
            </div>

            {/* Benefit bullet list */}
            <div className="w-full text-left bg-slate-950/60 border border-slate-850/50 rounded-xl p-4 space-y-2.5 font-sans">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                PROVEN SYSTEM ADVANTAGES
              </span>
              <ul className="space-y-2 text-xs text-slate-350">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col w-full gap-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onRedirectToBilling();
                }}
                className={`w-full py-2.5 bg-gradient-to-r ${buttonGradient} hover:opacity-95 text-white font-mono font-bold text-[11px] uppercase rounded-xl transition duration-200 cursor-pointer shadow-lg flex items-center justify-center gap-1.5`}
              >
                <span>Instant One-Click Upgrade</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-400 rounded-xl text-[10px] font-mono uppercase transition cursor-pointer"
              >
                Dismiss Prompt
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
