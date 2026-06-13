import React from "react";

interface SentricLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  withText?: boolean;
  withTagline?: boolean;
  center?: boolean;
  className?: string;
  theme?: "dark" | "light";
}

export default function SentricLogo({
  size = "md",
  withText = true,
  withTagline = false,
  center = false,
  className = "",
  theme = "dark"
}: SentricLogoProps) {
  // Dimensions helper
  const sizeMap = {
    xs: { icon: 20, font: "text-base", tracking: "tracking-wider", padding: "gap-1.5" },
    sm: { icon: 32, font: "text-lg", tracking: "tracking-widest", padding: "gap-2" },
    md: { icon: 48, font: "text-2xl", tracking: "tracking-widest", padding: "gap-2.5" },
    lg: { icon: 72, font: "text-3xl", tracking: "tracking-widest", padding: "gap-3" },
    xl: { icon: 110, font: "text-4xl", tracking: "tracking-widest-lg", padding: "gap-4" },
    xxl: { icon: 160, font: "text-5xl", tracking: "tracking-widest-xl", padding: "gap-6" }
  };

  const { icon: iconSize, font: fontSize, tracking: fontTracking, padding: gapSize } = sizeMap[size];

  // SVG representation of the elegant curving ribbon S logo
  const logoIcon = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="filter drop-shadow-[0_0_15px_rgba(59,130,246,0.25)] select-none"
    >
      <defs>
        {/* Glowing deep blue to vibrant cyan gradient (Main top rib) */}
        <linearGradient id="sentricBlueCyan" x1="10" y1="10" x2="110" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="60%" stopColor="#3182CE" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Vibrant cyan to bright emerald gradient (Main bottom rib) */}
        <linearGradient id="sentricCyanEmerald" x1="10" y1="110" x2="110" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="40%" stopColor="#059669" />
          <stop offset="70%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        <linearGradient id="innerLoopGrad" x1="20" y1="30" x2="100" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Shadow filter for 3D overlap effect */}
        <filter id="sentricShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* S Outer Flow Ribbon (Constructed as two intertwined infinity-curves wrapping) */}
      {/* Upper loop flowing down */}
      <path
        d="M 60 12 C 90 12, 108 34, 108 52 C 108 72, 85 85, 62 90 C 44 94, 26 98, 12 88 C 4 82, 4 64, 16 52 C 26 42, 40 45, 52 56 C 60 63, 68 76, 76 76 C 88 76, 92 64, 92 52 C 92 36, 76 26, 60 26 C 42 26, 28 38, 28 52 L 28 64 C 28 84, 48 108, 76 108"
        stroke="url(#innerLoopGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.25"
      />

      {/* First Ribbon Section: Upper Blue-Cyan Loop */}
      <path
        d="M 60 14 C 74 14, 106 20, 106 50 C 106 72, 75 88, 55 92 C 32 97, 14 78, 25 58 C 30 48, 44 46, 56 58 C 66 68, 72 78, 86 78 C 96 78, 94 62, 94 50 C 94 34, 78 28, 60 28 C 48 28, 38 34, 34 42"
        stroke="url(#sentricBlueCyan)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sentricShadow)"
      />

      {/* Second Ribbon Section: Lower Cyan-Emerald Interlocking Loop */}
      <path
        d="M 60 106 C 46 106, 14 100, 14 70 C 14 48, 45 32, 65 28 C 88 23, 106 42, 95 62 C 90 72, 76 74, 64 62 C 54 52, 48 42, 34 42 C 24 42, 26 58, 26 70 C 26 86, 42 92, 60 92 C 72 92, 82 86, 86 78"
        stroke="url(#sentricCyanEmerald)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Styled Brand identity text with custom Σ for E and a target dot for C
  const companyNameBlock = (
    <div className={`flex flex-col ${center ? "items-center text-center" : "items-start text-left"}`}>
      <div 
        className={`font-black tracking-widest flex items-center justify-center font-sans ${fontSize} ${
          theme === "light" ? "text-slate-900" : "text-white"
        }`}
      >
        <span className="font-sans">S</span>
        {/* Futuristic stylized Sigma Σ */}
        <span className="mx-0.5 font-sans text-indigo-500 font-extrabold select-none">Σ</span>
        <span className="font-sans">NTR</span>
        <span className="font-sans">I</span>
        {/* Target Reticle for C: concentric layout */}
        <span className="relative inline-flex items-center justify-center ml-0.5 select-none text-indigo-400">
          C
          <span className="absolute h-1.5 w-1.5 rounded-full bg-cyan-400 border border-slate-950 dark:border-white"></span>
        </span>
      </div>

      {withTagline && (
        <span 
          className={`font-mono font-bold tracking-wider uppercase text-[8px] sm:text-[10px] mt-1 lg:mt-1.5 ${
            theme === "light" ? "text-slate-500" : "text-slate-400 bg-clip-text text-transparent bg-gradient-to-r from-slate-400 via-indigo-400 to-cyan-400"
          }`}
        >
          See Everything. Secure Everything. Save Everything.
        </span>
      )}
    </div>
  );

  if (center) {
    return (
      <div className={`flex flex-col items-center justify-center ${gapSize} ${className}`}>
        {logoIcon}
        {withText && companyNameBlock}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${gapSize} ${className}`}>
      {logoIcon}
      {withText && companyNameBlock}
    </div>
  );
}
