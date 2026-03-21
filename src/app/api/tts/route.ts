import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "edge-tts-universal";

// Voice presets optimized for interview context
const VOICE_PRESETS: Record<string, { voice: string; rate: string; pitch: string; label: string }> = {
  "keita-interviewer": {
    voice: "ja-JP-KeitaNeural",
    rate: "-8%",    // Slightly slower — calm, deliberate interviewer pace
    pitch: "-2Hz",  // Slightly lower — authoritative tone
    label: "男性面接官（落ち着いた声）",
  },
  "nanami-interviewer": {
    voice: "ja-JP-NanamiNeural",
    rate: "-6%",    // Slightly slower — professional pace
    pitch: "-1Hz",  // Slightly lower — mature tone
    label: "女性面接官（丁寧な声）",
  },
  "keita-casual": {
    voice: "ja-JP-KeitaNeural",
    rate: "-3%",
    pitch: "+0Hz",
    label: "男性（カジュアル）",
  },
  "nanami-casual": {
    voice: "ja-JP-NanamiNeural",
    rate: "-3%",
    pitch: "+0Hz",
    label: "女性（カジュアル）",
  },
};

const DEFAULT_PRESET = "keita-interviewer";

export async function POST(req: NextRequest) {
  try {
    const { text, voice, preset } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    if (text.length > 2000) {
      return NextResponse.json({ error: "Text too long (max 2000 chars)" }, { status: 400 });
    }

    // Use preset if provided, otherwise fall back to voice param or default
    const selectedPreset = preset && preset in VOICE_PRESETS
      ? VOICE_PRESETS[preset]
      : VOICE_PRESETS[DEFAULT_PRESET];

    const allowedVoices = ["ja-JP-NanamiNeural", "ja-JP-KeitaNeural"];
    const finalVoice = voice && allowedVoices.includes(voice)
      ? voice
      : selectedPreset.voice;

    const tts = new EdgeTTS(text, finalVoice, {
      rate: selectedPreset.rate,
      pitch: selectedPreset.pitch,
    });
    const result = await tts.synthesize();

    const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
  }
}

// GET endpoint to list available presets
export async function GET() {
  const presets = Object.entries(VOICE_PRESETS).map(([key, value]) => ({
    id: key,
    label: value.label,
  }));
  return NextResponse.json({ presets });
}
