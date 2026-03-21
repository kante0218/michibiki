import { NextRequest, NextResponse } from "next/server";

// Google Cloud TTS Japanese voices (WaveNet tier - 1M chars/month free)
const ALLOWED_VOICES: Record<string, { name: string; ssmlGender: string; label: string }> = {
  "wavenet-female-a": {
    name: "ja-JP-Wavenet-A",
    ssmlGender: "FEMALE",
    label: "女性A（自然で落ち着いた声）",
  },
  "wavenet-female-b": {
    name: "ja-JP-Wavenet-B",
    ssmlGender: "FEMALE",
    label: "女性B（明るくハキハキした声）",
  },
  "wavenet-male-c": {
    name: "ja-JP-Wavenet-C",
    ssmlGender: "MALE",
    label: "男性A（深みのある声）",
  },
  "wavenet-male-d": {
    name: "ja-JP-Wavenet-D",
    ssmlGender: "MALE",
    label: "男性B（落ち着いた声）",
  },
  "neural2-female": {
    name: "ja-JP-Neural2-B",
    ssmlGender: "FEMALE",
    label: "女性（Neural2・高品質）",
  },
  "neural2-male": {
    name: "ja-JP-Neural2-C",
    ssmlGender: "MALE",
    label: "男性（Neural2・高品質）",
  },
};

const DEFAULT_VOICE = "wavenet-male-d";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Cloud TTS API key not configured" },
      { status: 503 }
    );
  }

  try {
    const { text, voice, speakingRate } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    if (text.length > 2000) {
      return NextResponse.json({ error: "Text too long (max 2000 chars)" }, { status: 400 });
    }

    const voiceKey = voice && voice in ALLOWED_VOICES ? voice : DEFAULT_VOICE;
    const selectedVoice = ALLOWED_VOICES[voiceKey];

    const rate = typeof speakingRate === "number"
      ? Math.max(0.5, Math.min(2.0, speakingRate))
      : 0.95; // Slightly slower for interview clarity

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: "ja-JP",
            name: selectedVoice.name,
            ssmlGender: selectedVoice.ssmlGender,
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: rate,
            pitch: -1.0, // Slightly lower for professional tone
            sampleRateHertz: 24000,
          },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Google TTS error:", response.status, errorData);
      return NextResponse.json(
        { error: "Google TTS synthesis failed" },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!data.audioContent) {
      return NextResponse.json({ error: "No audio content returned" }, { status: 502 });
    }

    // audioContent is base64-encoded
    const audioBuffer = Buffer.from(data.audioContent, "base64");

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Google TTS error:", err);
    return NextResponse.json({ error: "Google TTS generation failed" }, { status: 500 });
  }
}

// GET endpoint to list available voices and check if configured
export async function GET() {
  const isConfigured = !!process.env.GOOGLE_TTS_API_KEY;
  const voices = Object.entries(ALLOWED_VOICES).map(([key, value]) => ({
    id: key,
    label: value.label,
    gender: value.ssmlGender.toLowerCase(),
  }));
  return NextResponse.json({ isConfigured, voices });
}
