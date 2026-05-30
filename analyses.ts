import { supabase } from "./supabase";
import { KavachAnalysisResult } from "./gemini";

export async function saveAnalysis(
  userId: string,
  content: string,
  analysisType: string,
  result: KavachAnalysisResult
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("analyses").insert({
    user_id: userId,
    content: content.slice(0, 2000), // cap stored content
    analysis_type: analysisType,
    risk_score: result.riskScore,
    risk_level: result.riskLevel,
    verdict: result.verdict,
    scam_type: result.scamType,
    full_result: result as unknown as Record<string, unknown>,
  });

  if (error) {
    console.error("[Kavach] Failed to save analysis:", error.message);
    return { error: error.message };
  }

  return { error: null };
}

export async function fetchUserAnalyses(
  userId: string,
  page = 1,
  pageSize = 10
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("analyses")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  return { data, error, count };
}

export async function fetchAnalysisById(id: string, userId: string) {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  return { data, error };
}

export async function fetchUserStats(userId: string) {
  const { data, error } = await supabase
    .from("analyses")
    .select("risk_level")
    .eq("user_id", userId);

  if (error || !data) return null;

  const total = data.length;
  const high = data.filter(
    (a) => a.risk_level === "HIGH" || a.risk_level === "CRITICAL"
  ).length;
  const medium = data.filter((a) => a.risk_level === "MEDIUM").length;
  const safe = data.filter(
    (a) => a.risk_level === "LOW" || a.risk_level === "SAFE"
  ).length;

  return { total, high, medium, safe };
}
