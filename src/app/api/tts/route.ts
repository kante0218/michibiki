import { NextRequest, NextResponse } from "next/server";
import { encode } from "@msgpack/msgpack";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ maxRequests: 30, windowMs: 60_000 });

// Fish Audio voice reference ID
const FISH_VOICE_ID = process.env.FISH_AUDIO_VOICE_ID || "";

export async function POST(req: NextRequest) {
  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Fish Audio API key not configured" },
      { status: 503 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
  const { success } = limiter(ip);
  if (!success) {
    return NextResponse.json({ error: "リクエストが多すぎます。" }, { status: 429 });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    if (text.length > 2000) {
      return NextResponse.json({ error: "Text too long (max 2000 chars)" }, { status: 400 });
    }

    const body: Record<string, unknown> = {
      text,
      format: "mp3",
      mp3_bitrate: 128,
      chunk_length: 200,
      normalize: true,
      latency: "normal",
    };

    if (FISH_VOICE_ID) {
      body.reference_id = FISH_VOICE_ID;
    }

    const msgpackBody = encode(body);

    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/msgpack",
        "model": "s2",
      },
      body: msgpackBody,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Fish Audio TTS error:", response.status, errorText);
      return NextResponse.json(
        { error: "Fish Audio TTS synthesis failed" },
        { status: 502 }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Fish Audio TTS error:", err);
    return NextResponse.json({ error: "Fish Audio TTS generation failed" }, { status: 500 });
  }
}

export async function GET() {
  const isConfigured = !!process.env.FISH_AUDIO_API_KEY;
  return NextResponse.json({ isConfigured, hasVoice: !!FISH_VOICE_ID });
}
