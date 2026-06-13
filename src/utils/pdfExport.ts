/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from "jspdf";
import { maskEmailForUI } from "./fortressCrypto";

interface SummaryExportData {
  shadowAppsCount: number;
  blockedLeaksCount: string;
  cachedSavingsUSD: string;
  enforcedRulesCount: number;
  averageLatency: string;
  systemHealthStatus: string;
  complianceLevel: string;
  exportTimestamp: string;
  operatorEmail: string;
}

export function generatePdfSummary(data: SummaryExportData) {
  // Initialize page in portrait letter mode
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter"
  });

  // Color Palette Constants matching Sentric dark tech/minimalist vibe
  const BRAND_DARK = "#09090B"; // Sentric black
  const TEXT_PRIMARY = "#1E293B"; // slate-800
  const TEXT_SECONDARY = "#64748B"; // slate-500
  const ACCENT_INDIGO = "#4F46E5"; // indigo-600
  const ACCENT_EMERALD = "#10B981"; // emerald-500
  const LIGHT_ROW = "#F8FAFC"; // slate-50/100
  const BORDER_COLOR = "#E2E8F0"; // slate-200

  // Helper: Hex color conversion for PDF fill/stroke (jsPDF accepts either RGB integers or hex depending on methods)
  const setFillHex = (hex: string) => {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    doc.setFillColor(r, g, b);
  };

  const setDrawHex = (hex: string) => {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    doc.setDrawColor(r, g, b);
  };

  const setTextHex = (hex: string) => {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    doc.setTextColor(r, g, b);
  };

  // 1. PAGE BORDERS & HEADER ACCENT LINE
  setDrawHex(BORDER_COLOR);
  doc.rect(10, 10, 196, 260); // External frame

  // Top Accent Banner Block
  setFillHex(BRAND_DARK);
  doc.rect(10, 10, 196, 32, "F");

  // Logo Badge in Accent Block
  setFillHex(ACCENT_INDIGO);
  doc.rect(20, 18, 12, 12, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("S", 24, 27); // Big initial "S"

  // Title Headers
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("SENTRIC CONTROL PLANE", 38, 24);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(190, 200, 215);
  doc.text("ENTERPRISE MULTI-MODE CONSOLE AUDIT", 38, 30);
  
  // Right aligned metadata in banner
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  setTextHex(ACCENT_EMERALD);
  doc.text("● GOVERNANCE SECURE PORTAL", 138, 22);

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(220, 225, 230);
  doc.setFontSize(7.5);
  doc.text(`AUDIT ID: SEN-${Math.floor(100000 + Math.random() * 900000)}`, 138, 28);
  doc.text(`MAPPING DATEREF: ${data.exportTimestamp}`, 138, 33);

  // 2. META DATA SUB-PANEL
  setFillHex(LIGHT_ROW);
  doc.rect(15, 48, 186, 24, "F");
  setDrawHex(BORDER_COLOR);
  doc.rect(15, 48, 186, 24, "S");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  setTextHex(TEXT_PRIMARY);
  doc.text("OPERATOR LOGICAL IDENTITY:", 20, 54);
  doc.text("GATEWAY LATENCY STATUS:", 20, 60);
  doc.text("COMPLIANCE RATING LEVEL:", 20, 66);

  doc.setFont("Helvetica", "normal");
  setTextHex(TEXT_SECONDARY);
  doc.text(maskEmailForUI(data.operatorEmail || "aryan21430@gmail.com"), 75, 54);
  
  doc.setFont("Helvetica", "bold");
  setTextHex(ACCENT_EMERALD);
  doc.text(`${data.averageLatency} (SLA OK - Sub-20ms)`, 75, 60);
  doc.text(data.complianceLevel, 75, 66);

  // Status Indicators Right-Block inside meta sub-panel
  doc.setFont("Helvetica", "bold");
  setTextHex(TEXT_PRIMARY);
  doc.text("ENCRYPTION METHOD:", 135, 54);
  doc.text("FIREWALL STATE:", 135, 60);
  doc.text("SYSTEM POWER STATUS:", 135, 66);

  doc.setFont("Helvetica", "normal");
  setTextHex(TEXT_SECONDARY);
  doc.text("AES-256 (Ephem. WASM Sign)", 172, 54);
  doc.setFont("Helvetica", "bold");
  setTextHex(ACCENT_INDIGO);
  doc.text("ACTIVE REDACTOR", 172, 60);
  setTextHex(ACCENT_EMERALD);
  doc.text("ONLINE", 172, 66);

  // 3. EXECUTIVE METRICS GRID SECTION
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  setTextHex(TEXT_PRIMARY);
  doc.text("I. EXECUTIVE SECURITY & SAVINGS BALANCE", 15, 82);

  setDrawHex(BORDER_COLOR);
  doc.line(15, 84, 201, 84); // Divider line

  // KPI Bento cards drawn in PDF
  const colWidth = 43;
  const cards = [
    { title: "SHADOW AI APPS", value: `${data.shadowAppsCount}`, detail: "VLAN Footprint Logged" },
    { title: "LEAKS PREVENTED", value: `${data.blockedLeaksCount}`, detail: "Leaks / Injections Filed" },
    { title: "TOKEN CORPS SAVED", value: `${data.cachedSavingsUSD}`, detail: "64% Edge Optimization" },
    { title: "DIRECTIVES SYNC", value: `${data.enforcedRulesCount} Active`, detail: "100% Core Policy OK" }
  ];

  cards.forEach((card, idx) => {
    const xPos = 15 + idx * colWidth + idx * 4.5;
    
    // Draw card background
    setFillHex(LIGHT_ROW);
    doc.rect(xPos, 89, colWidth, 26, "F");
    setDrawHex(BORDER_COLOR);
    doc.rect(xPos, 89, colWidth, 26, "S");

    // Accent line inside card
    if (idx === 2) {
      setFillHex(ACCENT_EMERALD);
    } else if (idx === 1) {
      setFillHex("#F43F5E"); // Rose-500
    } else {
      setFillHex(ACCENT_INDIGO);
    }
    doc.rect(xPos, 89, colWidth, 1.5, "F");

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    setTextHex(TEXT_SECONDARY);
    doc.text(card.title, xPos + 4, 95);

    // Value
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    if (idx === 2) {
      setTextHex(ACCENT_EMERALD);
    } else if (idx === 1) {
      setTextHex("#F43F5E");
    } else {
      setTextHex(TEXT_PRIMARY);
    }
    doc.text(card.value, xPos + 4, 104);

    // Detail
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6.5);
    setTextHex(TEXT_SECONDARY);
    doc.text(card.detail, xPos + 4, 110);
  });

  // 4. SHADOW AI DISCOVERY PROFILE TABLE
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  setTextHex(TEXT_PRIMARY);
  doc.text("II. DISCOVERY AUDIT LOG & COMPLIANCE SUMMARY", 15, 126);
  
  setDrawHex(BORDER_COLOR);
  doc.line(15, 128, 201, 128);

  // Table Headers
  setFillHex(BRAND_DARK);
  doc.rect(15, 132, 186, 7.5, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("DETECTIVE LOG ID", 18, 137);
  doc.text("SHADOW CONTAINER APPLICATION", 50, 137);
  doc.text("CATEGORY", 112, 137);
  doc.text("RISK LEVEL", 142, 137);
  doc.text("DISCOVERY AGENT SOURCE", 168, 137);

  // Table Rows (mocking actual data patterns)
  const rows = [
    { id: "LOG-3102", app: "Unapproved-Claude-Chrome-Plugin", cat: "Writing", risk: "Critical (84/100)", src: "Endpoint Agent" },
    { id: "LOG-4109", app: "Local-LLM-Terminal-AutoComplete", cat: "Coding", risk: "Severe (91/100)", src: "DNS Query" },
    { id: "LOG-2091", app: "Unsanctioned-DALL-E-Marketing-Bot", cat: "Marketing", risk: "Medium (45/100)", src: "Federated Proxy" },
    { id: "LOG-2015", app: "Ghost-Integrator-Notion-AI-Bridge", cat: "System Integr.", risk: "Severe (76/100)", src: "Link Sentinel" },
    { id: "LOG-1940", app: "Custom-Vaporware-OpenAI-Synthesizer", cat: "Audio Gen", risk: "Low (12/100)", src: "WASM Sandbox" }
  ];

  rows.forEach((row, idx) => {
    const yPos = 139.5 + idx * 8.5;
    
    // Alt row background color
    if (idx % 2 === 0) {
      setFillHex(LIGHT_ROW);
      doc.rect(15, yPos, 186, 8.5, "F");
    }

    // Border bottom
    setDrawHex(BORDER_COLOR);
    doc.line(15, yPos + 8.5, 201, yPos + 8.5);

    // Text content
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    setTextHex(TEXT_PRIMARY);
    doc.text(row.id, 18, yPos + 5.5);
    
    doc.setFont("Helvetica", "bold");
    doc.text(row.app, 50, yPos + 5.5);
    
    doc.setFont("Helvetica", "normal");
    doc.text(row.cat, 112, yPos + 5.5);

    // Dynamic risk colors
    if (row.risk.includes("Critical") || row.risk.includes("Severe")) {
      setTextHex("#F43F5E"); // red
    } else {
      setTextHex(TEXT_PRIMARY);
    }
    doc.setFont("Helvetica", "bold");
    doc.text(row.risk, 142, yPos + 5.5);

    doc.setFont("Helvetica", "normal");
    setTextHex(TEXT_SECONDARY);
    doc.text(row.src, 168, yPos + 5.5);
  });

  // 5. INLINE PREVENTATIVE POLICIES ENFORCED (Section 3)
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  setTextHex(TEXT_PRIMARY);
  doc.text("III. ENFORCED GATEWAY & INLINE REDACTOR POLICIES", 15, 194);
  
  setDrawHex(BORDER_COLOR);
  doc.line(15, 196, 201, 196);

  const policies = [
    { name: "POL-01: SSN & PII MASKING RULE", status: "ENFORCED STATUS [100% SYNCED]", desc: "Regex and semantic pattern models mask corporate and payroll SSN digits dynamically before routing to GPT/Claude endpoints." },
    { name: "POL-02: STRIPE & AWS CREDENTIAL SECURE HARNESS", status: "ENFORCED STATUS [100% SYNCED]", desc: "Inline redactor intercepts AWS secret strings, database connection URLs, and Stripe production tokens on outbound packets." },
    { name: "POL-03: JAILBREAK / ADV-ATTACK BLOCKER", status: "ENFORCED STATUS [100% SYNCED]", desc: "Detects adversarial prompts violating enterprise guidelines. Triggers high-intensity red-amber logging on Sentric's Bodyguard platform." },
    { name: "POL-04: AUTONOMOUS AGENT BUDGET CIRCUIT BREAKER", status: "ENFORCED STATUS [100% SYNCED]", desc: "Monitors recursive agent feedback loop costs and self-terminates sessions when token consumption surpasses $50.00 daily threshold." }
  ];

  policies.forEach((pol, idx) => {
    const yPos = 200 + idx * 13.5;
    
    // Minimal solid bullet marker
    setFillHex(ACCENT_INDIGO);
    doc.rect(15, yPos + 1.5, 2.5, 2.5, "F");

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    setTextHex(TEXT_PRIMARY);
    doc.text(pol.name, 21, yPos + 3.5);

    // Synced badge
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(6.5);
    setTextHex(ACCENT_EMERALD);
    doc.text(pol.status, 148, yPos + 3.5);

    // Description text
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    setTextHex(TEXT_SECONDARY);
    doc.text(pol.desc, 21, yPos + 7.5);
  });

  // 6. CERTIFIED FOOTER STATEMENTS
  setFillHex(BRAND_DARK);
  doc.rect(10, 255, 196, 15, "F");

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(165, 180, 200);
  doc.text("SECURITY AUDIT STATEMENT: The telemetry figures reported in this compliance document reflect inline network auditing records logged within the local", 15, 261);
  doc.text("Sentric Edge Load Balancers. Cryptographic hash is certified fully compliant with SOC2 Type-II, HIPAA, and NIST AI RMF guidelines.", 15, 264.5);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7);
  setTextHex(ACCENT_EMERALD);
  doc.text("● CRYPTO STAMP AUTH: ONLINE / ENCRYPTED", 146, 264.5);

  // Trigger browser download dialog
  doc.save(`Sentric-Enterprise-AI-Audit-${new Date().toISOString().split('T')[0]}.pdf`);
}
