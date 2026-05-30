// FIX BUG-016: Added max content length cap (20,000 chars) for text/URL analysis
// to prevent DoS via extremely large payloads and excessive Gemini token usage.

import { NextRequest, NextResponse } from "next/server";
import {
  analyzeText,
  analyzeImage,
  transformGeminiToKavach,
  GeminiAnalysisResult,
} from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_TEXT_LENGTH = 20_000; // ~5,000 tokens — enough for any real scam message

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const contentType = req.headers.get("content-type") ?? "";

    let geminiResult: GeminiAnalysisResult;
    let analysisType: string;

    // ── Multipart (screenshot upload) ──────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 10MB." },
          { status: 400 }
        );
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error:
              "Unsupported file type. Please upload PNG, JPG, WEBP, or PDF.",
          },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      analysisType = "screenshot";

      geminiResult = await analyzeImage(base64, file.type);
    }
    // ── JSON (text / url) ──────────────────────────────────────────────────
    else {
      const body = (await req.json()) as {
        type?: string;
        content?: string;
      };

      const { type, content } = body;

      if (!type || !content) {
        return NextResponse.json(
          { error: "Missing 'type' or 'content' in request body" },
          { status: 400 }
        );
      }

      if (!["paste", "url"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid analysis type. Use 'paste' or 'url'." },
          { status: 400 }
        );
      }

      const trimmed = content.trim();
      if (trimmed.length < 3) {
        return NextResponse.json(
          { error: "Content is too short for meaningful analysis." },
          { status: 400 }
        );
      }

      // FIX BUG-016: Cap input length to prevent DoS and runaway Gemini costs.
      if (trimmed.length > MAX_TEXT_LENGTH) {
        return NextResponse.json(
          {
            error: `Content is too long. Please limit to ${MAX_TEXT_LENGTH.toLocaleString()} characters.`,
          },
          { status: 400 }
        );
      }

      analysisType = type;
      geminiResult = await analyzeText(trimmed, type as "paste" | "url");
    }

    // ── Transform to Kavach schema ─────────────────────────────────────────
    const kavachResult = transformGeminiToKavach(
      geminiResult,
      analysisType,
      startTime
    );

    return NextResponse.json({ success: true, data: kavachResult });
  } catch (err: unknown) {
    console.error("[Kavach API Error]", err);

    const message = err instanceof Error ? err.message : "Unknown error";

    // Model not found / unsupported model
    if (message.includes("not found") || message.includes("404") || message.includes("model")) {
      return NextResponse.json(
        {
          error:
            "The AI model could not be reached. Please check the model name or try again later.",
        },
        { status: 502 }
      );
    }

    // Invalid API key
    if (message.includes("API_KEY_INVALID") || message.includes("401") || message.includes("403")) {
      return NextResponse.json(
        {
          error:
            "Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    // Gemini-specific rate limit
    if (message.includes("429") || message.includes("quota")) {
      return NextResponse.json(
        {
          error:
            "Analysis service is temporarily busy. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    // Missing API key
    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        {
          error:
            "Analysis service is not configured. Please set the GEMINI_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    // JSON parse failure from Gemini
    if (message.includes("JSON") || message.includes("incomplete")) {
      return NextResponse.json(
        {
          error:
            "Analysis produced an unexpected result. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
