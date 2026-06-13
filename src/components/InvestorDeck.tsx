/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { PITCH_DECK_SLIDES } from "../data";
import { PitchDeckSlide } from "../types";
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  Tv, 
  FileText, 
  Presentation, 
  Layers, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Sparkles,
  Info
} from "lucide-react";

export default function InvestorDeck() {
  const [slides] = useState<PitchDeckSlide[]>(PITCH_DECK_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"slideshow" | "grid">("slideshow");

  const currentSlide = slides[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const getGraphicStyleIcon = (style: string) => {
    switch (style) {
      case "chart": return <TrendingUp className="h-4.5 w-4.5 text-teal-400" />;
      case "financials": return <DollarSign className="h-4.5 w-4.5 text-emerald-400" />;
      case "architecture": return <Layers className="h-4.5 w-4.5 text-cyan-400" />;
      case "timeline": return <BookOpen className="h-4.5 w-4.5 text-indigo-400" />;
      default: return <Presentation className="h-4.5 w-4.5 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector view layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/40 p-5 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Presentation className="h-5 w-5 text-indigo-400" />
            Sentric Investor Pitch Deck
          </h2>
          <p className="text-xs text-slate-400">Boardroom-ready, investor-grade presentation details compiled across 25 dynamic slides.</p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-xl">
          <button
            onClick={() => setViewMode("slideshow")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "slideshow" ? "bg-slate-800 text-indigo-300 border border-slate-700" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <Tv className="h-3.5 w-3.5" />
            Slideshow
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "grid" ? "bg-slate-800 text-indigo-300 border border-slate-700" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            Slide Grid ({slides.length})
          </button>
        </div>
      </div>

      {viewMode === "slideshow" ? (
        /* Slideshow Player Mode */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left panel: Slides outline checklist */}
          <div className="lg:col-span-1 bg-slate-950/80 border border-slate-850 rounded-2xl p-4 overflow-y-auto max-h-[550px] scrollbar-thin">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-3 block border-b border-slate-900 pb-2">
              Slide index list
            </div>
            <div className="space-y-1">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center gap-2 border ${
                    currentIndex === idx 
                      ? "bg-indigo-950/20 border-indigo-900/40 text-indigo-300" 
                      : "bg-transparent border-transparent text-slate-450 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span className="text-[10px] opacity-70 w-5">{idx + 1}.</span>
                  <span className="truncate">{slide.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right panel: Active Slide Presentation Canvas */}
          <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl min-h-[440px] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
              
              {/* Star-like background effect for Cosmic aesthetic */}
              <div className="absolute right-0 bottom-0 w-80 h-80 bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none"></div>
              <div className="absolute left-1/4 top-1/4 w-40 h-40 bg-cyan-600/5 rounded-full filter blur-3xl pointer-events-none"></div>

              {/* Status Header */}
              <div className="flex justify-between items-center border-b border-slate-805 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                    Slide {currentSlide.id} of {slides.length}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
                    SENTRIC • SEED PITCH DECK
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {getGraphicStyleIcon(currentSlide.graphicStyle)}
                  <span className="text-[10px] font-mono text-slate-450 uppercase">{currentSlide.graphicStyle} Style</span>
                </div>
              </div>

              {/* Slide Core Content */}
              <div className="my-6 md:my-8 space-y-6">
                <div className="space-y-2">
                  <span className="text-indigo-400 font-mono text-xs uppercase tracking-wider block font-semibold">
                    {currentSlide.title.toUpperCase()}
                  </span>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight font-sans">
                    {currentSlide.headline}
                  </h1>
                </div>

                <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
                  {currentSlide.story}
                </p>

                {/* Bullet details */}
                <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">Core highlights & story outline</span>
                  <ul className="space-y-1.5">
                    {currentSlide.bulletPoints.map((bullet, idx) => (
                      <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-indigo-400 font-mono mt-0.5">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sugessted Visual Concept Footer */}
              <div className="bg-slate-950 border border-slate-850/60 p-3.5 rounded-xl text-[11px] flex gap-2.5 items-start">
                <Info className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="text-slate-305 font-mono text-[10px] uppercase tracking-wider block">Visual Stage Suggestion for Deck Designer</strong>
                  <p className="text-slate-450 leading-relaxed font-sans">{currentSlide.visualConcept}</p>
                </div>
              </div>

            </div>

            {/* Slide Navigation footer panel */}
            <div className="flex justify-between items-center bg-slate-950 border border-slate-850 p-4 rounded-xl">
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono transition flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev Slide
              </button>

              <div className="hidden md:flex gap-1">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentIndex === idx ? "w-6 bg-indigo-500" : "w-2 bg-slate-850 hover:bg-slate-700"
                    }`}
                  ></button>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono transition flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                Next Slide
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Slides Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              onClick={() => {
                setCurrentIndex(idx);
                setViewMode("slideshow");
              }}
              className="bg-slate-900/20 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl flex flex-col justify-between min-h-[220px] transition duration-200 cursor-pointer group active:scale-98 relative"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>SLIDE {slide.id}</span>
                  <span className="uppercase">{slide.graphicStyle}</span>
                </div>
                <h3 className="text-xs font-bold text-indigo-400 uppercase font-mono tracking-wider">{slide.title}</h3>
                <h4 className="text-sm font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors">{slide.headline}</h4>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 font-sans leading-relaxed">
                {slide.story}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Outline details</span>
                <span className="text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View full
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
