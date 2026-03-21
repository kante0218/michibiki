import { NextRequest, NextResponse } from "next/server";

// VOICEVOX speaker IDs suitable for interview context
// See: https://voicevox.su-shiki.com/
const ALLOWED_SPEAKERS: Record<string, { id: number; name: string; gender: string }> = {
  "shikoku-normal": { id: 2, name: "四国めたん（ノーマル）", gender: "female" },
  "zundamon-normal": { id: 3, name: "ずんだもん（ノーマル）", gender: "female" },
  "tsumugi": { id: 8, name: "春日部つむぎ", gender: "female" },
  "ritsu-normal": { id: 9, name: "波音リツ（ノーマル）", gender: "female" },
  "himari": { id: 14, name: "冥鳴ひまり", gender: "female" },
  "ryusei": { id: 13, name: "青山龍星", gender: "male" },
  "takehiro": { id: 38, name: "玄野武宏（ノーマル）", gender: "male" },
  "kotarou": { id: 21, name: "小夜/SAYO", gender: "female" },
};

const DEFAULT_SPEAKER = "ryusei";

// Returns a streaming URL for the client to play directly
// This avoids server-side polling/timeout issues on Vercel
export async function POST(req: NextRequest) {
  try {
    const { text, speaker } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    if (text.length > 2000) {
      return NextResponse.json({ error: "Text too long (max 2000 chars)" }, { status: 400 });
    }

    const speakerKey = speaker && speaker in ALLOWED_SPEAKERS ? speaker : DEFAULT_SPEAKER;
    const speakerId = ALLOWED_SPEAKERS[speakerKey].id;

    // Request synthesis from tts.quest v3 API
    const synthesisUrl = `https://api.tts.quest/v3/voicevox/synthesis?speaker=${speakerId}&text=${encodeURIComponent(text)}`;
    const synthesisRes = await fetch(synthesisUrl, { signal: AbortSignal.timeout(10000) });

    if (!synthesisRes.ok) {
      console.error("VOICEVOX synthesis request failed:", synthesisRes.status);
      return NextResponse.json({ error: "VOICEVOX synthesis failed" }, { status: 502 });
    }

    const data = await synthesisRes.json();

    if (!data.success || !data.mp3StreamingUrl) {
      console.error("VOICEVOX: unexpected response", data);
      return NextResponse.json({ error: "VOICEVOX synthesis failed" }, { status: 502 });
    }

    // Return the streaming URL for the client to play directly
    // The mp3StreamingUrl waits for audio generation and streams the result
    return NextResponse.json({
      audioUrl: data.mp3StreamingUrl,
      speakerName: data.speakerName,
    });
  } catch (err) {
    console.error("VOICEVOX TTS error:", err);
    return NextResponse.json({ error: "VOICEVOX TTS generation failed" }, { status: 500 });
  }
}

// GET endpoint to list available speakers
export async function GET() {
  const speakers = Object.entries(ALLOWED_SPEAKERS).map(([key, value]) => ({
    id: key,
    name: value.name,
    gender: value.gender,
  }));
  return NextResponse.json({ speakers });
}
