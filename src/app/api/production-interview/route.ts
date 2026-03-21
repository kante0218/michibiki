import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ maxRequests: 15, windowMs: 60_000 });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Retry wrapper for Anthropic API calls (handles 529 overloaded errors)
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isOverloaded =
        (error instanceof Error && error.message?.includes("Overloaded")) ||
        (error instanceof Error && error.message?.includes("529")) ||
        (typeof error === "object" && error !== null && "status" in error && (error as { status: number }).status === 529);

      if (isOverloaded && attempt < maxRetries) {
        const delay = Math.pow(2, attempt + 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
  const { success } = limiter(ip);
  if (!success) {
    return NextResponse.json({ error: "リクエストが多すぎます。しばらくしてからもう一度お試しください。" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();

    // -------------------------------------------------------
    // Action: generate_questions
    // -------------------------------------------------------
    if (action === "generate_questions") {
      const {
        category,
        difficulty,
        topics,
        questionCount,
        customInstructions,
        jobTitle,
        jobDescription,
        expert,
      } = body;

      const isExpert = expert === true || (typeof category === "string" && category.includes("expert"));
      const topicsText = Array.isArray(topics) && topics.length > 0
        ? topics.join("、")
        : "一般的なトピック";

      const expertInstructions = isExpert ? `

## エキスパート面接モード
この面接はエキスパート（専門家）向けです。以下の特別な要件に従ってください：
1. ケーススタディ形式の問題を中心に出題してください（case_study型を多く）
2. 「正解が一つではない」オープンエンドな問題を含めてください
3. 候補者の思考プロセスを引き出す質問にしてください
4. 各問題に「思考プロセスガイド」を含めてください（例：「判断の根拠」「検討した代替案」「リスク評価」を求める指示）
5. 難易度は「expert」レベルにしてください
6. type に "case_study" と "open_ended" を積極的に使用してください` : "";

      const message = await callWithRetry(() =>
        anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: isExpert ? 5000 : 4000,
          messages: [
            {
              role: "user",
              content: `あなたは日本の採用プラットフォーム「みちびき」のAI面接官です。
以下の企業設定に基づいて、カスタム面接問題を${questionCount || (isExpert ? 4 : 5)}問生成してください。

カテゴリ: ${category || "一般"}
難易度: ${isExpert ? "expert" : (difficulty || "medium")}
トピック: ${topicsText}
求人タイトル: ${jobTitle || "一般"}
求人内容: ${jobDescription || "なし"}
${customInstructions ? `企業からの追加指示: ${customInstructions}` : ""}${expertInstructions}

各問題は以下のJSON形式で出力してください:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice" | "coding" | "short_answer" | "case_study"${isExpert ? ' | "open_ended"' : ""},
      "question": "問題文",
      "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"] (multiple_choiceの場合のみ),
      "correctAnswer": "正解"${isExpert ? ',\n      "thinkingGuide": "この問題で候補者に言語化してほしい思考プロセスのガイド"' : ""},
      "points": 配点,
      "difficulty": "${isExpert ? "expert" : (difficulty || "medium")}",
      "timeLimit": 秒数
    }
  ]
}

難易度「${isExpert ? "expert" : (difficulty || "medium")}」に合わせた問題を作成してください。
トピック（${topicsText}）に関連する内容を含めてください。
JSONのみを出力してください。`,
            },
          ],
        })
      );

      const content = message.content[0];
      if (content.type === "text") {
        try {
          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json(parsed);
          }
        } catch {
          return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }
      }
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    // -------------------------------------------------------
    // Action: start_interview
    // -------------------------------------------------------
    if (action === "start_interview") {
      const { productionInterviewId } = body;

      if (!productionInterviewId) {
        return NextResponse.json({ error: "productionInterviewId is required" }, { status: 400 });
      }

      // Mark interview as in_progress
      const { data: interview, error: updateError } = await supabase
        .from("production_interviews")
        .update({
          status: "in_progress",
          started_at: new Date().toISOString(),
        })
        .eq("id", productionInterviewId)
        .select()
        .single();

      if (updateError) {
        console.error("DB update error:", updateError.message);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }

      return NextResponse.json({
        interview,
        questions: interview.questions,
      });
    }

    // -------------------------------------------------------
    // Action: submit_answers
    // -------------------------------------------------------
    if (action === "submit_answers") {
      const { productionInterviewId, answers } = body;

      if (!productionInterviewId) {
        return NextResponse.json({ error: "productionInterviewId is required" }, { status: 400 });
      }

      if (!answers || !Array.isArray(answers)) {
        return NextResponse.json({ error: "answers array is required" }, { status: 400 });
      }

      const { data: interview, error: updateError } = await supabase
        .from("production_interviews")
        .update({
          answers,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", productionInterviewId)
        .select()
        .single();

      if (updateError) {
        console.error("DB update error:", updateError.message);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }

      return NextResponse.json({ interview });
    }

    // -------------------------------------------------------
    // Action: interview_question (video interview part)
    // -------------------------------------------------------
    if (action === "interview_question") {
      const {
        productionInterviewId,
        questionNumber,
        conversationHistory,
        category,
        difficulty,
      } = body;

      // Fetch interview data for context
      let interviewContext = "";
      if (productionInterviewId) {
        const { data: interview } = await supabase
          .from("production_interviews")
          .select("*, job_postings(*)")
          .eq("id", productionInterviewId)
          .single();

        if (interview) {
          interviewContext = `
求人タイトル: ${interview.job_postings?.title || "一般"}
求人内容: ${interview.job_postings?.description || "なし"}
質問番号: ${questionNumber || 1}`;
        }
      }

      const systemPrompt = `あなたは日本の採用プラットフォーム「みちびき」のAI面接官です。
プロフェッショナルかつ温かみのある面接を行ってください。
日本語で自然に会話してください。敬語を使用してください。

面接のルール:
1. 企業の求人要件に基づいた質問をしてください
2. 技術的な質問だけでなく、人間性やチームワークについても聞いてください
3. 回答に基づいて適切なフォローアップ質問をしてください
4. 質問は簡潔にしてください。前置きは1文程度、質問は1つだけにしてください
5. 必ず1つの明確な質問で終わってください
6. 長い文章は避け、合計3文以内にしてください
7. 音声で読み上げられることを意識し、自然な話し言葉を使ってください

カテゴリ: ${category || "一般"}
難易度: ${difficulty || "medium"}
${interviewContext}`;

      const messages: Anthropic.MessageParam[] = conversationHistory || [];

      if (messages.length === 0) {
        messages.push({
          role: "user",
          content: "面接を始めてください。まず自己紹介をお願いします。",
        });
      }

      const message = await callWithRetry(() =>
        anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: systemPrompt,
          messages,
        })
      );

      const content = message.content[0];
      if (content.type === "text") {
        return NextResponse.json({
          question: content.text,
          conversationHistory: messages,
        });
      }
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const statusCode =
      typeof error === "object" && error !== null && "status" in error
        ? (error as { status: number }).status
        : 500;
    console.error("Production Interview API error:", statusCode, errMsg);
    return NextResponse.json(
      { error: errMsg || "Internal server error" },
      { status: statusCode === 529 ? 529 : 500 }
    );
  }
}
