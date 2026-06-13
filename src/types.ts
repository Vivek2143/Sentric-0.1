/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PitchDeckSlide {
  id: number;
  title: string;
  story: string;
  headline: string;
  visualConcept: string;
  bulletPoints: string[];
  graphicStyle: "chart" | "comparison" | "threat-map" | "grid" | "architecture" | "logo-showcase" | "financials" | "timeline";
}

export interface ShadowAILog {
  id: string;
  appName: string;
  category: "Coding" | "Design" | "Writing" | "Analysis" | "Storage" | "AI Agent";
  discoverySource: "DNS Query" | "Proxy Stream" | "SAML / IAM" | "Endpoint Agent";
  riskScore: number;
  complianceLevel: "High" | "Medium" | "Low" | "Severe Risk";
  employeeCount: number;
  dataTransmittedMB: number;
  status: "Flagged" | "Approved" | "Blocked";
  lastActive: string;
}

export interface GuardAlert {
  id: string;
  timestamp: string;
  userEmail: string;
  targetModel: string;
  threatType: "Prompt Injection" | "Jailbreak" | "Sensitive Data Leak" | "IP Leak" | "Credentials Export";
  riskRating: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  originalPrompt: string;
  redactedPrompt: string;
  resolvedStatus: "Blocked" | "Audited" | "Allowed After Redaction";
}

export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  scope: "All Tools" | "Shadow AI Only" | "Enterprise Models Only" | "Autonomous Agents";
  action: "BLOCK" | "REDACT" | "ALERT" | "ALLOW";
  isActive: boolean;
  category: "PII" | "Security Attack" | "Financial Limit" | "Shadow AI Routing";
}

export interface FinOpsCostMetric {
  department: string;
  inputTokens: number;
  outputTokens: number;
  spentUSD: number;
  wasteUSD: number;
  redundantSubscriptions: number;
  agentId?: string;
}

export interface AutonomousAgentState {
  id: string;
  name: string;
  purpose: string;
  tokenConsumption: number;
  costUSD: number;
  uptimeHours: number;
  callCount: number;
  status: "Normal" | "Warning" | "Runaway" | "Stopped";
}

export interface CompetitorAnalysisRow {
  competitor: string;
  marketShareEst: string;
  strengths: string[];
  weaknesses: string[];
  sentricWinEdge: string;
  category: "Legacy Cybersecurity" | "AI Native Proxy" | "APM / Observability";
}

export interface VCInvestorEvaluation {
  scenario: "Bull Case" | "Bear Case";
  thesis: string;
  valuationProbability: string; // e.g. "15% Probability for $10B"
  points: string[];
}
