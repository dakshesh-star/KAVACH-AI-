export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE";

export interface AnalysisResult {
  id: string;
  timestamp: string;
  riskScore: number;
  riskLevel: RiskLevel;
  verdict: string;
  scamType: string;
  confidence: number;
  scamAnatomy: string;
  psychTactics: PsychTactic[];
  redFlags: RedFlag[];
  intelligenceMap: IntelNode[];
  immediateActions: Action[];
  recoverySteps: RecoveryStep[];
  preventionInsights: string[];
  confidenceBreakdown: ConfidenceItem[];
  analysisMetadata: {
    processingTime: string;
    model: string;
    patternsMatched: number;
    databaseSize: string;
  };
}

export interface PsychTactic {
  name: string;
  description: string;
  severity: "high" | "medium" | "low";
  icon: string;
}

export interface RedFlag {
  flag: string;
  explanation: string;
  weight: number;
}

export interface IntelNode {
  id: string;
  label: string;
  type: "primary" | "secondary" | "warning";
  connections: string[];
  x: number;
  y: number;
}

export interface Action {
  priority: number;
  title: string;
  description: string;
  urgency: "immediate" | "today" | "this-week";
  icon: string;
}

export interface RecoveryStep {
  step: number;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
}

export interface ConfidenceItem {
  label: string;
  score: number;
  color: string;
}

export const mockAnalysisResult: AnalysisResult = {
  id: "kvch_20250530_001",
  timestamp: "2025-05-30T14:32:00Z",
  riskScore: 94,
  riskLevel: "CRITICAL",
  verdict: "Confirmed Scam — High Confidence",
  scamType: "Authority Impersonation + Urgency Manipulation",
  confidence: 97,

  scamAnatomy:
    "This message impersonates RBI to build authority, then injects a 24-hour deadline to prevent you thinking clearly, then offers ₹50,000 reward to lower your guard — before asking for a one-time password that gives full account access.",

  psychTactics: [
    {
      name: "Authority Impersonation",
      description: "Fake RBI branding to establish false legitimacy and bypass your critical thinking",
      severity: "high",
      icon: "🏛️",
    },
    {
      name: "Artificial Urgency",
      description: "24-hour deadline creates panic, preventing calm evaluation of the request",
      severity: "high",
      icon: "⏱️",
    },
    {
      name: "False Reward",
      description: "₹50,000 reward lowers your guard and makes cooperation feel rational",
      severity: "high",
      icon: "💰",
    },
    {
      name: "OTP Harvesting",
      description: "Final ask for OTP — the actual theft mechanism disguised as verification",
      severity: "high",
      icon: "🔑",
    },
  ],

  redFlags: [
    { flag: "RBI never contacts citizens via WhatsApp or SMS", explanation: "RBI communicates only through official gazette or licensed banks", weight: 95 },
    { flag: "Unsolicited reward notification", explanation: "Legitimate institutions do not send unrequested financial rewards", weight: 88 },
    { flag: "Request for OTP / PIN", explanation: "No legitimate bank or government body ever asks for your OTP", weight: 99 },
    { flag: "24-hour urgency pressure", explanation: "Artificial deadlines are a textbook manipulation technique", weight: 82 },
    { flag: "Suspicious link domain", explanation: "Domain registered 8 days ago — not an official government domain", weight: 91 },
  ],

  intelligenceMap: [
    { id: "a", label: "WhatsApp Message", type: "warning", connections: ["b", "c"], x: 50, y: 15 },
    { id: "b", label: "Fake RBI Sender", type: "primary", connections: ["d"], x: 20, y: 45 },
    { id: "c", label: "Malicious Link", type: "primary", connections: ["e"], x: 80, y: 45 },
    { id: "d", label: "Phone Spoofing", type: "secondary", connections: [], x: 10, y: 78 },
    { id: "e", label: "Credential Farm", type: "primary", connections: [], x: 75, y: 78 },
  ],

  immediateActions: [
    {
      priority: 1,
      title: "Do NOT share your OTP or PIN",
      description: "If you haven't shared it yet, you are safe. Block the sender immediately.",
      urgency: "immediate",
      icon: "🛡️",
    },
    {
      priority: 2,
      title: "Block & Report the Number",
      description: "Block the sender on WhatsApp and report to Truecaller for community protection.",
      urgency: "immediate",
      icon: "🚫",
    },
    {
      priority: 3,
      title: "Report to Cyber Crime Portal",
      description: "File a complaint at cybercrime.gov.in — takes 5 minutes and helps authorities track patterns.",
      urgency: "today",
      icon: "📋",
    },
    {
      priority: 4,
      title: "Alert Your Bank",
      description: "Inform your bank's fraud department so they can monitor your account.",
      urgency: "today",
      icon: "🏦",
    },
  ],

  recoverySteps: [
    {
      step: 1,
      title: "Secure Your Accounts",
      description: "Change your banking PIN and enable 2FA on all financial accounts immediately.",
    },
    {
      step: 2,
      title: "File an FIR",
      description: "Visit your nearest cyber crime police station or file online at cybercrime.gov.in.",
      link: "https://cybercrime.gov.in",
      linkText: "cybercrime.gov.in",
    },
    {
      step: 3,
      title: "Contact Your Bank",
      description: "If money was transferred, call your bank's 24/7 fraud helpline (1930) within 24 hours for the best chance of recovery.",
    },
    {
      step: 4,
      title: "Document Everything",
      description: "Screenshot the messages, note the phone number, save transaction IDs. This is your evidence.",
    },
    {
      step: 5,
      title: "Emotional Support",
      description: "Being targeted is not your fault. Scammers are professional manipulators. Talk to someone you trust.",
    },
  ],

  preventionInsights: [
    "RBI never contacts citizens directly via SMS, WhatsApp, or phone calls",
    "No legitimate government body will ever ask for your OTP, PIN, or password",
    "Urgency pressure ('24 hours', 'act now') is a manipulation technique — always pause and verify",
    "Check domain registration age before clicking any link (use whois.domaintools.com)",
    "When in doubt, call the official number from the institution's official website only",
  ],

  confidenceBreakdown: [
    { label: "Pattern Match", score: 97, color: "#EF4444" },
    { label: "Language Analysis", score: 94, color: "#F97316" },
    { label: "Domain Intelligence", score: 91, color: "#EF4444" },
    { label: "Behavioral Signals", score: 88, color: "#F97316" },
    { label: "Network Fingerprint", score: 85, color: "#EF4444" },
  ],

  analysisMetadata: {
    processingTime: "1.4s",
    model: "Kavach-AI v2.1",
    patternsMatched: 23,
    databaseSize: "4.2M scam patterns",
  },
};
