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

const DEFAULT_SPEAKER = "ryusei"; // Professional male voice for interviewer

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

    // Use tts.quest v3 API (free, no API key required)
    const synthesisUrl = `https://api.tts.quest/v3/voicevox/synthesis?speaker=${speakerId}&text=${encodeURIComponent(text)}`;

    const synthesisRes = await fetch(synthesisUrl, { signal: AbortSignal.timeout(10000) });

    if (!synthesisRes.ok) {
      console.error("VOICEVOX synthesis request failed:", synthesisRes.status);
      return NextResponse.json({ error: "VOICEVOX synthesis failed" }, { status: 502 });
    }

    const synthesisData = await synthesisRes.json();

    if (!synthesisData.mp3DownloadUrl) {
      // If the result isn't ready yet, poll the status URL
      if (synthesisData.audioStatusUrl) {
        const audioUrl = await pollForAudio(synthesisData.audioStatusUrl, synthesisData.mp3DownloadUrl);
        if (audioUrl) {
          return await fetchAndReturnAudio(audioUrl);
        }
      }
      console.error("VOICEVOX: no download URL in response", synthesisData);
      return NextResponse.json({ error: "VOICEVOX synthesis failed" }, { status: 502 });
    }

    // Check if audio is immediately ready
    if (synthesisData.isAudioReady) {
      return await fetchAndReturnAudio(synthesisData.mp3DownloadUrl);
    }

    // Poll for audio readiness
    const audioUrl = await pollForAudio(synthesisData.audioStatusUrl, synthesisData.mp3DownloadUrl);
    if (audioUrl) {
      return await fetchAndReturnAudio(audioUrl);
    }

    return NextResponse.json({ error: "VOICEVOX audio generation timed out" }, { status: 504 });
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

async function pollForAudio(statusUrl: string, downloadUrl: string): Promise<string | null> {
  const maxAttempts = 15;
  const delay = 1000; // 1 second between polls

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      const statusRes = await fetch(statusUrl, { signal: AbortSignal.timeout(5000) });
      if (statusRes.ok) {
        const status = await statusRes.json();
        if (status.isAudioReady) {
          return downloadUrl;
        }
      }
    } catch {
      // Continue polling
    }
  }

  return null;
}

async function fetchAndReturnAudio(url: string): Promise<NextResponse> {
  const audioRes = await fetch(url, { signal: AbortSignal.timeout(15000) });

  if (!audioRes.ok) {
    return NextResponse.json({ error: "Failed to download audio" }, { status: 502 });
  }

  const audioBuffer = await audioRes.arrayBuffer();

  return new NextResponse(new Uint8Array(audioBuffer), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
