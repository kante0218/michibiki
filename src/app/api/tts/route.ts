import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // Limit text length to prevent resource exhaustion
    if (text.length > 2000) {
      return NextResponse.json({ error: "Text too long (max 2000 chars)" }, { status: 400 });
    }

    // Whitelist allowed voices
    const allowedVoices = ["ja-JP-NanamiNeural", "ja-JP-KeitaNeural"];
    const safeVoice = allowedVoices.includes(voice) ? voice : "ja-JP-NanamiNeural";

    // Dynamic import to use the compiled JS output (avoids TS stripping issues)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { tts } = require("edge-tts/out/index.js");

    const audioBuffer: Buffer = await tts(text, {
      voice: safeVoice,
      rate: "-5%",  // Slightly slower for clarity
      pitch: "+0Hz",
    });

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
  }
}
